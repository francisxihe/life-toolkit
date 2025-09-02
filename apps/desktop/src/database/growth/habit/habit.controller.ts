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
import type { Habit as HabitVO } from "@life-toolkit/vo";
import { HabitController as _HabitController } from "@life-toolkit/business-server";
import { habitService } from "./habit.service";

@Controller("/habit")
export class HabitController {
  private readonly controller = new _HabitController(habitService);

  @Post("/create")
  async create(@Body() body: HabitVO.CreateHabitVo) {
    return this.controller.create(body);
  }

  @Get("/detail/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Put("/update-streak/:id")
  async updateStreak(
    @Param("id") id: string,
    @Body() body: { completed?: boolean }
  ) {
    return this.controller.updateStreak(id, body);
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() body: HabitVO.UpdateHabitVo) {
    return this.controller.update(id, body);
  }

  @Delete("/delete/:id")
  async delete(@Param("id") id: string) {
    return this.controller.delete(id);
  }

  @Get("/page")
  async page(@Body() body: HabitVO.HabitPageFiltersVo) {
    return this.controller.page(body);
  }

  @Get("/list")
  async list(@Body() body: HabitVO.HabitListFiltersVo) {
    return this.controller.list(body);
  }

  @Get("/todos/:id")
  async getHabitTodos(@Param("id") id: string) {
    return this.controller.getHabitTodos(id);
  }

  @Get("/analytics/:id")
  async getHabitAnalytics(@Param("id") id: string) {
    return this.controller.getHabitAnalytics(id);
  }

  @Put("/done/batch")
  async doneBatch(@Body() body: HabitVO.HabitListFiltersVo) {
    return this.controller.doneBatch(body);
  }

  @Put("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return this.controller.abandon(id);
  }

  @Put("/restore/:id")
  async restore(@Param("id") id: string) {
    return this.controller.restore(id);
  }

  @Put("/pause/:id")
  async pauseHabit(@Param("id") id: string) {
    return this.controller.pauseHabit(id);
  }

  @Put("/resume/:id")
  async resumeHabit(@Param("id") id: string) {
    return this.controller.resumeHabit(id);
  }
}
