import { AiProviderKind } from '@true-north/enum';
import { AiPlatformError } from './ai-error';

/**
 * 主进程 AI 配置（写死）。渲染进程不得 import 本文件。
 * 联调时本地填写真实值；请勿把生产密钥提交到公共仓库。
 */
export type AiConfig = {
  providerKind: AiProviderKind.OPENAI_COMPATIBLE;
  baseUrl: string;
  model: string;
  apiKey: string;
  timeoutMs: number;
  maxTokens?: number;
};

const aiConfig: AiConfig = {
  providerKind: AiProviderKind.OPENAI_COMPATIBLE,
  // DeepSeek（OpenAI 兼容）；官方入口为 https://api.deepseek.com/v1
  baseUrl: 'https://sub2api.yuce-tech.cn/v1',
  // 该中转分组可用模型：deepseek-v4-flash / deepseek-v4-pro（无 deepseek-chat）
  model: 'deepseek-v4-flash',
  apiKey: '', // 本地联调时填写；勿将真实密钥提交入库
  timeoutMs: 60_000,
};

export function getAiConfig(): AiConfig {
  return { ...aiConfig };
}

export function assertAiConfigured(cfg: AiConfig = getAiConfig()): void {
  if (!cfg.baseUrl?.trim() || !cfg.model?.trim() || !cfg.apiKey?.trim()) {
    throw AiPlatformError.notConfigured('主进程 AI 未配置 baseUrl/model/apiKey');
  }
}

export function normalizeAiBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}
