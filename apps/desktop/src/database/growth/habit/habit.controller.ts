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
  private readonly controller: _HabitController;
  constructor() {
    this.controller = new _HabitController(habitService);
  }
  @Post("/create")
  async create(@Body() payload: HabitVO.CreateHabitVo) {
    return this.controller.create(payload);
  }

  @Get("/detail/:id")
  async findById(@Param("id") id: string) {
    return this.controller.findById(id);
  }

  @Post("/updateStreak/:id")
  async updateStreak(
    @Param("id") id: string,
    @Body() body?: { completed?: boolean }
  ) {
    return this.controller.updateStreak(id, body);
  }

  @Post("/pauseHabit")
  async pauseHabit(@Body() body?: { id?: string }) {
    return this.controller.pauseHabit(body);
  }

  @Post("/resumeHabit")
  async resumeHabit(@Body() body?: { id?: string }) {
    return this.controller.resumeHabit(body);
  }

  @Post("/completeHabit")
  async completeHabit(@Body() body?: { id?: string }) {
    return this.controller.completeHabit(body);
  }

  @Put("/update/:id")
  async update(
    @Param("id") id: string,
    @Body() payload: HabitVO.UpdateHabitVo
  ) {
    return this.controller.update(id, payload);
  }

  @Delete("/delete/:id")
  async remove(@Param("id") id: string) {
    return this.controller.remove(id);
  }

  @Get("/page")
  async page(@Query() query?: HabitPageFiltersVo) {
    return this.controller.page(query);
  }

  @Get("/list")
  async list(@Query() query?: HabitListFiltersVo) {
    return this.controller.list(query);
  }

  @Get("/getHabitTodos/:id")
  async getHabitTodos(@Param("id") id: string) {
    return this.controller.getHabitTodos(id);
  }

  @Get("/getHabitAnalytics/:id")
  async getHabitAnalytics(@Param("id") id: string) {
    return this.controller.getHabitAnalytics(id);
  }

  @Post("/batchDone")
  async batchDone(@Body() body?: { idList?: string[] }) {
    return this.controller.batchDone(body);
  }

  @Post("/abandon/:id")
  async abandon(@Param("id") id: string) {
    return this.controller.abandon(id);
  }

  @Post("/restore/:id")
  async restore(@Param("id") id: string) { 
    return this.controller.restore(id);
  }

  @Post("/pause")
  async pause(@Body() body?: { id?: string }) {
    return this.controller.pause(body);
  }

  @Post("/resume")
  async resume(@Body() body?: { id?: string }) {
    return this.controller.resume(body);
  }
}
