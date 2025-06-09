import { Injectable, BadRequestException } from "@nestjs/common";
import { GoalRepository } from "./goal.repository";
import { GoalTreeService } from "./goal-tree.service";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalStatus } from "./entities";

@Injectable()
export class GoalService {
  constructor(
    private readonly goalRepository: GoalRepository,
    private readonly goalTreeService: GoalTreeService
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    // 业务验证
    await this.validateBusinessRules(createGoalDto);

    // 数据处理
    const processedDto = await this.processCreateData(createGoalDto);

    // 处理树形结构
    if (createGoalDto.parentId) {
      return await this.createWithParent(processedDto);
    }

    // 调用数据访问层
    const result = await this.goalRepository.create(processedDto);

    // 后置处理
    await this.afterCreate(result);

    return result;
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    // 权限检查
    await this.checkPermission(filter);

    // 处理树形过滤逻辑
    const processedFilter = await this.processTreeFilter(filter);

    return await this.goalRepository.findAll(processedFilter);
  }

  async page(filter: GoalPageFilterDto): Promise<{ list: GoalDto[]; total: number }> {
    // 权限检查
    await this.checkPermission(filter);

    return await this.goalRepository.page(filter);
  }

  async findById(id: string): Promise<GoalDto> {
    return await this.goalRepository.findById(id);
  }

  async findDetail(id: string): Promise<GoalDto> {
    return await this.goalRepository.findById(id, ["parent", "children", "taskList"]);
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    // 业务验证
    await this.validateUpdateRules(id, updateGoalDto);

    // 数据处理
    const processedDto = await this.processUpdateData(updateGoalDto);

    // 调用数据访问层
    const result = await this.goalRepository.update(id, processedDto);

    // 后置处理
    await this.afterUpdate(result);

    return result;
  }

  async delete(id: string): Promise<void> {
    // 删除前检查
    await this.validateDelete(id);

    // 处理树形删除逻辑
    await this.deleteWithTree(id);

    // 后置处理
    await this.afterDelete(id);
  }

  // 状态操作（业务逻辑）
  async done(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);

    // 业务规则验证
    if (!this.canMarkAsDone(entity)) {
      throw new BadRequestException("当前状态不允许标记为完成");
    }

    await this.goalRepository.update(id, {
      status: GoalStatus.DONE,
      doneAt: new Date(),
    });

    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);

    // 业务规则验证
    if (!this.canAbandon(entity)) {
      throw new BadRequestException("当前状态不允许放弃");
    }

    await this.goalRepository.update(id, {
      status: GoalStatus.ABANDONED,
      abandonedAt: new Date(),
    });

    return true;
  }

  async restore(id: string): Promise<boolean> {
    const entity = await this.goalRepository.findById(id);

    // 业务规则验证
    if (!this.canRestore(entity)) {
      throw new BadRequestException("当前状态不允许恢复");
    }

    await this.goalRepository.update(id, {
      status: GoalStatus.TODO,
    });

    return true;
  }

  // 批量操作
  async batchDone(idList: string[]): Promise<void> {
    // 批量验证
    await this.validateBatchOperation(idList, 'done');

    await this.goalRepository.batchUpdate(idList, {
      status: GoalStatus.DONE,
      doneAt: new Date(),
    });
  }

  // 私有业务方法
  private async validateBusinessRules(dto: CreateGoalDto): Promise<void> {
    // 实现业务规则验证
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException("目标名称不能为空");
    }
  }

  private async processCreateData(dto: CreateGoalDto): Promise<CreateGoalDto> {
    // 实现数据预处理
    return {
      ...dto,
      name: dto.name.trim(),
    };
  }

  private async afterCreate(result: GoalDto): Promise<void> {
    // 实现创建后处理
    // 例如：发送通知、更新缓存等
  }

  private async createWithParent(dto: CreateGoalDto): Promise<GoalDto> {
    // 使用事务处理树形结构创建
    const treeRepo = this.goalRepository.getTreeRepository();
    
    return await treeRepo.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(treeRepo.target);
      
      const entity = treeRepository.create({
        ...dto,
        status: GoalStatus.TODO,
      });

      if (dto.parentId) {
        await this.goalTreeService.updateParent(
          {
            currentGoal: entity,
            parentId: dto.parentId,
          },
          treeRepository
        );
      }

      const savedEntity = await treeRepository.save(entity);
      return this.goalRepository.findById(savedEntity.id);
    });
  }

  private async processTreeFilter(filter: GoalListFilterDto): Promise<GoalListFilterDto> {
    let excludeIds: string[] = [];
    let includeIds: string[] = [];

    const treeRepo = this.goalTreeService.getTreeRepo();

    // 处理排除自身逻辑
    if (filter.withoutSelf && filter.id) {
      const goal = await this.goalRepository.findById(filter.id);
      if (goal) {
        const entity = await treeRepo.findOne({ where: { id: filter.id } });
        if (entity) {
          const flatChildren = await treeRepo.findDescendants(entity);
          excludeIds = flatChildren.map((child) => child.id);
          excludeIds.push(goal.id);
        }
      }
    }

    // 处理父级过滤逻辑
    if (filter.parentId) {
      const goal = await this.goalRepository.findById(filter.parentId);
      if (goal) {
        const entity = await treeRepo.findOne({ where: { id: filter.parentId } });
        if (entity) {
          const flatChildren = await treeRepo.findDescendants(entity);
          includeIds = flatChildren.map((child) => child.id);
          includeIds.push(goal.id);
        }
      }
    }

    return {
      ...filter,
      excludeIds,
      includeIds,
    } as any;
  }

  private async deleteWithTree(id: string): Promise<void> {
    const treeRepository = this.goalRepository.getTreeRepository();
    const goalToDelete = await treeRepository.findOne({
      where: { id },
      relations: ["children"],
    });

    if (!goalToDelete) {
      throw new BadRequestException(`目标不存在，ID: ${id}`);
    }

    // 删除目标及其所有子目标
    await treeRepository.remove(goalToDelete);
  }

  private canMarkAsDone(entity: GoalDto): boolean {
    return entity.status === GoalStatus.TODO || entity.status === GoalStatus.IN_PROGRESS;
  }

  private canAbandon(entity: GoalDto): boolean {
    return entity.status !== GoalStatus.ABANDONED;
  }

  private canRestore(entity: GoalDto): boolean {
    return entity.status === GoalStatus.ABANDONED;
  }

  private async checkPermission(filter: any): Promise<void> {
    // 实现权限检查逻辑
    // 例如：检查用户是否有权限访问这些数据
  }

  private async validateUpdateRules(id: string, dto: UpdateGoalDto): Promise<void> {
    // 实现更新验证逻辑
  }

  private async processUpdateData(dto: UpdateGoalDto): Promise<UpdateGoalDto> {
    // 实现更新数据预处理
    return dto;
  }

  private async afterUpdate(result: GoalDto): Promise<void> {
    // 实现更新后处理
  }

  private async validateDelete(id: string): Promise<void> {
    // 实现删除验证逻辑
  }

  private async afterDelete(id: string): Promise<void> {
    // 实现删除后处理
  }

  private async validateBatchOperation(ids: string[], operation: string): Promise<void> {
    // 实现批量操作验证逻辑
  }
}
