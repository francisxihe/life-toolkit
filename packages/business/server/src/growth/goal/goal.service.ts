import { GoalRepository, GoalTreeRepository } from "./goal.repository";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalStatus } from "./goal.enum";

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
    await this.validateBusinessRules(createGoalDto);
    const processedDto = await this.processCreateData(createGoalDto);

    if (processedDto.parentId) {
      return await this.goalTreeRepository.createWithParent(processedDto);
    }

    const result = await this.goalRepository.create(processedDto);
    await this.afterCreate(result);
    return result;
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    await this.checkPermission(filter);

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

  async getTree(filter: GoalListFilterDto): Promise<GoalDto[]> {
    await this.checkPermission(filter);

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
    await this.checkPermission(filter);
    return await this.goalRepository.page(filter);
  }

  async findById(id: string): Promise<GoalDto> {
    return await this.goalRepository.findById(id);
  }

  async findDetail(id: string): Promise<GoalDto> {
    // 使用仓储层实现（包含 parent/children/taskList）
    return await this.goalTreeRepository.findDetail(id);
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    await this.validateUpdateRules(id, updateGoalDto);
    const processedDto = await this.processUpdateData(updateGoalDto);

    if (updateGoalDto.parentId !== undefined) {
      return await this.goalTreeRepository.updateWithParent(id, processedDto);
    }

    const result = await this.goalRepository.update(id, processedDto);
    await this.afterUpdate(result);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this.validateDelete(id);
    await this.goalTreeRepository.deleteWithTree(id);
    await this.afterDelete(id);
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
    await this.validateBatchOperation(idList, "done");
    await this.goalRepository.batchUpdate(idList, {
      status: GoalStatus.DONE,
      doneAt: new Date(),
    });
  }

  // 私有业务方法
  private async validateBusinessRules(dto: CreateGoalDto): Promise<void> {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new Error("目标名称不能为空");
    }
  }

  private async processCreateData(dto: CreateGoalDto): Promise<CreateGoalDto> {
    return {
      ...dto,
      name: dto.name.trim(),
    };
  }

  private async afterCreate(result: GoalDto): Promise<void> {
    // hook
  }

  private async validateUpdateRules(
    id: string,
    dto: UpdateGoalDto
  ): Promise<void> {
    // hook
  }

  private async processUpdateData(dto: UpdateGoalDto): Promise<UpdateGoalDto> {
    return dto;
  }

  private async afterUpdate(result: GoalDto): Promise<void> {
    // hook
  }

  private async validateDelete(id: string): Promise<void> {
    // hook
  }

  private async afterDelete(id: string): Promise<void> {
    // hook
  }

  private async validateBatchOperation(
    ids: string[],
    operation: string
  ): Promise<void> {
    // hook
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

  private async checkPermission(filter: any): Promise<void> {
    // hook
  }
}
