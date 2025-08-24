import { GoalRepository, GoalTreeRepository } from "./goal.repository";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalType, GoalStatus } from "@life-toolkit/enum";

export class GoalService {
  goalRepository: GoalRepository;
  goalTreeRepository: GoalTreeRepository;

  constructor(
    goalRepository: GoalRepository,
    goalTreeRepository: GoalTreeRepository
  ) {
    this.goalRepository = goalRepository;
    this.goalTreeRepository = goalTreeRepository;
  }

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    if (createGoalDto.parentId) {
      return await this.goalTreeRepository.createWithParent(createGoalDto);
    }

    const result = await this.goalRepository.create(createGoalDto);
    return result;
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    const treeFilters = await this.goalTreeRepository.processTreeFilter({
      withoutSelf: (filter as any).withoutSelf,
      id: (filter as any).id,
      parentId: filter.parentId,
    });

    const processedFilter = {
      ...filter,
      ...treeFilters,
    } as any;

    return await this.goalRepository.findAll(processedFilter);
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    if (updateGoalDto.parentId !== undefined) {
      return await this.goalTreeRepository.updateWithParent(id, updateGoalDto);
    }

    const result = await this.goalRepository.update(id, updateGoalDto);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.goalTreeRepository.deleteWithTree(id);
  }

  async findById(id: string): Promise<GoalDto> {
    return await this.goalRepository.findById(id);
  }

  async getTree(filter: GoalListFilterDto): Promise<GoalDto[]> {
    // 交由仓储层处理树形构建与过滤
    return await this.goalTreeRepository.getFilteredTree({
      status: filter.status,
      keyword: (filter as any).keyword,
      importance: filter.importance,
    });
  }

  async page(
    filter: GoalPageFilterDto
  ): Promise<{ list: GoalDto[]; total: number }> {
    return await this.goalRepository.page(filter);
  }

  async findDetail(id: string): Promise<GoalDto> {
    // 使用仓储层实现（包含 parent/children/taskList）
    return await this.goalTreeRepository.findDetail(id);
  }

  // 状态操作（业务逻辑）
  async done(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);
    if (!this.canMarkAsDone(entity)) {
      throw new Error("当前状态不允许标记为完成");
    }
    await this.goalRepository.update(id, {
      status: GoalStatus.DONE,
      doneAt: new Date(),
    });
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);
    if (!this.canAbandon(entity)) {
      throw new Error("当前状态不允许放弃");
    }
    await this.goalRepository.update(id, {
      status: GoalStatus.ABANDONED,
      abandonedAt: new Date(),
    });
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);
    if (!this.canRestore(entity)) {
      throw new Error("当前状态不允许恢复");
    }
    await this.goalRepository.update(id, {
      status: GoalStatus.TODO,
    });
    return true;
  }

  async batchDone(idList: string[]): Promise<void> {
    await this.goalRepository.batchUpdate(idList, {
      status: GoalStatus.DONE,
      doneAt: new Date(),
    });
  }

  private canMarkAsDone(entity: GoalDto): boolean {
    return (
      entity.status === GoalStatus.TODO ||
      entity.status === GoalStatus.IN_PROGRESS
    );
  }

  private canAbandon(entity: GoalDto): boolean {
    return entity.status !== GoalStatus.ABANDONED;
  }

  private canRestore(entity: GoalDto): boolean {
    return entity.status === GoalStatus.ABANDONED;
  }
}
