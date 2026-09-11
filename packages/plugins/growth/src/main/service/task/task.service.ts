import { TaskRepository } from './task.repository';
import { TaskTreeRepository } from './task-tree.repository';
import { CreateTaskDto, UpdateTaskDto, TaskPageFilterDto, TaskFilterDto, TaskDto } from './dto';
import { Task } from './task.entity';
import { GoalRepository } from '../goal/goal.repository';
import { TodoRepository } from '../todo/todo.repository';
import { TodoRepeatRepository } from '../todo/todo-repeat.repository';
import { TrackTimeRepository } from '../track-time/track-time.repository';
import { TrackTimeDto } from '../track-time/dto/track-time-model.dto';
import { TaskStatus, TodoRelatedType, TrackTimeRelatedType } from '@true-north/enum';

export class TaskService {
  protected taskRepository: TaskRepository;
  protected taskTreeRepository: TaskTreeRepository;
  protected todoRepository: TodoRepository;
  protected todoRepeatRepository: TodoRepeatRepository;
  protected goalRepository: GoalRepository;
  protected trackTimeRepository: TrackTimeRepository;

  constructor(
    taskRepository: TaskRepository,
    taskTreeRepository: TaskTreeRepository,
    todoRepository: TodoRepository,
    todoRepeatRepository: TodoRepeatRepository,
    goalRepository = new GoalRepository(),
    trackTimeRepository = new TrackTimeRepository()
  ) {
    this.taskRepository = taskRepository;
    this.taskTreeRepository = taskTreeRepository;
    this.todoRepository = todoRepository;
    this.todoRepeatRepository = todoRepeatRepository;
    this.goalRepository = goalRepository;
    this.trackTimeRepository = trackTimeRepository;
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
    const createData = await this.withInheritedTaskFields(createTaskDto);
    this.assertValidEstimateTime(createData.estimateTime);
    await this.validateTaskCandidate(createData);
    const task = new Task();
    task.name = createData.name;
    task.description = createData.description;
    task.tags = createData.tags ?? [];
    task.estimateTime = createData.estimateTime;
    task.importance = createData.importance;
    task.difficulty = createData.difficulty;
    task.urgency = createData.urgency;
    task.goalId = createData.goalId;
    task.startAt = createData.startAt;
    task.endAt = createData.endAt;
    task.status = TaskStatus.TODO;

    if (createData.parentId) {
      const parent = await this.taskRepository.find(createData.parentId);
      task.parent = parent;
      task.parentId = parent.id;
    } else if (createData.goalId) {
      task.goal = await this.goalRepository.find(createData.goalId);
    }

    const entity = await this.taskRepository.create(task);
    return TaskDto.importEntity(entity);
  }

  async delete(id: string): Promise<boolean> {
    const task = await this.taskRepository.find(id);
    const childCount = await this.taskRepository.repo.count({ where: { parentId: id } as any });
    const todoCount = await this.todoRepository.repo.count({
      where: { relatedType: TodoRelatedType.TASK, relatedId: id } as any,
    });
    if (childCount || todoCount) {
      const impacts = [];
      if (childCount) impacts.push(`${childCount} 个子任务`);
      if (todoCount) impacts.push(`${todoCount} 个关联待办`);
      throw new Error(`无法删除任务，仍有关联内容：${impacts.join('、')}`);
    }
    await this.taskRepository.delete(task.id);
    return true;
  }

