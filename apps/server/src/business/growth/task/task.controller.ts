import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import { Response } from '@/decorators/response.decorator';
import { TaskStatusService } from './task-status.service';
import type { Task, TaskFilterVo, TaskPageFilterVo } from '@life-toolkit/vo';
import { TaskController as BusinessTaskController } from '@life-toolkit/business-server';

@Controller('task')
export class TaskController {
  private readonly businessController: BusinessTaskController;

  constructor(
    private readonly taskService: TaskService,
    private readonly taskStatusService: TaskStatusService
  ) {
    this.businessController = new BusinessTaskController(taskService);
  }

  @Put('done/batch')
  @Response()
  async doneBatch(@Body() body: { includeIds?: string[] }) {
    return await this.businessController.doneBatch(body);
  }

  @Put('abandon/:id')
  @Response()
  async abandon(@Param('id') id: string) {
    return await this.businessController.abandon(id);
  }

  @Put('restore/:id')
  @Response()
  async restore(@Param('id') id: string) {
    return await this.businessController.restore(id);
  }

  @Get('task-with-relations/:id')
  @Response()
  async taskWithRelations(@Param('id') id: string) {
    return await this.businessController.taskWithRelations(id);
  }

  @Post('create')
  @Response()
  async create(@Body() createTaskVo: Task.CreateTaskVo) {
    return await this.businessController.create(createTaskVo);
  }

  @Delete('delete/:id')
  @Response()
  async delete(@Param('id') id: string) {
    return await this.businessController.remove(id);
  }

  @Put('update/:id')
  @Response()
  async update(@Param('id') id: string, @Body() updateTaskVo: Task.UpdateTaskVo) {
    return await this.businessController.update(id, updateTaskVo);
  }

  @Get('page')
  @Response()
  async page(@Query() filter: TaskPageFilterVo) {
    return await this.businessController.page(filter);
  }

  @Get('list')
  @Response()
  async list(@Query() filter: TaskFilterVo) {
    return await this.businessController.list(filter);
  }

  @Get('detail/:id')
  @Response()
  async findById(@Param('id') id: string) {
    return await this.businessController.findById(id);
  }
}
