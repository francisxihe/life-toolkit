import { Button } from '@sue/design-web-react';
import type { AiMessage, AiTextPart } from '../../../shared/types';
import styles from '../style.module.css';

type Props = {
  message: AiMessage;
  onOpenWorkspace?: (messageId: string) => void;
  onOpenGoal?: (goalId: string) => void;
  onOpenTask?: (taskId: string) => void;
};

export function MessageBubble({ message, onOpenWorkspace, onOpenGoal, onOpenTask }: Props) {
  const isUser = message.role === 'user';
  const workspacePart = message.parts.find((part) => part.type === 'workspace');
  const textParts = message.parts.filter((part): part is AiTextPart => part.type === 'text');
  const workspaceLabel =
    workspacePart?.workspaceKey === 'task.decompose'
      ? '打开工作台：任务拆解'
      : workspacePart
        ? '打开工作台：目标拆解'
        : '';

  return (
    <div className={`${styles.messageRow} ${isUser ? styles.messageRowUser : styles.messageRowAssistant}`}>
      <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : ''}`}>
        {textParts.map((part, index) => {
          if (part.entityLink?.type === 'goal' && onOpenGoal) {
            return (
              <p key={`${message.id}-text-${index}`} className={styles.bubbleText}>
                请帮我拆解
                <button type="button" className={styles.entityLink} onClick={() => onOpenGoal(part.entityLink!.id)}>
                  {part.entityLink.label}
                </button>
              </p>
            );
          }
          if (part.entityLink?.type === 'task' && onOpenTask) {
            return (
              <p key={`${message.id}-text-${index}`} className={styles.bubbleText}>
                请帮我拆解
                <button type="button" className={styles.entityLink} onClick={() => onOpenTask(part.entityLink!.id)}>
                  {part.entityLink.label}
                </button>
              </p>
            );
          }
          return part.text ? (
            <p key={`${message.id}-text-${index}`} className={styles.bubbleText}>
              {part.text}
            </p>
          ) : null;
        })}
        {workspacePart && onOpenWorkspace ? (
          <div className={styles.workspaceChip}>
            <Button size="small" type="link" onClick={() => onOpenWorkspace(message.id)}>
              {workspaceLabel}
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
