import type { Task as TaskVO, ResponsePageVo, ResponseListVo } from '@life-toolkit/vo';
import { TaskService } from './task.service';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';
import { TaskFilterDto, TaskPageFilterDto, UpdateTaskDto, CreateTaskDto, TaskDto } from './dto';
@Controller('/task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('/create', { description: '创建任务' })
  async create(@Body() createTaskVo: TaskVO.CreateTaskVo): Promise<TaskVO.TaskVo> {
    const createDto = new CreateTaskDto();
    createDto.importCreateVo(createTaskVo);
    const dto = await this.taskService.create(createDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除任务' })
  async delete(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.delete(id);
  }

  @Put('/update/:id', { description: '更新任务' })
  async update(@Param('id') id: string, @Body() body: TaskVO.UpdateTaskVo): Promise<TaskVO.TaskVo> {
    const updateDto = new UpdateTaskDto();
    updateDto.importUpdateVo(body);
    const dto = await this.taskService.update(id, updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id', { description: '根据ID查询任务详情' })
  async find(@Param('id') id: string): Promise<TaskVO.TaskVo> {
    const dto = await this.taskService.find(id);
    return dto.exportVo();
  }

  @Get('/find-by-filter', { description: '查询任务列表' })
  async findByFilter(
    @Query() taskListFiltersVo?: TaskVO.TaskFilterVo
  ): Promise<ResponseListVo<TaskVO.TaskWithoutRelationsVo>> {
    const filter = new TaskFilterDto();
    if (taskListFiltersVo) filter.importListVo(taskListFiltersVo);
    const list = await this.taskService.findByFilter(filter);
    return TaskDto.dtoListToListVo(list);
  }

  @Get('/page', { description: '分页查询任务列表' })
  async page(
    @Query() taskPageFiltersVo?: TaskVO.TaskPageFilterVo
  ): Promise<ResponsePageVo<TaskVO.TaskWithoutRelationsVo>> {
    const filter = new TaskPageFilterDto();
    if (taskPageFiltersVo) filter.importPageVo(taskPageFiltersVo);
    const { list, total, pageNum, pageSize } = await this.taskService.page(filter);
    return TaskDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Get('/task-with-relations/:id', { description: '查询任务及其时间追踪信息' })
  async taskWithRelations(@Param('id') id: string): Promise<TaskVO.TaskVo> {
    const dto = await this.taskService.taskWithRelations(id);
    return dto.exportVo(); // taskWithRelationsDto 继承自 TaskDto
  }

  @Put('/abandon/:id', { description: '放弃任务' })
  async abandon(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.abandon(id);
  }

  @Put('/restore/:id', { description: '恢复任务' })
  async restore(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.restore(id);
  }
}
