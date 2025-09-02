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
import type {
  Habit as HabitVO,
  HabitListFiltersVo,
  HabitPageFiltersVo,
} from "@life-toolkit/vo";
import { HabitController as _HabitController } from "@life-toolkit/business-server";
import { habitService } from "./habit.service";

@Controller("/habit")
export class HabitController {
  controller = new _HabitController(habitService);


  @Post("/create")
  async create(@Body() payload: any) {
    return this.controller.create(payload);
  }

  @Get("/detail/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Put("/update-streak/:id")
  async updateStreak(@Param("id") id: string, @Body() payload: any) {
    return this.controller.updateStreak(id, payload);
  }

  @Put("/update/:id")
  async update(@Param("id") id: string, @Body() payload: any) {
    return this.controller.update(id, payload);
  }

  @Delete("/delete/:id")
  async delete(@Param("id") id: string) {
    return this.controller.delete(id);
  }

  @Get("/page")
  async page(@Query() query?: any) {
    return this.controller.page(query);
  }

  @Get("/list")
  async list(@Query() query?: any) {
    return this.controller.list(query);
  }

  @Get("/todos/:id")
  async getHabitTodos(@Param("id") id: string) {
    return this.controller.getHabitTodos(id);
  }

  @Get("/analytics/:id")
  async getHabitAnalytics(@Param("id") id: string) {
    return this.controller.getHabitAnalytics(id);
  }

  @Put("/batch-done")
  async batchDone(@Body() payload: any) {
    return this.controller.batchDone(payload);
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
