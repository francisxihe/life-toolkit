import { Button, Flex } from '@sue/design-web-react';
import { Plus } from 'lucide-react';
import { productRef } from '../../../product-wiki';
import { useAiSessionContext } from '../context';
import styles from '../style.module.css';

export function SessionList() {
  const { conversations, activeConversationId, selectConversation, createBlankConversation, goalTitle, taskTitle } =
    useAiSessionContext();

  return (
    <aside className={styles.sessionList} data-product-ref={productRef('ai.session.view.session-list')}>
      <Flex className={styles.sessionListHeader} justify="space-between" align="center">
        <strong>会话</strong>
        <Button size="small" icon={<Plus size={14} />} onClick={createBlankConversation}>
          新建
        </Button>
      </Flex>
      <div className={styles.sessionListBody}>
        <Flex vertical gap={4}>
          {conversations.map((conversation) => {
            const boundLabel =
              conversation.refType === 'goal'
                ? goalTitle(conversation.refId)
                : conversation.refType === 'task'
                  ? taskTitle(conversation.refId)
                  : undefined;
            return (
              <button
                key={conversation.id}
                type="button"
                className={`${styles.sessionItem} ${conversation.id === activeConversationId ? styles.sessionItemActive : ''}`}
                onClick={() => selectConversation(conversation.id)}
              >
                <span className={styles.sessionTitle}>{conversation.title}</span>
                <span className={styles.sessionMeta}>
                  {boundLabel ? `${boundLabel} · ` : ''}
                  {conversation.updatedAt.slice(0, 16).replace('T', ' ')}
                </span>
              </button>
            );
          })}
        </Flex>
      </div>
    </aside>
  );
}
