import { request } from '../request';
import { TrackTime as TrackTimeVO, ResponseListVo } from '@true-north/vo';

export default class TrackTimeController {
  static async create(body: TrackTimeVO.CreateTrackTimeVo) {
    return request<TrackTimeVO.TrackTimeVo>({ method: 'post' })(`/trackTime/create`, body);
  }

  static async delete(id: string) {
    return request<void>({ method: 'remove' })(`/trackTime/delete/${id}`);
  }

  static async update(id: string, body: TrackTimeVO.UpdateTrackTimeVo) {
    return request<TrackTimeVO.TrackTimeVo>({ method: 'put' })(`/trackTime/update/${id}`, body);
  }

  static async list(query?: TrackTimeVO.TrackTimeFilterVo) {
    return request<ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo>>({ method: 'get' })(
      `/trackTime/list`,
      query
    );
  }

  static async findOne(id: string) {
    return request<TrackTimeVO.TrackTimeVo | null>({ method: 'get' })(`/trackTime/find/${id}`);
  }

  static async findByRelatedId(relatedType: string, relatedId: string) {
    return request<ResponseListVo<TrackTimeVO.TrackTimeWithoutRelationsVo>>({ method: 'get' })(
      `/trackTime/related/${relatedType}/${relatedId}`
    );
  }

  static async deleteByRelatedId(relatedType: string, relatedId: string) {
    return request<void>({ method: 'remove' })(`/trackTime/related/${relatedType}/${relatedId}`);
  }
}
