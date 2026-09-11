import { request } from '../request';
import type { ActivityFilterVo, ActivityVo, AdoptCaptureRequestVo, HomeTodayVo } from '@true-north/vo';

export default class ActivityController {
  static async list(query?: ActivityFilterVo) {
    return request<{ list: ActivityVo[] }>({ method: 'get' })('/activity/list', query);
  }

  static async homeToday() {
    return request<HomeTodayVo>({ method: 'get' })('/activity/home-today');
  }

  static async adopt(body: AdoptCaptureRequestVo) {
    return request<ActivityVo>({ method: 'post' })('/activity/adopt', body);
  }

  static async delete(id: string) {
    return request<boolean>({ method: 'remove' })(`/activity/delete/${id}`);
  }
}