  async deleteByFilter(filter: TaskFilterDto): Promise<void> {
    const entities = await this.taskRepository.findByFilter(filter);
    for (const entity of entities) await this.delete(entity.id);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDto> {
    const current = await this.taskRepository.find(id);
    if (
      updateTaskDto.status !== undefined ||
      updateTaskDto.doneAt !== undefined ||
      updateTaskDto.abandonedAt !== undefined
    ) {
      throw new Error('任务状态只能通过完成、放弃或恢复操作更新');
    }

    const candidate = {
      ...current,
      ...updateTaskDto,
      id,
      parentId: updateTaskDto.parentId === undefined ? current.parentId : updateTaskDto.parentId,
      goalId: updateTaskDto.goalId === undefined ? current.goalId : updateTaskDto.goalId,
    };
    this.assertValidEstimateTime(candidate.estimateTime);
    await this.validateTaskCandidate(candidate);
    await this.validateTaskChildren(candidate);

    Object.assign(current, updateTaskDto);
    if (updateTaskDto.parentId !== undefined) {
      // `undefined` is ignored when the entity is saved. Keep the explicit
      // null sent by the form so switching away from a parent task detaches it.
      current.parent = updateTaskDto.parentId
        ? await this.taskRepository.find(updateTaskDto.parentId)
        : (null as any);
      current.parentId = updateTaskDto.parentId || (null as any);
    }
    if (updateTaskDto.goalId !== undefined) {
      current.goal = updateTaskDto.goalId
        ? await this.goalRepository.find(updateTaskDto.goalId)
        : (null as any);
      current.goalId = updateTaskDto.goalId || (null as any);
    }
    const entity = await this.taskRepository.updateWithParent(current);
    return TaskDto.importEntity(entity);
  }

  async findByFilter(filter: TaskFilterDto): Promise<TaskDto[]> {
    const entities = await this.taskRepository.findByFilter(filter);
    return entities.map((entity) => TaskDto.importEntity(entity));
  }

  async page(filter: TaskPageFilterDto): Promise<{
    list: TaskDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { list, total, pageNum, pageSize } = await this.taskRepository.page(filter);
    return { list: list.map(TaskDto.importEntity), total, pageNum, pageSize };
  }

  async find(id: string): Promise<TaskDto> {
    return TaskDto.importEntity(await this.taskRepository.find(id));
  }

  async taskWithRelations(taskId: string): Promise<TaskDto> {
    const entity = await this.taskRepository.findWithRelations(taskId);
    entity.todoList = await this.todoRepository.repo.find({
      where: { relatedType: TodoRelatedType.TASK, relatedId: taskId } as any,
    });
    const result = TaskDto.importEntity(entity);
    result.trackTimeList = (await this.trackTimeRepository.findByFilter({
      relatedType: TrackTimeRelatedType.TASK,
      relatedId: taskId,
    } as any)).map((trackTime) => TrackTimeDto.importEntity(trackTime));
    return result;
  }

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    return this.taskRepository.findByFilter({ goalIds } as TaskFilterDto);
  }

  async done(id: string): Promise<boolean> {
    const task = await this.taskRepository.find(id);
    if (task.status !== TaskStatus.TODO && task.status !== TaskStatus.DOING) {
      throw new Error('当前状态不允许标记为完成');
    }
    task.status = TaskStatus.DONE;
    task.doneAt = new Date();
    task.abandonedAt = null as any;
    await this.taskRepository.updateWithParent(task);
    return true;
  }

  async start(id: string): Promise<boolean> {
    const task = await this.taskRepository.find(id);
    if (task.status !== TaskStatus.TODO) throw new Error('当前状态不允许开始任务');
    task.status = TaskStatus.DOING;
    await this.taskRepository.updateWithParent(task);
    return true;
  }

  async pause(id: string): Promise<boolean> {
    const task = await this.taskRepository.find(id);
    if (task.status !== TaskStatus.DOING) throw new Error('当前状态不允许暂停任务');
    task.status = TaskStatus.TODO;
    await this.taskRepository.updateWithParent(task);
    return true;
  }

  async abandon(id: string): Promise<boolean> {
    const task = await this.taskRepository.find(id);
    if (task.status !== TaskStatus.TODO && task.status !== TaskStatus.DOING) {
      throw new Error('当前状态不允许放弃');
    }
    task.status = TaskStatus.ABANDONED;
    task.abandonedAt = new Date();
    task.doneAt = null as any;
    await this.taskRepository.updateWithParent(task);
    return true;
  }

