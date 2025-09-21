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

  @Put('/abandon/:id')
  async abandon(@Param('id') id: string) {
    return this.controller.abandon(id);
  }

  @Put('/restore/:id')
  async restore(@Param('id') id: string) {
    return this.controller.restore(id);
  }
}
