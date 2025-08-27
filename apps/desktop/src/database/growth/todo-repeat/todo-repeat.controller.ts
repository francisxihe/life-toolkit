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
import type { TodoRepeat as TodoRepeatVO } from "@life-toolkit/vo";
import { TodoRepeatController as _TodoRepeatController } from "@life-toolkit/business-server";
import { todoRepeatService } from "./todo-repeat.service";

@Controller("/todo-repeat")
export class TodoRepeatController {
  private readonly controller: _TodoRepeatController;
  constructor() {
    this.controller = new _TodoRepeatController(todoRepeatService);
  }
  @Post("/create")
  async create(@Body() payload: TodoRepeatVO.CreateTodoRepeatVo) {
    return this.controller.create(payload);
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Put("/update/:id")
  async update(
    @Param("id") id: string,
    @Body() payload: { updateVo?: TodoRepeatVO.UpdateTodoRepeatVo } & TodoRepeatVO.UpdateTodoRepeatVo
  ) {
    return this.controller.update(id, payload);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return this.controller.remove(id);
  }

  @Get("/page")
  async page(@Query() q?: TodoRepeatVO.TodoRepeatPageFiltersVo) {
    return this.controller.page(q);
  }

  @Get("/list")
  async list(@Query() query: TodoRepeatVO.TodoRepeatListFiltersVo) {
    return this.controller.list(query);
  }

  @Put("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return this.controller.batchDone(body?.idList ?? []);
  }

  @Put("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return this.controller.abandon(id);
  }

  @Put("/restore/:id")
  async restore(@Param("id") id: string) {
    return this.controller.restore(id);
  }

  @Put("/done/:id")
  async done(@Param("id") id: string) {
    return this.controller.done(id);
  }
}
