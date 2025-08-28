import { Repository, In } from "typeorm";
import { AppDataSource } from "../../database.config";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFiltersDto,
  GoalListFiltersDto,
  GoalDto,
  Goal,
} from "@life-toolkit/business-server";
import { GoalStatus, GoalType } from "@life-toolkit/enum";

type GoalListFilterExt = GoalListFiltersDto & {
  includeIds?: string[];
  excludeIds?: string[];
};

// 桌面端 GoalRepository 实现（适配 business 接口，结构化兼容）
export class GoalRepository {
  private repo: Repository<Goal>;

  constructor() {
    this.repo = AppDataSource.getRepository(Goal);
  }

  private buildQuery(filter: GoalListFilterExt) {
    let qb = this.repo
      .createQueryBuilder("goal")
      .leftJoinAndSelect("goal.parent", "parent")
      .andWhere("goal.deletedAt IS NULL");

    // includeIds / excludeIds
    const includeIds = filter.includeIds;
    const excludeIds = filter.excludeIds;
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
        status: filter.status,
      });
    }

    if (filter.type) {
      qb = qb.andWhere("goal.type = :type", { type: filter.type });
    }

    if (filter.importance) {
      qb = qb.andWhere("goal.importance = :importance", {
        importance: filter.importance,
      });
    }

    const keyword = filter.keyword;
    if (keyword) {
      qb = qb.andWhere("(goal.name LIKE :kw OR goal.description LIKE :kw)", {
        kw: `%${keyword}%`,
      });
    }

    // 计划时间范围（desktop 字段：startDate/targetDate）
    const planDateStart = filter.planDateStart;
    const planDateEnd = filter.planDateEnd;
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
    const doneDateStart = filter.doneDateStart;
    const doneDateEnd = filter.doneDateEnd;
    if (doneDateStart && doneDateEnd) {
      qb = qb.andWhere("goal.doneAt BETWEEN :ds AND :de", {
        ds: new Date(`${doneDateStart}T00:00:00`),
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    } else if (doneDateStart) {
      qb = qb.andWhere("goal.doneAt >= :ds", {
        ds: new Date(`${doneDateStart}T00:00:00`),
      });
    } else if (doneDateEnd) {
      qb = qb.andWhere("goal.doneAt <= :de", {
        de: new Date(`${doneDateEnd}T23:59:59`),
      });
    }

    // 放弃日期范围
    const abandonedDateStart = filter.abandonedDateStart;
    const abandonedDateEnd = filter.abandonedDateEnd;
    if (abandonedDateStart && abandonedDateEnd) {
      qb = qb.andWhere("goal.abandonedAt BETWEEN :ads AND :ade", {
        ads: new Date(`${abandonedDateStart}T00:00:00`),
        ade: new Date(`${abandonedDateEnd}T23:59:59`),
      });
    } else if (abandonedDateStart) {
      qb = qb.andWhere("goal.abandonedAt >= :ads", {
        ads: new Date(`${abandonedDateStart}T00:00:00`),
      });
    } else if (abandonedDateEnd) {
      qb = qb.andWhere("goal.abandonedAt <= :ade", {
        ade: new Date(`${abandonedDateEnd}T23:59:59`),
      });
    }

    return qb.orderBy("goal.updatedAt", "DESC");
  }

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    const entity = this.repo.create({
      name: createGoalDto.name,
      description: createGoalDto.description,
      type: createGoalDto.type ?? GoalType.OBJECTIVE,
      status: createGoalDto.status ?? GoalStatus.TODO,
      importance: createGoalDto.importance ?? 1,
      startAt: createGoalDto.startAt,
      endAt: createGoalDto.endAt,
    });

    const saved = await this.repo.save(entity);
    return GoalDto.importEntity(saved);
  }

  async findById(id: string, relations?: string[]): Promise<GoalDto> {
    const entity = await this.repo.findOne({ where: { id }, relations });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return GoalDto.importEntity(entity);
  }

  async findAll(filter: GoalListFiltersDto): Promise<GoalDto[]> {
    const qb = this.buildQuery(filter);
    const list = await qb.getMany();
    return list.map((e) => GoalDto.importEntity(e));
  }

  async page(
    filter: GoalPageFiltersDto
  ): Promise<{ list: GoalDto[]; total: number; pageNum: number; pageSize: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const qb = this.buildQuery(filter);
    const [entities, total] = await qb
      .skip((pageNum - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return {
      list: entities.map((e) => GoalDto.importEntity(e)),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);

    updateGoalDto.appendToUpdateEntity(entity);

    const saved = await this.repo.save(entity);
    return GoalDto.importEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    await this.repo.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  async batchUpdate(ids: string[], updateData: Partial<Goal>): Promise<void> {
    await this.repo.update({ id: In(ids) }, updateData);
  }

  async findDetail(id: string): Promise<GoalDto> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ["parent", "children", "taskList"],
    });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    return GoalDto.importEntity(entity);
  }

  async updateStatus(
    id: string,
    status: GoalStatus,
    extra: Partial<Goal> = {}
  ): Promise<void> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) throw new Error(`目标不存在，ID: ${id}`);
    Object.assign(entity, {
      status: status,
      ...extra,
    });
    await this.repo.save(entity);
  }

  async batchDone(ids: string[]): Promise<void> {
    await this.repo.update(
      { id: In(ids) },
      {
        status: GoalStatus.DONE,
        doneAt: new Date(),
      }
    );
  }
}
