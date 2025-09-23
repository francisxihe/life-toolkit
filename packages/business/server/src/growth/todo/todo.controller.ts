import type { Todo as TodoVO, ResponseListVo, ResponsePageVo } from '@life-toolkit/vo';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';
import {
  TodoFilterDto,
  TodoPageFilterDto,
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
  CreateTodoDto,
  UpdateTodoDto,
} from './dto';
import { TodoService } from './todo.service';
import { TodoRepeatService } from './todo-repeat.service';
import { TodoSource } from '@life-toolkit/enum';

@Controller('/todo')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoRepeatService: TodoRepeatService
  ) {}

  @Post('/create', { description: '创建待办' })
  async create(@Body() createTodoVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoVo> {
    if (createTodoVo.repeatConfig) {
      const createTodoRepeatDto = new CreateTodoRepeatDto();
      createTodoRepeatDto.importCreateVo({
        ...createTodoVo,
        repeatConfig: createTodoVo.repeatConfig,
      });
      const todoRepeatDto = await this.todoRepeatService.create(createTodoRepeatDto);
      return todoRepeatDto.exportVo();
    }
    const createTodoDto = new CreateTodoDto();
    createTodoDto.importCreateVo(createTodoVo);
    const todoDto = await this.todoService.create(createTodoDto);
    return todoDto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除待办' })
  async delete(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.delete(id);
  }

  @Put('/update/:id', { description: '更新待办' })
  async update(@Param('id') id: string, @Body() updateVo: TodoVO.UpdateTodoVo): Promise<TodoVO.TodoVo> {
    const updateDto = new UpdateTodoDto();
    updateDto.importUpdateVo(updateVo);
    updateDto.id = id;
    const dto = await this.todoService.update(updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id', { description: '根据ID查询待办详情' })
  async find(@Param('id') id: string): Promise<TodoVO.TodoVo> {
    const dto = await this.todoService.find(id);
    return dto.exportVo();
  }

  @Get('/find-by-filter', { description: '列表查询待办' })
  async findByFilter(@Query() query?: TodoVO.TodoFilterVo): Promise<ResponseListVo<TodoVO.TodoWithoutRelationsVo>> {
    const filter = new TodoFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.findByFilter(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

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

  @Put('/update-with-repeat/:id', { description: '更新待办' })
  async updateWithRepeat(@Param('id') id: string, @Body() updateVo: TodoVO.UpdateTodoVo): Promise<TodoVO.TodoVo> {
    if (updateVo.source === TodoSource.IS_REPEAT) {
      const updateTodoRepeatDto = new UpdateTodoRepeatDto();
      updateTodoRepeatDto.importUpdateVo({
        ...updateVo,
        repeatConfig: updateVo.repeatConfig,
      });
      updateTodoRepeatDto.id = id;
      const dto = await this.todoRepeatService.update(updateTodoRepeatDto);
      return dto.exportVo();
    }
    const updateDto = new UpdateTodoDto();
    updateDto.importUpdateVo(updateVo);
    updateDto.id = id;
    const dto = await this.todoService.update(updateDto);
    return dto.exportVo();
  }

  @Put('/done-with-repeat/batch', { description: '批量完成待办' })
  async doneWithRepeatBatch(@Body() body: TodoVO.TodoFilterVo): Promise<any> {
    const filter = new TodoFilterDto();
    filter.importListVo(body);
    return await this.todoService.doneWithRepeatBatch(filter);
  }

  @Put('/abandon-with-repeat/:id', { description: '废弃待办' })
  async abandonWithRepeat(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.abandonWithRepeat(id);
  }

  @Put('/restore-with-repeat/:id', { description: '恢复待办' })
  async restoreWithRepeat(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.restoreWithRepeat(id);
  }

  @Get('/list-with-repeat', { description: '列表查询待办及其重复信息' })
  async listWithRepeat(@Query() query?: TodoVO.TodoFilterVo): Promise<ResponseListVo<TodoVO.TodoWithoutRelationsVo>> {
    const filter = new TodoFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.listWithRepeat(filter);

    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  @Get('/detail-with-repeat/:id', { description: '查询待办及其重复信息' })
  async detailWithRepeat(@Param('id') id: string, @Query() query?: { source?: string }): Promise<TodoVO.TodoVo> {
    console.log('=============query',query);
    const source = query?.source;
    if (source === TodoSource.IS_REPEAT) {
      return (await this.todoRepeatService.findWithRelations(id)).exportVo();
    }
    return (await this.todoService.findWithRelations(id)).exportVo();
  }
}
