import { Button, Flex } from '@sue/design-web-react';
import { Plus } from 'lucide-react';
import type { ProductSurfaceHostProps } from '@ylib/product-server';
import { useAiSessionContext } from '../context';
import styles from '../style.module.less';

export function SessionList({ 'data-product-ref': productRefAttr }: ProductSurfaceHostProps) {
  const { conversations, activeConversationId, selectConversation, createBlankConversation, goalTitle, taskTitle } =
    useAiSessionContext();

  return (
    <Flex vertical container="fixed" className={`${styles.sessionList} h-full`} data-product-ref={productRefAttr}>
      <Flex className={styles.sessionListHeader} justify="space-between" align="center">
        <strong>会话</strong>
        <Button size="small" icon={<Plus size={14} />} onClick={() => void createBlankConversation()}>
          新建
        </Button>
      </Flex>
      <Flex vertical container="fill" className={styles.sessionListBody} gap={4}>
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            type="button"
            className={`${styles.sessionItem} ${
              conversation.id === activeConversationId ? styles.sessionItemActive : ''
            }`}
            onClick={() => selectConversation(conversation.id)}
          >
            <span className={styles.sessionTitle}>{conversation.title}</span>
            <span className={styles.sessionMeta}>
              {conversation.refType === 'goal' && conversation.refId
                ? `${goalTitle(conversation.refId) || '目标'} · `
                : conversation.refType === 'task' && conversation.refId
                  ? `${taskTitle(conversation.refId) || '任务'} · `
                  : ''}
              {conversation.updatedAt.slice(0, 16).replace('T', ' ')}
            </span>
          </button>
        ))}
      </Flex>
    </Flex>
  );
}
