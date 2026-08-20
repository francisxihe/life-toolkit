import type { Todo as TodoVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';
import {
  TodoFilterDto,
  TodoPageFilterDto,
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  CreateTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoService, todoService as defaultTodoService, todoRepeatService as defaultTodoRepeatService } from './todo.service';
import { TodoRepeatService } from './todo-repeat.service';
import { TodoRelatedType } from '@true-north/enum';

@Controller('/todo')
export class TodoController {
  /** 默认注入模块单例，供 electron-ipc-restful 无参实例化 */
  constructor(
    private readonly todoService: TodoService = defaultTodoService,
    private readonly todoRepeatService: TodoRepeatService = defaultTodoRepeatService
  ) {}

  @Get('/page', { description: '分页查询待办' })
  async page(@Query() query?: TodoVO.TodoPageFilterVo): Promise<ResponsePageVo<TodoVO.TodoWithoutRelationsVo>> {
    const filter = new TodoPageFilterDto();
    if (query) filter.importPageVo(query);
    const { list, total, pageNum, pageSize } = await this.todoService.page(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
      total,
      pageNum,
      pageSize,
    };
  }

  @Post('/create', { description: '创建待办' })
  async create(@Body() body: TodoVO.CreateTodoVo): Promise<TodoVO.TodoVo> {
    try {
      if (body.repeatConfig) {
        const createTodoRepeatDto = new CreateTodoRepeatDto();
        createTodoRepeatDto.importCreateVo({
          ...body,
          repeatConfig: body.repeatConfig,
        });
        const todoRepeatDto = await this.todoRepeatService.create(createTodoRepeatDto);
        return todoRepeatDto.exportVo();
      }
      const createTodoDto = new CreateTodoDto();
      createTodoDto.importCreateVo(body);
      const todoDto = await this.todoService.create(createTodoDto);
      return todoDto.exportVo();
    } catch (error) {
      console.error('创建待办失败:', error);
      throw error;
    }
  }

  @Delete('/delete/:relatedType/:id', { description: '删除待办' })
  async delete(@Param('relatedType') relatedType: TodoRelatedType, @Param('id') id: string): Promise<boolean> {
    if (relatedType === TodoRelatedType.IS_REPEAT) {
      return await this.todoRepeatService.delete(id);
    }
    return await this.todoService.delete(id);
  }

  @Put('/update/:relatedType/:id', { description: '更新待办' })
  async update(
    @Param('relatedType') relatedType: TodoRelatedType,
    @Param('id') id: string,
    @Body() body: TodoVO.UpdateTodoVo
  ): Promise<TodoVO.TodoVo> {
    if (relatedType === TodoRelatedType.IS_REPEAT) {
      const updateTodoRepeatDto = new UpdateTodoRepeatDto();
      updateTodoRepeatDto.importUpdateVo({
        ...body,
        repeatConfig: body.repeatConfig,
      });
      updateTodoRepeatDto.id = id;
      const dto = await this.todoRepeatService.update(updateTodoRepeatDto);
      return dto.exportVo();
    }
    const updateDto = new UpdateTodoDto();
    updateDto.importUpdateVo(body);
    updateDto.id = id;
    const dto = await this.todoService.update(updateDto);
    return dto.exportVo();
  }

  @Put('/done/:relatedType/:id', { description: '完成待办' })
  async done(
    @Param('relatedType') relatedType: TodoRelatedType,
    @Param('id') id: string,
    @Body()
    body?: {
      doneAt?: string;
    }
  ): Promise<any> {
    return await this.todoService.done(relatedType, id, body);
  }

  @Put('/abandon/:relatedType/:id', { description: '废弃待办' })
  async abandon(@Param('relatedType') relatedType: TodoRelatedType, @Param('id') id: string): Promise<any> {
    return await this.todoService.abandon(relatedType, id);
  }

  @Put('/restore/:relatedType/:id', { description: '恢复待办' })
  async restore(@Param('relatedType') relatedType: TodoRelatedType, @Param('id') id: string): Promise<boolean> {
    if (relatedType === TodoRelatedType.IS_REPEAT) {
      return await this.todoRepeatService.restore(id);
    }
    return await this.todoService.restore(id);
  }

  @Get('/list', { description: '列表查询待办及其重复信息' })
  async list(@Query() query?: TodoVO.TodoFilterVo): Promise<ResponseListVo<TodoVO.TodoWithoutRelationsVo>> {
    const todoQueryDto = new TodoFilterDto();
    if (query) todoQueryDto.importListVo(query);
    const list = await this.todoService.list(todoQueryDto);

    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  @Get('/find/:relatedType/:id', { description: '查询待办及其重复信息' })
  async find(@Param('relatedType') relatedType: TodoRelatedType, @Param('id') id: string): Promise<TodoVO.TodoVo> {
    if (relatedType === TodoRelatedType.IS_REPEAT) {
      return (await this.todoRepeatService.findWithRelations(id)).exportVo();
    }
    return (await this.todoService.findWithRelations(id)).exportVo();
  }

  @Put('/done/batch', { description: '批量完成待办' })
  doneBatch(@Body() body: TodoVO.TodoFilterVo): Promise<any> {
    const todoFilterDto = new TodoFilterDto();
    if (body) todoFilterDto.importListVo(body);
    return this.todoService.doneBatch(todoFilterDto);
  }
}
