import type { Todo as TodoVO } from '@life-toolkit/vo';
import { TodoFilterDto, TodoPageFilterDto } from './dto';
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

  @Delete('/delete/:id', { description: '删除待办' })
  async delete(@Param('id') id: string): Promise<boolean> {
    return await this.todoService.delete(id);
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

  @Get('/find/:id', { description: '根据ID查询待办详情' })
  async find(@Param('id') id: string): Promise<TodoVO.TodoVo> {
    return (await this.todoService.find(id)).exportVo();
  }

  @Get('/find-all', { description: '列表查询待办' })
  async findAll(@Query() query?: TodoVO.TodoFilterVo): Promise<TodoVO.TodoListVo> {
    const filter = new TodoFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.findAll(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  @Get('/page', { description: '分页查询待办' })
  async page(@Query() query?: TodoVO.TodoPageFilterVo): Promise<TodoVO.TodoPageVo> {
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

  @Put('/done-batch', { description: '批量完成待办' })
  async doneBatch(@Body() body?: TodoVO.TodoFilterVo): Promise<any> {
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

  @Get('/list-with-repeat', { description: '列表查询待办及其重复信息' })
  async listWithRepeat(@Query() query?: TodoVO.TodoFilterVo): Promise<TodoVO.TodoListVo> {
    const filter = new TodoFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.listWithRepeat(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  @Get('/detail-with-repeat/:id', { description: '查询待办及其重复信息' })
  async detailWithRepeat(@Param('id') id: string): Promise<TodoVO.TodoVo> {
    return (await this.todoService.detailWithRepeat(id)).exportVo();
  }
}
