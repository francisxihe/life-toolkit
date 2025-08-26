import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@life-toolkit/electron-ipc-router";
import { TaskStatus } from "@life-toolkit/enum";
import type { Task as TaskVO, TaskPageFiltersVo, TaskListFiltersVo } from "@life-toolkit/vo";
import {
  TaskMapper,
  TaskListFiltersDto,
  TaskPageFiltersDto,
} from "@life-toolkit/business-server";
import { taskService } from "./task.service";

@Controller("/task")
export class TaskController {
  @Post("/create")
  async create(@Body() payload: TaskVO.CreateTaskVo) {
    return TaskMapper.dtoToVo(
      await taskService.create(TaskMapper.voToCreateDto(payload))
    );
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return TaskMapper.dtoToVo(await taskService.findById(id));
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() payload: TaskVO.CreateTaskVo) {
    return TaskMapper.dtoToVo(
      await taskService.update(
        id,
        TaskMapper.voToUpdateDto(payload as TaskVO.CreateTaskVo)
      )
    );
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return await taskService.delete(id);
  }

  @Get("/page")
  async page(@Query() query?: TaskPageFiltersVo) {
    const taskPageFiltersDto = new TaskPageFiltersDto();
    taskPageFiltersDto.importPageVo(query);
    const { list, total, pageNum, pageSize } = await taskService.page(taskPageFiltersDto);
    return TaskMapper.dtoToPageVo(
      list,
      total,
      pageNum,
      pageSize
    );
  }

  @Get("/list")
  async list(@Query() query?: TaskListFiltersVo) {
    const taskListFiltersDto = new TaskListFiltersDto();
    taskListFiltersDto.importListVo(query);
    const list = await taskService.list(taskListFiltersDto);
    return TaskMapper.dtoToListVo(list);
  }

  @Get("/taskWithTrackTime/:id")
  async taskWithTrackTime(@Param("id") id: string) {
    return TaskMapper.dtoToWithTrackTimeVo(
      await taskService.taskWithTrackTime(id)
    );
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return (
      await Promise.all(
        (body?.idList ?? []).map((id: string) =>
          taskService.completeTask(id)
        )
      )
    ).map((dto) => TaskMapper.dtoToVo(dto));
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return await taskService.abandon(id);
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return await taskService.restore(id);
  }
}
