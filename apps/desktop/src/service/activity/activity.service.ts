import type { EntityManager } from 'typeorm';
import {
  mergeTodaySections,
  normalizeCaptureSuggestion,
  type ActivityEntityRef,
  type CaptureAdopter,
  type TodaySectionContribution,
  type TodaySectionSnapshot,
} from '@true-north/plugin-sdk';
import { ActivityDomain, ActivitySource } from '@true-north/enum';
import type {
  ActivityFilterVo,
  ActivityLinkVo,
  ActivityVo,
  AdoptCaptureRequestVo,
  CreateActivityVo,
  HomeTodayVo,
} from '@true-north/vo';
import { store } from './storage';
import { Activity } from './activity.entity';
import { ActivityLink } from './activity-link.entity';

const HOST_LEGACY_DOMAIN_TO_REF: Record<string, { pluginId: string; entityType: string }> = {
  todo: { pluginId: 'growth', entityType: 'todo' },
  habit: { pluginId: 'growth', entityType: 'habit' },
  task: { pluginId: 'growth', entityType: 'task' },
  goal: { pluginId: 'growth', entityType: 'goal' },
  focus: { pluginId: 'growth', entityType: 'track-time' },
  expense: { pluginId: 'expense', entityType: 'transaction' },
  purchase: { pluginId: 'purchase', entityType: 'purchase' },
  bookmark: { pluginId: 'library', entityType: 'bookmark' },
};

function hostRefFromDomain(domain: string, entityId: string): ActivityEntityRef {
  const mapped = HOST_LEGACY_DOMAIN_TO_REF[domain];
  if (mapped) return { ...mapped, entityId };
  return { pluginId: domain, entityType: domain, entityId };
}

function hostDomainFromRef(ref: ActivityEntityRef): string {
  const entry = Object.entries(HOST_LEGACY_DOMAIN_TO_REF).find(
    ([, value]) => value.pluginId === ref.pluginId && value.entityType === ref.entityType,
  );
  return entry?.[0] || ref.entityType;
}

