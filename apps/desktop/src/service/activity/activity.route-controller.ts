import { Body, Controller, Delete, Get, Param, Post, Query } from '@true-north/plugin-sdk/main';
import type {
  ActivityFilterVo,
  ActivityVo,
  AdoptCaptureRequestVo,
  HomeTodayVo,
} from '@true-north/vo';
import { activityService } from './activity.service';

@Controller('/activity')
export class ActivityController {
  @Get('/list', { description: '活动时间线' })
  async list(@Query() query?: ActivityFilterVo): Promise<{ list: ActivityVo[] }> {
    return { list: await activityService.list(query) };
  }

  @Get('/home-today', { description: '首页今日摘要' })
  async homeToday(): Promise<HomeTodayVo> {
    return activityService.homeToday();
  }

  @Post('/adopt', { description: '采纳收集建议' })
  async adopt(@Body() body: AdoptCaptureRequestVo): Promise<ActivityVo> {
    return activityService.adoptCapture(body);
  }

  @Delete('/delete/:id', { description: '删除活动卡' })
  async remove(@Param('id') id: string): Promise<boolean> {
    return activityService.remove(id);
  }
}
