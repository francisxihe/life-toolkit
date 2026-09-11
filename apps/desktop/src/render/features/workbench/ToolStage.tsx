import { useEffect, useState } from 'react';
import { message } from '@sue/design-web-react';
import type { AiWorkspacePayloadVo } from '@true-north/vo';
import { useWorkbench, type WorkbenchToolTab } from './context';
import styles from './style.module.less';

export function ToolStage({ tab }: { tab: WorkbenchToolTab }) {
  const { requestFollowUp, tools, workspaceHost } = useWorkbench();
  const [payload, setPayload] = useState(tab.payload);
  const [workspaceKey, setWorkspaceKey] = useState(tab.workspaceKey);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPayload(tab.payload);
    setWorkspaceKey(tab.workspaceKey);
  }, [tab.id, tab.payload, tab.workspaceKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const next = await workspaceHost.load(tab.conversationId, tab.messageId);
        if (cancelled) return;
        setError(null);
        setWorkspaceKey(next.workspaceKey);
        setPayload(next.payload);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : '未找到对应的工作台内容');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab.conversationId, tab.messageId, workspaceHost]);

  useEffect(() => {
    return workspaceHost.subscribe(tab.messageId, (next) => {
      setWorkspaceKey(next.workspaceKey);
      setPayload(next.payload);
    });
  }, [tab.messageId, workspaceHost]);

  const definition = tools.find(workspaceKey);

  const updatePayload = async (next: AiWorkspacePayloadVo) => {
    try {
      const saved = await workspaceHost.patch(tab.messageId, next);
      setPayload(saved);
      return true;
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败');
      return false;
    }
  };

  let parsed: unknown = payload;
  let parseError: string | null = null;
  if (definition) {
    try {
      parsed = definition.parsePayload(payload);
    } catch (err) {
      parseError = err instanceof Error ? err.message : '工作台载荷无效';
    }
  }

  const Comp = definition?.Component;
  const displayError = error || parseError || (!definition ? `未知工作台类型：${workspaceKey}` : null);

  return (
    <div className={styles.toolStage}>
      {displayError ? (
        <p className={styles.toolStageError}>{displayError}</p>
      ) : Comp ? (
        <Comp
          payload={parsed as never}
          messageId={tab.messageId}
          conversationId={tab.conversationId}
          actions={{
            updatePayload,
            requestFollowUp: (text) => requestFollowUp(tab.conversationId, text),
          }}
        />
      ) : (
        <p className={styles.toolStageError}>未知工作台类型：{workspaceKey}</p>
      )}
    </div>
  );
}
