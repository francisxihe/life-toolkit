import { GoalDto, CreateGoalDto, UpdateGoalDto, GoalFilterDto, GoalPageFilterDto } from './dto';
import { GoalRepository } from './goal.repository';
import { GoalTreeRepository } from './goal-tree.repository';
import { Goal } from './goal.entity';
import { GoalStatus, GoalType, TodoRelatedType } from '@true-north/enum';
import { TaskRepository } from '../task/task.repository';
import { TodoRepository } from '../todo/todo.repository';
import { HabitRepository } from '../habit/habit.repository';

export class GoalService {
  goalRepository: GoalRepository;
  goalTreeRepository: GoalTreeRepository;
  private readonly taskRepository = new TaskRepository();
  private readonly todoRepository = new TodoRepository();
  private readonly habitRepository = new HabitRepository();

  constructor(goalRepository: GoalRepository, goalTreeRepository: GoalTreeRepository) {
    this.goalRepository = goalRepository;
    this.goalTreeRepository = goalTreeRepository;
  }

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    await this.validateGoalCandidate({
      ...createGoalDto,
      id: undefined,
    });
    const goalEntity = new Goal();
    goalEntity.name = createGoalDto.name;
    goalEntity.description = createGoalDto.description;
    // Status changes are only allowed through done/abandon/restore. New goals
    // always start from TODO even if a stale client payload contains status.
    goalEntity.status = GoalStatus.TODO;
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
    // 如果只获取根级目标，直接使用 findRoots 方法
    if (filter.onlyRootLevel) {
      return this.findRoots();
    }

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
    const current = await this.goalRepository.find(updateGoalDto.id);
    if (
      updateGoalDto.status !== undefined ||
      updateGoalDto.doneAt !== undefined ||
      updateGoalDto.abandonedAt !== undefined
    ) {
      throw new Error('目标状态只能通过完成、放弃或恢复操作更新');
    }

    const candidate = {
      ...current,
      ...updateGoalDto,
      parentId: updateGoalDto.parentId === undefined ? current.parentId : updateGoalDto.parentId,
    };
    await this.validateGoalCandidate(candidate);
    await this.validateGoalChildren(candidate);

