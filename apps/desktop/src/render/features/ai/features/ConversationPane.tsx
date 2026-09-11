import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Input, Select } from '@sue/design-web-react';
import { ProductSurface, type ProductSurfaceHostProps } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import type { AiEntityLinkVo } from '@true-north/vo';
import {
  Conversation,
  ConversationEmptyState,
  ConversationScrollButton,
  ConversationViewport,
} from '../components/Conversation';
import { Message, MessageContent, MessageParts } from '../components/Message';
import { PromptInput, PromptInputSubmit } from '../components/PromptInput';
import { useAiSessionContext } from '../context';
import styles from '../style.module.less';
import type { ComposerInputRef } from '../types';

type MentionItem = AiEntityLinkVo;

function readMentionQuery(text: string, cursor: number): { start: number; query: string } | null {
  const before = text.slice(0, cursor);
  const match = before.match(/@([^\s@]*)$/);
  if (!match || match.index === undefined) return null;
  return { start: match.index, query: match[1] || '' };
}

function resolveTextArea(ref: ComposerInputRef | null): HTMLTextAreaElement | null {
  if (!ref) return null;
  if (ref.nativeElement instanceof HTMLTextAreaElement) return ref.nativeElement;
  const nested = ref.resizableTextArea?.textArea;
  return nested instanceof HTMLTextAreaElement ? nested : null;
}

