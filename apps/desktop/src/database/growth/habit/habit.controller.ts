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
import type {
  Habit as HabitVO,
  HabitListFiltersVo,
  HabitPageFiltersVo,
} from "@life-toolkit/vo";
import { HabitMapper } from "@life-toolkit/business-server";
import {
  HabitListFiltersDto,
  HabitPageFiltersDto,
} from "@life-toolkit/business-server";

@Controller("/habit")
export class HabitController {
  @Post("/create")
  async create(@Body() payload: HabitVO.CreateHabitVo) {
    return HabitMapper.dtoToVo(
      await habitService.create(HabitMapper.voToCreateDto(payload))
    );
  }

  @Get("/findById/:id")
  async findById(@Param("id") id: string) {
    return HabitMapper.dtoToVo(await habitService.findById(id));
  }

  @Post("/updateStreak/:id")
  async updateStreak(
    @Param("id") id: string,
    @Body() body?: { completed?: boolean }
  ) {
    return await habitService.updateStreak(id, body?.completed);
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
  async page(@Query() q?: HabitPageFiltersVo) {
    const habitPageFilter = new HabitPageFiltersDto();
    habitPageFilter.importVo(q);
    const res = await habitService.page(habitPageFilter);
    return HabitMapper.dtoToPageVo(
      res.data,
      res.total,
      habitPageFilter.pageNum,
      habitPageFilter.pageSize
    );
  }

  @Get("/list")
  async list(@Query() query?: HabitListFiltersVo) {
    const habitListFilter = new HabitListFiltersDto();
    habitListFilter.importVo(query);
    const list = await habitService.list(habitListFilter);
    return HabitMapper.dtoToListVo(list);
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
