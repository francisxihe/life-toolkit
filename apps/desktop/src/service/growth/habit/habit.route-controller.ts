import type { Habit as HabitVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { CreateHabitDto, UpdateHabitDto, HabitDto, HabitFilterDto, HabitPageFilterDto } from './dto';
import { HabitService, habitService as defaultHabitService } from './habit.service';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';

@Controller('/habit')
export class HabitController {
  /** 默认注入模块单例，供 electron-ipc-restful 无参实例化 */
  constructor(private readonly habitService: HabitService = defaultHabitService) {}

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

  @Get('/list', { description: '查询习惯列表' })
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
    @Query() habitPageFilterVo?: HabitVO.HabitPageFilterVo
  ): Promise<ResponsePageVo<HabitVO.HabitWithoutRelationsVo>> {
    const filter = new HabitPageFilterDto();
    if (habitPageFilterVo) filter.importPageVo(habitPageFilterVo);
    const { list, total, pageNum, pageSize } = await this.habitService.page(filter);
    return HabitDto.dtoListToPageVo(list, total, pageNum, pageSize);
  }

  @Put('/abandon/:id', { description: '废弃习惯' })
  async abandon(@Param('id') id: string): Promise<void> {
    return await this.habitService.abandon(id);
  }

  @Put('/pause/:id', { description: '暂停习惯' })
  async pause(@Param('id') id: string): Promise<void> {
    return await this.habitService.pause(id);
  }

  @Put('/activate/:id', { description: '开始或恢复习惯' })
  async activate(@Param('id') id: string): Promise<void> {
    return await this.habitService.activate(id);
  }

  @Put('/restore/:id', { description: '恢复习惯（兼容旧客户端）' })
  async restore(@Param('id') id: string): Promise<void> {
    return await this.habitService.activate(id);
  }
}
