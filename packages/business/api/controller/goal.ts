import { request } from "@life-toolkit/share-request";
import { Goal as GoalVO } from "@life-toolkit/vo/growth";

export default class GoalController {

  static async create(body: GoalVO.CreateGoalVo) {
    return request<GoalVO.GoalVo>({ method: "post" })(`/goal/create`, body);
  }

  static async delete(id: string) {
    return request<void>({ method: "remove" })(`/goal/delete/${id}`);
  }

  static async update(id: string, body: GoalVO.UpdateGoalVo) {
    return request<GoalVO.GoalVo>({ method: "put" })(`/goal/update/${id}`, body);
  }

  static async find(id: string) {
    return request<GoalVO.GoalVo>({ method: "get" })(`/goal/find/${id}`);
  }

  static async findWithRelations(id: string) {
    return request<GoalVO.GoalVo>({ method: "get" })(`/goal/find-with-relations/${id}`);
  }

  static async findAll(body: GoalVO.GoalListFiltersVo) {
    return request<GoalVO.GoalListVo>({ method: "get" })(`/goal/find-all`, body);
  }

  static async page(body: GoalVO.GoalPageFiltersVo) {
    return request<GoalVO.GoalPageVo>({ method: "get" })(`/goal/page`, body);
  }

  static async tree(body: GoalVO.GoalListFiltersVo) {
    return request<GoalVO.GoalListVo>({ method: "get" })(`/goal/tree`, body);
  }

  static async findRoots() {
    return request<GoalVO.GoalVo[]>({ method: "get" })(`/goal/find-roots`);
  }

  static async abandon(id: string) {
    return request<boolean>({ method: "put" })(`/goal/abandon/${id}`);
  }

  static async restore(id: string) {
    return request<boolean>({ method: "put" })(`/goal/restore/${id}`);
  }
}
