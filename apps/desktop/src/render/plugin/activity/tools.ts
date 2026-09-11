import { ActivityCaptureKey } from '@true-north/enum';
import type { CapturePayloadVo } from '@true-north/vo';
import { parseCapturePayload } from '@true-north/vo';
import type { WorkbenchToolDefinition } from '@true-north/plugin-sdk';
import { ActivityCaptureWorkspace } from './ActivityCaptureWorkspace';

export const activityCaptureTool: WorkbenchToolDefinition<CapturePayloadVo> = {
  workspaceKey: ActivityCaptureKey,
  title: () => '收集预览',
  entryLabel: () => '打开工作台：收集预览',
  autoOpen: ({ force, message }) => {
    if (force) return true;
    const parts = (message as { parts?: Array<{ type?: string; toolName?: string; status?: string }> })?.parts || [];
    return parts.some(
      (part) => part.type === 'tool' && part.toolName === 'capture_activity' && part.status === 'done'
    );
  },
  parsePayload: parseCapturePayload,
  Component: ActivityCaptureWorkspace,
};

export const activityWorkbenchTools = [activityCaptureTool];
