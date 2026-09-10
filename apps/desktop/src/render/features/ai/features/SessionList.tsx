import { useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import {
  Button,
  Dropdown,
  Flex,
  Input,
  Modal,
  Popover,
} from '@sue/design-web-react';
import { Ellipsis, Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ProductSurfaceHostProps } from '@ylib/product-surface-react';
import type { ConversationVo } from '@true-north/vo';
import ContextMenu, { type ContextMenuItem } from '@/components/ContextMenu';
import { useAiSessionContext } from '../context';
import styles from '../style.module.less';

dayjs.extend(relativeTime);

function formatAbsolute(value?: string) {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm') : value;
}

function formatRelative(value?: string) {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.fromNow() : '';
}

function SessionPreview({
  title,
  boundLabel,
  createdAt,
  updatedAt,
}: {
  title: string;
  boundLabel: string;
  createdAt?: string;
  updatedAt: string;
}) {
  const createdAbsolute = formatAbsolute(createdAt);
  const createdRelative = formatRelative(createdAt);
  const updatedAbsolute = formatAbsolute(updatedAt);
  const updatedRelative = formatRelative(updatedAt);

  return (
    <div className={styles.sessionPreview}>
      <div className={styles.sessionPreviewTitle}>{title}</div>
      {boundLabel ? <div className={styles.sessionPreviewBound}>{boundLabel}</div> : null}
      {createdAbsolute ? (
        <div className={styles.sessionPreviewRow}>
          <span className={styles.sessionPreviewLabel}>创建</span>
          <span>
            {createdRelative}
            {createdRelative ? ' · ' : ''}
            {createdAbsolute}
          </span>
        </div>
      ) : null}
      {updatedAbsolute ? (
        <div className={styles.sessionPreviewRow}>
          <span className={styles.sessionPreviewLabel}>更新</span>
          <span>
            {updatedRelative}
            {updatedRelative ? ' · ' : ''}
            {updatedAbsolute}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function SessionItem({
  conversation,
  active,
  boundLabel,
  onSelect,
  onRename,
  onPin,
  onDelete,
}: {
  conversation: ConversationVo;
  active: boolean;
  boundLabel: string;
  onSelect: () => void;
  onRename: (title: string) => Promise<boolean>;
  onPin: (pinned: boolean) => Promise<boolean>;
  onDelete: () => Promise<void>;
}) {
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);
  const [moreOpen, setMoreOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [hoverOpen, setHoverOpen] = useState(false);
  const skipCommitRef = useRef(false);
  const committingRef = useRef(false);
  const pinned = Boolean(conversation.pinned);
  const previewOpen = hoverOpen && !renaming && !moreOpen && !contextOpen;

  const beginRename = () => {
    skipCommitRef.current = false;
    setDraftTitle(conversation.title);
    setRenaming(true);
    setHoverOpen(false);
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

  const togglePin = () => {
    void onPin(!pinned);
  };

  const actionItems: ContextMenuItem[] = [
    {
      key: 'pin',
      label: pinned ? '取消置顶' : '置顶',
      icon: <Pin size={16} />,
      onClick: togglePin,
    },
    {
      key: 'rename',
      label: '重命名',
      icon: <Pencil size={16} />,
      onClick: beginRename,
    },
    {
      key: 'delete',
      label: '删除',
      icon: <Trash2 size={16} />,
      onClick: confirmDelete,
    },
  ];

  const stopRowClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onTitleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      cancelRename();
    }
  };

  const row = (
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
          onKeyDown={onTitleKey}
        />
      ) : (
        <>
          <span className={styles.sessionTitle}>{conversation.title}</span>
          <div className={styles.sessionActions}>
            <button
              type="button"
              className={`${styles.sessionPin} ${pinned ? styles.sessionPinPinned : ''}`}
              onClick={(event) => {
                stopRowClick(event);
                togglePin();
              }}
              aria-label={pinned ? '取消置顶' : '置顶'}
            >
              <Pin size={14} fill={pinned ? 'currentColor' : 'none'} />
            </button>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              onOpenChange={setMoreOpen}
              menu={{
                items: [
                  {
                    key: 'rename',
                    label: '重命名',
                    icon: <Pencil size={16} />,
                    onClick: beginRename,
                  },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: <Trash2 size={16} />,
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
                <Ellipsis size={16} />
              </button>
            </Dropdown>
          </div>
        </>
      )}
    </div>
  );

  return (
    <ContextMenu style={{ width: '100%' }} items={actionItems} onVisibleChange={setContextOpen}>
      {renaming ? (
        row
      ) : (
        <Popover
          trigger="hover"
          placement="rightTop"
          mouseEnterDelay={0.35}
          mouseLeaveDelay={0.1}
          open={previewOpen}
          onOpenChange={(open) => {
            if (renaming || moreOpen || contextOpen) {
              setHoverOpen(false);
              return;
            }
            setHoverOpen(open);
          }}
          content={
            <SessionPreview
              title={conversation.title}
              boundLabel={boundLabel}
              createdAt={conversation.createdAt}
              updatedAt={conversation.updatedAt}
            />
          }
        >
          {row}
        </Popover>
      )}
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
    pinConversation,
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
                ? `目标 · ${goalTitle(conversation.refId) || '目标'}`
                : conversation.refType === 'task' && conversation.refId
                  ? `任务 · ${taskTitle(conversation.refId) || '任务'}`
                  : ''
            }
            onSelect={() => selectConversation(conversation.id)}
            onRename={(title) => renameConversation(conversation.id, title)}
            onPin={(pinned) => pinConversation(conversation.id, pinned)}
            onDelete={() => deleteConversation(conversation.id)}
          />
        ))}
      </Flex>
    </Flex>
  );
}
