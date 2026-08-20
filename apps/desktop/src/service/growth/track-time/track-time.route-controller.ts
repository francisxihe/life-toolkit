import type { TrackTime as TrackTimeVO, ResponseListVo, ResponsePageVo } from '@true-north/vo';
import { CreateTrackTimeDto, UpdateTrackTimeDto, TrackTimeDto, TrackTimeFilterDto } from './dto';
import { TrackTimeService, trackTimeService as defaultTrackTimeService } from './track-time.service';
import { Post, Get, Put, Delete, Controller, Body, Param, Query } from '@business/decorators';
import { TrackTimeRelatedType } from '@true-north/enum';

@Controller('/trackTime')
export class TrackTimeController {
  /** 默认注入模块单例，供 electron-ipc-restful 无参实例化 */
  constructor(private readonly trackTimeService: TrackTimeService = defaultTrackTimeService) {}

  @Post('/create', { description: '创建时间记录' })
  async create(@Body() createTrackTimeVo: TrackTimeVO.CreateTrackTimeVo): Promise<TrackTimeVO.TrackTimeVo> {
    const createDto = new CreateTrackTimeDto();
    createDto.importCreateVo(createTrackTimeVo);
    const dto = await this.trackTimeService.create(createDto);
    return dto.exportVo();
  }

  @Delete('/delete/:id', { description: '删除时间记录' })
  async delete(@Param('id') id: string): Promise<void> {
    return await this.trackTimeService.delete(id);
  }

  @Put('/update/:id', { description: '更新时间记录' })
  async update(
    @Param('id') id: string,
    @Body() updateTrackTimeVo: TrackTimeVO.UpdateTrackTimeVo
  ): Promise<TrackTimeVO.TrackTimeVo> {
    const updateDto = new UpdateTrackTimeDto();
    updateDto.id = id;
    updateDto.importUpdateVo(updateTrackTimeVo);
    const dto = await this.trackTimeService.update(updateDto);
    return dto.exportVo();
  }

  @Get('/find/:id', { description: '查询时间记录详情' })
  async find(@Param('id') id: string): Promise<TrackTimeVO.TrackTimeVo | null> {
    const dto = await this.trackTimeService.find(id);
    return dto ? dto.exportVo() : null;
  }

  @Get('/list', { description: '查询时间记录列表' })
  async list(@Query() query?: TrackTimeVO.TrackTimeFilterVo): Promise<ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo>> {
    const filter = new TrackTimeFilterDto();
    if (query) filter.importListVo(query);
    return TrackTimeDto.dtoListToListVo(await this.trackTimeService.findByFilter(filter));
  }

  @Get('/related/:relatedType/:relatedId', { description: '根据关联对象查询时间记录' })
  async findByRelatedId(
    @Param('relatedType') relatedType: TrackTimeRelatedType,
    @Param('relatedId') relatedId: string
  ): Promise<ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo>> {
    const list = await this.trackTimeService.findByRelatedId(relatedType, relatedId);
    return TrackTimeDto.dtoListToListVo(list);
  }

  @Delete('/related/:relatedType/:relatedId', { description: '删除关联对象的所有时间记录' })
  async deleteByRelatedId(
    @Param('relatedType') relatedType: TrackTimeRelatedType,
    @Param('relatedId') relatedId: string
  ): Promise<void> {
    return await this.trackTimeService.deleteByRelatedId(relatedType, relatedId);
  }
}
