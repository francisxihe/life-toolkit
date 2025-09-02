import type { Todo as TodoVO } from '@life-toolkit/vo';
import { TodoListFilterDto, TodoPageFiltersDto } from './dto';
import { TodoService } from './todo.service';
import { TodoRepeatService } from './todo-repeat.service';
import { CreateTodoRepeatDto, UpdateTodoRepeatDto } from './dto/todo-repeat-form.dto';
import { CreateTodoDto, UpdateTodoDto } from './dto';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';

@Controller('/todo')
export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoRepeatService: TodoRepeatService
  ) {}

  // ==============CURD==================

  @Post('/create', { description: '创建待办' })
  async create(@Body() createTodoVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoVo> {
    if (createTodoVo.repeat) {
      const createTodoRepeatDto = new CreateTodoRepeatDto();
      createTodoRepeatDto.importCreateVo({
        ...createTodoVo,
        repeat: createTodoVo.repeat,
      });
      const todoRepeatDto = await this.todoRepeatService.create(createTodoRepeatDto);
      return todoRepeatDto.exportVo();
    }
    const createTodoDto = new CreateTodoDto();
    createTodoDto.importCreateVo(createTodoVo);
    const todoDto = await this.todoService.create(createTodoDto);
    return todoDto.exportVo();
  }

  @Get('/detail/:id', { description: '根据ID查询待办详情' })
  async findById(@Param('id') id: string): Promise<TodoVO.TodoVo> {
    return (await this.todoService.findById(id)).exportVo();
  }

  @Put('/update/:id', { description: '更新待办' })
  async update(@Param('id') id: string, @Body() updateVo: TodoVO.UpdateTodoVo): Promise<TodoVO.TodoVo> {
    if (updateVo.repeat) {
      const updateTodoRepeatDto = new UpdateTodoRepeatDto();
      updateTodoRepeatDto.importUpdateVo({
        ...updateVo,
        repeat: updateVo.repeat,
      });
      const dto = await this.todoRepeatService.update(id, updateTodoRepeatDto);
      return dto.exportVo();
    }
    const updateDto = new UpdateTodoDto();
    updateDto.importUpdateVo(updateVo);
    const dto = await this.todoService.update(id, updateDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除待办' })
  async delete(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.delete(id);
  }

  @Get('/page', { description: '分页查询待办' })
  async page(@Query() query?: TodoVO.TodoPageFiltersVo): Promise<TodoVO.TodoPageVo> {
    const filter = new TodoPageFiltersDto();
    if (query) filter.importPageVo(query);
    const { list, total, pageNum, pageSize } = await this.todoService.page(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
      total,
      pageNum,
      pageSize,
    };
  }

  @Get('/list', { description: '列表查询待办' })
  async list(@Query() query?: TodoVO.TodoListFiltersVo): Promise<TodoVO.TodoListVo> {
    const filter = new TodoListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.list(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  // ==============业务操作==================

  @Put('/done/batch', { description: '批量完成待办' })
  async doneBatch(@Body() body?: TodoVO.TodoListFiltersVo) {
    return await this.todoService.doneBatch({ includeIds: body?.includeIds ?? [] });
  }

  @Put('/abandon/:id', { description: '废弃待办' })
  async abandon(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.abandon(id);
  }

  @Put('/restore/:id', { description: '恢复待办' })
  async restore(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.restore(id);
  }

  @Put('/done/:id', { description: '完成待办' })
  async done(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.done(id);
  }

  @Get('/listWithRepeat', { description: '列表查询待办及其重复信息' })
  async listWithRepeat(@Query() query?: TodoVO.TodoListFiltersVo): Promise<TodoVO.TodoListVo> {
    const filter = new TodoListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.listWithRepeat(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  @Get('/detailWithRepeat/:id', { description: '查询待办及其重复信息' })
  async detailWithRepeat(@Param('id') id: string): Promise<TodoVO.TodoVo> {
    return (await this.todoService.detailWithRepeat(id)).exportVo();
  }
}
