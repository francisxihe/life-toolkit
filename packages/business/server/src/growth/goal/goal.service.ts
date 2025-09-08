import { GoalDto, CreateGoalDto, UpdateGoalDto, GoalFilterDto, GoalPageFilterDto } from './dto';
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

  async findByFilter(filter: GoalFilterDto): Promise<GoalDto[]> {
    const treeFilters = await this.processTreeFilter({
      excludeIds: filter.excludeIds,
      parentId: filter.parentId,
    });

    const processedFilter = {
      ...filter,
      ...treeFilters,
    };

    const entities = await this.goalRepository.findByFilter(processedFilter as any);
    return entities.map((entity) => {
      const goalDto = new GoalDto();
      goalDto.importEntity(entity);
      return goalDto;
    });
  }

  async update(updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    const updateEntity = updateGoalDto.exportUpdateEntity();
    const entity = await this.goalRepository.update(updateEntity);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
  }

  async delete(id: string): Promise<void> {
    const goal = await this.goalRepository.find(id);
    if (!goal) throw new Error(`目标不存在，ID: ${id}`);
    await this.goalRepository.delete(id);
  }

  async find(id: string): Promise<GoalDto> {
    const entity = await this.goalRepository.find(id);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
  }

  async getTree(filter: GoalFilterDto): Promise<GoalDto[]> {
    // 交由仓储层处理树形构建与过滤
    const goalFilterDto = new GoalFilterDto();
    goalFilterDto.importListVo(filter);
    const entities = await this.getFilteredTree(goalFilterDto);
    return entities.map((entity) => {
      const goalDto = new GoalDto();
      goalDto.importEntity(entity);
      return goalDto;
    });
  }

  async page(
    filter: GoalPageFilterDto
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
    const filter = new GoalFilterDto();
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

  async buildTree(node: Goal): Promise<Goal> {
    const tree = await this.goalTreeRepository.findDescendantsTree(node);
    // 过滤软删除
    const filterDeleted = (n: Goal): Goal | null => {
      if (n.deletedAt) return null;
      const children: Goal[] = [];
      for (const c of n.children || []) {
        const fc = filterDeleted(c);
        if (fc) children.push(fc);
      }
      n.children = children;
      return n;
    };
    const filtered = filterDeleted(tree);
    return filtered || node;
  }

  filterTreeNodes(node: Goal, nodeIdsToInclude: Set<string>): Goal | null {
    if (!nodeIdsToInclude.has(node.id)) return null;
    const children: Goal[] = [];
    for (const child of node.children || []) {
      const fc = this.filterTreeNodes(child, nodeIdsToInclude);
      if (fc) children.push(fc);
    }
    return { ...node, children } as Goal;
  }

  async collectIdsByFilter(filter: GoalFilterDto): Promise<Set<string>> {
    const treeRepo = this.goalTreeRepository;
    const roots = await treeRepo.findRoots();
    const res = new Set<string>();
    for (const r of roots) {
      const full = await treeRepo.findDescendantsTree(r);
      const traverse = (n: Goal) => {
        if (
          (!filter.status || n.status === filter.status) &&
          (!filter.keyword || n.name.includes(filter.keyword) || (n.description || '').includes(filter.keyword)) &&
          (!filter.importance || n.importance === filter.importance)
        ) {
          res.add(n.id);
        }
        for (const c of n.children || []) traverse(c);
      };
      traverse(full);
    }
    return res;
  }

  async getFilteredTree(filter: GoalFilterDto): Promise<Goal[]> {
    const treeRepo = this.goalTreeRepository;
    if (!filter.status && !filter.keyword && !filter.importance) {
      const roots = await treeRepo.findRoots();
      const trees: Goal[] = [];
      for (const r of roots) {
        const full = await this.buildTree(r);
        trees.push(full);
      }
      return trees;
    }

    const includeIds = await this.collectIdsByFilter(filter);
    if (includeIds.size === 0) return [];

    const roots = await treeRepo.findRoots();
    const trees: Goal[] = [];
    for (const r of roots) {
      if (includeIds.has(r.id)) {
        const full = await treeRepo.findDescendantsTree(r);
        const filtered = this.filterTreeNodes(full, includeIds);
        if (filtered) trees.push(filtered);
      }
    }
    return trees;
  }

  async processTreeFilter(filter: {
    excludeIds?: string[];
    parentId?: string;
  }): Promise<{ includeIds?: string[]; excludeIds?: string[] }> {
    const treeRepo = this.goalTreeRepository;
    let includeIds: string[] = [];
    let excludeIds: string[] = [];

    if (filter.excludeIds) {
      const filter = new GoalFilterDto();
      filter.excludeIds = filter.excludeIds;
      const nodes = await this.goalRepository.findByFilter(filter);
      for (const node of nodes) {
        const all = await this.goalTreeRepository.findDescendants(node);
        excludeIds = all.map((n) => n.id);
        excludeIds.push(node.id);
      }
    }

    if (filter.parentId) {
      const filter = new GoalFilterDto();
      filter.parentId = filter.parentId;
      const parent = await this.goalRepository.findByFilter(filter);
      if (parent.length > 0) {
        const all = await treeRepo.findDescendants(parent[0]);
        includeIds = all.map((n) => n.id);
        includeIds.push(parent[0].id);
      }
    }

    return { includeIds, excludeIds };
  }
}
