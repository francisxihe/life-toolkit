import type { KeyboardEvent } from 'react';
import { Flex, Input, Select } from '@sue/design-web-react';
import { productRef } from '../../../product-wiki';
import {
  Conversation,
  ConversationEmptyState,
  ConversationScrollButton,
  ConversationViewport,
} from '../components/Conversation';
import { Message, MessageContent, MessageParts } from '../components/Message';
import { PromptInput, PromptInputSubmit } from '../components/PromptInput';
import { useAiSessionContext } from '../context';
import styles from '../style.module.css';

export function ConversationPane() {
  const {
    activeConversation,
    activeConversationId,
    activeMessages,
    draft,
    setDraft,
    sendUserMessage,
    codingAgents,
    selectedAgentId,
    selectedAgent,
    selectCodingAgent,
    canSendWithSelectedAgent,
    threadWillReset,
    composerInputRef,
    openWorkspaceFromMessage,
    onOpenGoal,
    onOpenTask,
  } = useAiSessionContext();

  const isEmpty = !activeConversation || activeMessages.length === 0;
  const composerDisabled = !activeConversation || !canSendWithSelectedAgent;
  const sendDisabled = !canSendWithSelectedAgent || !draft.trim() || !activeConversation;

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing || event.key === 'Process') return;
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const agentPicker = (
    <Flex
      align="center"
      gap={8}
      wrap
      data-product-ref={productRef('ai.session.view.agent-picker')}
    >
      <Select
        size="small"
        value={selectedAgentId}
        aria-label="编码 Agent"
        style={{ minWidth: 180 }}
        options={codingAgents.map((agent) => ({
          value: agent.id,
          label: agent.available ? agent.name : `${agent.name}（${agent.unavailableReason}）`,
          disabled: !agent.available,
        }))}
        onChange={(value) => selectCodingAgent(String(value))}
      />
      {threadWillReset && selectedAgent ? (
        <span className={styles.agentSwitchHint}>
          之后的发送将由「{selectedAgent.name}」重新开始，不会续跑上一 Agent 的对话线程。
        </span>
      ) : null}
    </Flex>
  );

  return (
    <Conversation data-product-ref={productRef('ai.session.view.conversation')}>
      {activeConversation ? (
        <Flex container="fixed" className={`${styles.conversationHeader} w-full`}>
          <strong>{activeConversation.title}</strong>
        </Flex>
      ) : null}
      <ConversationViewport resetKey={activeConversationId} followOnSend={false}>
        {isEmpty ? (
          <ConversationEmptyState>选择或新建一个会话开始对话</ConversationEmptyState>
        ) : (
          activeMessages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <Message key={message.id} role={message.role}>
                <div>
                  {!isUser && message.agentName ? (
                    <div className={styles.agentName}>{message.agentName}</div>
                  ) : null}
                  <MessageContent role={message.role}>
                    <MessageParts
                      message={message}
                      streaming={false}
                      onOpenGoal={onOpenGoal}
                      onOpenTask={onOpenTask}
                      onOpenWorkspace={openWorkspaceFromMessage}
                    />
                  </MessageContent>
                </div>
              </Message>
            );
          })
        )}
        <ConversationScrollButton />
      </ConversationViewport>
      <PromptInput
        tools={agentPicker}
        submit={<PromptInputSubmit streaming={false} disabled={sendDisabled} />}
        onSubmit={() => {
          if (!sendDisabled) sendUserMessage();
        }}
      >
        <Input.TextArea
          ref={composerInputRef}
          className="w-full"
          variant="borderless"
          autoSize={{ minRows: 1, maxRows: 6 }}
          value={draft}
          placeholder={canSendWithSelectedAgent ? '继续追问…' : '当前 Agent 不可用，无法发送'}
          disabled={composerDisabled}
          onKeyDown={handleComposerKeyDown}
          onChange={(event) => setDraft(event.target.value)}
        />
      </PromptInput>
    </Conversation>
  );
}
