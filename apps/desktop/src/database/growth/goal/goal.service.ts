import {
  GoalService as _GoalService,
  CreateGoalDto,
  UpdateGoalDto,
  GoalListFilterDto,
  GoalPageFilterDto,
  GoalDto,
} from "@life-toolkit/business-server";
import { GoalRepository } from "./goal.repository";
import { GoalTreeRepository } from "./goal-tree.repository";

export default class GoalService {
  private goalService: _GoalService;
  private treeRepo: GoalTreeRepository;

  constructor() {
    const repo = new GoalRepository();
    this.treeRepo = new GoalTreeRepository();
    this.goalService = new _GoalService(repo, this.treeRepo);
  }

  async create(goalData: CreateGoalDto): Promise<GoalDto> {
    return this.goalService.create(goalData);
  }

  async findById(id: string): Promise<GoalDto> {
    return this.goalService.findById(id);
  }

  async findDetail(id: string): Promise<GoalDto> {
    return this.goalService.findDetail(id);
  }

  async findAll(filter?: GoalListFilterDto): Promise<GoalDto[]> {
    return this.goalService.findAll(filter);
  }

  async findRoots(): Promise<GoalDto[]> {
    // 返回根节点树
    return this.goalService.getTree({} as GoalListFilterDto);
  }

  async findTree(): Promise<GoalDto[]> {
    return this.goalService.getTree({} as GoalListFilterDto);
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    return this.goalService.update(id, updateGoalDto);
  }

  async delete(id: string): Promise<void> {
    await this.goalService.delete(id);
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
    } as GoalPageFilterDto);
    return {
      data: res.list ?? [],
      total: res.total,
      pageNum,
      pageSize,
    };
  }

  async batchDone(ids: string[]): Promise<void> {
    await this.goalService.batchDone(ids);
  }

  async list(filter?: GoalListFilterDto): Promise<GoalDto[]> {
    return await this.goalService.findAll(filter);
  }
}

export const goalService = new GoalService();
