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
} from "typeorm";
import { Goal, GoalStatus } from "./entities";
import {
  CreateGoalDto,
  UpdateGoalDto,
  GoalPageFilterDto,
  GoalListFilterDto,
  GoalDto,
} from "./dto";
import { GoalMapper } from "./mapper";

function getWhere(filter: GoalPageFilterDto) {
  const where: FindOptionsWhere<Goal> = {};

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
  if (filter.keyword) {
    where.name = Like(`%${filter.keyword}%`);
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

  return where;
}

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: Repository<Goal>
  ) {}

  async create(createGoalDto: CreateGoalDto): Promise<GoalDto> {
    if (createGoalDto.parentId) {
      const parentGoal = await this.goalRepository.findOneBy({
        id: createGoalDto.parentId,
      });
      if (!parentGoal) {
        throw new Error("Parent goal not found");
      }
      createGoalDto.parent = parentGoal;
    }

    const goal = this.goalRepository.create({
      ...createGoalDto,
      status: GoalStatus.TODO,
    });
    await this.goalRepository.save(goal);
    return GoalMapper.entityToDto(goal);
  }

  async findAll(filter: GoalListFilterDto): Promise<GoalDto[]> {
    const goalList = await this.goalRepository.find({
      where: getWhere(filter),
      relations: ["children", "parent"],
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

    return this.findById(id);
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
    const descendantsTree =
      await treeRepository.findDescendantsTree(goalToDelete);

    const getAllDescendantIds = (node: Goal): string[] => {
      const ids = [node.id];
      if (node.children) {
        node.children.forEach((child) => {
          ids.push(...getAllDescendantIds(child));
        });
      }
      return ids;
    };

    const allIds = getAllDescendantIds(descendantsTree);

    // 使用事务确保数据一致性
    await this.goalRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 删除闭包表中的所有相关记录
        for (const nodeId of allIds) {
          await transactionalEntityManager.query(
            `DELETE FROM goal_closure WHERE id_ancestor = ? OR id_descendant = ?`,
            [nodeId, nodeId]
          );
        }

        // 删除所有节点
        await transactionalEntityManager.delete(Goal, allIds);
      }
    );
  }

  async findById(id: string): Promise<GoalDto> {
    const goal = await this.goalRepository.findOne({
      where: { id },
      relations: ["children", "parent"],
    });
    if (!goal) {
      throw new Error("Goal not found");
    }
    return GoalMapper.entityToDto(goal);
  }
}
