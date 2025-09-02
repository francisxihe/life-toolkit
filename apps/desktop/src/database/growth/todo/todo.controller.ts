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
import { todoService, todoRepeatService } from "./todo.service";

@Controller("/todo")
export class TodoController {
  private readonly controller: _TodoController;
  constructor() {
    this.controller = new _TodoController(todoService, todoRepeatService);
  }

  @Post("/create")
  async create(@Body() body: TodoVO.CreateTodoVo) {
    return this.controller.create(body);
  }

  @Get("/detail/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Delete("/delete/:id")
  async delete(@Param("id") id: string) {
    return this.controller.delete(id);
  }

  @Get("/page")
  async page(@Query() query?: TodoVO.TodoPageFiltersVo) {
    return this.controller.page(query);
  }

  @Get("/list")
  async list(@Query() query?: TodoVO.TodoListFiltersVo) {
    return this.controller.list(query);
  }

  @Put("/done/batch")
  async doneBatch(@Body() body: TodoVO.TodoListFiltersVo) {
    return this.controller.doneBatch(body);
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

  @Get("/detailWithRepeat/:id")
  async detailWithRepeat(@Param("id") id: string) {
    return this.controller.detailWithRepeat(id);
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() body: TodoVO.UpdateTodoVo) {
    return this.controller.update(id, body);
  }

  @Get("/listWithRepeat")
  async listWithRepeat(@Query() query?: TodoVO.TodoListFiltersVo) {
    return this.controller.listWithRepeat(query);
  }
}
