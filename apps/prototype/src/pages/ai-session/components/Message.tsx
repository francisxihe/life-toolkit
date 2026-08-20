import type { ReactNode } from 'react';
import { Button, Flex } from '@sue/design-web-react';
import type { AiMessage, AiTextPart, AiToolPart, AiWorkspacePart } from '../../../shared/types';
import { Tool } from './Tool';
import styles from '../style.module.css';

export function Message({ role, children }: { role: AiMessage['role']; children: ReactNode }) {
  const isUser = role === 'user';
  return (
    <Flex
      className={styles.messageRow}
      justify={isUser ? 'flex-end' : 'flex-start'}
    >
      {children}
    </Flex>
  );
}

export function MessageContent({ role, children }: { role?: AiMessage['role']; children: ReactNode }) {
  const isUser = role === 'user';
  return <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : ''}`}>{children}</div>;
}

export function MessageTextPart({
  part,
  showCursor,
  onOpenGoal,
  onOpenTask,
}: {
  part: AiTextPart;
  showCursor?: boolean;
  onOpenGoal?: (goalId: string) => void;
  onOpenTask?: (taskId: string) => void;
}) {
  if (part.entityLink?.type === 'goal' && onOpenGoal) {
    return (
      <p className={styles.bubbleText}>
        请帮我拆解
        <button type="button" className={styles.entityLink} onClick={() => onOpenGoal(part.entityLink!.id)}>
          {part.entityLink.label}
        </button>
        {showCursor ? <span className={styles.streamCursor} /> : null}
      </p>
    );
  }
  if (part.entityLink?.type === 'task' && onOpenTask) {
    return (
      <p className={styles.bubbleText}>
        请帮我拆解
        <button type="button" className={styles.entityLink} onClick={() => onOpenTask(part.entityLink!.id)}>
          {part.entityLink.label}
        </button>
        {showCursor ? <span className={styles.streamCursor} /> : null}
      </p>
    );
  }
  if (!part.text && !showCursor) return null;
  return (
    <p className={styles.bubbleText}>
      {part.text}
      {showCursor ? <span className={styles.streamCursor} /> : null}
    </p>
  );
}

export function MessageWorkspacePart({
  part,
  messageId,
  onOpenWorkspace,
}: {
  part: AiWorkspacePart;
  messageId: string;
  onOpenWorkspace?: (messageId: string) => void;
}) {
  if (!onOpenWorkspace) return null;
  const label = part.workspaceKey === 'task.decompose' ? '打开工作台：任务拆解' : '打开工作台：目标拆解';
  return (
    <div className={styles.workspaceChip}>
      <Button size="small" type="link" onClick={() => onOpenWorkspace(messageId)}>
        {label}
      </Button>
    </div>
  );
}

export function MessageParts({
  message,
  streaming,
  onOpenGoal,
  onOpenTask,
  onOpenWorkspace,
}: {
  message: AiMessage;
  streaming?: boolean;
  onOpenGoal?: (goalId: string) => void;
  onOpenTask?: (taskId: string) => void;
  onOpenWorkspace?: (messageId: string) => void;
}) {
  const parts = message.parts || [];
  const lastTextIndex = parts.reduce((found, part, index) => (part.type === 'text' ? index : found), -1);

  return (
    <>
      {parts.map((part, index) => {
        const key = `${message.id}-${part.type}-${index}`;
        if (part.type === 'text') {
          return (
            <MessageTextPart
              key={key}
              part={part}
              showCursor={Boolean(streaming && index === lastTextIndex)}
              onOpenGoal={onOpenGoal}
              onOpenTask={onOpenTask}
            />
          );
        }
        if (part.type === 'tool') {
          return <Tool key={key} part={part as AiToolPart} />;
        }
        if (part.type === 'workspace') {
          return (
            <MessageWorkspacePart
              key={key}
              part={part}
              messageId={message.id}
              onOpenWorkspace={onOpenWorkspace}
            />
          );
        }
        return null;
      })}
    </>
  );
}
