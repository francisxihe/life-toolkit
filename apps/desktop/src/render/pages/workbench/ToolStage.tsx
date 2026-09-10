import { useEffect, useState } from 'react';
import { message } from '@sue/design-web-react';
import type { AiWorkspacePartVo, AiWorkspaceSuggestionVo, MessageVo } from '@true-north/vo';
import { AiService, GoalService, TaskService } from '@true-north/web-service';
import { workspaceRegistry } from '../ai/workspaces/registry';
import { useWorkbench, type WorkbenchToolTab } from './context';
import styles from './style.module.less';

function readWorkspacePart(item: MessageVo): AiWorkspacePartVo | null {
  return item.parts.find((part): part is AiWorkspacePartVo => part.type === 'workspace') || null;
}

export function ToolStage({ tab }: { tab: WorkbenchToolTab }) {
  const { requestFollowUp } = useWorkbench();
  const [payload, setPayload] = useState(tab.payload);
  const [workspaceKey, setWorkspaceKey] = useState(tab.workspaceKey);
  const [goal, setGoal] = useState<any>();
  const [task, setTask] = useState<any>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPayload(tab.payload);
    setWorkspaceKey(tab.workspaceKey);
  }, [tab.id, tab.payload, tab.workspaceKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await AiService.listMessages(tab.conversationId);
      if (cancelled) return;
      if (result.ok === false) {
        setError(result.message);
        return;
      }
      const item = result.data.find((entry) => entry.id === tab.messageId);
      const part = item ? readWorkspacePart(item) : null;
      if (!part) {
        setError('未找到对应的工作台内容');
        return;
      }
      setError(null);
      setWorkspaceKey(part.workspaceKey);
      setPayload(part.payload);
    })();
    return () => {
      cancelled = true;
    };
  }, [tab.conversationId, tab.messageId]);

  useEffect(() => {
    return AiService.subscribeChatStream((event) => {
      if (event.event !== 'message' && event.event !== 'done') return;
      if (event.message.id !== tab.messageId) return;
      const part = readWorkspacePart(event.message);
      if (!part) return;
      setWorkspaceKey(part.workspaceKey);
      setPayload(part.payload);
    });
  }, [tab.messageId]);

  useEffect(() => {
    const ref = payload.ref;
    if (!ref) return undefined;
    let cancelled = false;
    (async () => {
      try {
        if (ref.type === 'goal') {
          const found = await GoalService.find(ref.id);
          if (!cancelled) setGoal(found?.id ? found : undefined);
        } else {
          const found = await TaskService.find(ref.id);
          if (!cancelled) setTask(found?.id ? found : undefined);
        }
      } catch {
        if (!cancelled) {
          setGoal(undefined);
          setTask(undefined);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payload.ref]);

  const patchWorkspace = async (
    messageId: string,
    suggestions: AiWorkspaceSuggestionVo[],
    analysisSummary?: string,
  ) => {
    const result = await AiService.patchWorkspace(messageId, { suggestions, analysisSummary });
    if (result.ok === false) {
      message.error(result.message);
      return false;
    }
    const part = readWorkspacePart(result.data);
    if (part) setPayload(part.payload);
    return true;
  };

  const Comp = workspaceRegistry[workspaceKey];
  const ref = payload.ref;
  const goalId = ref?.type === 'goal' ? ref.id : undefined;
  const taskId = ref?.type === 'task' ? ref.id : undefined;

  return (
    <div className={styles.toolStage}>
      {error ? (
        <p className={styles.toolStageError}>{error}</p>
      ) : Comp ? (
        <Comp
          payload={payload}
          messageId={tab.messageId}
          goalId={goalId}
          taskId={taskId}
          goal={goal}
          task={task}
          setDraft={(text) => requestFollowUp(tab.conversationId, text)}
          patchWorkspace={patchWorkspace}
        />
      ) : (
        <p className={styles.toolStageError}>未知工作台类型：{workspaceKey}</p>
      )}
    </div>
  );
}
