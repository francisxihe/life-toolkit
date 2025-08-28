import type {
  Task as TaskVO,
  TaskListFiltersVo,
  TaskPageFiltersVo,
} from "@life-toolkit/vo";
import { TaskListFiltersDto, TaskPageFiltersDto, UpdateTaskDto, CreateTaskDto, TaskDto } from "./dto";
import { TaskService } from "./task.service";
import { TaskStatus } from "@life-toolkit/enum";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  async create(createTaskVo: TaskVO.CreateTaskVo) {
    const createDto = new CreateTaskDto();
    createDto.importVo(createTaskVo);
    const dto = await this.taskService.create(createDto);
    return dto.exportVo();
  }

  async findById(id: string) {
    const dto = await this.taskService.findById(id);
    return dto.exportVo();
  }

  async update(id: string, vo: TaskVO.UpdateTaskVo) {
    const updateDto = new UpdateTaskDto();
    updateDto.importVo(vo);
    const dto = await this.taskService.update(id, updateDto);
    return dto.exportVo();
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
    return TaskDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  async list(taskListFiltersVo?: TaskListFiltersVo) {
    const filter = new TaskListFiltersDto();
    if (taskListFiltersVo) filter.importListVo(taskListFiltersVo);
    const list = await this.taskService.list(filter);
    return TaskDto.dtoListToListVo(list);
  }

  async taskWithTrackTime(id: string) {
    const dto = await this.taskService.taskWithTrackTime(id);
    return dto.exportVo(); // TaskWithTrackTimeDto 继承自 TaskDto
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
    return results.map((dto) => dto.exportVo());
  }

  async abandon(id: string) {
    return await this.taskService.abandon(id);
  }

  async restore(id: string) {
    return await this.taskService.restore(id);
  }
}
