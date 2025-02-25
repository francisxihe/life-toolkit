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
import { Task, TaskStatus } from "./entities";
import { TrackTime } from "../track-time";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFilterDto,
  TaskListFilterDto,
  TaskDto,
  TaskWithTrackTimeDto,
} from "./dto";
import { TaskMapper } from "./mapper";

function getWhere(filter: TaskPageFilterDto) {
  const where: FindOptionsWhere<Task> = {};

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
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TrackTime)
    private readonly trackTimeRepository: Repository<TrackTime>
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
    if (createTaskDto.parentId) {
      const parentTask = await this.taskRepository.findOneBy({
        id: createTaskDto.parentId,
      });
      if (!parentTask) {
        throw new Error("Parent task not found");
      }
      createTaskDto.parent = parentTask;
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      status: TaskStatus.TODO,
      tags: createTaskDto.tags || [],
    });
    await this.taskRepository.save(task);
    return TaskMapper.entityToDto(task);
  }

  async findAll(filter: TaskListFilterDto): Promise<TaskDto[]> {
    const taskList = await this.taskRepository.find({
      where: getWhere(filter),
      relations: ["children", "parent"],
    });

    return taskList
      .filter((task) => !task.parent)
      .map((task) => TaskMapper.entityToDto(task));
  }

  async page(
    filter: TaskPageFilterDto
  ): Promise<{ list: TaskDto[]; total: number }> {
    const pageNum = filter.pageNum || 1;
    const pageSize = filter.pageSize || 10;

    const [taskList, total] = await this.taskRepository.findAndCount({
      where: getWhere(filter),
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: taskList.map((task) => TaskMapper.entityToDto(task)),
      total,
    };
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDto> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new Error("Task not found");
    }

    await this.taskRepository.update(id, {
      ...updateTaskDto,
    });

    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const treeRepository = this.taskRepository.manager.getTreeRepository(Task);
    const taskToDelete = await treeRepository.findOne({
      where: { id },
      relations: ["children"],
    });

    if (!taskToDelete) {
      throw new Error("Task not found");
    }

    // 获取所有子节点
    const descendantsTree =
      await treeRepository.findDescendantsTree(taskToDelete);

    const getAllDescendantIds = (node: Task): string[] => {
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
    await this.taskRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 删除闭包表中的所有相关记录
        for (const nodeId of allIds) {
          await transactionalEntityManager.query(
            `DELETE FROM task_closure WHERE id_ancestor = ? OR id_descendant = ?`,
            [nodeId, nodeId]
          );
        }

        // 删除所有节点
        await transactionalEntityManager.delete(Task, allIds);
      }
    );
  }

  async findById(id: string): Promise<TaskDto> {
    const task = await this.taskRepository.findOneBy({ id });
    if (!task) {
      throw new Error("Task not found");
    }

    return TaskMapper.entityToDto(task);
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    // 先查询任务
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["children"],
    });

    if (!task) {
      throw new Error("Task not found");
    }

    if (task.trackTimeIds?.length) {
      // 再查询相关的 track times
      const trackTimes = await this.trackTimeRepository.findBy({
        id: In(task.trackTimeIds),
      });
      return { ...task, trackTimeList: trackTimes };
    }

    return { ...task, trackTimeList: [] };
  }
}
