import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Response } from '@/decorators/response.decorator';
import type { Todo, TodoFilterVo, TodoPageFilterVo } from '@life-toolkit/vo';
import { TodoController as _TodoController, UpdateTodoDto } from '@life-toolkit/business-server';
import { TodoRepeatService } from './todo-repeat.service';

@Controller('todo')
export class TodoController {
  controller: _TodoController;

  constructor(
    private readonly todoService: TodoService,
    private readonly todoRepeatService: TodoRepeatService
  ) {
    this.controller = new _TodoController(todoService, todoRepeatService);
  }

  @Post('create')
  @Response()
  async create(@Body() createTodoVo: Todo.CreateTodoVo) {
    return this.controller.create(createTodoVo);
  }

  @Delete('delete/:id')
  @Response()
  async delete(@Param('id') id: string) {
    return this.todoService.delete(id);
  }

  @Put('update/:id')
  @Response()
  async update(@Param('id') id: string, @Body() updateTodoVo: Todo.UpdateTodoVo) {
    const updateTodoDto = new UpdateTodoDto();
    updateTodoDto.importUpdateVo(updateTodoVo);
    const todoDto = await this.todoService.update(id, updateTodoDto);
    return todoDto.exportVo();
  }

  @Get('page')
  @Response()
  async page(@Query() filter: TodoPageFilterVo) {
    return this.controller.page(filter);
  }

  @Get('list')
  @Response()
  async list(@Query() filter: TodoFilterVo) {
    return this.controller.list(filter);
  }

  @Get('detail/:id')
  @Response()
  async findWithRelations(@Param('id') id: string) {
    return this.controller.findWithRelations(id);
  }

  @Put('done/batch')
  @Response()
  async doneBatch(@Body() body: TodoFilterVo) {
    return this.controller.doneBatch(body);
  }

  @Put('abandon/:id')
  @Response()
  async abandon(@Param('id') id: string) {
    return this.controller.abandon(id);
  }

  @Put('done/:id')
  @Response()
  async done(@Param('id') id: string) {
    return this.controller.done(id);
  }

  @Put('restore/:id')
  @Response()
  async restore(@Param('id') id: string) {
    return this.controller.restore(id);
  }
}
