import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOptionsWhere,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
  IsNull,
  Not,
} from "typeorm";
import { Goal, GoalStatus } from "./entities";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalMapper } from "./mappers";

@Injectable()
export class GoalRepository {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
  ) {}

  // 基础 CRUD 操作
  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    const entity = this.goalRepository.create({
      ...createGoalDto,
      status: GoalStatus.TODO,
    });
    const savedEntity = await this.goalRepository.save(entity);
    return GoalMapper.entityToDto(savedEntity);
  }

  async findById(id: string, relations?: string[]): Promise<GoalDto> {
    const entity = await this.goalRepository.findOne({
      where: { id },
      relations,
    });
    if (!entity) {
      throw new NotFoundException(`目标不存在，ID: ${id}`);
    }
    return GoalMapper.entityToDto(entity);
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    const query = this.buildQuery(filter);
    const entities = await query.getMany();
    return entities.map(entity => GoalMapper.entityToDto(entity));
  }

  async page(
    filter: GoalPageFilterDto
  ): Promise<{ list: GoalDto[]; total: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const skip = (pageNum - 1) * pageSize;

    const query = this.buildQuery(filter);
    const [entities, total] = await query
      .skip(skip)
      .take(pageSize)
      .getManyAndCount();

    return {
      list: entities.map(entity => GoalMapper.entityToDto(entity)),
      total,
    };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    const entity = await this.goalRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`目标不存在，ID: ${id}`);
    }

    Object.assign(entity, updateGoalDto);
    const savedEntity = await this.goalRepository.save(entity);
    return GoalMapper.entityToDto(savedEntity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.goalRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`目标不存在，ID: ${id}`);
    }
    await this.goalRepository.remove(entity);
  }

  async softDelete(id: string): Promise<void> {
    const result = await this.goalRepository.softDelete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`目标不存在，ID: ${id}`);
    }
  }

  async batchUpdate(ids: string[], updateData: Partial<Goal>): Promise<void> {
    await this.goalRepository.update(
      { id: In(ids) },
      updateData
    );
  }

  // 获取树形仓库
  getTreeRepository() {
    return this.goalRepository.manager.getTreeRepository(Goal);
  }

  // 构建查询条件的私有方法
  private buildQuery(filter: GoalListFilterDto) {
    let query = this.goalRepository.createQueryBuilder("goal");

    // 软删除过滤
    query = query.andWhere("goal.deletedAt IS NULL");

    // 状态过滤
    if (filter.status) {
      query = query.andWhere("goal.status = :status", { status: filter.status });
    }

    // 类型过滤
    if (filter.type) {
      query = query.andWhere("goal.type = :type", { type: filter.type });
    }

    // 重要程度过滤
    if (filter.importance) {
      query = query.andWhere("goal.importance = :importance", { importance: filter.importance });
    }

    // 紧急程度过滤
    if (filter.urgency) {
      query = query.andWhere("goal.urgency = :urgency", { urgency: filter.urgency });
    }

    // 关键词搜索
    if (filter.keyword) {
      query = query.andWhere(
        "(goal.name LIKE :keyword OR goal.description LIKE :keyword)",
        { keyword: `%${filter.keyword}%` }
      );
    }

    // 日期范围过滤
    if (filter.planDateStart) {
      query = query.andWhere("goal.startAt >= :planDateStart", { 
        planDateStart: new Date(filter.planDateStart + "T00:00:00") 
      });
    }
    if (filter.planDateEnd) {
      query = query.andWhere("goal.endAt <= :planDateEnd", { 
        planDateEnd: new Date(filter.planDateEnd + "T23:59:59") 
      });
    }

    // 完成日期范围过滤
    if (filter.doneDateStart && filter.doneDateEnd) {
      query = query.andWhere("goal.doneAt BETWEEN :doneDateStart AND :doneDateEnd", {
        doneDateStart: new Date(filter.doneDateStart + "T00:00:00"),
        doneDateEnd: new Date(filter.doneDateEnd + "T23:59:59"),
      });
    } else if (filter.doneDateStart) {
      query = query.andWhere("goal.doneAt >= :doneDateStart", { 
        doneDateStart: new Date(filter.doneDateStart + "T00:00:00") 
      });
    } else if (filter.doneDateEnd) {
      query = query.andWhere("goal.doneAt <= :doneDateEnd", { 
        doneDateEnd: new Date(filter.doneDateEnd + "T23:59:59") 
      });
    }

    // 放弃日期范围过滤
    if (filter.abandonedDateStart && filter.abandonedDateEnd) {
      query = query.andWhere("goal.abandonedAt BETWEEN :abandonedDateStart AND :abandonedDateEnd", {
        abandonedDateStart: new Date(filter.abandonedDateStart + "T00:00:00"),
        abandonedDateEnd: new Date(filter.abandonedDateEnd + "T23:59:59"),
      });
    } else if (filter.abandonedDateStart) {
      query = query.andWhere("goal.abandonedAt >= :abandonedDateStart", { 
        abandonedDateStart: new Date(filter.abandonedDateStart + "T00:00:00") 
      });
    } else if (filter.abandonedDateEnd) {
      query = query.andWhere("goal.abandonedAt <= :abandonedDateEnd", { 
        abandonedDateEnd: new Date(filter.abandonedDateEnd + "T23:59:59") 
      });
    }

    return query.orderBy("goal.updatedAt", "DESC");
  }
} 