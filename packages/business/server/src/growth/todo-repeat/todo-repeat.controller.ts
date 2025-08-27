import type { TodoRepeat as TodoRepeatVO } from "@life-toolkit/vo";
import { TodoRepeatMapper } from "./todo-repeat.mapper";
import { TodoRepeatListFilterDto, TodoRepeatPageFiltersDto } from "./dto";
import { TodoRepeatService } from "./todo-repeat.service";

export class TodoRepeatController {
  constructor(private readonly todoRepeatService: TodoRepeatService) {}

  async create(createTodoRepeatVo: TodoRepeatVO.CreateTodoRepeatVo) {
    const dto = await this.todoRepeatService.create(TodoRepeatMapper.voToCreateDto(createTodoRepeatVo));
    return TodoRepeatMapper.dtoToVo(dto);
  }

  async findById(id: string) {
    return TodoRepeatMapper.dtoToVo(await this.todoRepeatService.findById(id));
  }

  async update(id: string, payload: { updateVo?: TodoRepeatVO.UpdateTodoRepeatVo } & TodoRepeatVO.UpdateTodoRepeatVo) {
    const updateVo = (payload?.updateVo ?? payload) as TodoRepeatVO.UpdateTodoRepeatVo;
    const dto = await this.todoRepeatService.update(id, TodoRepeatMapper.voToUpdateDto(updateVo));
    return TodoRepeatMapper.dtoToVo(dto);
  }

  async remove(id: string) {
    return await this.todoRepeatService.delete(id);
  }

  async page(q?: TodoRepeatVO.TodoRepeatPageFiltersVo) {
    const filter = new TodoRepeatPageFiltersDto();
    if (q) filter.importPageVo(q);
    const { list, total, pageNum, pageSize } = await this.todoRepeatService.page(filter);
    return TodoRepeatMapper.dtoToPageVo(list, total, pageNum, pageSize);
  }

  async list(query?: TodoRepeatVO.TodoRepeatListFiltersVo) {
    const filter = new TodoRepeatListFilterDto();
    if (query) filter.importListVo(query);
    const list = await this.todoRepeatService.list(filter);
    return TodoRepeatMapper.dtoToListVo(list);
  }

  async batchDone(idList: string[]) {
    return await this.todoRepeatService.batchDone(idList);
  }

  async abandon(id: string) {
    return await this.todoRepeatService.abandon(id);
  }

  async restore(id: string) {
    return await this.todoRepeatService.restore(id);
  }

  async done(id: string) {
    return await this.todoRepeatService.done(id);
  }
}
