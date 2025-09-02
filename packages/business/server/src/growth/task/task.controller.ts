import type { Task as TaskVO } from "@life-toolkit/vo";
import { TaskService } from "./task.service";
import { Post, Get, Put, Delete, Controller } from "@business/decorators";
import {
  TaskListFiltersDto,
  TaskPageFiltersDto,
  UpdateTaskDto,
  CreateTaskDto,
  TaskDto,
} from "./dto";
@Controller("/task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post("/create", { description: "创建任务" })
  async create(createTaskVo: TaskVO.CreateTaskVo): Promise<TaskVO.TaskVo> {
    const createDto = new CreateTaskDto();
    createDto.importVo(createTaskVo);
    const dto = await this.taskService.create(createDto);
    return dto.exportVo();
  }

  @Get("/detail/:id", { description: "根据ID查询任务详情" })
  async findById(id: string): Promise<TaskVO.TaskVo> {
    const dto = await this.taskService.findById(id);
    return dto.exportVo();
  }

  @Put("/update/:id", { description: "更新任务" })
  async update(id: string, vo: TaskVO.UpdateTaskVo): Promise<TaskVO.TaskVo> {
    const updateDto = new UpdateTaskDto();
    updateDto.importVo(vo);
    const dto = await this.taskService.update(id, updateDto);
    return dto.exportVo();
  }

  @Delete("/delete/:id", { description: "删除任务" })
  async delete(id: string): Promise<boolean> {
    return await this.taskService.delete(id);
  }

  @Get("/page", { description: "分页查询任务列表" })
  async page(
    taskPageFiltersVo?: TaskVO.TaskPageFiltersVo
  ): Promise<TaskVO.TaskPageVo> {
    const filter = new TaskPageFiltersDto();
    if (taskPageFiltersVo) filter.importPageVo(taskPageFiltersVo);
    const { list, total, pageNum, pageSize } =
      await this.taskService.page(filter);
    return TaskDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Get("/list", { description: "查询任务列表" })
  async list(
    taskListFiltersVo?: TaskVO.TaskListFiltersVo
  ): Promise<TaskVO.TaskListVo> {
    const filter = new TaskListFiltersDto();
    if (taskListFiltersVo) filter.importListVo(taskListFiltersVo);
    const list = await this.taskService.list(filter);
    return TaskDto.dtoListToListVo(list);
  }

  @Get("/task-with-track-time/:id", { description: "查询任务及其时间追踪信息" })
  async taskWithTrackTime(id: string): Promise<TaskVO.TaskVo> {
    const dto = await this.taskService.taskWithTrackTime(id);
    return dto.exportVo(); // TaskWithTrackTimeDto 继承自 TaskDto
  }

  @Put("/abandon/:id", { description: "放弃任务" })
  async abandon(id: string): Promise<boolean> {
    return await this.taskService.abandon(id);
  }

  @Put("/restore/:id", { description: "恢复任务" })
  async restore(id: string): Promise<boolean> {
    return await this.taskService.restore(id);
  }
}
