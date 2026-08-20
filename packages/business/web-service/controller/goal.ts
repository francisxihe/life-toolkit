import { request } from '../request';
import { Goal as GoalVO, ResponsePageVo, ResponseListVo, ResponseTreeVo } from '@true-north/vo';

export default class GoalController {
  static async create(body: GoalVO.CreateGoalVo) {
    return request<GoalVO.GoalVo>({ method: 'post' })(`/goal/create`, body);
  }

  static async delete(id: string) {
    return request<void>({ method: 'remove' })(`/goal/delete/${id}`);
  }

  static async update(id: string, updateGoalVo: GoalVO.UpdateGoalVo) {
    return request<GoalVO.GoalVo>({ method: 'put' })(`/goal/update/${id}`, updateGoalVo);
  }

  static async find(id: string) {
    return request<GoalVO.GoalVo>({ method: 'get' })(`/goal/find/${id}`);
  }

  static async page(goalPageFilterVo?: GoalVO.GoalPageFilterVo) {
    return request<ResponsePageVo<GoalVO.GoalWithoutRelationsVo>>({ method: 'get' })(`/goal/page`, goalPageFilterVo);
  }

  static async findRoots() {
    return request<GoalVO.GoalVo[]>({ method: 'get' })(`/goal/find-roots`);
  }

  static async findChildren(parentId: string) {
    return request<GoalVO.GoalVo[]>({ method: 'get' })(`/goal/children/${parentId}`);
  }

  static async abandon(id: string) {
    return request<boolean>({ method: 'put' })(`/goal/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<boolean>({ method: 'put' })(`/goal/restore/${id}`);
  }

  static async findByFilter(goalListFiltersVo?: GoalVO.GoalFilterVo) {
    return request<ResponseListVo<GoalVO.GoalWithoutRelationsVo>>({ method: 'get' })(`/goal/list`, goalListFiltersVo);
  }

  static async getTree(goalListFiltersVo?: GoalVO.GoalFilterVo) {
    return request<ResponseTreeVo<GoalVO.GoalVo>>({ method: 'get' })(`/goal/get-tree`, goalListFiltersVo);
  }

  static async markDone(id: string) {
    return request<boolean>({ method: 'put' })(`/goal/done/${id}`);
  }
}
