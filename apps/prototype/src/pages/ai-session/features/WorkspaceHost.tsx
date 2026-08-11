import type { ReactNode } from 'react';
import { productRef } from '../../../product-wiki';
import { EmptyWorkspace } from '../components/EmptyWorkspace';
import { useAiSessionContext } from '../context';
import { workspaceRegistry } from '../workspaces/registry';
import styles from '../style.module.css';

export function WorkspaceHost() {
  const { activeConversation, activeWorkspacePart, goals, tasks, saveEntity, setDraft } = useAiSessionContext();

  let body: ReactNode = <EmptyWorkspace />;
  if (activeWorkspacePart) {
    const Comp = workspaceRegistry[activeWorkspacePart.workspaceKey];
    body = Comp ? (
      <Comp
        payload={activeWorkspacePart.payload}
        goalId={activeConversation?.refType === 'goal' ? activeConversation.refId : undefined}
        taskId={activeConversation?.refType === 'task' ? activeConversation.refId : undefined}
        goals={goals}
        tasks={tasks}
        saveEntity={saveEntity}
        setDraft={setDraft}
      />
    ) : (
      <div className={styles.emptyWorkspace}>未知工作台类型：{activeWorkspacePart.workspaceKey}</div>
    );
  }

  return (
    <aside className={styles.workspaceHost} data-product-ref={productRef('ai.session.view.workspace-host')}>
      <div className={styles.workspaceHeader}>工作台</div>
      <div className={styles.workspaceBody}>{body}</div>
    </aside>
  );
}
