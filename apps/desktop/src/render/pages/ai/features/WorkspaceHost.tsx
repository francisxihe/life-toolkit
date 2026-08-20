import type { ReactNode } from 'react';
import { Flex } from '@sue/design-web-react';
import { EmptyWorkspace } from '../components/EmptyWorkspace';
import { useAiSessionContext } from '../context';
import { workspaceRegistry } from '../workspaces/registry';
import styles from '../style.module.less';

export function WorkspaceHost() {
  const {
    activeWorkspacePart,
    activeWorkspaceMessageId,
    findGoal,
    findTask,
    setDraft,
    focusComposer,
    patchWorkspace,
  } = useAiSessionContext();

  let body: ReactNode = <EmptyWorkspace />;
  if (activeWorkspacePart && activeWorkspaceMessageId) {
    const Comp = workspaceRegistry[activeWorkspacePart.workspaceKey];
    const ref = activeWorkspacePart.payload.ref;
    const goalId = ref?.type === 'goal' ? ref.id : undefined;
    const taskId = ref?.type === 'task' ? ref.id : undefined;
    body = Comp ? (
      <Comp
        payload={activeWorkspacePart.payload}
        messageId={activeWorkspaceMessageId}
        goalId={goalId}
        taskId={taskId}
        goal={findGoal(goalId)}
        task={findTask(taskId)}
        setDraft={(text) => {
          setDraft(text);
          focusComposer();
        }}
        patchWorkspace={patchWorkspace}
      />
    ) : (
      <div className={styles.emptyWorkspace}>未知工作台类型：{activeWorkspacePart.workspaceKey}</div>
    );
  }

  return (
    <Flex vertical container="fixed" className={`${styles.workspaceHost} h-full`}>
      <Flex container="fixed" className={`${styles.workspaceHeader} w-full`}>
        工作台
      </Flex>
      <Flex vertical container="fill" className={styles.workspaceBody}>
        {body}
      </Flex>
    </Flex>
  );
}
