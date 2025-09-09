import { Controller, Get, Post, Body, Param, Delete, Put, Query } from '@nestjs/common';
import { HabitService } from './habit.service';
import {
  HabitPageFilterDto,
  HabitFilterDto,
  CreateHabitDto,
  UpdateHabitDto,
  HabitDto,
} from '@life-toolkit/business-server';
import { Response } from '@/decorators/response.decorator';
import type { Habit as HabitVO } from '@life-toolkit/vo';

@Controller('habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Put('done/batch')
  @Response()
  async doneBatch(@Body() body: HabitVO.HabitFilterVo) {
    return await this.habitService.doneBatch(body.includeIds);
  }

  @Put('abandon/:id')
  @Response()
  async abandon(@Param('id') id: string) {
    await this.habitService.abandon(id);
    return { result: true };
  }

  @Put('restore/:id')
  @Response()
  async restore(@Param('id') id: string) {
    await this.habitService.restore(id);
    return { result: true };
  }

  @Put('pause/:id')
  @Response()
  async pause(@Param('id') id: string) {
    await this.habitService.pause(id);
    return { result: true };
  }

  @Put('resume/:id')
  @Response()
  async resume(@Param('id') id: string) {
    await this.habitService.resume(id);
    return { result: true };
  }

  @Post('create')
  @Response()
  async create(@Body() createHabitVO: HabitVO.CreateHabitVo) {
    const createDto = new CreateHabitDto();
    createDto.importCreateVo(createHabitVO);
    const dto = await this.habitService.create(createDto);
    return dto.exportVo();
  }

  @Delete('delete/:id')
  @Response()
  async delete(@Param('id') id: string) {
    return await this.habitService.delete(id);
  }

  @Put('update/:id')
  @Response()
  async update(@Param('id') id: string, @Body() updateHabitVO: HabitVO.UpdateHabitVo) {
    const updateDto = new UpdateHabitDto();
    updateDto.importUpdateVo(updateHabitVO);
    const dto = await this.habitService.update(id, updateDto);
    return dto.exportVo();
  }

  @Get('page')
  @Response()
  async page(@Query() filter: HabitPageFilterDto) {
    const { list, total } = await this.habitService.page(filter);
    return HabitDto.dtoListToPageVo(list, total, filter.pageNum || 1, filter.pageSize || 10);
  }

  @Get('list')
  @Response()
  async list(@Query() filter: HabitFilterDto) {
    const habits = await this.habitService.findByFilter(filter);
    return HabitDto.dtoListToListVo(habits);
  }

  @Get('detail/:id')
  @Response()
  async findWithRelations(@Param('id') id: string) {
    const habit = await this.habitService.findWithRelations(id);
    return habit.exportVo();
  }

  @Get('todos/:id')
  @Response()
  async getHabitTodos(@Param('id') id: string) {
    const result = await this.habitService.getHabitTodos(id);
    return result;
  }

  @Get('analytics/:id')
  @Response()
  async getHabitAnalytics(@Param('id') id: string) {
    const result = await this.habitService.getHabitAnalytics(id);
    return result;
  }
}
