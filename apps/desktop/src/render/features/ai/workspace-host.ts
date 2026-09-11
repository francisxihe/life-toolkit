import type { AiWorkspacePartVo, AiWorkspacePayloadVo } from '@true-north/vo';
import { AiService } from '@true-north/web-service';
import type { WorkbenchWorkspaceHost } from '@true-north/plugin-sdk';

function readWorkspacePart(parts: Array<{ type: string; workspaceKey?: string; payload?: AiWorkspacePayloadVo }>) {
  const part = parts.find((item) => item.type === 'workspace');
  return part?.workspaceKey && part.payload
    ? { workspaceKey: part.workspaceKey, payload: part.payload }
    : null;
}

export function createAiWorkspaceHost(): WorkbenchWorkspaceHost {
  return {
    async load(conversationId, messageId) {
      const result = await AiService.listMessages(conversationId);
      if (result.ok === false) throw new Error(result.message);
      const item = result.data.find((entry) => entry.id === messageId);
      const part = item ? readWorkspacePart(item.parts) : null;
      if (!part) throw new Error('未找到对应的工作台内容');
      return { workspaceKey: part.workspaceKey, payload: part.payload };
    },
    subscribe(messageId, onUpdate) {
      return AiService.subscribeChatStream((event) => {
        if (event.event !== 'message' && event.event !== 'done') return;
        if (event.message.id !== messageId) return;
        const part = readWorkspacePart(event.message.parts);
        if (!part) return;
        onUpdate({ workspaceKey: part.workspaceKey, payload: part.payload });
      });
    },
    async patch(messageId, payload: AiWorkspacePayloadVo) {
      const result = await AiService.patchWorkspace(messageId, { payload });
      if (result.ok === false) throw new Error(result.message);
      const part = readWorkspacePart(result.data.parts);
      if (!part) throw new Error('未找到对应的工作台内容');
      return part.payload;
    },
  };
}
