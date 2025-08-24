import { Repository, In, DeepPartial } from "typeorm";
import { AppDataSource } from "../../database.config";
import { Goal } from "@life-toolkit/business-server";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
  Goal as BusinessGoal,
} from "@life-toolkit/business-server";
import { GoalStatus, GoalType } from "@life-toolkit/enum";

// 桌面端 GoalRepository 实现（适配 business 接口，结构化兼容）
export class GoalRepository {
  private repo: Repository<Goal>;

  constructor() {
    this.repo = AppDataSource.getRepository(Goal);
  }

  // 映射 Desktop 实体到 Business DTO
  private toDto(entity: Goal): GoalDto {
    return {
      // BaseModelDto
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      // Goal
      name: entity.name,
      description: entity.description,
      status: entity.status as unknown as GoalStatus,
      type: entity.type as unknown as GoalType,
      importance: entity.importance,
      startAt: entity.startAt,
      endAt: entity.endAt,
      doneAt: entity.doneAt,
      abandonedAt: entity.abandonedAt,
      parent: entity.parent as any,
      children: (entity.children || []) as any,
      taskList: (entity.taskList || []) as any,
    } as unknown as GoalDto;
  }

  private buildQuery(filter: GoalListFilterDto) {
    let qb = this.repo
      .createQueryBuilder("goal")
      .leftJoinAndSelect("goal.parent", "parent")
      .andWhere("goal.deletedAt IS NULL");

    // includeIds / excludeIds
    const includeIds = (filter as any).includeIds as string[] | undefined;
    const excludeIds = (filter as any).excludeIds as string[] | undefined;
    if (includeIds && includeIds.length > 0) {
      qb = qb.andWhere("goal.id IN (:...includeIds)", { includeIds });
    }
    if (excludeIds && excludeIds.length > 0) {
      qb = qb.andWhere("goal.id NOT IN (:...excludeIds)", { excludeIds });
    }

    if (filter.parentId) {
      qb = qb.andWhere("parent.id = :parentId", { parentId: filter.parentId });
    }

    if (filter.status) {
      qb = qb.andWhere("goal.status = :status", {
        status: filter.status as any,
      });
    }

    if (filter.type) {
      qb = qb.andWhere("goal.type = :type", { type: filter.type as any });
    }

    if (filter.importance) {
      qb = qb.andWhere("goal.importance = :importance", {
        importance: filter.importance,
      });
    }

    const keyword = (filter as any).keyword as string | undefined;
    if (keyword) {
      qb = qb.andWhere("(goal.name LIKE :kw OR goal.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }

    // 计划时间范围（desktop 字段：startDate/targetDate）
    const planDateStart = (filter as any).planDateStart as string | undefined;
    const planDateEnd = (filter as any).planDateEnd as string | undefined;
    if (planDateStart) {
      qb = qb.andWhere("goal.startAt >= :planDateStart", {
        planDateStart: new Date(`${planDateStart}T00:00:00`),
      });
    }
    if (planDateEnd) {
      qb = qb.andWhere("goal.endAt <= :planDateEnd", {
        planDateEnd: new Date(`${planDateEnd}T23:59:59`),
      });
    }

    // 完成日期范围（desktop: completedAt）
    const doneDateStart = (filter as any).doneDateStart as string | undefined;
    const doneDateEnd = (filter as any).doneDateEnd as string | undefined;
    if (doneDateStart && doneDateEnd) {
      qb = qb.andWhere("goal.completedAt BETWEEN :ds AND :de", {
        ds: new Date(`${doneDateStart}T00:00:00`),
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    } else if (doneDateStart) {
      qb = qb.andWhere("goal.completedAt >= :ds", {
        ds: new Date(`${doneDateStart}T00:00:00`),
      });
    } else if (doneDateEnd) {
      qb = qb.andWhere("goal.completedAt <= :de", {
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    }

    return qb.orderBy("goal.updatedAt", "DESC");
  }

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    const entity = this.repo.create({
      name: createGoalDto.name,
      description: createGoalDto.description,
      type: (createGoalDto.type as unknown as GoalType) ?? GoalType.OBJECTIVE,
      status:
        (createGoalDto.status as unknown as GoalStatus) ?? GoalStatus.TODO,
      importance: createGoalDto.importance ?? 1,
      startAt: createGoalDto.startAt,
      endAt: createGoalDto.endAt,
    } as DeepPartial<Goal>);

    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async findById(id: string, relations?: string[]): Promise<GoalDto> {
    const entity = await this.repo.findOne({ where: { id }, relations });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return this.toDto(entity);
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => this.toDto(e));
  }

  async page(
    filter: GoalPageFilterDto
  ): Promise<{ list: GoalDto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = filter as any;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: entities.map((e) => this.toDto(e)), total };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    let entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);

    entity = {
      ...entity,
      ...updateGoalDto,
    };

    const saved = await this.repo.save(entity);
    return this.toDto(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    await this.repo.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async batchUpdate(
    ids: string[],
    updateData: Partial<BusinessGoal>
  ): Promise<void> {
    await this.repo.update(
      { id: In(ids) },
      updateData as unknown as Partial<Goal>
    );
  }

  async findDetail(id: string): Promise<GoalDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["parent", "children", "taskList"],
    });
    console.log("=====================", entity);
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return this.toDto(entity);
  }

  async updateStatus(
    id: string,
    status: GoalStatus,
    extra: Partial<BusinessGoal> = {}
  ): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    Object.assign(entity, {
      status: status as any,
      ...(extra as unknown as Partial<Goal>),
    });
    await this.repo.save(entity);
  }

  async batchDone(ids: string[]): Promise<void> {
    await this.repo.update({ id: In(ids) }, {
      status: GoalStatus.DONE,
      completedAt: new Date(),
    } as any);
  }
}
