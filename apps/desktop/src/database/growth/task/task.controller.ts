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
import type { Task as TaskVO, TaskPageFiltersVo, TaskListFiltersVo } from "@life-toolkit/vo";
import { TaskController as _TaskController } from "@life-toolkit/business-server";
import { taskService } from "./task.service";

@Controller("/task")
export class TaskController {
  private readonly controller: _TaskController;
  constructor() {
    this.controller = new _TaskController(taskService);
  }
  @Post("/create")
  async create(@Body() payload: TaskVO.CreateTaskVo) {
    return this.controller.create(payload);
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() payload: TaskVO.CreateTaskVo) {
    return this.controller.update(id, payload);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return this.controller.remove(id);
  }

  @Get("/page")
  async page(@Query() query?: TaskPageFiltersVo) {
    return this.controller.page(query);
  }

  @Get("/list")
  async list(@Query() query?: TaskListFiltersVo) {
    return this.controller.list(query);
  }

  @Get("/taskWithTrackTime/:id")
  async taskWithTrackTime(@Param("id") id: string) {
    return this.controller.taskWithTrackTime(id);
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return this.controller.batchDone(body);
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return this.controller.abandon(id);
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return this.controller.restore(id);
  }
}
