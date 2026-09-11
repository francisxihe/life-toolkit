import { GoalDecomposeKey, TaskDecomposeKey } from '@true-north/enum';
import type { AiDecomposePayloadVo } from '@true-north/vo';
import { parseDecomposePayload, workspaceEntityRef } from '@true-north/vo';
import type { WorkbenchToolDefinition } from '@true-north/plugin-sdk';
import { GoalDecomposeWorkspace } from './GoalDecomposeWorkspace';
import { TaskDecomposeWorkspace } from './TaskDecomposeWorkspace';

function decomposeTitle(kindLabel: string, payload: AiDecomposePayloadVo) {
  const refLabel = payload.ref?.label || workspaceEntityRef(payload as never)?.label;
  return refLabel ? `${kindLabel} · ${refLabel}` : kindLabel;
}

function decomposeAutoOpen({ force }: { force: boolean }) {
  return force;
}

export const goalDecomposeTool: WorkbenchToolDefinition<AiDecomposePayloadVo> = {
  workspaceKey: GoalDecomposeKey,
  title: (payload) => decomposeTitle('目标拆解', payload),
  entryLabel: (payload) => `打开工作台：${decomposeTitle('目标拆解', payload)}`,
  autoOpen: decomposeAutoOpen,
  parsePayload: parseDecomposePayload,
  Component: GoalDecomposeWorkspace,
};

export const taskDecomposeTool: WorkbenchToolDefinition<AiDecomposePayloadVo> = {
  workspaceKey: TaskDecomposeKey,
  title: (payload) => decomposeTitle('任务拆解', payload),
  entryLabel: (payload) => `打开工作台：${decomposeTitle('任务拆解', payload)}`,
  autoOpen: decomposeAutoOpen,
  parsePayload: parseDecomposePayload,
  Component: TaskDecomposeWorkspace,
};

export const growthWorkbenchTools = [goalDecomposeTool, taskDecomposeTool];
