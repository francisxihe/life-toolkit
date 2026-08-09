import { AiCapabilityKey, AiProviderKind, AiRunStatus } from '@true-north/enum';
import { AiRun } from './ai-run.entity';
import { AiRunRepository } from './ai-run.repository';

export type CreateAiRunInput = {
  capabilityKey: AiCapabilityKey | string;
  providerKind?: AiProviderKind;
  model?: string;
  baseUrlHost?: string;
  requestSummary?: string;
  refType?: string;
  refId?: string;
};

export type FinishAiRunInput = {
  status: AiRunStatus.SUCCEEDED | AiRunStatus.FAILED;
  responseSummary?: string;
  errorCode?: string;
  errorMessage?: string;
  latencyMs?: number;
};

function truncate(text: string | undefined, max = 2000): string | undefined {
  if (!text) return text;
  return text.length > max ? `${text.slice(0, max)}…[truncated]` : text;
}

export class AiRunService {
  constructor(private readonly aiRunRepository: AiRunRepository) {}

  async start(input: CreateAiRunInput): Promise<AiRun> {
    const entity = new AiRun();
    entity.capabilityKey = input.capabilityKey;
    entity.status = AiRunStatus.PENDING;
    entity.providerKind = input.providerKind;
    entity.model = input.model;
    entity.baseUrlHost = input.baseUrlHost;
    entity.requestSummary = truncate(input.requestSummary);
    entity.refType = input.refType;
    entity.refId = input.refId;
    return this.aiRunRepository.create(entity);
  }

  async finish(id: string, input: FinishAiRunInput): Promise<AiRun> {
    const entity = await this.aiRunRepository.find(id);
    entity.status = input.status;
    entity.responseSummary = truncate(input.responseSummary);
    entity.errorCode = input.errorCode;
    entity.errorMessage = truncate(input.errorMessage, 1000);
    entity.latencyMs = input.latencyMs;
    entity.finishedAt = new Date();
    return this.aiRunRepository.update(entity);
  }
}

export const aiRunService = new AiRunService(new AiRunRepository());
