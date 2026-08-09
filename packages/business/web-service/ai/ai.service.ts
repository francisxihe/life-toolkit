import type { GoalDecomposeRequestVo, GoalDecomposeResponseVo } from '@true-north/vo';
import AiController from '../controller/ai';
import { aiErrorUserMessage, parseAiError } from './parse-ai-error';

export type AiDecomposeResult =
  | { ok: true; data: GoalDecomposeResponseVo }
  | { ok: false; code: ReturnType<typeof parseAiError>['code']; message: string };

export default class AiService {
  /**
   * 目标 AI 拆解。不弹全局 Message，由调用方按 code 展示文案。
   */
  static async decomposeGoal(body: GoalDecomposeRequestVo): Promise<AiDecomposeResult> {
    try {
      const data = await AiController.decomposeGoal(body);
      return { ok: true, data };
    } catch (error: unknown) {
      const parsed = parseAiError(error);
      return {
        ok: false,
        code: parsed.code,
        message: aiErrorUserMessage(parsed.code, parsed.message),
      };
    }
  }
}
