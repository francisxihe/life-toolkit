import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindOperator,
  FindOptionsWhere,
  Between,
  MoreThan,
  LessThan,
  Like,
  In,
  IsNull,
  Not,
} from "typeorm";
import { Goal, GoalStatus } from "./entities";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalMapper } from "./mappers";
import { TaskService } from "../task/task.service";
import { GoalTreeService } from "./goal-tree.service";

function getWhere(
  filter: GoalPageFilterDto & { excludeIds?: string[]; includeIds?: string[] }
) {
  const where: FindOptionsWhere<Goal> = {
    deletedAt: IsNull(),
  };

  if (filter.doneDateStart && filter.doneDateEnd) {
    where.doneAt = Between(
      new Date(filter.doneDateStart + "T00:00:00"),
      new Date(filter.doneDateEnd + "T23:59:59")
    );
  } else if (filter.doneDateStart) {
    where.doneAt = MoreThan(new Date(filter.doneDateStart + "T00:00:00"));
  } else if (filter.doneDateEnd) {
    where.doneAt = LessThan(new Date(filter.doneDateEnd + "T23:59:59"));
  }

  if (filter.abandonedDateStart && filter.abandonedDateEnd) {
    where.abandonedAt = Between(
      new Date(filter.abandonedDateStart + "T00:00:00"),
      new Date(filter.abandonedDateEnd + "T23:59:59")
    );
  } else if (filter.abandonedDateStart) {
    where.abandonedAt = MoreThan(
      new Date(filter.abandonedDateStart + "T00:00:00")
    );
  } else if (filter.abandonedDateEnd) {
    where.abandonedAt = LessThan(
      new Date(filter.abandonedDateEnd + "T23:59:59")
    );
  }

  if (filter.startAt) {
    where.startAt = MoreThan(new Date(filter.startAt + "T00:00:00"));
  }
  if (filter.endAt) {
    where.endAt = LessThan(new Date(filter.endAt + "T23:59:59"));
  }

  if (filter.keyword) {
    where.name = Like(`%${filter.keyword}%`);
  }
  if (filter.type) {
    where.type = filter.type;
  }
  if (filter.status) {
    where.status = filter.status;
  }
  if (filter.importance) {
    where.importance = filter.importance;
  }
  if (filter.urgency) {
    where.urgency = filter.urgency;
  }

  if (filter.includeIds && filter.includeIds.length > 0) {
    where.id = In(filter.includeIds);
  } else if (filter.excludeIds && filter.excludeIds.length > 0) {
    where.id = Not(In(filter.excludeIds));
  }

  return where;
}

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>,
    private readonly taskService: TaskService,
    private readonly goalTreeService: GoalTreeService
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    const createGoal = this.goalRepository.create({
      ...createGoalDto,
      status: GoalStatus.TODO,
    });

    await this.goalRepository.manager.transaction(async (goalManager) => {
      const treeRepo = goalManager.getTreeRepository(Goal);
      if (createGoalDto.parentId) {
        await this.goalTreeService.updateParent(
          {
            currentGoal: createGoal,
            parentId: createGoalDto.parentId,
          },
          treeRepo
        );
      }
      await treeRepo.save(createGoal);
    });

    return GoalMapper.entityToDto(createGoal);
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    let excludeIds: string[] = [];
    const treeRepo = this.goalTreeService.getTreeRepo();

    if (filter.withoutSelf && filter.id) {
      const goal = await this.goalRepository.findOne({
        where: { id: filter.id },
        relations: ["children"],
      });
      if (goal) {
        const flatChildren = await treeRepo.findDescendants(goal);
        excludeIds = flatChildren.map((child) => child.id);
        excludeIds.push(goal.id);
      }
    }

    let includeIds: string[] = [];
    if (filter.parentId) {
      const goal = await this.goalRepository.findOne({
        where: { id: filter.parentId },
        relations: ["children"],
      });
      if (goal) {
        const flatChildren = await treeRepo.findDescendants(goal);
        includeIds = flatChildren.map((child) => child.id);
        includeIds.push(goal.id);
      }
    }

    const goalList = await treeRepo.find({
      where: getWhere({
        ...filter,
        excludeIds,
        includeIds,
      }),
    });

    return goalList
      .filter((goal) => !goal.parent)
      .map((goal) => GoalMapper.entityToDto(goal));
  }

  async page(
    filter: GoalPageFilterDto
  ): Promise<{ list: GoalDto[]; total: number }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [goalList, total] = await this.goalRepository.findAndCount({
      where: getWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: goalList.map((goal) => GoalMapper.entityToDto(goal)),
      total,
    };
  }

  async update(id: string, updateGoalDto: UpdateGoalDto): Promise<GoalDto> {
    const goal = await this.goalRepository.findOneBy({ id });
    if (!goal) {
      throw new Error("Goal not found");
    }

    await this.goalRepository.update(id, {
      ...updateGoalDto,
    });

    return this.findDetail(id);
  }

  async delete(id: string): Promise<void> {
    const treeRepository = this.goalRepository.manager.getTreeRepository(Goal);
    const goalToDelete = await treeRepository.findOne({
      where: { id },
      relations: ["children"],
    });

    if (!goalToDelete) {
      throw new Error("Goal not found");
    }

    // 获取所有子节点
    const descendantsNodes = await treeRepository.findDescendants(goalToDelete);

    const allIds = descendantsNodes.map((node) => node.id);
    allIds.push(goalToDelete.id);

    // 使用事务确保数据一致性
    await this.goalRepository.manager.transaction(async (goalManager) => {
      const treeRepo = goalManager.getTreeRepository(Goal);

      // 先删除关联的任务
      await this.taskService.deleteByFilter(
        {
          goalIds: allIds,
        },
        goalManager
      );

      // 再删除目标及其子节点
      await this.goalTreeService.deleteChildren(goalToDelete, treeRepo);

      await goalManager.delete(Goal, {
        id: goalToDelete.id,
      });
    });
  }

  async findDetail(id: string): Promise<GoalDto> {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ["children", "parent", "taskList"],
    });
    if (!goal) {
      throw new Error("Goal not found");
    }
    return GoalMapper.entityToDto(goal);
  }
}
