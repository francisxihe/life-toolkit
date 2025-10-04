import type { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@life-toolkit/vo';
import { CreateHabitDto, UpdateHabitDto, HabitDto, HabitFilterDto, HabitPageFilterDto } from './dto';
import { HabitService } from './habit.service';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';

@Controller('/habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post('/create', { description: '创建习惯' })
  async create(@Body() createHabitVo: HabitVO.CreateHabitVo): Promise<HabitVO.HabitVo> {
    const createDto = new CreateHabitDto();
    createDto.importCreateVo(createHabitVo);
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
    updateDto.id = id;
    updateDto.importUpdateVo(updateHabitVo);
    const dto = await this.habitService.update(updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id', { description: '根据ID查询习惯详情' })
  async find(@Param('id') id: string): Promise<HabitVO.HabitVo> {
    const dto = await this.habitService.find(id);
    return dto.exportVo();
  }

  @Get('/find-by-filter', { description: '查询习惯列表' })
  async findByFilter(
    @Query() habitListFiltersVo?: HabitVO.HabitFilterVo
  ): Promise<ResponseListVo<HabitVO.HabitWithoutRelationsVo>> {
    const filter = new HabitFilterDto();
    if (habitListFiltersVo) filter.importListVo(habitListFiltersVo);
    const list = await this.habitService.findByFilter(filter);
    return HabitDto.dtoListToListVo(list);
  }

  @Get('/page', { description: '分页查询习惯列表' })
  async page(
    @Query() habitPageFiltersVo?: HabitVO.HabitPageFilterVo
  ): Promise<ResponsePageVo<HabitVO.HabitWithoutRelationsVo>> {
    const filter = new HabitPageFilterDto();
    if (habitPageFiltersVo) filter.importPageVo(habitPageFiltersVo);
    const { list, total, pageNum, pageSize } = await this.habitService.page(filter);
    return HabitDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Put('/abandon/:id', { description: '废弃习惯' })
  async abandon(@Param('id') id: string): Promise<void> {
    return await this.habitService.abandon(id);
  }

  @Put('/restore/:id', { description: '恢复习惯' })
  async restore(@Param('id') id: string): Promise<void> {
    return await this.habitService.restore(id);
  }
}
