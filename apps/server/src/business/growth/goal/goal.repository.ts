import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { CreateGoalDto, UpdateGoalDto, GoalPageFilterDto, GoalFilterDto, GoalDto } from '@life-toolkit/business-server';
import { Goal } from '@life-toolkit/business-server';
import { GoalType, GoalStatus } from '@life-toolkit/enum';

@Injectable()
export class GoalRepository {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) {}

  // 基础 CRUD 操作
  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    const entity = this.goalRepository.create({
      ...createGoalDto,
      status: GoalStatus.TODO,
    });
    const savedEntity = await this.goalRepository.save(entity);
    return GoalDto.importEntity(savedEntity);
  }

  async findWithRelations(id: string, relations?: string[]): Promise<GoalDto> {
    const entity = await this.goalRepository.findOne({
      where: { id },
      relations,
    });
    if (!entity) {
      throw new NotFoundException(`目标不存在，ID: ${id}`);
    }
    return GoalDto.importEntity(entity);
  }

  async findByFilter(filter: GoalFilterDto): Promise<GoalDto[]> {
    const query = this.buildQuery(filter);
    const entities = await query.getMany();
    return entities.map((entity) => GoalDto.importEntity(entity));
  }

  async page(
    filter: GoalPageFilterDto
  ): Promise<{ list: GoalDto[]; total: number; pageNum: number; pageSize: number }> {
    const { pageNum = 1, pageSize = 10 } = filter;
    const skip = (pageNum - 1) * pageSize;

    const query = this.buildQuery(filter);
    const [entities, total] = await query.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: entities.map((entity) => GoalDto.importEntity(entity)),
      total,
      pageNum,
      pageSize,
    };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    const entity = await this.goalRepository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`目标不存在，ID: ${id}`);
    }

    Object.assign(entity, updateGoalDto);
    const savedEntity = await this.goalRepository.save(entity);
    return GoalDto.importEntity(savedEntity);
  }

  async remove(id: string): Promise<void> {
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
    await this.goalRepository.update({ id: In(ids) }, updateData);
  }

  async updateStatus(id: string, status: GoalStatus, extra: Partial<Goal> = {}): Promise<void> {
    const entity = await this.goalRepository.findOne({ where: { id } });
    if (!entity) throw new NotFoundException(`目标不存在，ID: ${id}`);
    Object.assign(entity, { status, ...extra });
    await this.goalRepository.save(entity);
  }

  async doneBatch(ids: string[]): Promise<void> {
    await this.goalRepository.update(
      { id: In(ids) },
      {
        status: GoalStatus.DONE,
        doneAt: new Date(),
      }
    );
  }

  // 构建查询条件的私有方法
  private buildQuery(filter: GoalFilterDto) {
    let query = this.goalRepository.createQueryBuilder('goal').leftJoinAndSelect('goal.parent', 'parent');

    // 软删除过滤
    query = query.andWhere('goal.deletedAt IS NULL');

    // includeIds / excludeIds（由 service 预处理）
    if ((filter as any).includeIds && (filter as any).includeIds.length > 0) {
      query = query.andWhere('goal.id IN (:...includeIds)', {
        includeIds: (filter as any).includeIds,
      });
    }
    if ((filter as any).excludeIds && (filter as any).excludeIds.length > 0) {
      query = query.andWhere('goal.id NOT IN (:...excludeIds)', {
        excludeIds: (filter as any).excludeIds,
      });
    }

    // 父级过滤
    if (filter.parentId) {
      query = query.andWhere('parent.id = :parentId', {
        parentId: filter.parentId,
      });
    }

    // 状态过滤
    if (filter.status) {
      query = query.andWhere('goal.status = :status', {
        status: filter.status,
      });
    }

    // 类型过滤
    if (filter.type) {
      query = query.andWhere('goal.type = :type', { type: filter.type });
    }

    // 重要程度过滤
    if (filter.importance) {
      query = query.andWhere('goal.importance = :importance', {
        importance: filter.importance,
      });
    }

    // 关键词搜索
    if ((filter as any).keyword) {
      query = query.andWhere('(goal.name LIKE :keyword OR goal.description LIKE :keyword)', {
        keyword: `%${(filter as any).keyword}%`,
      });
    }

    // 计划时间范围过滤
    if ((filter as any).planDateStart) {
      query = query.andWhere('goal.startAt >= :planDateStart', {
        planDateStart: new Date((filter as any).planDateStart + 'T00:00:00'),
      });
    }
    if ((filter as any).planDateEnd) {
      query = query.andWhere('goal.endAt <= :planDateEnd', {
        planDateEnd: new Date((filter as any).planDateEnd + 'T23:59:59'),
      });
    }

    // 完成日期范围过滤
    if ((filter as any).doneDateStart && (filter as any).doneDateEnd) {
      query = query.andWhere('goal.doneAt BETWEEN :doneDateStart AND :doneDateEnd', {
        doneDateStart: new Date((filter as any).doneDateStart + 'T00:00:00'),
        doneDateEnd: new Date((filter as any).doneDateEnd + 'T23:59:59'),
      });
    } else if ((filter as any).doneDateStart) {
      query = query.andWhere('goal.doneAt >= :doneDateStart', {
        doneDateStart: new Date((filter as any).doneDateStart + 'T00:00:00'),
      });
    } else if ((filter as any).doneDateEnd) {
      query = query.andWhere('goal.doneAt <= :doneDateEnd', {
        doneDateEnd: new Date((filter as any).doneDateEnd + 'T23:59:59'),
      });
    }

    // 放弃日期范围过滤
    if ((filter as any).abandonedDateStart && (filter as any).abandonedDateEnd) {
      query = query.andWhere('goal.abandonedAt BETWEEN :abandonedDateStart AND :abandonedDateEnd', {
        abandonedDateStart: new Date((filter as any).abandonedDateStart + 'T00:00:00'),
        abandonedDateEnd: new Date((filter as any).abandonedDateEnd + 'T23:59:59'),
      });
    } else if ((filter as any).abandonedDateStart) {
      query = query.andWhere('goal.abandonedAt >= :abandonedDateStart', {
        abandonedDateStart: new Date((filter as any).abandonedDateStart + 'T00:00:00'),
      });
    } else if ((filter as any).abandonedDateEnd) {
      query = query.andWhere('goal.abandonedAt <= :abandonedDateEnd', {
        abandonedDateEnd: new Date((filter as any).abandonedDateEnd + 'T23:59:59'),
      });
    }

    return query.orderBy('goal.updatedAt', 'DESC');
  }
}
