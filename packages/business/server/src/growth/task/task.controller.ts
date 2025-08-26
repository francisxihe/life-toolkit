import type {
  Task as TaskVO,
  TaskListFiltersVo,
  TaskPageFiltersVo,
} from "@life-toolkit/vo";
import { TaskMapper } from "./task.mapper";
import { TaskListFiltersDto, TaskPageFiltersDto, UpdateTaskDto } from "./dto";
import { TaskService } from "./task.service";
import { TaskStatus } from "@life-toolkit/enum";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  async create(createTaskVo: TaskVO.CreateTaskVo) {
    const dto = await this.taskService.create(
      TaskMapper.voToCreateDto(createTaskVo)
    );
    return TaskMapper.dtoToVo(dto);
  }

  async findById(id: string) {
    return TaskMapper.dtoToVo(await this.taskService.findById(id));
  }

  async update(id: string, vo: TaskVO.CreateTaskVo) {
    const dto = await this.taskService.update(
      id,
      TaskMapper.voToUpdateDto(vo)
    );
    return TaskMapper.dtoToVo(dto);
  }

  async remove(id: string) {
    return await this.taskService.delete(id);
  }

  async page(taskPageFiltersVo?: TaskPageFiltersVo) {
    const filter = new TaskPageFiltersDto();
    if (taskPageFiltersVo) filter.importPageVo(taskPageFiltersVo);
    const { list, total, pageNum, pageSize } = await this.taskService.page(
      filter
    );
    return TaskMapper.dtoToPageVo(list, total, pageNum, pageSize);
  }

  async list(taskListFiltersVo?: TaskListFiltersVo) {
    const filter = new TaskListFiltersDto();
    if (taskListFiltersVo) filter.importListVo(taskListFiltersVo);
    const list = await this.taskService.list(filter);
    return TaskMapper.dtoToListVo(list);
  }

  async taskWithTrackTime(id: string) {
    const dto = await this.taskService.taskWithTrackTime(id);
    return TaskMapper.dtoToWithTrackTimeVo(dto);
  }

  async batchDone(body?: { idList?: string[] }) {
    const idList = body?.idList ?? [];
    const results = await Promise.all(
      idList.map(async (id) => {
        const updateDto = new UpdateTaskDto();
        updateDto.status = TaskStatus.DONE as any;
        (updateDto as any).doneAt = new Date();
        return await this.taskService.update(id, updateDto);
      })
    );
    return results.map((dto) => TaskMapper.dtoToVo(dto));
  }

  async abandon(id: string) {
    return await this.taskService.abandon(id);
  }

  async restore(id: string) {
    return await this.taskService.restore(id);
  }
}
