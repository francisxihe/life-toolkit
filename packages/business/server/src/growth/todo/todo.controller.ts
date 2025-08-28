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

  async create(createTodoVo: TodoVO.CreateTodoVo) {
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

  async findById(id: string) {
    return (await this.todoService.findById(id)).exportVo();
  }

  async update(id: string, updateVo: TodoVO.UpdateTodoVo) {
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

  async delete(id: string) {
    return await this.todoService.delete(id);
  }

  async page(q?: TodoVO.TodoPageFiltersVo) {
    const filter = new TodoPageFiltersDto();
    if (q) filter.importPageVo(q);
    const { list, total, pageNum, pageSize } =
      await this.todoService.page(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
      total,
      pageNum,
      pageSize,
    };
  }

  async list(query?: TodoVO.TodoListFiltersVo) {
    const filter = new TodoListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.list(filter);
    return {
      list: list.map((todo) => todo.exportVo()),
    };
  }

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
}
