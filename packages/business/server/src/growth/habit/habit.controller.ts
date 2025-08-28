import type {
  Habit as HabitVO,
  HabitListFiltersVo,
  HabitPageFiltersVo,
} from "@life-toolkit/vo";
import { CreateHabitDto, UpdateHabitDto, HabitDto } from "./dto";
import { HabitListFiltersDto, HabitPageFiltersDto } from "./dto";
import { HabitService } from "./habit.service";

export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  async create(createHabitVo: HabitVO.CreateHabitVo) {
    const createDto = new CreateHabitDto();
    createDto.importVo(createHabitVo);
    const dto = await this.habitService.create(createDto);
    return dto.exportVo();
  }

  async findById(id: string) {
    const dto = await this.habitService.findById(id);
    return dto.exportVo();
  }

  async updateStreak(id: string, body?: { completed?: boolean }) {
    return await this.habitService.updateStreak(id, body?.completed as any);
  }

  async pauseHabit(body?: { id?: string }) {
    return await this.habitService.pauseHabit(body?.id as any);
  }

  async resumeHabit(body?: { id?: string }) {
    return await this.habitService.resumeHabit(body?.id as any);
  }

  async completeHabit(body?: { id?: string }) {
    return await this.habitService.completeHabit(body?.id as any);
  }

  async update(id: string, updateHabitVo: HabitVO.UpdateHabitVo) {
    const updateDto = new UpdateHabitDto();
    updateDto.importVo(updateHabitVo);
    const dto = await this.habitService.update(id, updateDto);
    return dto.exportVo();
  }

  async remove(id: string) {
    return await this.habitService.delete(id);
  }

  async page(habitPageFiltersVo?: HabitPageFiltersVo) {
    const filter = new HabitPageFiltersDto();
    if (habitPageFiltersVo) filter.importPageVo(habitPageFiltersVo);
    const { list, total, pageNum, pageSize } = await this.habitService.page(
      filter
    );
    return HabitDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  async list(habitListFiltersVo?: HabitListFiltersVo) {
    const filter = new HabitListFiltersDto();
    if (habitListFiltersVo) filter.importListVo(habitListFiltersVo);
    const list = await this.habitService.list(filter);
    return HabitDto.dtoListToListVo(list);
  }

  async getHabitTodos(id: string) {
    return await this.habitService.getHabitTodos(id);
  }

  async getHabitAnalytics(id: string) {
    return await this.habitService.getHabitAnalytics(id);
  }

  async batchDone(body?: { idList?: string[] }) {
    return await Promise.all(
      (body?.idList ?? []).map((id: string) =>
        this.habitService.completeHabit(id)
      )
    );
  }

  async abandon(id: string) {
    return await this.habitService.abandon(id);
  }

  async restore(id: string) {
    return await this.habitService.restore(id);
  }

  async pause(body?: { id?: string }) {
    return await this.habitService.pauseHabit(body?.id as any);
  }

  async resume(body?: { id?: string }) {
    return await this.habitService.resumeHabit(body?.id as any);
  }
}
