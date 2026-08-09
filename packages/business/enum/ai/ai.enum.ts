export enum AiProviderKind {
  OPENAI_COMPATIBLE = 'openai_compatible',
}

export enum AiRunStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export enum AiCapabilityKey {
  GOAL_DECOMPOSE = 'goal.decompose',
}

export enum AiErrorCode {
  NOT_CONFIGURED = 'NOT_CONFIGURED',
  PROVIDER_HTTP = 'PROVIDER_HTTP',
  TIMEOUT = 'TIMEOUT',
  INVALID_MODEL_OUTPUT = 'INVALID_MODEL_OUTPUT',
  CONTEXT_NOT_FOUND = 'CONTEXT_NOT_FOUND',
  INTERNAL = 'INTERNAL',
}

export enum AiSuggestionKind {
  GOAL = 'goal',
  TASK = 'task',
  TODO = 'todo',
  HABIT = 'habit',
}

export enum AiMessageRole {
  SYSTEM = 'system',
  USER = 'user',
  ASSISTANT = 'assistant',
}
