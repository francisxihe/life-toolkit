import { Body, Controller, Delete, Get, Param, Post, Put, Query } from 'electron-ipc-restful';
import type { Habit as HabitVO } from '@life-toolkit/vo';
import { HabitController as _HabitController } from '@life-toolkit/business-server';
import { habitService } from './habit.service';

@Controller('/habit')
export class HabitController {
  private readonly controller = new _HabitController(habitService);

  @Post('/create')
  async create(@Body() body: HabitVO.CreateHabitVo) {
    return this.controller.create(body);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return this.controller.delete(id);
  }

  @Put('/update/:id')
  async update(@Param('id') id: string, @Body() body: HabitVO.UpdateHabitVo) {
    return this.controller.update(id, body);
  }

  @Get('/find/:id')
  async find(@Param('id') id: string) {
    return this.controller.find(id);
  }

  @Get('/find-by-filter')
  async findByFilter(@Body() body: HabitVO.HabitFilterVo) {
    return this.controller.findByFilter(body);
  }

  @Get('/page')
  async page(@Body() body: HabitVO.HabitPageFilterVo) {
    return this.controller.page(body);
  }

  @Put('/update-streak/:id')
  async updateStreak(@Param('id') id: string, @Body() body: { completed?: boolean }) {
    return this.controller.updateStreak(id, body);
  }

  @Get('/get-habit-todos/:id')
  async getHabitTodos(@Param('id') id: string) {
    return this.controller.getHabitTodos(id);
  }

  @Get('/get-habit-analytics/:id')
  async getHabitAnalytics(@Param('id') id: string) {
    return this.controller.getHabitAnalytics(id);
  }

  @Put('/done/batch')
  async doneBatch(@Body() body: { includeIds?: string[] }) {
    return this.controller.doneBatch(body);
  }

  @Put('/abandon/:id')
  async abandon(@Param('id') id: string) {
    return this.controller.abandon(id);
  }

  @Put('/restore/:id')
  async restore(@Param('id') id: string) {
    return this.controller.restore(id);
  }

  @Put('/pause-habit/:id')
  async pauseHabit(@Param('id') id: string) {
    return this.controller.pauseHabit(id);
  }

  @Put('/resume-habit/:id')
  async resumeHabit(@Param('id') id: string) {
    return this.controller.resumeHabit(id);
  }
}
