import type { FormEvent, ReactNode } from 'react';
import { Button, Flex } from '@sue/design-web-react';
import { ArrowUp, X } from 'lucide-react';
import styles from '../style.module.less';

type PromptInputProps = {
  mentionSlot?: ReactNode;
  tools?: ReactNode;
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
      <Button htmlType="button" icon={<X size={16} />} onClick={() => onStop?.()}>
        停止
      </Button>
    );
  }
  return (
    <Button htmlType="submit" type="primary" size="small" icon={<ArrowUp size={16} />} disabled={disabled}>
      发送
    </Button>
  );
}

export function PromptInput({ mentionSlot, tools, submit, onSubmit, children }: PromptInputProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <Flex vertical container="fixed" className={`${styles.conversationComposer} w-full`}>
      <Flex
        vertical
        component="form"
        className={`${styles.composerCard} w-full`}
        gap={8}
        onSubmit={handleSubmit}
      >
        <Flex vertical className={styles.composerField}>
          {mentionSlot}
          {children}
        </Flex>
        <Flex className="w-full" align="center" justify="space-between" gap={8}>
          <Flex flex={1} align="center" gap={8} wrap className="min-w-0">
            {tools}
          </Flex>
          <Flex container="fixed">{submit}</Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