function toIso(value: Date | string | undefined): string {
  if (!value) return new Date().toISOString();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function linkRef(link: ActivityLink): ActivityEntityRef {
  if (link.pluginId && link.entityType) {
    return { pluginId: link.pluginId, entityType: link.entityType, entityId: link.entityId };
  }
  return hostRefFromDomain(String(link.domain), link.entityId);
}

function toLinkVo(entity: ActivityLink): ActivityLinkVo {
  const ref = linkRef(entity);
  return {
    id: entity.id,
    activityId: entity.activityId,
    pluginId: ref.pluginId,
    entityType: ref.entityType,
    domain: (entity.domain || hostDomainFromRef(ref)) as ActivityLinkVo['domain'],
    entityId: entity.entityId,
    role: entity.role,
    label: entity.label,
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

function toActivityVo(entity: Activity, links: ActivityLink[]): ActivityVo {
  return {
    id: entity.id,
    occurredAt: toIso(entity.occurredAt),
    title: entity.title,
    summary: entity.summary,
    source: entity.source,
    captureMessageId: entity.captureMessageId,
    links: links.map(toLinkVo),
    createdAt: toIso(entity.createdAt),
    updatedAt: toIso(entity.updatedAt),
  };
}

function resolveLinkInput(link: CreateActivityVo['links'][number]): ActivityEntityRef & { role?: string; label?: string } {
  if (link.pluginId && link.entityType) {
    return {
      pluginId: link.pluginId,
      entityType: link.entityType,
      entityId: link.entityId,
      role: link.role,
      label: link.label,
    };
  }
  const ref = hostRefFromDomain(String(link.domain || 'todo'), link.entityId);
  return { ...ref, role: link.role, label: link.label };
}

export class ActivityService {
  private captureAdopters = new Map<string, CaptureAdopter>();
  private todayCollectors: TodaySectionContribution[] = [];
  private workspaceWriter: {
    patch(messageId: string, payload: Record<string, unknown>, manager?: EntityManager): Promise<void>;
  } | null = null;

  configureCaptureAdopters(adopters: CaptureAdopter[]) {
    this.captureAdopters = new Map(adopters.map((adopter) => [adopter.type, adopter]));
  }

  configureToday(collectors: TodaySectionContribution[]) {
    this.todayCollectors = collectors;
  }

  configureWorkspaceWriter(writer: NonNullable<ActivityService['workspaceWriter']>) {
    this.workspaceWriter = writer;
  }

  private activities(manager?: EntityManager) {
    return (manager ?? store().manager).getRepository(Activity);
  }

  private links(manager?: EntityManager) {
    return (manager ?? store().manager).getRepository(ActivityLink);
  }

  async create(input: CreateActivityVo, manager?: EntityManager): Promise<ActivityVo> {
    const activities = this.activities(manager);
    const linksRepo = this.links(manager);
    const activity = activities.create({
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      title: input.title.trim(),
      summary: input.summary,
      source: input.source as ActivitySource,
      captureMessageId: input.captureMessageId,
    });
    const saved = await activities.save(activity);
    const links = input.links?.length
      ? await linksRepo.save(
          input.links.map((link) => {
            const ref = resolveLinkInput(link);
            return linksRepo.create({
              activityId: saved.id,
              pluginId: ref.pluginId,
              entityType: ref.entityType,
              domain: hostDomainFromRef(ref) as ActivityDomain,
              entityId: ref.entityId,
              role: ref.role,
              label: ref.label,
            });
          }),
        )
      : [];
    return toActivityVo(saved, links);
  }

  async list(filter?: ActivityFilterVo): Promise<ActivityVo[]> {
    const qb = this.activities().createQueryBuilder('activity').andWhere('activity.deletedAt IS NULL');
    if (filter?.from) qb.andWhere('activity.occurredAt >= :from', { from: filter.from });
    if (filter?.to) qb.andWhere('activity.occurredAt <= :to', { to: filter.to });
    if (filter?.keyword?.trim()) {
      qb.andWhere('(activity.title LIKE :keyword OR activity.summary LIKE :keyword)', {
        keyword: `%${filter.keyword.trim()}%`,
      });
    }
    const activities = await qb.orderBy('activity.occurredAt', 'DESC').getMany();
    const ids = activities.map((item) => item.id);
    const links = ids.length
      ? await this.links().createQueryBuilder('link').where('link.activityId IN (:...ids)', { ids }).getMany()
      : [];
    const byActivity = new Map<string, ActivityLink[]>();
    for (const link of links) {
      const bucket = byActivity.get(link.activityId) || [];
      bucket.push(link);
      byActivity.set(link.activityId, bucket);
    }
    const result = activities.map((item) => toActivityVo(item, byActivity.get(item.id) || []));
    if (filter?.pluginId) {
      return result.filter((item) => item.links.some((link) => link.pluginId === filter.pluginId));
    }
    if (filter?.domain) {
      return result.filter((item) => item.links.some((link) => link.domain === filter.domain));
    }
    return result;
  }

  async unlink(domain: ActivityDomain | `${ActivityDomain}`, entityId: string): Promise<void> {
    return this.unlinkRef(hostRefFromDomain(domain, entityId));
  }

  async unlinkRef(ref: ActivityEntityRef): Promise<void> {
    await this.links()
      .createQueryBuilder()
      .softDelete()
      .where(
        '(pluginId = :pluginId AND entityType = :entityType AND entityId = :entityId) OR (domain = :domain AND entityId = :entityId)',
        {
          pluginId: ref.pluginId,
          entityType: ref.entityType,
          entityId: ref.entityId,
          domain: hostDomainFromRef(ref) as ActivityDomain,
        },
      )
      .execute();
  }

  async remove(id: string): Promise<boolean> {
    await this.links().createQueryBuilder().softDelete().where('activityId = :id', { id }).execute();
    await this.activities().softDelete(id);
    return true;
  }

  async adoptCapture(body: AdoptCaptureRequestVo): Promise<ActivityVo> {
    if (!this.workspaceWriter || this.captureAdopters.size === 0) {
      throw new Error('收集采纳尚未配置');
    }
    const selected = (body.suggestions || [])
      .map((item) => normalizeCaptureSuggestion(item as unknown as Record<string, unknown>))
      .filter((item) => item.status !== 'accepted' && item.status !== 'rejected');
    if (!selected.length) throw new Error('没有可采纳的建议');

    const links: CreateActivityVo['links'] = [];
    const accepted = new Map<string, ReturnType<typeof normalizeCaptureSuggestion>>();

    for (const suggestion of selected) {
      const adopter = this.captureAdopters.get(suggestion.type);
      if (!adopter) throw new Error(`不支持的建议类型：${suggestion.type}`);
      const created = await adopter.adopt(suggestion);
      links.push({
        pluginId: created.pluginId,
        entityType: created.entityType,
        entityId: created.entityId,
        role: created.role,
        label: created.label,
        domain: hostDomainFromRef(created) as CreateActivityVo['links'][number]['domain'],
      });
      accepted.set(suggestion.id, { ...suggestion, status: 'accepted' });
    }

    const title = selected.length === 1
      ? String(selected[0].payload.title || selected[0].type)
      : selected.map((item) => String(item.payload.title || item.type)).join('、');

    return store().runInTransaction(async (tx) => {
      const activity = await this.create(
        {
          title,
          summary: body.sourceText,
          source: ActivitySource.HOME,
          captureMessageId: body.messageId,
          links,
        },
        tx.manager,
      );

      const remaining = (body.suggestions || []).map((item) => {
        const next = accepted.get(item.id);
        if (!next) return item;
        return {
          ...item,
          type: next.type,
          status: next.status,
          accepted: true,
          selected: true,
          payload: next.payload,
        };
      });
      await this.workspaceWriter!.patch(
        body.messageId,
        {
          runId: body.runId,
          analysisSummary: body.analysisSummary || '',
          sourceText: body.sourceText,
          suggestions: remaining,
        },
        tx.manager,
      );
      return activity;
    });
  }

  async homeToday(): Promise<HomeTodayVo> {
    const parts: TodaySectionSnapshot[][] = await Promise.all(
      this.todayCollectors.map(async (collector) => [await collector.collect()]),
    );
    return { sections: mergeTodaySections(parts) as HomeTodayVo['sections'] };
  }
}

export const activityService = new ActivityService();