export function ConversationPane({ 'data-product-ref': productRefAttr }: ProductSurfaceHostProps) {
  const {
    activeConversation,
    activeConversationId,
    activeMessages,
    draft,
    setDraft,
    sendUserMessage,
    cancelStreaming,
    streaming,
    streamingAssistantId,
    openWorkspace,
    openEntity,
    entities,
    entitySources,
    codingAgents,
    selectedAgentId,
    selectedAgent,
    selectCodingAgent,
    canSend,
    threadWillReset,
    composerInputRef,
  } = useAiSessionContext();
  const [cursor, setCursor] = useState(0);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);

  const mention = mentionOpen ? readMentionQuery(draft.text, cursor) : null;
  const mentionItems = useMemo(() => {
    if (!mention) return [] as MentionItem[];
    const keyword = mention.query.trim().toLowerCase();
    const all: MentionItem[] = entities.map((entity) => ({
      type: entity.type,
      id: entity.id,
      label: entity.label,
    }));
    if (!keyword) return all.slice(0, 12);
    return all.filter((item) => item.label.toLowerCase().includes(keyword)).slice(0, 12);
  }, [entities, mention]);

  useEffect(() => {
    setMentionIndex(0);
  }, [mention?.query, mentionItems.length]);

  const insertMention = (item: MentionItem) => {
    const current = readMentionQuery(draft.text, cursor);
    if (!current) return;
    const before = draft.text.slice(0, current.start);
    const after = draft.text.slice(cursor);
    const nextText = `${before}@${item.label} ${after}`;
    const nextCursor = `${before}@${item.label} `.length;
    const links = draft.links.some((link) => link.type === item.type && link.id === item.id)
      ? draft.links
      : [...draft.links, item];
    setDraft({ text: nextText, links });
    setMentionOpen(false);
    setCursor(nextCursor);
    composerInputRef.current?.focus();
    requestAnimationFrame(() => {
      const textarea = resolveTextArea(composerInputRef.current);
      textarea?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const onComposerKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && mentionOpen) {
      event.preventDefault();
      setMentionOpen(false);
      return;
    }

    if (mentionOpen && mentionItems.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setMentionIndex((index) => (index + 1) % mentionItems.length);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setMentionIndex((index) => (index - 1 + mentionItems.length) % mentionItems.length);
        return;
      }
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        insertMention(mentionItems[mentionIndex] ?? mentionItems[0]);
        return;
      }
    }

    if (event.nativeEvent.isComposing || event.key === 'Process') return;
    if (event.key !== 'Enter') return;
    if (event.shiftKey) return;
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };

  const isEmpty = activeMessages.length === 0;
  const composerDisabled = streaming || !canSend;
  const sendDisabled = !canSend || !draft.text.trim() || streaming;
  const unavailableReason = !codingAgents.length
    ? '还没有可用的 AI，无法发送'
    : selectedAgent && !selectedAgent.available
      ? selectedAgent.unavailableReason || '当前 Agent 不可用，无法发送'
      : '当前 Agent 不可用，无法发送';

  const agentPicker = (
    <ProductSurface id={productRef('ai.session.view.agent-picker')}>
      <Select
        size="small"
        variant="borderless"
        value={selectedAgentId || undefined}
        aria-label="编码 Agent"
        className={styles.agentSelect}
        popupMatchSelectWidth={false}
        options={codingAgents.map((agent) => ({
          value: agent.id,
          label: agent.available ? agent.name : `${agent.name}（${agent.unavailableReason}）`,
          disabled: !agent.available,
        }))}
        onChange={(value) => void selectCodingAgent(String(value))}
      />
    </ProductSurface>
  );

  const agentHint =
    threadWillReset && selectedAgent ? (
      <span className={styles.agentSwitchHint}>
        之后的发送将由「{selectedAgent.name}」重新开始，不会续跑上一 Agent 的对话线程。
      </span>
    ) : null;

  const mentionSlot =
    mention && mentionItems.length ? (
      <div className={styles.mentionPanel} role="listbox">
        {mentionItems.map((item, index) => (
          <button
            key={`${item.type}-${item.id}`}
            id={`mention-${item.type}-${item.id}`}
            type="button"
            role="option"
            aria-selected={index === mentionIndex}
            className={`${styles.mentionItem}${index === mentionIndex ? ` ${styles.mentionItemActive}` : ''}`}
            onMouseEnter={() => setMentionIndex(index)}
            onMouseDown={(event) => {
              event.preventDefault();
              insertMention(item);
            }}
          >
            <span className={styles.mentionKind}>
              {entitySources.find((source) => source.type === item.type)?.kindLabel || item.type}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    ) : null;

  const mentionActiveItem = mentionItems[mentionIndex] ?? mentionItems[0];
  const mentionComboboxProps =
    mention && mentionItems.length && mentionActiveItem
      ? {
          role: 'combobox' as const,
          'aria-expanded': true,
          'aria-activedescendant': `mention-${mentionActiveItem.type}-${mentionActiveItem.id}`,
        }
      : undefined;

  return (
    <Conversation data-product-ref={productRefAttr}>
      <ConversationViewport resetKey={activeConversationId} followOnSend={streaming}>
        {isEmpty ? (
          <ConversationEmptyState>开始一段新对话，或直接记下今天的事</ConversationEmptyState>
        ) : (
          activeMessages.map((message) => (
            <Message key={message.id} role={message.role}>
              <MessageContent role={message.role}>
                <MessageParts
                  message={message}
                  streaming={streaming && message.id === streamingAssistantId}
                  onOpenEntity={openEntity}
                  onOpenWorkspace={openWorkspace}
                />
              </MessageContent>
            </Message>
          ))
        )}
        <ConversationScrollButton />
      </ConversationViewport>
      <PromptInput
        mentionSlot={mentionSlot}
        tools={agentPicker}
        hint={agentHint}
        submit={
          <PromptInputSubmit
            streaming={streaming}
            disabled={sendDisabled}
            onStop={() => void cancelStreaming()}
          />
        }
        onSubmit={() => {
          if (!sendDisabled) void sendUserMessage();
        }}
      >
        <Input.TextArea
          ref={composerInputRef}
          className="w-full"
          variant="borderless"
          autoSize={{ minRows: 2, maxRows: 8 }}
          value={draft.text}
          placeholder={
            canSend
              ? activeConversation
                ? `继续追问，输入 @ 引用${entitySources.map((source) => source.kindLabel).join('或') || '实体'}…`
                : '记下今天的事，或直接提问…'
              : unavailableReason
          }
          disabled={composerDisabled}
          onKeyDown={onComposerKey}
          onChange={(event) => {
            const nextText = event.target.value;
            const nextCursor = event.target.selectionStart ?? nextText.length;
            setDraft({
              text: nextText,
              links: draft.links.filter((link) => nextText.includes(`@${link.label}`)),
            });
            setCursor(nextCursor);
            setMentionOpen(Boolean(readMentionQuery(nextText, nextCursor)));
          }}
          onSelect={(event) => {
            const target = event.target as HTMLTextAreaElement;
            const nextCursor = target.selectionStart ?? 0;
            setCursor(nextCursor);
            setMentionOpen(Boolean(readMentionQuery(draft.text, nextCursor)));
          }}
          {...mentionComboboxProps}
        />
      </PromptInput>
    </Conversation>
  );
}
