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
import type { Todo as TodoVO } from "@life-toolkit/vo";
import { TodoController as _TodoController } from "@life-toolkit/business-server";
import { todoService } from "./todo.service";

@Controller("/todo")
export class TodoController {
  private readonly controller: _TodoController;
  constructor() {
    this.controller = new _TodoController(todoService);
  }
  @Post("/create")
  async create(@Body() payload: TodoVO.CreateTodoVo) {
    return this.controller.create(payload);
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Put("/update/:id")
  async update(
    @Param("id") id: string,
    @Body() payload: { updateVo?: TodoVO.UpdateTodoVo } & TodoVO.UpdateTodoVo
  ) {
    return this.controller.update(id, payload);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return this.controller.remove(id);
  }

  @Get("/page")
  async page(@Query() q?: TodoVO.TodoPageFiltersVo) {
    return this.controller.page(q);
  }

  @Get("/list")
  async list(@Query() query: TodoVO.TodoListFiltersVo) {
    return this.controller.list(query);
  }

  @Put("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return this.controller.batchDone(body);
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
