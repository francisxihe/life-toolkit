import { Injectable, BadRequestException } from "@nestjs/common";
import { GoalRepository } from "./goal.repository";
import { GoalTreeService } from "./goal-tree.service";
import { GoalMapper } from "./mappers";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalStatus, Goal } from "./entities";
import { Like } from "typeorm";

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

  async getTree(filter: GoalListFilterDto): Promise<GoalDto[]> {
    // 权限检查
    await this.checkPermission(filter);

    // 获取树形仓库
    const treeRepo = this.goalTreeService.getTreeRepo();

    // 如果没有过滤条件，直接返回所有根节点的完整树
    if (!filter.status && !filter.keyword && !filter.importance) {
      console.log("=== 进入完整树形结构分支 ===");
      const rootNodes = await treeRepo.findRoots();
      console.log(
        `找到 ${rootNodes.length} 个根节点:`,
        rootNodes.map((r) => r.name)
      );

      const trees: GoalDto[] = [];
      for (const root of rootNodes) {
        console.log(`开始构建根节点 ${root.name} 的树形结构`);
        const tree = await this.buildTree(root, treeRepo);
        trees.push(GoalMapper.entityToDto(tree));
      }
      console.log("=== 完整树形结构构建完成 ===");
      return trees;
    }

    // 构建查询条件
    const whereCondition: any = {};

    if (filter.status) {
      whereCondition.status = filter.status;
    }

    if (filter.keyword) {
      whereCondition.name = Like(`%${filter.keyword}%`);
    }

    if (filter.importance) {
      whereCondition.importance = filter.importance;
    }

    // 先找到所有满足条件的节点
    const matchingNodes = await treeRepo.find({ where: whereCondition });
    console.log(
      `找到 ${matchingNodes.length} 个满足条件的节点:`,
      matchingNodes.map((n) => ({ name: n.name, id: n.id, status: n.status }))
    );

    if (matchingNodes.length === 0) {
      return [];
    }

    // 收集所有需要包含的节点ID（包括祖先路径）
    const nodeIdsToInclude = new Set<string>();

    for (const node of matchingNodes) {
      // 添加当前节点
      nodeIdsToInclude.add(node.id);

      // 添加所有祖先节点
      const ancestors = await treeRepo.findAncestors(node);
      console.log(
        `节点 ${node.name} 的祖先节点:`,
        ancestors.map((a) => ({ name: a.name, id: a.id }))
      );
      ancestors.forEach((ancestor) => nodeIdsToInclude.add(ancestor.id));
    }

    console.log(`需要包含的节点ID:`, Array.from(nodeIdsToInclude));

    // 获取所有根节点
    const allRootNodes = await treeRepo.findRoots();
    console.log(
      `所有根节点:`,
      allRootNodes.map((r) => ({ name: r.name, id: r.id }))
    );

    // 过滤并构建树形结构
    const trees: GoalDto[] = [];

    for (const root of allRootNodes) {
      console.log(
        `检查根节点 ${root.name} 是否需要包含:`,
        nodeIdsToInclude.has(root.id)
      );
      if (nodeIdsToInclude.has(root.id)) {
        console.log(`构建根节点 ${root.name} 的树形结构`);
        // 获取完整的子树
        const fullTree = await this.buildTree(root, treeRepo);

        // 过滤子树，只保留需要的节点
        const filteredTree = this.filterTreeNodes(fullTree, nodeIdsToInclude);

        if (filteredTree) {
          trees.push(GoalMapper.entityToDto(filteredTree));
        }
      }
    }

    return trees;
  }

  /**
   * 手动构建树形结构
   */
  private async buildTree(node: Goal, treeRepo: any): Promise<Goal> {
    // 直接使用SQL查询来调试
    const result = await treeRepo.query(
      `
      SELECT id, name, status, parent_id 
      FROM goal 
      WHERE parent_id = ? AND deleted_at IS NULL
    `,
      [node.id]
    );

    console.log(`SQL查询结果 for parent ${node.id}:`, result);

    // 如果有子节点，转换为Goal实体
    const children = [];
    for (const row of result) {
      const child = await treeRepo.findOne({ where: { id: row.id } });
      if (child) {
        const childTree = await this.buildTree(child, treeRepo);
        children.push(childTree);
      }
    }

    // 设置子节点
    node.children = children;

    return node;
  }

  /**
   * 过滤树形节点，只保留指定的节点ID
   */
  private filterTreeNodes(
    node: any,
    nodeIdsToInclude: Set<string>
  ): any | null {
    if (!nodeIdsToInclude.has(node.id)) {
      return null;
    }

    // 创建新的节点对象
    const filteredNode = { ...node };

    // 过滤子节点
    if (node.children && node.children.length > 0) {
      const filteredChildren = node.children
        .map((child: any) => this.filterTreeNodes(child, nodeIdsToInclude))
        .filter((child: any) => child !== null);

      filteredNode.children = filteredChildren;
    } else {
      filteredNode.children = [];
    }

    return filteredNode;
  }

  async page(
    filter: GoalPageFilterDto
  ): Promise<{ list: GoalDto[]; total: number }> {
    // 权限检查
    await this.checkPermission(filter);

    return await this.goalRepository.page(filter);
  }

  async findById(id: string): Promise<GoalDto> {
    return await this.goalRepository.findById(id);
  }

  async findDetail(id: string): Promise<GoalDto> {
    const treeRepo = this.goalTreeService.getTreeRepo();

    // 使用findDescendantsTree获取完整的树形结构
    const entity = await treeRepo.findOne({ where: { id } });

    if (!entity) {
      throw new BadRequestException(`目标不存在，ID: ${id}`);
    }

    // 获取完整的树形结构（包含所有子目标）
    const treeWithChildren = await treeRepo.findDescendantsTree(entity);

    // 手动加载parent和taskList关系
    const entityWithRelations = await treeRepo.findOne({
      where: { id },
      relations: ["parent", "taskList"],
    });

    if (entityWithRelations) {
      treeWithChildren.parent = entityWithRelations.parent;
      treeWithChildren.taskList = entityWithRelations.taskList;
    }

    return GoalMapper.entityToDto(treeWithChildren);
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    // 业务验证
    await this.validateUpdateRules(id, updateGoalDto);

    // 数据处理
    const processedDto = await this.processUpdateData(updateGoalDto);

    // 如果更新了parentId，需要特殊处理树形结构
    if (updateGoalDto.parentId !== undefined) {
      return await this.updateWithParent(id, processedDto);
    }

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
    await this.validateBatchOperation(idList, "done");

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
        status: dto.status || GoalStatus.TODO,
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
      // 在事务内直接转换为DTO返回，避免事务外查询问题
      return GoalMapper.entityToDto(savedEntity);
    });
  }

  private async updateWithParent(
    id: string,
    dto: UpdateGoalDto
  ): Promise<GoalDto> {
    // 使用事务处理树形结构更新
    const treeRepo = this.goalRepository.getTreeRepository();

    return await treeRepo.manager.transaction(async (manager) => {
      const treeRepository = manager.getTreeRepository(treeRepo.target);

      // 先获取当前目标
      const currentGoal = await treeRepository.findOne({ where: { id } });
      if (!currentGoal) {
        throw new BadRequestException(`目标不存在，ID: ${id}`);
      }

      // 更新基础字段
      Object.assign(currentGoal, dto);

      // 处理父级关系变更
      if (dto.parentId) {
        // 设置新的父级
        await this.goalTreeService.updateParent(
          {
            currentGoal,
            parentId: dto.parentId,
          },
          treeRepository
        );
      } else if (dto.parentId === null) {
        // 移除父级关系，设为根节点
        currentGoal.parent = undefined;
        await treeRepository.save(currentGoal);
      }

      // 保存更新后的实体
      const savedEntity = await treeRepository.save(currentGoal);
      return GoalMapper.entityToDto(savedEntity);
    });
  }

  private async processTreeFilter(
    filter: GoalListFilterDto
  ): Promise<GoalListFilterDto> {
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
        const entity = await treeRepo.findOne({
          where: { id: filter.parentId },
        });
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
    // 实现权限检查逻辑
    // 例如：检查用户是否有权限访问这些数据
  }

  private async validateUpdateRules(
    id: string,
    dto: UpdateGoalDto
  ): Promise<void> {
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

  private async validateBatchOperation(
    ids: string[],
    operation: string
  ): Promise<void> {
    // 实现批量操作验证逻辑
  }
}
