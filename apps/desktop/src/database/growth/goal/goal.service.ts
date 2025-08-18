import { GoalType, GoalStatus } from "./goal.entity";
import { GoalRepository } from "./goal.repository";
import { GoalTreeRepository } from "./goal-tree.repository";
import {
  GoalService as _GoalService,
  CreateGoalDto,
  UpdateGoalDto,
  GoalListFilterDto,
  GoalPageFilterDto,
  GoalDto,
} from "@life-toolkit/business-server";

export default class GoalService {
  private goalService: _GoalService;
  private treeRepo: GoalTreeRepository;

  constructor() {
    const repo = new GoalRepository();
    this.treeRepo = new GoalTreeRepository();
    this.goalService = new _GoalService(repo, this.treeRepo);
  }

  async create(goalData: {
    name: string;
    type: GoalType;
    status?: GoalStatus;
    description?: string;
    startDate?: Date;
    endDate?: Date;
    priority?: number;
    parentId?: string;
  }): Promise<GoalDto> {
    const dto: CreateGoalDto = {
      name: goalData.name,
      type: goalData.type as any,
      status: (goalData.status as any) ?? GoalStatus.TODO,
      description: goalData.description,
      importance: (goalData as any).importance,
      startAt: goalData.startDate,
      endAt: goalData.endDate,
      parentId: goalData.parentId,
    } as any;
    return await this.goalService.create(dto);
  }

  async findById(id: string): Promise<GoalDto> {
    // 返回包含关系的详情，兼容原有调用
    return await this.goalService.findDetail(id);
  }

  async findAll(): Promise<GoalDto[]> {
    return await this.goalService.findAll({} as GoalListFilterDto);
  }

  async findRoots(): Promise<GoalDto[]> {
    // 返回根节点树
    return await this.goalService.getTree({} as GoalListFilterDto);
  }

  async findTree(): Promise<GoalDto[]> {
    return await this.goalService.getTree({} as GoalListFilterDto);
  }

  async findChildren(parentId: string): Promise<GoalDto[]> {
    const detail = await this.goalService.findDetail(parentId);
    return (detail?.children ?? []) as any;
  }

  async findParent(childId: string): Promise<GoalDto | null> {
    // 简化：通过树仓储查询祖先
    const node = await this.treeRepo.findOne({ id: childId } as any);
    if (!node) return null;
    const ancestors = await this.treeRepo.findAncestors(node as any);
    if (ancestors.length > 1) {
      const parentId = (ancestors as any)[ancestors.length - 2].id as string;
      return await this.goalService.findById(parentId);
    }
    return null;
  }

  async update(id: string, data: any): Promise<GoalDto> {
    const dto: UpdateGoalDto = {
      name: data.name,
      description: data.description,
      type: data.type as any,
      importance: data.importance,
      status: data.status as any,
      startAt: data.startDate,
      endAt: data.endDate,
      parentId: data.parentId,
      doneAt: data.completedAt,
    } as any;
    return await this.goalService.update(id, dto);
  }

  async delete(id: string): Promise<void> {
    await this.goalService.delete(id);
  }

  async findByType(type: GoalType): Promise<GoalDto[]> {
    return await this.goalService.findAll({ type } as any);
  }

  async findByStatus(status: GoalStatus): Promise<GoalDto[]> {
    return await this.goalService.findAll({ status } as any);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<GoalDto[]> {
    return await this.goalService.findAll({
      startAt: startDate,
      endAt: endDate,
    } as any);
  }

  async count(): Promise<number> {
    const list = await this.goalService.findAll({} as GoalListFilterDto);
    return list.length;
  }

  async page(
    pageNum: number,
    pageSize: number
  ): Promise<{
    data: GoalDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const res = await this.goalService.page({
      pageNum,
      pageSize,
    } as unknown as GoalPageFilterDto);
    return {
      data: res.list ?? [],
      total: res.total,
      pageNum,
      pageSize,
    } as any;
  }

  async batchDone(ids: string[]): Promise<void> {
    await this.goalService.batchDone(ids);
  }

  async list(filter?: {
    type?: GoalType;
    status?: GoalStatus;
    priority?: number;
    keyword?: string;
    startDate?: Date;
    endDate?: Date;
    parentId?: string;
  }): Promise<GoalDto[]> {
    const f: any = {} as GoalListFilterDto;
    if (filter?.type !== undefined) f.type = filter.type as any;
    if (filter?.status !== undefined) f.status = filter.status as any;
    if (filter?.keyword) (f as any).keyword = filter.keyword;
    if (filter?.startDate) f.startAt = filter.startDate;
    if (filter?.endDate) f.endAt = filter.endDate;
    if (filter?.parentId) f.parentId = filter.parentId;
    const list = await this.goalService.findAll(f);
    return list;
  }
}

export const goalService = new GoalService();
