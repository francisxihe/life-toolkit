import type { ReactNode } from 'react';
import { Button, Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-server';
import { productRef } from '@true-north/product-wiki';
import type {
  AiTextPartVo,
  AiToolPartVo,
  AiWorkspacePartVo,
  MessageVo,
} from '@true-north/vo';
import { Tool } from './Tool';
import styles from '../style.module.less';

type MessageProps = {
  role: MessageVo['role'];
  children: ReactNode;
};

type MessagePartsProps = {
  message: MessageVo;
  streaming?: boolean;
  onOpenGoal?: (goalId: string) => void;
  onOpenTask?: (taskId: string) => void;
  onOpenWorkspace?: (messageId: string) => void;
};

export function Message({ role, children }: MessageProps) {
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

export function MessageContent({ role, children }: { role?: MessageVo['role']; children: ReactNode }) {
  const isUser = role === 'user';
  return <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : ''}`}>{children}</div>;
}

export function MessageTextPart({
  part,
  showCursor,
  onOpenGoal,
  onOpenTask,
}: {
  part: AiTextPartVo;
  showCursor?: boolean;
  onOpenGoal?: (goalId: string) => void;
  onOpenTask?: (taskId: string) => void;
}) {
  const links = part.entityLinks || [];
  if (!part.text && !links.length && !showCursor) return null;
  return (
    <>
      {part.text || showCursor ? (
        <p className={styles.bubbleText}>
          {part.text}
          {showCursor ? <span className={styles.streamCursor} /> : null}
        </p>
      ) : null}
      {links.length ? (
        <Flex gap={8} wrap="wrap">
          {links.map((link) => {
            const open = link.type === 'goal' ? onOpenGoal : link.type === 'task' ? onOpenTask : undefined;
            if (!open) return null;
            return (
              <button
                key={`${link.type}-${link.id}`}
                type="button"
                className={styles.entityLink}
                onClick={() => open(link.id)}
              >
                @{link.label}
              </button>
            );
          })}
        </Flex>
      ) : null}
    </>
  );
}

export function MessageWorkspacePart({
  part,
  messageId,
  onOpenWorkspace,
}: {
  part: AiWorkspacePartVo;
  messageId: string;
  onOpenWorkspace?: (messageId: string) => void;
}) {
  if (!onOpenWorkspace) return null;
  const refLabel = part.payload.ref?.label;
  const label =
    part.workspaceKey === 'task.decompose'
      ? `打开工作台：任务拆解${refLabel ? ` · ${refLabel}` : ''}`
      : `打开工作台：目标拆解${refLabel ? ` · ${refLabel}` : ''}`;
  return (
    <ProductSurface id={productRef('ai.session.rule.workspace-dispatch')}>
      <div className={styles.workspaceChip}>
        <Button size="small" type="link" onClick={() => onOpenWorkspace(messageId)}>
          {label}
        </Button>
      </div>
    </ProductSurface>
  );
}

export function MessageParts({
  message,
  streaming,
  onOpenGoal,
  onOpenTask,
  onOpenWorkspace,
}: MessagePartsProps) {
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
          return <Tool key={key} part={part as AiToolPartVo} />;
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
