import { GoalDto, CreateGoalDto, UpdateGoalDto, GoalListFiltersDto, GoalPageFiltersDto } from './dto';
import { GoalRepository, GoalTreeRepository } from './goal.repository';
import { Goal } from './goal.entity';
import { GoalStatus } from '@life-toolkit/enum';

export class GoalService {
  goalRepository: GoalRepository;
  goalTreeRepository: GoalTreeRepository;

  constructor(goalRepository: GoalRepository, goalTreeRepository: GoalTreeRepository) {
    this.goalRepository = goalRepository;
    this.goalTreeRepository = goalTreeRepository;
  }

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    const goalEntity = new Goal();
    goalEntity.name = createGoalDto.name;
    goalEntity.description = createGoalDto.description;
    goalEntity.status = createGoalDto.status;
    goalEntity.importance = createGoalDto.importance;
    goalEntity.difficulty = createGoalDto.difficulty;
    goalEntity.type = createGoalDto.type;
    goalEntity.startAt = createGoalDto.startAt;
    goalEntity.endAt = createGoalDto.endAt;
    // parentId 需要通过关系设置
    if (createGoalDto.parentId) {
      goalEntity.parent = { id: createGoalDto.parentId } as Goal;
    }
    const entity = await this.goalRepository.create(goalEntity);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
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
    return entities.map((entity) => {
      const goalDto = new GoalDto();
      goalDto.importEntity(entity);
      return goalDto;
    });
  }


  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    if (updateGoalDto.name !== undefined) goalUpdate.name = updateGoalDto.name;
    if (updateGoalDto.description !== undefined) goalUpdate.description = updateGoalDto.description;
    if (updateGoalDto.status !== undefined) goalUpdate.status = updateGoalDto.status;
    if (updateGoalDto.importance !== undefined) goalUpdate.importance = updateGoalDto.importance;
    if (updateGoalDto.difficulty !== undefined) goalUpdate.difficulty = updateGoalDto.difficulty;
    if (updateGoalDto.type !== undefined) goalUpdate.type = updateGoalDto.type;
    if (updateGoalDto.parentId !== undefined) {
      goalUpdate.parent = updateGoalDto.parentId ? ({ id: updateGoalDto.parentId } as Goal) : undefined;
    }
    if (updateGoalDto.startAt !== undefined) goalUpdate.startAt = updateGoalDto.startAt;
    if (updateGoalDto.endAt !== undefined) goalUpdate.endAt = updateGoalDto.endAt;
    if (updateGoalDto.doneAt !== undefined) goalUpdate.doneAt = updateGoalDto.doneAt;
    if (updateGoalDto.abandonedAt !== undefined) goalUpdate.abandonedAt = updateGoalDto.abandonedAt;

    const entity = await this.goalRepository.update(goalUpdate);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
  }

  async delete(id: string): Promise<void> {
    await this.goalTreeRepository.deleteWithTree(id);
  }

  async find(id: string): Promise<GoalDto> {
    const entity = await this.goalRepository.find(id);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
  }

  async getTree(filter: GoalListFiltersDto): Promise<GoalDto[]> {
    // 交由仓储层处理树形构建与过滤
    const entities = await this.goalTreeRepository.getFilteredTree({
      status: filter.status,
      keyword: filter.keyword,
      importance: filter.importance,
    });
    return entities.map((entity) => {
      const goalDto = new GoalDto();
      goalDto.importEntity(entity);
      return goalDto;
    });
  }

  async page(
    filter: GoalPageFiltersDto
  ): Promise<{ list: GoalDto[]; total: number; pageNum: number; pageSize: number }> {
    const { list, total, pageNum, pageSize } = await this.goalRepository.page(filter);
    return {
      list: list.map((entity) => {
        const goalDto = new GoalDto();
        goalDto.importEntity(entity);
        return goalDto;
      }),
      total,
      pageNum,
      pageSize,
    };
  }

  async findWithRelations(id: string): Promise<GoalDto> {
    const entity = await this.goalRepository.findWithRelations(id, ['parent', 'children', 'taskList']);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
  }

  // 状态操作（业务逻辑）
  async done(id: string): Promise<boolean> {
    const entity = await this.goalRepository.find(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status === GoalStatus.TODO || dto.status === GoalStatus.IN_PROGRESS) {
      throw new Error('当前状态不允许标记为完成');
    }
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    goalUpdate.status = GoalStatus.DONE;
    goalUpdate.doneAt = new Date();
    await this.goalRepository.update(goalUpdate);
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const entity = await this.goalRepository.find(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status === GoalStatus.ABANDONED) {
      throw new Error('当前状态不允许放弃');
    }
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    goalUpdate.status = GoalStatus.ABANDONED;
    goalUpdate.abandonedAt = new Date();
    await this.goalRepository.update(goalUpdate);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const entity = await this.goalRepository.find(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status !== GoalStatus.ABANDONED) {
      throw new Error('当前状态不允许恢复');
    }
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    goalUpdate.status = GoalStatus.TODO;
    await this.goalRepository.update(goalUpdate);
    return true;
  }

  async doneBatch(params: { includeIds: string[] }): Promise<any> {
    const goalUpdate = new Goal();
    goalUpdate.status = GoalStatus.DONE;
    goalUpdate.doneAt = new Date();
    const filter = new GoalListFiltersDto();
    filter.includeIds = params.includeIds;
    const result = await this.goalRepository.updateByFilter(filter, goalUpdate);
    return result;
  }

  async findRoots(): Promise<GoalDto[]> {
    const entities = await this.goalTreeRepository.findRoots();
    return entities.map((entity) => {
      const goalDto = new GoalDto();
      goalDto.importEntity(entity);
      return goalDto;
    });
  }
}
