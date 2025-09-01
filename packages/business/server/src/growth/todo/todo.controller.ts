import type { Todo as TodoVO } from "@life-toolkit/vo";
import { TodoListFilterDto, TodoPageFiltersDto } from "./dto";
import { TodoService } from "./todo.service";
import { TodoRepeatService } from "./todo-repeat.service";
import {
  CreateTodoRepeatDto,
  UpdateTodoRepeatDto,
} from "./dto/todo-repeat-form.dto";
import { CreateTodoDto, UpdateTodoDto } from "./dto";

export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoRepeatService: TodoRepeatService
  ) {}

  // ==============CURD==================

  async create(createTodoVo: TodoVO.CreateTodoVo): Promise<TodoVO.TodoVo> {
    if (createTodoVo.repeat) {
      const createTodoRepeatDto = new CreateTodoRepeatDto();
      createTodoRepeatDto.importCreateVo({
        ...createTodoVo,
        repeat: createTodoVo.repeat,
      });
      const todoRepeatDto =
        await this.todoRepeatService.create(createTodoRepeatDto);
      return todoRepeatDto.exportVo();
    }
    const createTodoDto = new CreateTodoDto();
    createTodoDto.importCreateVo(createTodoVo);
    const todoDto = await this.todoService.create(createTodoDto);
    return todoDto.exportVo();
  }

  async findById(id: string): Promise<TodoVO.TodoVo> {
    return (await this.todoService.findById(id)).exportVo();
  }

  async update(
    id: string,
    updateVo: TodoVO.UpdateTodoVo
  ): Promise<TodoVO.TodoVo> {
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

  async delete(id: string): Promise<boolean> {
    return await this.todoService.delete(id);
  }

  async page(query?: TodoVO.TodoPageFiltersVo): Promise<TodoVO.TodoPageVo> {
    const filter = new TodoPageFiltersDto();
    if (query) filter.importPageVo(query);
    const { list, total, pageNum, pageSize } =
      await this.todoService.page(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
      total,
      pageNum,
      pageSize,
    };
  }

  async list(query?: TodoVO.TodoListFiltersVo): Promise<TodoVO.TodoListVo> {
    const filter = new TodoListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.list(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  // ==============业务操作==================

  async batchDone(body?: { idList?: string[] }) {
    return await this.todoService.batchDone({ idList: body?.idList ?? [] });
  }

  async abandon(id: string) {
    return await this.todoService.abandon(id);
  }

  async restore(id: string) {
    return await this.todoService.restore(id);
  }

  async done(id: string) {
    return await this.todoService.done(id);
  }

  async listWithRepeat(
    query?: TodoVO.TodoListFiltersVo
  ): Promise<TodoVO.TodoListVo> {
    const filter = new TodoListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.listWithRepeat(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

  async detailWithRepeat(id: string): Promise<TodoVO.TodoVo> {
    return (await this.todoService.detailWithRepeat(id)).exportVo();
  }
}
