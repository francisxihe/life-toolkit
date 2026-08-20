import { useEffect, useState } from 'react';
import { Alert, Button, Flex, Input } from '@sue/design-web-react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { taskAncestorIds } from '../../../shared/lifecycle';
import type { Task } from '../../../shared/types';
import { statusLabel } from '../../../shared/utils';
import styles from '../style.module.css';

type Props = {
  tasks: Task[];
  selectedTaskId: string;
  onSelect: (id: string) => void;
  creatingChild: boolean;
  childTitle: string;
  childError: string;
  onStartCreateChild: () => void;
  onChildTitleChange: (title: string) => void;
  onCreateChild: () => boolean;
  onCancelCreateChild: () => void;
};

export function TaskTree({
  tasks,
  selectedTaskId,
  onSelect,
  creatingChild,
  childTitle,
  childError,
  onStartCreateChild,
  onChildTitleChange,
  onCreateChild,
  onCancelCreateChild,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  useEffect(() => setExpandedIds((current) => [...new Set([...current, ...taskAncestorIds(selectedTaskId, tasks)])]), [selectedTaskId, tasks]);
  const toggle = (id: string) => setExpandedIds((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  const renderNodes = (parentId?: string, depth = 0): React.ReactNode => tasks
    .filter((task) => task.parentId === parentId)
    .map((task) => {
      const hasChildren = tasks.some((item) => item.parentId === task.id);
      const expanded = expandedIds.includes(task.id);
      return (
        <div key={task.id} className={styles.treeBranch}>
          <div className={styles.treeRow} style={{ paddingLeft: depth * 16 }}>
            {hasChildren ? <Button type="text" size="small" className={styles.treeToggle} icon={expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />} aria-label={expanded ? '收起子任务' : '展开子任务'} onClick={() => toggle(task.id)} /> : <span className={styles.treeSpacer} />}
            <Button type="text" className={selectedTaskId === task.id ? styles.treeActive : styles.treeButton} onClick={() => onSelect(task.id)}>
              <span>{task.title}</span><small>{statusLabel(task.status)}</small>
            </Button>
          </div>
          {hasChildren && expanded && renderNodes(task.id, depth + 1)}
        </div>
      );
    });
  return (
    <Flex vertical className={styles.treePanel} container="fixed">
      <Flex vertical className={styles.treeHeader} gap={12}>
        <Flex align="center" justify="space-between">
          <b>任务树</b>
          <Button size="small" type="primary" icon={<Plus size={14} />} onClick={onStartCreateChild}>新增子任务</Button>
        </Flex>
        {creatingChild && <Flex vertical className={styles.treeCreateForm} gap={8}>
          <Input autoFocus value={childTitle} placeholder="输入子任务名称" onChange={(event) => onChildTitleChange(event.target.value)} onPressEnter={() => { if (onCreateChild()) setExpandedIds((items) => [...new Set([...items, selectedTaskId])]); }} />
          <Flex gap={8}>
            <Button size="small" type="primary" onClick={() => { if (onCreateChild()) setExpandedIds((items) => [...new Set([...items, selectedTaskId])]); }}>创建</Button>
            <Button size="small" onClick={onCancelCreateChild}>取消</Button>
          </Flex>
          {childError && <Alert className={styles.treeCreateError} type="error" showIcon title={childError} />}
        </Flex>}
      </Flex>
      <Flex vertical className={styles.treeList} container="fill">{renderNodes()}</Flex>
    </Flex>
  );
}
