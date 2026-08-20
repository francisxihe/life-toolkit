import type { Task as TaskVO, ResponsePageVo, ResponseListVo } from '@true-north/vo';
import { TaskService, taskService as defaultTaskService } from './task.service';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';
import { TaskFilterDto, TaskPageFilterDto, UpdateTaskDto, CreateTaskDto, TaskDto } from './dto';

@Controller('/task')
export class TaskController {
  /** 默认注入模块单例，供 electron-ipc-restful 无参实例化 */
  constructor(private readonly taskService: TaskService = defaultTaskService) {}

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

  @Get('/list', { description: '查询任务列表' })
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
    @Query() taskPageFilterVo?: TaskVO.TaskPageFilterVo
  ): Promise<ResponsePageVo<TaskVO.TaskWithoutRelationsVo>> {
    const filter = new TaskPageFilterDto();
    filter.importPageVo({
      ...taskPageFilterVo,
      pageNum: normalizePageValue(taskPageFilterVo?.pageNum, 1),
      pageSize: normalizePageValue(taskPageFilterVo?.pageSize, 10, 100),
    });
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

  @Put('/done/:id', { description: '完成任务' })
  async markDone(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.done(id);
  }

  @Put('/start/:id', { description: '开始任务' })
  async start(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.start(id);
  }

  @Put('/pause/:id', { description: '暂停任务' })
  async pause(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.pause(id);
  }

  @Put('/restore/:id', { description: '恢复任务' })
  async restore(@Param('id') id: string): Promise<boolean> {
    return await this.taskService.restore(id);
  }

  @Get('/tree', { description: '获取任务树结构' })
  async getTree(@Query() taskFilterVo?: TaskVO.TaskFilterVo): Promise<ResponseListVo<TaskVO.TaskVo>> {
    const filter = new TaskFilterDto();
    if (taskFilterVo) filter.importListVo(taskFilterVo);
    const list = await this.taskService.findByFilter(filter);
    // 构建树形结构
    const taskMap = new Map<string, TaskVO.TaskVo>();
    const rootTasks: TaskVO.TaskVo[] = [];

    // 转换为 VO 并建立映射
    // findByFilter already joins direct children. Build this endpoint from the
    // flat result only, otherwise every child would be appended twice below.
    const taskVos = list.map((dto) => ({ ...dto.exportVo(), children: [] }));
    taskVos.forEach((task) => taskMap.set(task.id, task));

    // 构建父子关系
    taskVos.forEach((task) => {
      if (!task.parentId) {
        rootTasks.push(task);
      } else {
        const parent = taskMap.get(task.parentId);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(task);
        }
      }
    });

    return { list: rootTasks };
  }
}

function normalizePageValue(value: unknown, fallback: number, maximum?: number) {
  const numberValue = Number(value);
  if (!Number.isInteger(numberValue) || numberValue < 1) return fallback;
  return maximum ? Math.min(numberValue, maximum) : numberValue;
}
