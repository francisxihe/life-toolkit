import { pluginIpc } from './port';
import { TrackTime as TrackTimeVO, ResponseListVo } from '@true-north/vo';

export default class TrackTimeController {
  static async create(body: TrackTimeVO.CreateTrackTimeVo) {
    return pluginIpc().post<TrackTimeVO.TrackTimeVo>(`/trackTime/create`, body);
  }

  static async delete(id: string) {
    return pluginIpc().remove<void>(`/trackTime/delete/${id}`);
  }

  static async update(id: string, body: TrackTimeVO.UpdateTrackTimeVo) {
    return pluginIpc().put<TrackTimeVO.TrackTimeVo>(`/trackTime/update/${id}`, body);
  }

  static async list(query?: TrackTimeVO.TrackTimeFilterVo) {
    return pluginIpc().get<ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo>>(`/trackTime/list`,
      query);
  }

  static async findOne(id: string) {
    return pluginIpc().get<TrackTimeVO.TrackTimeVo | null>(`/trackTime/find/${id}`);
  }

  static async findByRelatedId(relatedType: string, relatedId: string) {
    return pluginIpc().get<ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo>>(`/trackTime/related/${relatedType}/${relatedId}`);
  }

  static async deleteByRelatedId(relatedType: string, relatedId: string) {
    return pluginIpc().remove<void>(`/trackTime/related/${relatedType}/${relatedId}`);
  }
}
