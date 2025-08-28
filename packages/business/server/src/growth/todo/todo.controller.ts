import type { Todo as TodoVO } from "@life-toolkit/vo";
import { TodoMapper } from "./todo.mapper";
import { TodoListFilterDto, TodoPageFiltersDto } from "./dto";
import { TodoService } from "./todo.service";
import { TodoRepeatService } from "./todo-repeat.service";
import { TodoRepeatMapper } from "./todo-repeat.mapper";
import { CreateTodoRepeatDto } from "./dto/todo-repeat-form.dto";

export class TodoController {
  constructor(
    private readonly todoService: TodoService,
    private readonly todoRepeatService: TodoRepeatService
  ) {}

  async create(createTodoVo: TodoVO.CreateTodoVo) {
    if (createTodoVo.repeat) {
      const createTodoRepeatDto = new CreateTodoRepeatDto();
      createTodoRepeatDto.voToCreateDto({
        ...createTodoVo,
        repeat: createTodoVo.repeat,
      });
      const todoRepeatDto =
        await this.todoRepeatService.create(createTodoRepeatDto);
      return TodoRepeatMapper.dtoToVo(todoRepeatDto);
    }
    const createTodoDto = TodoMapper.voToCreateDto(createTodoVo);
    const todoDto = await this.todoService.create(createTodoDto);
    return TodoMapper.dtoToVo(todoDto);
  }

  async findById(id: string) {
    return TodoMapper.dtoToVo(await this.todoService.findById(id));
  }

  async update(
    id: string,
    payload: { updateVo?: TodoVO.UpdateTodoVo } & TodoVO.UpdateTodoVo
  ) {
    const updateVo = (payload?.updateVo ?? payload) as TodoVO.UpdateTodoVo;
    const dto = await this.todoService.update(
      id,
      TodoMapper.voToUpdateDto(updateVo)
    );
    return TodoMapper.dtoToVo(dto);
  }

  async remove(id: string) {
    return await this.todoService.delete(id);
  }

  async page(q?: TodoVO.TodoPageFiltersVo) {
    const filter = new TodoPageFiltersDto();
    if (q) filter.importPageVo(q);
    const { list, total, pageNum, pageSize } =
      await this.todoService.page(filter);
    return TodoMapper.dtoToPageVo(list, total, pageNum, pageSize);
  }

  async list(query?: TodoVO.TodoListFiltersVo) {
    const filter = new TodoListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoService.list(filter);
    return TodoMapper.dtoToListVo(list);
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
