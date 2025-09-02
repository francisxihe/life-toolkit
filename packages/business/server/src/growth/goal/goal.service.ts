import { GoalType, GoalStatus } from '@life-toolkit/enum';
import { GoalRepository, GoalTreeRepository } from './goal.repository';
import { CreateGoalDto, UpdateGoalDto, GoalPageFiltersDto, GoalListFiltersDto, GoalDto } from './dto';

export class GoalService {
  goalRepository: GoalRepository;
  goalTreeRepository: GoalTreeRepository;

  constructor(goalRepository: GoalRepository, goalTreeRepository: GoalTreeRepository) {
    this.goalRepository = goalRepository;
    this.goalTreeRepository = goalTreeRepository;
  }

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    if (createGoalDto.parentId) {
      const entity = await this.goalTreeRepository.createWithParent(createGoalDto);
      return GoalDto.importEntity(entity);
    }

    const entity = await this.goalRepository.create(createGoalDto);
    return GoalDto.importEntity(entity);
  }

  async findAll(filter: GoalListFiltersDto): Promise<GoalDto[]> {
    const treeFilters = await this.goalTreeRepository.processTreeFilter({
      excludeIds: filter.excludeIds,
      parentId: filter.parentId,
    });

    const processedFilter = {
      ...filter,
      ...treeFilters,
    };

    const entities = await this.goalRepository.findAll(processedFilter as any);
    return entities.map((entity) => GoalDto.importEntity(entity));
  }

  async list(filter: GoalListFiltersDto): Promise<GoalDto[]> {
    const list = await this.findAll(filter);
    return list;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    if (updateGoalDto.parentId !== undefined) {
      const entity = await this.goalTreeRepository.updateWithParent(id, updateGoalDto);
      return GoalDto.importEntity(entity);
    }

    const entity = await this.goalRepository.update(id, updateGoalDto);
    return GoalDto.importEntity(entity);
  }

  async delete(id: string): Promise<void> {
    await this.goalTreeRepository.deleteWithTree(id);
  }

  async findById(id: string): Promise<GoalDto> {
    const entity = await this.goalRepository.findById(id);
    return GoalDto.importEntity(entity);
  }

  async getTree(filter: GoalListFiltersDto): Promise<GoalDto[]> {
    // 交由仓储层处理树形构建与过滤
    const entities = await this.goalTreeRepository.getFilteredTree({
      status: filter.status,
      keyword: filter.keyword,
      importance: filter.importance,
    });
    return entities.map((entity) => GoalDto.importEntity(entity));
  }

  async page(filter: GoalPageFiltersDto): Promise<{
    list: GoalDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { list, total, pageNum, pageSize } = await this.goalRepository.page(filter);
    return {
      list: list.map((entity) => GoalDto.importEntity(entity)),
      total,
      pageNum,
      pageSize,
    };
  }

  async getDetail(id: string): Promise<GoalDto> {
    const entity = await this.goalTreeRepository.findDetail(id);
    return GoalDto.importEntity(entity);
  }

  // 状态操作（业务逻辑）
  async done(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status === GoalStatus.TODO || dto.status === GoalStatus.IN_PROGRESS) {
      throw new Error('当前状态不允许标记为完成');
    }
    await this.goalRepository.update(
      id,
      Object.assign(new UpdateGoalDto(), {
        status: GoalStatus.DONE,
        doneAt: new Date(),
      })
    );
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status === GoalStatus.ABANDONED) {
      throw new Error('当前状态不允许放弃');
    }
    await this.goalRepository.update(
      id,
      Object.assign(new UpdateGoalDto(), {
        status: GoalStatus.ABANDONED,
        abandonedAt: new Date(),
      })
    );
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status !== GoalStatus.ABANDONED) {
      throw new Error('当前状态不允许恢复');
    }
    await this.goalRepository.update(
      id,
      Object.assign(new UpdateGoalDto(), {
        status: GoalStatus.TODO,
      })
    );
    return true;
  }

  async doneBatch(includeIds: string[]): Promise<void> {
    const updateGoalDto = new UpdateGoalDto();
    updateGoalDto.status = GoalStatus.DONE;
    updateGoalDto.doneAt = new Date();
    await this.goalRepository.batchUpdate(includeIds, updateGoalDto);
  }

  async findRoots(): Promise<GoalDto[]> {
    const entities = await this.goalTreeRepository.findRoots();
    return entities.map((entity) => GoalDto.importEntity(entity));
  }
}