  async restore(id: string): Promise<boolean> {
    const task = await this.taskRepository.find(id);
    if (task.status !== TaskStatus.DONE && task.status !== TaskStatus.ABANDONED) {
      throw new Error('当前状态不允许恢复');
    }
    task.status = TaskStatus.TODO;
    task.doneAt = null as any;
    task.abandonedAt = null as any;
    await this.taskRepository.updateWithParent(task);
    return true;
  }

  private async validateTaskCandidate(candidate: Partial<Task> & { id?: string }): Promise<void> {
    const { id, parentId, goalId, startAt, endAt, importance, difficulty } = candidate;
    if (Boolean(parentId) === Boolean(goalId)) {
      throw new Error('任务必须且只能关联一个直接归属（目标或父任务）');
    }
    if (startAt && endAt && startAt > endAt) throw new Error('任务结束日期不能早于开始日期');

    if (parentId) {
      if (parentId === id) throw new Error('任务不能设为自身的父任务');
      const parent = await this.taskRepository.find(parentId);
      if (id) {
        const current = await this.taskRepository.find(id);
        if ((await this.taskTreeRepository.computeDescendantIds(current)).includes(parentId)) {
          throw new Error('不能将任务移动到自己的子任务下');
        }
      }
      this.validateTaskBounds({ startAt, endAt, importance, difficulty }, parent, '父任务');
      return;
    }

    const goal = await this.goalRepository.find(goalId!);
    this.validateTaskBounds({ startAt, endAt, importance, difficulty }, goal, '关联目标');
  }

  private async withInheritedTaskFields(createTaskDto: CreateTaskDto): Promise<CreateTaskDto> {
    if (!createTaskDto.parentId) return createTaskDto;
    const parent = await this.taskRepository.find(createTaskDto.parentId);
    return Object.assign(new CreateTaskDto(), createTaskDto, {
      startAt: createTaskDto.startAt ?? parent.startAt,
      endAt: createTaskDto.endAt ?? parent.endAt,
      importance: createTaskDto.importance ?? parent.importance,
      difficulty: createTaskDto.difficulty ?? parent.difficulty,
    });
  }

  private validateTaskBounds(
    task: Pick<Task, 'startAt' | 'endAt' | 'importance' | 'difficulty'>,
    parent: Pick<Task, 'startAt' | 'endAt' | 'importance' | 'difficulty'>,
    sourceLabel: string
  ): void {
    if (parent.startAt && task.startAt && task.startAt < parent.startAt) {
      throw new Error(`任务开始日期不能早于${sourceLabel}`);
    }
    if (parent.endAt && task.endAt && task.endAt > parent.endAt) {
      throw new Error(`任务结束日期不能晚于${sourceLabel}`);
    }
    if (parent.importance !== undefined && task.importance !== undefined && task.importance > parent.importance) {
      throw new Error(`任务重要度不能高于${sourceLabel}`);
    }
    if (parent.difficulty !== undefined && task.difficulty !== undefined && task.difficulty > parent.difficulty) {
      throw new Error(`任务难度不能高于${sourceLabel}`);
    }
  }

  private assertValidEstimateTime(estimateTime?: number): void {
    if (estimateTime !== undefined && (!Number.isInteger(estimateTime) || estimateTime < 0)) {
      throw new Error('任务预计时长必须为非负整数秒');
    }
  }

  private async validateTaskChildren(candidate: Partial<Task> & { id?: string }): Promise<void> {
    if (!candidate.id) return;
    const children = await this.taskRepository.repo.find({ where: { parentId: candidate.id } as any });
    for (const child of children) this.validateTaskBounds(child, candidate as Task, '父任务');
  }
}

export const taskService = new TaskService(
  new TaskRepository(),
  new TaskTreeRepository(),
  new TodoRepository(),
  new TodoRepeatRepository()
);
