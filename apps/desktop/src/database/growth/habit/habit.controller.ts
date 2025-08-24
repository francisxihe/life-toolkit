import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@life-toolkit/electron-ipc-router";
import { habitService } from "./habit.service";
import { HabitStatus } from "@life-toolkit/enum";
import type { Habit as HabitVO } from "@life-toolkit/vo";
import { HabitMapper } from "@life-toolkit/business-server";

@Controller("/habit")
export class HabitController {
  @Post("/create")
  async create(@Body() payload: HabitVO.CreateHabitVo) {
    return HabitMapper.dtoToVo(
      await habitService.create(HabitMapper.voToCreateDto(payload))
    );
  }

  @Get("/findAll")
  async findAll() {
    return (await habitService.findAll()).map((dto) =>
      HabitMapper.dtoToItemVo(dto)
    );
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return HabitMapper.dtoToVo(await habitService.findById(id));
  }

  @Get("/findActiveHabits")
  async findActiveHabits() {
    return (await habitService.findActiveHabits()).map((dto) =>
      HabitMapper.dtoToItemVo(dto)
    );
  }

  @Get("/findByStatus/:status")
  async findByStatus(@Param("status") status: string) {
    return (await habitService.findByStatus(status as HabitStatus)).map((dto) =>
      HabitMapper.dtoToItemVo(dto)
    );
  }

  @Post("/updateStreak/:id")
  async updateStreak(
    @Param("id") id: string,
    @Body() body?: { completed?: boolean }
  ) {
    return await habitService.updateStreak(id, body?.completed);
  }

  @Get("/getStatistics/:id")
  async getStatistics(@Param("id") id: string) {
    return await habitService.getHabitStatistics(id);
  }

  @Get("/getOverallStatistics")
  async getOverallStatistics() {
    return await habitService.getOverallStatistics();
  }

  @Post("/pauseHabit")
  async pauseHabit(@Body() body?: { id?: string }) {
    return await habitService.pauseHabit(body?.id);
  }

  @Post("/resumeHabit")
  async resumeHabit(@Body() body?: { id?: string }) {
    return await habitService.resumeHabit(body?.id);
  }

  @Post("/completeHabit")
  async completeHabit(@Body() body?: { id?: string }) {
    return await habitService.completeHabit(body?.id);
  }

  @Put("/update/:id")
  async update(
    @Param("id") id: string,
    @Body() payload: HabitVO.UpdateHabitVo
  ) {
    return HabitMapper.dtoToVo(
      await habitService.update(
        id,
        HabitMapper.voToUpdateDto(payload as HabitVO.UpdateHabitVo)
      )
    );
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return await habitService.delete(id);
  }

  @Get("/page")
  async page(
    @Query() q?: { pageNum?: number | string; pageSize?: number | string }
  ) {
    const pageNum = Number(q?.pageNum) || 1;
    const pageSize = Number(q?.pageSize) || 10;
    const res = await habitService.page(pageNum, pageSize);
    return HabitMapper.dtoToPageVo(res.data, res.total, pageNum, pageSize);
  }

  @Get("/list")
  async list() {
    return HabitMapper.dtoToListVo(await habitService.list());
  }

  @Get("/findByIdWithRelations/:id")
  async findByIdWithRelations(@Param("id") id: string) {
    return HabitMapper.dtoToVo(await habitService.findByIdWithRelations(id));
  }

  @Get("/findByGoalId/:goalId")
  async findByGoalId(@Param("goalId") goalId: string) {
    return (await habitService.findByGoalId(goalId)).map((dto) =>
      HabitMapper.dtoToItemVo(dto)
    );
  }

  @Get("/getHabitTodos/:id")
  async getHabitTodos(@Param("id") id: string) {
    return await habitService.getHabitTodos(id);
  }

  @Get("/getHabitAnalytics/:id")
  async getHabitAnalytics(@Param("id") id: string) {
    return await habitService.getHabitAnalytics(id);
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return await Promise.all(
      (body?.idList ?? []).map((id: string) =>
        habitService.update(id, { status: HabitStatus.COMPLETED })
      )
    );
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return HabitMapper.dtoToVo(
      await habitService.update(id, { status: HabitStatus.PAUSED })
    );
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) {
    return HabitMapper.dtoToVo(
      await habitService.update(id, { status: HabitStatus.ACTIVE })
    );
  }

  @Post("/pause")
  async pause(@Body() body?: { id?: string }) {
    return await habitService.pauseHabit(body?.id);
  }

  @Post("/resume")
  async resume(@Body() body?: { id?: string }) {
    return await habitService.resumeHabit(body?.id);
  }
}
