import type { FormEvent, ReactNode } from 'react';
import { Button, Flex } from '@sue/design-web-react';
import { ArrowUp, Square } from 'lucide-react';
import styles from '../style.module.less';

type PromptInputProps = {
  mentionSlot?: ReactNode;
  tools?: ReactNode;
  hint?: ReactNode;
  submit?: ReactNode;
  onSubmit?: () => void;
  children: ReactNode;
};

export function PromptInputSubmit({
  streaming,
  disabled,
  onStop,
}: {
  streaming?: boolean;
  disabled?: boolean;
  onStop?: () => void;
}) {
  if (streaming) {
    return (
      <Button
        htmlType="button"
        type="primary"
        shape="circle"
        className={styles.composerSubmit}
        icon={<Square size={12} />}
        aria-label="停止"
        onClick={() => onStop?.()}
      />
    );
  }
  return (
    <Button
      htmlType="submit"
      type="primary"
      shape="circle"
      className={styles.composerSubmit}
      icon={<ArrowUp size={16} />}
      disabled={disabled}
      aria-label="发送"
    />
  );
}

export function PromptInput({ mentionSlot, tools, hint, submit, onSubmit, children }: PromptInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <Flex vertical container="fixed" className={`${styles.conversationComposer} w-full`}>
      <Flex
        vertical
        component="form"
        className={styles.composerCard}
        gap={8}
        onSubmit={handleSubmit}
      >
        <Flex vertical className={styles.composerField}>
          {mentionSlot}
          {children}
        </Flex>
        {hint}
        <Flex className={`${styles.composerToolbar} w-full`} align="center" justify="flex-end" gap={8}>
          <Flex align="center" className="min-w-0">
            {tools}
          </Flex>
          <Flex container="fixed">{submit}</Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
