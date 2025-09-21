import { Body, Controller, Delete, Get, Param, Post, Put, Query } from 'electron-ipc-restful';
import type { Task as TaskVO } from '@life-toolkit/vo';
import { TaskController as _TaskController } from '@life-toolkit/business-server';
import { taskService } from './task.service';

@Controller('/task')
export class TaskController {
  private readonly controller = new _TaskController(taskService);

  @Post('/create')
  async create(@Body() body: TaskVO.CreateTaskVo) {
    return this.controller.create(body);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.controller.delete(id);
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() body: TaskVO.UpdateTaskVo) {
    return this.controller.update(id, body);
  }

  @Get('/find/:id')
  async find(@Param('id') id: string) {
    return this.controller.find(id);
  }

  @Get('/find-by-filter')
  async findByFilter(@Body() body: TaskVO.TaskFilterVo) {
    return this.controller.findByFilter(body);
  }

  @Get('/page')
  async page(@Body() body: TaskVO.TaskPageFilterVo) {
    return this.controller.page(body);
  }

  @Get('/task-with-relations/:id')
  async taskWithRelations(@Param('id') id: string) {
    return this.controller.taskWithRelations(id);
  }

  @Put('/abandon/:id')
  async abandon(@Param('id') id: string) {
    return this.controller.abandon(id);
  }

  @Put('/restore/:id')
  async restore(@Param('id') id: string) {
    return this.controller.restore(id);
  }
}