    const updateEntity = updateGoalDto.exportUpdateEntity();
    if (updateGoalDto.parentId !== undefined) {
      // `undefined` is ignored by TypeORM's save. Use null explicitly so a
      // cleared parent selection really detaches the goal from its old parent.
      updateEntity.parent = updateGoalDto.parentId
        ? ({ id: updateGoalDto.parentId } as Goal)
        : (null as any);
      updateEntity.parentId = updateGoalDto.parentId || (null as any);
    }
    const entity = await this.goalRepository.update(updateEntity);
    const goalDto = new GoalDto();
    goalDto.importEntity(entity);
    return goalDto;
  }

  async delete(id: string): Promise<void> {
    const goal = await this.goalRepository.find(id);
    if (!goal) throw new Error(`目标不存在，ID: ${id}`);
    const impact = await this.getDeleteImpact(id);
    if (impact.length) {
      throw new Error(`无法删除目标，仍有关联内容：${impact.join('、')}`);
    }
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
    if (dto.status !== GoalStatus.TODO && dto.status !== GoalStatus.DOING) {
      throw new Error('当前状态不允许标记为完成');
    }
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    goalUpdate.status = GoalStatus.DONE;
    goalUpdate.doneAt = new Date();
    goalUpdate.abandonedAt = null as any;
    await this.goalRepository.update(goalUpdate);
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const entity = await this.goalRepository.find(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status !== GoalStatus.TODO && dto.status !== GoalStatus.DOING) {
      throw new Error('当前状态不允许放弃');
    }
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    goalUpdate.status = GoalStatus.ABANDONED;
    goalUpdate.abandonedAt = new Date();
    goalUpdate.doneAt = null as any;
    await this.goalRepository.update(goalUpdate);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const entity = await this.goalRepository.find(id);
    const dto = GoalDto.importEntity(entity);
    if (dto.status !== GoalStatus.ABANDONED && dto.status !== GoalStatus.DONE) {
      throw new Error('当前状态不允许恢复');
    }
    const goalUpdate = new Goal();
    goalUpdate.id = id;
    goalUpdate.status = GoalStatus.TODO;
    goalUpdate.doneAt = null as any;
    goalUpdate.abandonedAt = null as any;
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
      const traverse = (n: Goal): boolean => {
        const hasMatchingChild = (n.children || []).map(traverse).some(Boolean);
        if (this.matchesTreeFilter(n, filter) || hasMatchingChild) {
          res.add(n.id);
          return true;
        }
        return false;
      };
      traverse(full);
    }
    return res;
  }

  async getFilteredTree(filter: GoalFilterDto): Promise<Goal[]> {
    const treeRepo = this.goalTreeRepository;
    if (!this.hasTreeFilter(filter)) {
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

  private hasTreeFilter(filter: GoalFilterDto): boolean {
    return Boolean(
      filter.status ||
      filter.keyword ||
      filter.type ||
      filter.importance ||
      filter.difficulty ||
      filter.startDateStart ||
      filter.startDateEnd ||
      filter.endDateStart ||
      filter.endDateEnd,
    );
  }

  private matchesTreeFilter(goal: Goal, filter: GoalFilterDto): boolean {
    const statusMatch =
      !filter.status ||
      (Array.isArray(filter.status) ? filter.status.includes(goal.status) : goal.status === filter.status);
    const keywordMatch =
      !filter.keyword ||
      goal.name.includes(filter.keyword) ||
      (goal.description || '').includes(filter.keyword);
    const typeMatch = !filter.type || goal.type === filter.type;
    const importanceMatch = !filter.importance || goal.importance === filter.importance;
    const difficultyMatch = !filter.difficulty || goal.difficulty === filter.difficulty;
    const startAt = goal.startAt?.getTime();
    const endAt = goal.endAt?.getTime();
    const startAfter = !filter.startDateStart || (startAt !== undefined && startAt >= new Date(`${filter.startDateStart}T00:00:00`).getTime());
    const startBefore = !filter.startDateEnd || (startAt !== undefined && startAt <= new Date(`${filter.startDateEnd}T23:59:59`).getTime());
    const endAfter = !filter.endDateStart || (endAt !== undefined && endAt >= new Date(`${filter.endDateStart}T00:00:00`).getTime());
    const endBefore = !filter.endDateEnd || (endAt !== undefined && endAt <= new Date(`${filter.endDateEnd}T23:59:59`).getTime());

    return statusMatch && keywordMatch && typeMatch && importanceMatch && difficultyMatch && startAfter && startBefore && endAfter && endBefore;
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

  private async validateGoalCandidate(candidate: Partial<Goal> & { id?: string }): Promise<void> {
    const { parentId, type, startAt, endAt, importance, difficulty, id } = candidate;

    if (startAt && endAt && startAt > endAt) {
      throw new Error('目标结束日期不能早于开始日期');
    }

    if (!parentId) {
      if (type !== GoalType.VISION) throw new Error('顶层目标必须为愿景类型');
      return;
    }

    if (parentId === id) throw new Error('目标不能设为自身的父目标');
    const parent = await this.goalRepository.find(parentId);
    if (id) {
      const current = await this.goalRepository.find(id);
      const descendants = await this.goalTreeRepository.findDescendants(current);
      if (descendants.some((goal) => goal.id === parentId)) {
        throw new Error('不能将目标移动到自己的子目标下');
      }
    }
    if (parent.type === GoalType.RESULT && type !== GoalType.RESULT) {
      throw new Error('指标目标只能包含指标子目标');
    }
    if (parent.startAt && startAt && startAt < parent.startAt) {
      throw new Error('子目标开始日期不能早于父目标');
    }
    if (parent.endAt && endAt && endAt > parent.endAt) {
      throw new Error('子目标结束日期不能晚于父目标');
    }
    if (parent.importance !== undefined && importance !== undefined && importance > parent.importance) {
      throw new Error('子目标重要度不能高于父目标');
    }
    if (parent.difficulty !== undefined && difficulty !== undefined && difficulty > parent.difficulty) {
      throw new Error('子目标难度不能高于父目标');
    }
  }

  private async validateGoalChildren(candidate: Partial<Goal> & { id?: string }): Promise<void> {
    if (!candidate.id) return;
    const children = await this.goalRepository.findByFilter({ parentId: candidate.id } as GoalFilterDto);
    for (const child of children) {
      if (candidate.type === GoalType.RESULT && child.type !== GoalType.RESULT) {
        throw new Error(`子目标“${child.name}”不是指标类型，请先调整子目标`);
      }
      if (candidate.startAt && child.startAt && child.startAt < candidate.startAt) {
        throw new Error(`子目标“${child.name}”的开始日期超出父目标范围`);
      }
      if (candidate.endAt && child.endAt && child.endAt > candidate.endAt) {
        throw new Error(`子目标“${child.name}”的结束日期超出父目标范围`);
      }
      if (candidate.importance !== undefined && child.importance > candidate.importance) {
        throw new Error(`子目标“${child.name}”的重要度高于父目标`);
      }
      if (candidate.difficulty !== undefined && child.difficulty !== undefined && child.difficulty > candidate.difficulty) {
        throw new Error(`子目标“${child.name}”的难度高于父目标`);
      }
    }
  }

  private async getDeleteImpact(id: string): Promise<string[]> {
    const children = await this.goalRepository.findByFilter({ parentId: id } as GoalFilterDto);
    const tasks = await this.taskRepository.findByFilter({ goalIds: [id] } as any);
    const todoCount = await this.todoRepository.repo.count({
      where: { relatedId: id, relatedType: TodoRelatedType.GOAL } as any,
    });
    const habitCount = await this.habitRepository.repo
      .createQueryBuilder('habit')
      .innerJoin('habit.goals', 'goal', 'goal.id = :id', { id })
      .getCount();
    const impact: string[] = [];
    if (children.length) impact.push(`${children.length} 个子目标`);
    if (tasks.length) impact.push(`${tasks.length} 个关联任务`);
    if (todoCount) impact.push(`${todoCount} 个关联待办`);
    if (habitCount) impact.push(`${habitCount} 个关联习惯`);
    return impact;
  }
}

export const goalService = new GoalService(new GoalRepository(), new GoalTreeRepository());
