import { productRef } from '../../product-wiki';
import type { DrawerState, Goal, Habit, SaveEntity, Task, Todo } from '../../shared/types';
import { AiSessionProvider } from './context';
import { ConversationPane } from './features/ConversationPane';
import { SessionList } from './features/SessionList';
import { WorkspaceHost } from './features/WorkspaceHost';
import styles from './style.module.css';

type Props = {
  goals: Goal[];
  tasks: Task[];
  todos: Todo[];
  habits: Habit[];
  setDrawer: (drawer: DrawerState) => void;
  saveEntity: SaveEntity;
  onOpenGoal: (goalId: string) => void;
  onOpenTask: (taskId: string) => void;
};

export function AiSessionPage(props: Props) {
  return (
    <AiSessionProvider {...props}>
      <div className={styles.shell} data-product-ref={productRef('ai.session.view.shell')}>
        <SessionList />
        <ConversationPane />
        <WorkspaceHost />
      </div>
    </AiSessionProvider>
  );
}
