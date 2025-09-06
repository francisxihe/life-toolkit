import { Body, Controller, Delete, Get, Param, Post, Put, Query } from 'electron-ipc-restful';
import type { Todo as TodoVO } from '@life-toolkit/vo';
import { TodoController as _TodoController } from '@life-toolkit/business-server';
import { todoService, todoRepeatService } from './todo.service';

@Controller('/todo')
export class TodoController {
  private readonly controller = new _TodoController(todoService, todoRepeatService);

  @Post('/create')
  async create(@Body() body: TodoVO.CreateTodoVo) {
    return this.controller.create(body);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.controller.delete(id);
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() body: TodoVO.UpdateTodoVo) {
    return this.controller.update(id, body);
  }

  @Get('/find/:id')
  async find(@Param('id') id: string) {
    return this.controller.find(id);
  }

  @Get('/find-by-filter')
  async findByFilter(@Query() query?: TodoVO.TodoFilterVo) {
    return this.controller.findByFilter(query);
  }

  @Get('/page')
  async page(@Query() query?: TodoVO.TodoPageFilterVo) {
    return this.controller.page(query);
  }

  @Put('/done-batch')
  async doneBatch(@Body() body: TodoVO.TodoFilterVo) {
    return this.controller.doneBatch(body);
  }

  @Put('/abandon/:id')
  async abandon(@Param('id') id: string) {
    return this.controller.abandon(id);
  }

  @Put('/restore/:id')
  async restore(@Param('id') id: string) {
    return this.controller.restore(id);
  }

  @Put('/done/:id')
  async done(@Param('id') id: string) {
    return this.controller.done(id);
  }

  @Get('/list-with-repeat')
  async listWithRepeat(@Query() query?: TodoVO.TodoFilterVo) {
    return this.controller.listWithRepeat(query);
  }

  @Get('/detail-with-repeat/:id')
  async detailWithRepeat(@Param('id') id: string) {
    return this.controller.detailWithRepeat(id);
  }
}
