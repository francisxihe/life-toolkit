import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
  Button,
  Dropdown,
  Flex,
  Input,
  Modal,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@sue/design-web-react';
import { Plus } from 'lucide-react';
import type { ProductSurfaceHostProps } from '@ylib/product-surface-react';
import type { ConversationVo } from '@true-north/vo';
import ContextMenu, { type ContextMenuItem } from '@/components/ContextMenu';
import { useAiSessionContext } from '../context';
import styles from '../style.module.less';

function formatUpdatedAt(value: string) {
  return value.slice(0, 16).replace('T', ' ');
}

function SessionItem({
  conversation,
  active,
  boundLabel,
  onSelect,
  onRename,
  onDelete,
}: {
  conversation: ConversationVo;
  active: boolean;
  boundLabel: string;
  onSelect: () => void;
  onRename: (title: string) => Promise<boolean>;
  onDelete: () => Promise<void>;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);
  const [moreOpen, setMoreOpen] = useState(false);
  const skipCommitRef = useRef(false);
  const committingRef = useRef(false);

  const beginRename = () => {
    skipCommitRef.current = false;
    setDraftTitle(conversation.title);
    setRenaming(true);
  };

  const commitRename = async () => {
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      return;
    }
    if (committingRef.current) return;
    const next = draftTitle.trim();
    if (!next || next === conversation.title) {
      setDraftTitle(conversation.title);
      setRenaming(false);
      return;
    }
    committingRef.current = true;
    const ok = await onRename(next);
    committingRef.current = false;
    if (ok) setRenaming(false);
    else setDraftTitle(conversation.title);
  };

  const cancelRename = () => {
    skipCommitRef.current = true;
    setDraftTitle(conversation.title);
    setRenaming(false);
  };

  const confirmDelete = () => {
    Modal.confirm({
      title: '确定删除该会话？',
      content: `删除后「${conversation.title}」及其消息将不再出现。`,
      okText: '删除',
      okButtonProps: { danger: true },
      onOk: () => onDelete(),
    });
  };

  const actionItems: ContextMenuItem[] = [
    {
      key: 'rename',
      label: '重命名',
      icon: <EditOutlined />,
      onClick: beginRename,
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      onClick: confirmDelete,
    },
  ];

  const stopRowClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onTitleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelRename();
    }
  };

  return (
    <ContextMenu style={{ width: '100%' }} items={actionItems}>
      <div
        className={`${styles.sessionItem} ${active ? styles.sessionItemActive : ''}`}
        onClick={() => {
          if (!renaming) onSelect();
        }}
      >
        {renaming ? (
          <Input
            size="small"
            value={draftTitle}
            autoFocus
            onClick={stopRowClick}
            onChange={(event) => setDraftTitle(event.target.value)}
            onPressEnter={() => void commitRename()}
            onBlur={() => void commitRename()}
            onKeyDown={onTitleKeyDown}
          />
        ) : (
          <>
            <span className={styles.sessionTitle}>{conversation.title}</span>
            <span className={styles.sessionMeta}>
              {boundLabel}
              {formatUpdatedAt(conversation.updatedAt)}
            </span>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              onOpenChange={setMoreOpen}
              menu={{
                items: [
                  {
                    key: 'rename',
                    label: '重命名',
                    icon: <EditOutlined />,
                    onClick: beginRename,
                  },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: confirmDelete,
                  },
                ],
              }}
            >
              <button
                type="button"
                className={`${styles.sessionMore} ${moreOpen ? styles.sessionMoreOpen : ''}`}
                onClick={stopRowClick}
                aria-label="会话操作"
              >
                <EllipsisOutlined />
              </button>
            </Dropdown>
          </>
        )}
      </div>
    </ContextMenu>
  );
}

export function SessionList({
  'data-product-ref': productRefAttr,
}: ProductSurfaceHostProps) {
  const {
    conversations,
    activeConversationId,
    selectConversation,
    createBlankConversation,
    renameConversation,
    deleteConversation,
    goalTitle,
    taskTitle,
  } = useAiSessionContext();

  return (
    <Flex
      vertical
      container="fixed"
      className={`${styles.sessionList} h-full`}
      data-product-ref={productRefAttr}
    >
      <Flex
        className={styles.sessionListHeader}
        justify="space-between"
        align="center"
      >
        <strong>会话</strong>
        <Button
          size="small"
          icon={<Plus size={14} />}
          onClick={() => void createBlankConversation()}
        >
          新建
        </Button>
      </Flex>
      <Flex
        vertical
        container="fill"
        className={styles.sessionListBody}
        gap={4}
      >
        {conversations.map((conversation) => (
          <SessionItem
            key={conversation.id}
            conversation={conversation}
            active={conversation.id === activeConversationId}
            boundLabel={
              conversation.refType === 'goal' && conversation.refId
                ? `${goalTitle(conversation.refId) || '目标'} · `
                : conversation.refType === 'task' && conversation.refId
                  ? `${taskTitle(conversation.refId) || '任务'} · `
                  : ''
            }
            onSelect={() => selectConversation(conversation.id)}
            onRename={(title) => renameConversation(conversation.id, title)}
            onDelete={() => deleteConversation(conversation.id)}
          />
        ))}
      </Flex>
    </Flex>
  );
}
