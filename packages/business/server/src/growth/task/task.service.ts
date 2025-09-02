import {
  TaskRepository,
  TaskTreeRepository,
  TodoCleanupService,
} from "./task.repository";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFiltersDto,
  TaskListFiltersDto,
  TaskDto,
  TaskWithTrackTimeDto,
} from "./dto";
import { Task } from "./task.entity";
import { TaskStatus } from "@life-toolkit/enum";

export class TaskService {
  protected taskRepository: TaskRepository;
  protected taskTreeRepository: TaskTreeRepository;
  protected todoCleanup: TodoCleanupService;

  constructor(
    taskRepository: TaskRepository,
    taskTreeRepository: TaskTreeRepository,
    todoCleanup: TodoCleanupService
  ) {
    this.taskRepository = taskRepository;
    this.taskTreeRepository = taskTreeRepository;
    this.todoCleanup = todoCleanup;
  }

  async create(createTaskDto: CreateTaskDto): Promise<TaskDto> {
    const entity = await this.taskRepository.create(createTaskDto);
    if (createTaskDto.parentId) {
      await this.taskTreeRepository.updateParent({
        task: entity as Task,
        parentId: createTaskDto.parentId,
      });
    }
    const resultEntity = await this.taskRepository.findById(entity.id);
    return TaskDto.importEntity(resultEntity);
  }

  async delete(id: string): Promise<boolean> {
    const taskToDelete = await this.taskTreeRepository.findOne({
      id,
    } as Partial<Task>);
    if (!taskToDelete) {
      throw new Error("Task not found");
    }
    const allIds =
      await this.taskTreeRepository.computeDescendantIds(taskToDelete);
    await this.todoCleanup.deleteByTaskIds(allIds);
    await this.taskTreeRepository.deleteByIds(allIds);
    return true;
  }

  async deleteByFilter(filter: TaskListFiltersDto): Promise<void> {
    const entities = await this.taskRepository.findAll(filter);
    if (!entities.length) return;
    const toDeleteIds = entities.map((t) => t.id);

    const treeTargets: Task[] = [] as Task[];
    for (const id of toDeleteIds) {
      const t = await this.taskTreeRepository.findOne({ id } as Partial<Task>);
      if (t) treeTargets.push(t);
    }
    if (!treeTargets.length) throw new Error("Task not found");

    const allIds: string[] = [];
    for (const t of treeTargets) {
      const ids = await this.taskTreeRepository.computeDescendantIds(t);
      allIds.push(...ids);
    }
    await this.todoCleanup.deleteByTaskIds(allIds);
    await this.taskTreeRepository.deleteByIds(allIds);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<TaskDto> {
    // 处理父子关系及基本字段更新（委托给树仓储）
    const entity = await this.taskTreeRepository.updateWithParent(
      id,
      updateTaskDto
    );
    return TaskDto.importEntity(entity);
  }

  async findAll(filter: TaskListFiltersDto): Promise<TaskDto[]> {
    const entities = await this.taskRepository.findAll(filter);
    return entities.map(entity => TaskDto.importEntity(entity));
  }

  async list(filter: TaskListFiltersDto): Promise<TaskDto[]> {
    const entities = await this.taskRepository.findAll(filter);
    return entities.map(entity => TaskDto.importEntity(entity));
  }

  async page(filter: TaskPageFiltersDto): Promise<{
    list: TaskDto[];
    total: number;
    pageNum: number;
    pageSize: number;
  }> {
    const { list, total, pageNum, pageSize } =
      await this.taskRepository.page(filter);
    return { 
      list: list.map(entity => TaskDto.importEntity(entity)), 
      total, 
      pageNum, 
      pageSize 
    };
  }

  async findById(id: string): Promise<TaskDto> {
    const entity = await this.taskRepository.findById(id);
    return TaskDto.importEntity(entity);
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    return await this.taskRepository.taskWithTrackTime(taskId);
  }

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    return await this.taskRepository.findByGoalIds(goalIds);
  }

  async abandon(id: string): Promise<boolean> {
    await this.update(
      id,
      Object.assign(new UpdateTaskDto(), { status: TaskStatus.ABANDONED })
    );
    return true;
  }

  async restore(id: string): Promise<boolean> {
    await this.update(
      id,
      Object.assign(new UpdateTaskDto(), { status: TaskStatus.TODO })
    );
    return true;
  }
}
