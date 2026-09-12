import { pluginIpc } from './port';
import { Goal as GoalVO, ResponsePageVo, ResponseListVo, ResponseTreeVo } from '@true-north/vo';

export default class GoalController {
  static async create(body: GoalVO.CreateGoalVo) {
    return pluginIpc().post<GoalVO.GoalVo>(`/goal/create`, body);
  }

  static async delete(id: string) {
    return pluginIpc().remove<void>(`/goal/delete/${id}`);
  }

  static async update(id: string, updateGoalVo: GoalVO.UpdateGoalVo) {
    return pluginIpc().put<GoalVO.GoalVo>(`/goal/update/${id}`, updateGoalVo);
  }

  static async find(id: string) {
    return pluginIpc().get<GoalVO.GoalVo>(`/goal/find/${id}`);
  }

  static async page(goalPageFilterVo?: GoalVO.GoalPageFilterVo) {
    return pluginIpc().get<ResponsePageVo<GoalVO.GoalWithoutRelationsVo>>(`/goal/page`, goalPageFilterVo);
  }

  static async findRoots() {
    return pluginIpc().get<GoalVO.GoalVo[]>(`/goal/find-roots`);
  }

  static async findChildren(parentId: string) {
    return pluginIpc().get<GoalVO.GoalVo[]>(`/goal/children/${parentId}`);
  }

  static async abandon(id: string) {
    return pluginIpc().put<boolean>(`/goal/abandon/${id}`);
  }

  static async restore(id: string) {
    return pluginIpc().put<boolean>(`/goal/restore/${id}`);
  }

  static async findByFilter(goalListFiltersVo?: GoalVO.GoalFilterVo) {
    return pluginIpc().get<ResponseListVo<GoalVO.GoalWithoutRelationsVo>>(`/goal/list`, goalListFiltersVo);
  }

  static async getTree(goalListFiltersVo?: GoalVO.GoalFilterVo) {
    return pluginIpc().get<ResponseTreeVo<GoalVO.GoalVo>>(`/goal/get-tree`, goalListFiltersVo);
  }

  static async markDone(id: string) {
    return pluginIpc().put<boolean>(`/goal/done/${id}`);
  }
}
