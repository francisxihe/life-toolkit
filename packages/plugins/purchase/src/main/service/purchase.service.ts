import dayjs from 'dayjs';
import type { EntityManager } from 'typeorm';
import { PurchaseStatus } from '@true-north/enum';
import type { CreatePurchaseVo, PurchaseFilterVo, PurchaseVo, UpdatePurchaseVo } from '@true-north/vo';
import { store } from '../storage';
import { PurchaseItem } from './purchase.entity';
import { recordDomainActivity } from '../ports';

function toIso(value: Date | string | undefined): string | undefined {
  if (!value) return undefined;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toVo(entity: PurchaseItem): PurchaseVo {
  return {
    id: entity.id,
    name: entity.name,
    quantity: entity.quantity,
    unit: entity.unit,
    neededAt: entity.neededAt ? dayjs(entity.neededAt).format('YYYY-MM-DD') : undefined,
    status: entity.status,
    purchasedAt: toIso(entity.purchasedAt),
    note: entity.note,
    transactionId: entity.transactionId,
    createdAt: toIso(entity.createdAt) || '',
    updatedAt: toIso(entity.updatedAt) || '',
  };
}

export class PurchaseService {
  private repo(manager?: EntityManager) {
    return (manager ?? store().manager).getRepository(PurchaseItem);
  }

  async list(filter?: PurchaseFilterVo): Promise<PurchaseVo[]> {
    const qb = this.repo().createQueryBuilder('item').andWhere('item.deletedAt IS NULL');
    if (filter?.status) qb.andWhere('item.status = :status', { status: filter.status });
    if (filter?.keyword?.trim()) {
      qb.andWhere('(item.name LIKE :keyword OR item.note LIKE :keyword)', {
        keyword: `%${filter.keyword.trim()}%`,
      });
    }
    if (filter?.neededFrom) qb.andWhere('item.neededAt >= :neededFrom', { neededFrom: filter.neededFrom });
    if (filter?.neededTo) qb.andWhere('item.neededAt <= :neededTo', { neededTo: filter.neededTo });
    const list = await qb.orderBy('item.updatedAt', 'DESC').getMany();
    return list.map(toVo);
  }

  async create(
    body: CreatePurchaseVo,
    options?: { skipActivity?: boolean; manager?: EntityManager }
  ): Promise<PurchaseVo> {
    const name = body?.name?.trim();
    if (!name) throw new Error('请填写采购名称');
    const repo = this.repo(options?.manager);
    const entity = repo.create({
      name,
      quantity: body.quantity,
      unit: body.unit,
      neededAt: body.neededAt ? new Date(body.neededAt) : undefined,
      status: (body.status as PurchaseStatus) || PurchaseStatus.PENDING,
      purchasedAt: body.purchasedAt ? new Date(body.purchasedAt) : undefined,
      note: body.note,
      transactionId: body.transactionId,
    });
    const saved = await repo.save(entity);
    const vo = toVo(saved);
    if (!options?.skipActivity) {
      await recordDomainActivity({
        title: vo.name,
        source: 'domain',
        links: [{ domain: 'purchase', entityId: vo.id, role: 'purchase', label: vo.name }],
      });
    }
    return vo;
  }

  async update(id: string, body: UpdatePurchaseVo): Promise<PurchaseVo> {
    const current = await this.repo().findOneBy({ id });
    if (!current) throw new Error('采购项不存在');
    if (body.name !== undefined) current.name = body.name.trim();
    if (body.quantity !== undefined) current.quantity = body.quantity;
    if (body.unit !== undefined) current.unit = body.unit;
    if (body.neededAt !== undefined) current.neededAt = body.neededAt ? new Date(body.neededAt) : undefined;
    if (body.status !== undefined) current.status = body.status as PurchaseStatus;
    if (body.purchasedAt !== undefined) {
      current.purchasedAt = body.purchasedAt ? new Date(body.purchasedAt) : undefined;
    }
    if (body.note !== undefined) current.note = body.note;
    if (body.transactionId !== undefined) current.transactionId = body.transactionId;
    if (current.status === PurchaseStatus.PURCHASED && !current.purchasedAt) {
      current.purchasedAt = new Date();
    }
    return toVo(await this.repo().save(current));
  }

  async delete(id: string): Promise<boolean> {
    await this.repo().softDelete(id);
    const { unlinkDomain } = await import('../ports');
    await unlinkDomain('purchase', id);
    return true;
  }
}

export const purchaseService = new PurchaseService();
