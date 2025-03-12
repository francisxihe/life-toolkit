import { Inject, Injectable, forwardRef } from "@nestjs/common";
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
  TreeRepository,
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
import { TaskMapper } from "./mappers";
import { TodoService } from "../todo/todo.service";
import { TaskTreeService } from "./task-tree.service";

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
  if (filter.startAt) {
    where.startAt = MoreThan(new Date(filter.startAt));
  }
  if (filter.endAt) {
    where.endAt = LessThan(new Date(filter.endAt));
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
    private readonly trackTimeRepository: Repository<TrackTime>,
    private readonly todoService: TodoService,
    private readonly taskTreeService: TaskTreeService
  ) {}

  async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
    const treeRepo = this.taskTreeService.getTreeRepo();

    // 创建新任务
    const createTask = this.taskRepository.create(createTaskDto);
    createTask.status = TaskStatus.TODO;
    createTask.tags = createTaskDto.tags || [];

    await this.taskRepository.manager.transaction(
      async (transactionalManager) => {
        if (createTaskDto.parentId) {
          await this.taskTreeService.updateParent(
            {
              task: createTask,
              parentId: createTaskDto.parentId,
            },
            treeRepo
          );
        }
        await treeRepo.save(createTask);
      }
    );

    // 返回结果
    return TaskMapper.entityToDto(createTask);
  }

  async delete(id: string): Promise<void> {
    const treeRepo = this.taskTreeService.getTreeRepo();
    const taskToDelete = await treeRepo.findOne({
      where: { id },
      relations: ["children"],
    });

    if (!taskToDelete) {
      throw new Error("Task not found");
    }

    // 使用事务确保数据一致性
    await this.taskRepository.manager.transaction(async (taskManager) => {
      await this.taskTreeService.deleteChildren(
        taskToDelete,
        taskManager.getTreeRepository(Task)
      );
      await taskManager.delete(Task, taskToDelete.id);
    });
  }

  async batchDelete(ids: string[]): Promise<void> {
    if (ids.length === 0) {
      return;
    }

    const treeRepo = this.taskTreeService.getTreeRepo();

    const taskListToDelete = await treeRepo.find({
      where: { id: In(ids) },
      relations: ["children"],
    });

    if (taskListToDelete.length === 0) {
      throw new Error("Task not found");
    }

    // 使用事务确保数据一致性
    await this.taskRepository.manager.transaction(async (taskManager) => {
      await this.taskTreeService.deleteChildren(
        taskListToDelete,
        taskManager.getTreeRepository(Task)
      );

      // 删除所有节点
      await taskManager.delete(Task, taskListToDelete);
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDto> {
    const updateTask = await this.taskTreeService
      .getTreeRepo()
      .findOneBy({ id });

    if (!updateTask) {
      throw new Error("Task not found");
    }

    await this.taskRepository.manager.transaction(
      async (transactionalManager) => {
        const treeRepo = transactionalManager.getTreeRepository(Task);

        if (updateTaskDto.parentId) {
          await this.taskTreeService.updateParent(
            {
              task: updateTask,
              parentId: updateTaskDto.parentId,
            },
            treeRepo
          );
        }

        const updateTaskEntity = TaskMapper.updateDtoToEntity(
          updateTaskDto,
          updateTask
        );
        delete updateTaskDto.parentId;
        await treeRepo.update(id, updateTaskEntity);
      }
    );

    return this.findById(id);
  }

  async findAll(filter: TaskListFilterDto): Promise<TaskDto[]> {
    let flatChildrenIds: string[] = [];

    if (filter.withoutSelf && filter.id) {
      const treeRepo = this.taskRepository.manager.getTreeRepository(Task);
      const task = await this.taskRepository.findOne({
        where: { id: filter.id },
        relations: ["children"],
      });
      if (task) {
        const flatChildren = await treeRepo.findDescendants(task);
        flatChildrenIds = flatChildren.map((child) => child.id);
      }
    }

    const taskList = await this.taskRepository.find({
      where: {
        ...getWhere(filter),
        id: Not(In(flatChildrenIds)),
      },
      relations: ["children"],
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

  async findById(id: string): Promise<TaskDto> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ["children", "parent", "goal", "todoList"],
    });
    if (!task) {
      throw new Error("Task not found");
    }

    return TaskMapper.entityToDto(task);
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    // 先查询任务
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ["children", "parent", "goal", "todoList"],
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

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    const tasks = await this.taskRepository.find({
      where: { goalId: In(goalIds), deletedAt: IsNull() },
    });
    return tasks;
  }
}
