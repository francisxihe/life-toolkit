import { Flex } from '@sue/design-web-react';
import DefaultPage from '@/components/Layout/DefaultPage';
import { AiSessionProvider } from './context';
import { ConversationPane } from './features/ConversationPane';
import { SessionList } from './features/SessionList';
import { WorkspaceHost } from './features/WorkspaceHost';
import styles from './style.module.less';

export default function AiSessionPage() {
  return (
    <AiSessionProvider>
      <Flex container="full" className={styles.shell}>
        <SessionList />
        <ConversationPane />
        <WorkspaceHost />
      </Flex>
    </AiSessionProvider>
  );
}
