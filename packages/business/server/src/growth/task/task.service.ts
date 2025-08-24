import { TaskRepository, TaskTreeRepository, TodoCleanupService } from "./task.repository";
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskPageFilterDto,
  TaskListFilterDto,
  TaskDto,
  TaskWithTrackTimeDto,
} from "./dto";
import { Task } from "./task.entity";

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
      await (this.taskTreeRepository as any).updateParent({
        task: entity as Task,
        parentId: createTaskDto.parentId,
      });
    }
    return await this.taskRepository.findById((entity as any).id);
  }

  async delete(id: string): Promise<void> {
    const taskToDelete = await this.taskTreeRepository.findOne({ id } as Partial<Task>);
    if (!taskToDelete) throw new Error("Task not found");
    const allIds = await this.taskTreeRepository.computeDescendantIds(taskToDelete);
    await this.todoCleanup.deleteByTaskIds(allIds);
    await this.taskTreeRepository.deleteByIds(allIds);
  }

  async deleteByFilter(filter: TaskListFilterDto): Promise<void> {
    const taskList = await this.findAll(filter);
    if (!taskList.length) return;
    const toDeleteIds = taskList.map((t) => t.id);

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
    const dto = await this.taskTreeRepository.updateWithParent(id, updateTaskDto);
    return dto;
  }

  async findAll(filter: TaskListFilterDto): Promise<TaskDto[]> {
    let excludeIds: string[] = [];
    if ((filter as any).withoutSelf && (filter as any).id) {
      const node = await this.taskTreeRepository.findOne({ id: (filter as any).id } as Partial<Task>);
      if (node) {
        const ids = await this.taskTreeRepository.computeDescendantIds(node);
        excludeIds = ids.concat((filter as any).id);
      }
    }
    const taskList = await this.taskRepository.findAll({ ...(filter as any), excludeIds });
    return taskList;
  }

  async page(filter: TaskPageFilterDto): Promise<{ list: TaskDto[]; total: number }> {
    return await this.taskRepository.page(filter);
  }

  async findById(id: string): Promise<TaskDto> {
    return await this.taskRepository.findById(id);
  }

  async taskWithTrackTime(taskId: string): Promise<TaskWithTrackTimeDto> {
    return await this.taskRepository.taskWithTrackTime(taskId);
  }

  async findByGoalIds(goalIds: string[]): Promise<Task[]> {
    return await this.taskRepository.findByGoalIds(goalIds);
  }
}
