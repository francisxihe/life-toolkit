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
import { TaskPageFilterDto, TaskListFilterDto } from "./dto";
import { Response } from "@/decorators/response.decorator";
import { TaskStatusService } from "./task-status.service";
import type { Task, OperationByIdListVo, TaskListFiltersVo } from "@life-toolkit/vo";
import { TaskMapper } from "./mappers";
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
    const result = await this.taskStatusService.abandon(id);
    return { result };
  }

  @Put("restore/:id")
  @Response()
  async restore(@Param("id") id: string) {
    const result = await this.taskStatusService.restore(id);
    return { result };
  }

  @Get("task-with-track-time/:id")
  @Response()
  async taskWithTrackTime(@Param("id") id: string) {
    const dto = await this.taskService.taskWithTrackTime(id);
    return TaskMapper.dtoToWithTrackTimeVo(dto);
  }

  @Post("create")
  @Response()
  async create(@Body() createTaskVo: Task.CreateTaskVo) {
    const createdDto = TaskMapper.voToCreateDto(createTaskVo);
    const dto = await this.taskService.create(createdDto);
    return TaskMapper.dtoToVo(dto);
  }

  @Delete("delete/:id")
  @Response()
  async delete(@Param("id") id: string) {
    return this.taskService.delete(id);
  }

  @Put("update/:id")
  @Response()
  async update(@Param("id") id: string, @Body() updateTaskVo: Task.CreateTaskVo) {
    const updatedDto = TaskMapper.voToUpdateDto(updateTaskVo);
    const dto = await this.taskService.update(id, updatedDto);
    return TaskMapper.dtoToVo(dto);
  }

  @Get("page")
  @Response()
  async page(@Query() filter: TaskPageFilterDto) {
    const { list, total } = await this.taskService.page(filter);
    return TaskMapper.dtoToPageVo(
      list,
      total,
      filter.pageNum || 1,
      filter.pageSize || 10
    );
  }

  @Get("list")
  @Response()
  async list(@Query() filter: TaskListFiltersVo) {
    const taskListFilterDto = new TaskListFilterDto();
    taskListFilterDto.withoutSelf = filter.withoutSelf;
    taskListFilterDto.id = filter.id;
    taskListFilterDto.importance = filter.importance;
    taskListFilterDto.urgency = filter.urgency;
    taskListFilterDto.status = filter.status;
    taskListFilterDto.startAt = filter.startAt ? new Date(filter.startAt) : undefined;
    taskListFilterDto.endAt = filter.endAt ? new Date(filter.endAt) : undefined;
    const taskList = await this.taskService.findAll(taskListFilterDto);
    return TaskMapper.dtoToListVo(taskList); 
  }

  @Get("detail/:id")
  @Response()
  async findById(@Param("id") id: string) {
    const task = await this.taskService.findById(id);
    return TaskMapper.dtoToVo(task);
  }
}
 