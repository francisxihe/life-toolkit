import { TaskRepository, TaskTreeRepository } from './task.repository';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFiltersDto,
  TaskListFiltersDto,
  TaskDto,
  TaskWithTrackTimeDto,
} from './dto';
import { Task } from './task.entity';
import { TaskStatus } from '@life-toolkit/enum';
import { TodoService, TodoRepository, TodoRepeatRepository } from '../todo';

export class TaskService {
  protected taskRepository: TaskRepository;
  protected taskTreeRepository: TaskTreeRepository;
  protected todoRepository: TodoRepository;
  protected todoRepeatRepository: TodoRepeatRepository;

  constructor(taskRepository: TaskRepository, taskTreeRepository: TaskTreeRepository, todoRepository: TodoRepository, todoRepeatRepository: TodoRepeatRepository) {
    this.taskRepository = taskRepository;
    this.taskTreeRepository = taskTreeRepository;
    this.todoRepository = todoRepository;
    this.todoRepeatRepository = todoRepeatRepository;
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
    const taskEntity: Partial<Task> = {
      name: createTaskDto.name,
      description: createTaskDto.description,
      tags: createTaskDto.tags,
      estimateTime: createTaskDto.estimateTime,
      importance: createTaskDto.importance,
      urgency: createTaskDto.urgency,
      goalId: createTaskDto.goalId,
      startAt: createTaskDto.startAt,
      endAt: createTaskDto.endAt,
    };
    // 处理父任务关系
    if (createTaskDto.parentId) {
      taskEntity.parent = { id: createTaskDto.parentId } as Task;
    }
    const entity = await this.taskRepository.create(taskEntity as Task);
    if (createTaskDto.parentId) {
      await this.taskTreeRepository.updateParent({
        task: entity as Task,
        parentId: createTaskDto.parentId,
      });
    }
    const resultEntity = await this.taskRepository.find(entity.id);
    return TaskDto.importEntity(resultEntity);
  }

  async delete(id: string): Promise<boolean> {
    const taskToDelete = await this.taskRepository.find(id);
    if (!taskToDelete) {
      throw new Error('Task not found');
    }
    const allIds = await this.taskTreeRepository.computeDescendantIds(taskToDelete);
    const todoService = new TodoService(this.todoRepository, this.todoRepeatRepository);
    await todoService.deleteByTaskIds(allIds);
    await this.taskTreeRepository.deleteByIds(allIds);
    return true;
  }

  async deleteByFilter(filter: TaskListFiltersDto): Promise<void> {
    const entities = await this.taskRepository.findAll(filter);
    if (!entities.length) return;
    const toDeleteIds = entities.map((t) => t.id);

    const treeTargets: Task[] = [] as Task[];
    for (const id of toDeleteIds) {
      try {
        const t = await this.taskRepository.find(id);
        if (t) treeTargets.push(t);
      } catch (error) {
        // 任务不存在，跳过
      }
    }
    if (!treeTargets.length) throw new Error('Task not found');

    const allIds: string[] = [];
    for (const t of treeTargets) {
      const ids = await this.taskTreeRepository.computeDescendantIds(t);
      allIds.push(...ids);
    }
    const todoService = new TodoService(this.todoRepository, this.todoRepeatRepository);
    await todoService.deleteByTaskIds(allIds);
    await this.taskTreeRepository.deleteByIds(allIds);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDto> {
    const taskUpdate = new Task();
    taskUpdate.id = id;
    if (updateTaskDto.name !== undefined) taskUpdate.name = updateTaskDto.name;
    if (updateTaskDto.description !== undefined) taskUpdate.description = updateTaskDto.description;
    if (updateTaskDto.tags !== undefined) taskUpdate.tags = updateTaskDto.tags;
    if (updateTaskDto.estimateTime !== undefined) taskUpdate.estimateTime = updateTaskDto.estimateTime;
    if (updateTaskDto.importance !== undefined) taskUpdate.importance = updateTaskDto.importance;
    if (updateTaskDto.urgency !== undefined) taskUpdate.urgency = updateTaskDto.urgency;
    if (updateTaskDto.goalId !== undefined) taskUpdate.goalId = updateTaskDto.goalId;
    if (updateTaskDto.startAt !== undefined) taskUpdate.startAt = updateTaskDto.startAt;
    if (updateTaskDto.endAt !== undefined) taskUpdate.endAt = updateTaskDto.endAt;
    if (updateTaskDto.status !== undefined) taskUpdate.status = updateTaskDto.status;
    if (updateTaskDto.doneAt !== undefined) taskUpdate.doneAt = updateTaskDto.doneAt;
    if (updateTaskDto.abandonedAt !== undefined) taskUpdate.abandonedAt = updateTaskDto.abandonedAt;
    // 处理父任务关系
    if (updateTaskDto.parentId !== undefined) {
      taskUpdate.parent = updateTaskDto.parentId ? ({ id: updateTaskDto.parentId } as Task) : undefined;
    }
    // 使用标准仓储方法更新
    const entity = await this.taskRepository.update(taskUpdate);
    return TaskDto.importEntity(entity);
  }

  async findAll(filter: TaskListFiltersDto): Promise<TaskDto[]> {
    const entities = await this.taskRepository.findAll(filter);
    return entities.map((entity) => TaskDto.importEntity(entity));
  }


  async page(filter: TaskPageFiltersDto): Promise<{
    list: TaskDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { list, total, pageNum, pageSize } = await this.taskRepository.page(filter);
    return {
      list: list.map((entity) => TaskDto.importEntity(entity)),
      total,
      pageNum,
      pageSize,
    };
  }

  async find(id: string): Promise<TaskDto> {
    const entity = await this.taskRepository.find(id);
    return TaskDto.importEntity(entity);
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    const entity = await this.taskRepository.findWithRelations(taskId);
    const base = TaskDto.importEntity(entity);
    const result = new TaskWithTrackTimeDto();
    Object.assign(result, base);
    result.trackTimeList = [];
    return result;
  }

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    const filter = new TaskListFiltersDto();
    filter.goalIds = goalIds;
    return await this.taskRepository.findAll(filter);
  }

  async abandon(id: string): Promise<boolean> {
    await this.update(id, Object.assign(new UpdateTaskDto(), { status: TaskStatus.ABANDONED }));
    return true;
  }

  async restore(id: string): Promise<boolean> {
    await this.update(id, Object.assign(new UpdateTaskDto(), { status: TaskStatus.TODO }));
    return true;
  }
}
