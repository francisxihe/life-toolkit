import { request } from '../request';
import type { GoalDecomposeRequestVo, GoalDecomposeResponseVo } from '@true-north/vo';

export default class AiController {
  static async decomposeGoal(body: GoalDecomposeRequestVo) {
    return request<GoalDecomposeResponseVo>({ method: 'post' })(`/ai/capabilities/goal/decompose`, body);
  }
}
