import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { Response } from "@/decorators/response.decorator";
import { TaskStatusService } from "./task-status.service";
import type {
  Task,
  OperationByIdListVo,
  TaskListFiltersVo,
} from "@life-toolkit/vo";
import {
  TaskPageFiltersDto,
  TaskListFiltersDto,
  CreateTaskDto,
  UpdateTaskDto,
  TaskDto,
} from "@life-toolkit/business-server";
import { OperationMapper } from "@/common/operation";

@Controller("task")
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly taskStatusService: TaskStatusService
  ) {}

  @Put("batch-done")
  @Response()
  async batchDone(@Body() idList: OperationByIdListVo) {
    return await this.taskStatusService.batchDone(
      OperationMapper.voToOperationByIdListDto(idList)
    );
  }

  @Put("abandon/:id")
  @Response()
  async abandon(@Param("id") id: string) {
    await this.taskStatusService.abandon(id);
    return { result: true };
  }

  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    await this.taskStatusService.restore(id);
    return { result: true };
  }

  @Get("task-with-track-time/:id")
  @Response()
  async taskWithTrackTime(@Param("id") id: string) {
    const dto = await this.taskService.taskWithTrackTime(id);
    return dto.exportVo();
  }

  @Post("create")
  @Response()
  async create(@Body() createTaskVo: Task.CreateTaskVo) {
    const createDto = new CreateTaskDto();
    createDto.importVo(createTaskVo);
    const dto = await this.taskService.create(createDto);
    return dto.exportVo();
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.taskService.delete(id);
  }

  @Put("update/:id")
  @Response()
  async update(
    @Param("id") id: string,
    @Body() updateTaskVo: Task.UpdateTaskVo
  ) {
    const updateDto = new UpdateTaskDto();
    updateDto.importVo(updateTaskVo);
    const dto = await this.taskService.update(id, updateDto);
    return dto.exportVo();
  }

  @Get("page")
  @Response()
  async page(@Query() filter: TaskPageFiltersDto) {
    const { list, total } = await this.taskService.page(filter);
    return TaskDto.dtoListToPageVo(
      list,
      total,
      filter.pageNum || 1,
      filter.pageSize || 10
    );
  }

  @Get("list")
  @Response()
  async list(@Query() filter: TaskListFiltersVo) {
    const taskListFilterDto = new TaskListFiltersDto();
    taskListFilterDto.importListVo(filter);
    const taskList = await this.taskService.findAll(taskListFilterDto);
    return TaskDto.dtoListToListVo(taskList);
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const task = await this.taskService.findById(id);
    return task.exportVo();
  }
}
