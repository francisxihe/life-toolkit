import type { Habit as HabitVO } from '@life-toolkit/vo';
import { CreateHabitDto, UpdateHabitDto, HabitDto, HabitFilterDto, HabitPageFilterDto } from './dto';
import { HabitService } from './habit.service';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';

@Controller('/habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post('/create', { description: '创建习惯' })
  async create(@Body() createHabitVo: HabitVO.CreateHabitVo): Promise<HabitVO.HabitVo> {
    const createDto = new CreateHabitDto();
    createDto.importVo(createHabitVo);
    const dto = await this.habitService.create(createDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除习惯' })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.habitService.delete(id);
  }

  @Put('/update/:id', { description: '更新习惯' })
  async update(@Param('id') id: string, @Body() updateHabitVo: HabitVO.UpdateHabitVo): Promise<HabitVO.HabitVo> {
    const updateDto = new UpdateHabitDto();
    updateDto.importVo(updateHabitVo);
    const dto = await this.habitService.update(id, updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id', { description: '根据ID查询习惯详情' })
  async find(@Param('id') id: string): Promise<HabitVO.HabitVo> {
    const dto = await this.habitService.find(id);
    return dto.exportVo();
  }

  @Get('/find-by-filter', { description: '查询习惯列表' })
  async findByFilter(@Query() habitListFiltersVo?: HabitVO.HabitFilterVo): Promise<HabitVO.HabitListVo> {
    const filter = new HabitFilterDto();
    if (habitListFiltersVo) filter.importListVo(habitListFiltersVo);
    const list = await this.habitService.findByFilter(filter);
    return HabitDto.dtoListToListVo(list);
  }

  @Get('/page', { description: '分页查询习惯列表' })
  async page(@Query() habitPageFiltersVo?: HabitVO.HabitPageFilterVo): Promise<HabitVO.HabitPageVo> {
    const filter = new HabitPageFilterDto();
    if (habitPageFiltersVo) filter.importPageVo(habitPageFiltersVo);
    const { list, total, pageNum, pageSize } = await this.habitService.page(filter);
    return HabitDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Put('/update-streak/:id', { description: '更新习惯 streak' })
  async updateStreak(@Param('id') id: string, @Body() body?: { completed?: boolean }): Promise<any> {
    return await this.habitService.updateStreak(id, body?.completed as any);
  }

  @Get('/get-habit-todos/:id', { description: '查询习惯的待办事项' })
  async getHabitTodos(@Param('id') id: string): Promise<any> {
    return await this.habitService.getHabitTodos(id);
  }

  @Get('/get-habit-analytics/:id', { description: '查询习惯的分析数据' })
  async getHabitAnalytics(@Param('id') id: string): Promise<any> {
    return await this.habitService.getHabitAnalytics(id);
  }

  @Put('/done/batch', { description: '批量完成习惯' })
  async doneBatch(@Body() body?: { includeIds?: string[] }): Promise<any[]> {
    return await Promise.all((body?.includeIds ?? []).map((id: string) => this.habitService.completeHabit(id)));
  }

  @Put('/abandon/:id', { description: '废弃习惯' })
  async abandon(@Param('id') id: string): Promise<void> {
    return await this.habitService.abandon(id);
  }

  @Put('/restore/:id', { description: '恢复习惯' })
  async restore(@Param('id') id: string): Promise<void> {
    return await this.habitService.restore(id);
  }

  @Put('/pause-habit/:id', { description: '暂停习惯' })
  async pauseHabit(@Param('id') id: string): Promise<void> {
    return await this.habitService.pauseHabit(id);
  }

  @Put('/resume-habit/:id', { description: '恢复习惯' })
  async resumeHabit(@Param('id') id: string): Promise<void> {
    return await this.habitService.resumeHabit(id);
  }
}
