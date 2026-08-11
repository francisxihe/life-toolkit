import { Button, Flex, Input } from '@sue/design-web-react';
import { productRef } from '../../../product-wiki';
import { MessageBubble } from '../components/MessageBubble';
import { useAiSessionContext } from '../context';
import styles from '../style.module.css';

export function ConversationPane() {
  const {
    activeConversation,
    activeMessages,
    draft,
    setDraft,
    sendUserMessage,
    openWorkspaceFromMessage,
    onOpenGoal,
    onOpenTask,
  } = useAiSessionContext();

  if (!activeConversation) {
    return (
      <section className={styles.conversation} data-product-ref={productRef('ai.session.view.conversation')}>
        <div className={styles.conversationEmpty}>选择或新建一个会话开始对话</div>
      </section>
    );
  }

  return (
    <section className={styles.conversation} data-product-ref={productRef('ai.session.view.conversation')}>
      <div className={styles.conversationHeader}>
        <strong>{activeConversation.title}</strong>
      </div>
      <div className={styles.conversationBody}>
        {activeMessages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onOpenWorkspace={openWorkspaceFromMessage}
            onOpenGoal={onOpenGoal}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
      <div className={styles.conversationComposer}>
        <Flex gap={8}>
          <Input
            style={{ flex: 1 }}
            value={draft}
            placeholder="继续追问…"
            onChange={(event) => setDraft(event.target.value)}
            onPressEnter={sendUserMessage}
          />
          <Button type="primary" onClick={sendUserMessage}>
            发送
          </Button>
        </Flex>
      </div>
    </section>
  );
}
