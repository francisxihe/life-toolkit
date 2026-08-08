import React from 'react';
import {
  Card,
  Button,
  Flex,
  Progress,
  Dropdown,
  Menu,
  Badge,
  CheckOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
} from '@sue/design-web-react';
import { HabitWithoutRelationsVo } from '@true-north/vo';
import { HABIT_STATUS_OPTIONS } from '../constants';
import { formatHabitRepeatLabel } from '../formatHabitRepeatLabel';
import styles from './HabitCard.module.less';

interface HabitCardProps {
  habit: HabitWithoutRelationsVo;
  goalLabel?: string;
  onComplete?: () => void;
  onIncomplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onAbandon?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  goalLabel,
  onComplete,
  onIncomplete,
  onPause,
  onResume,
  onAbandon,
  onDelete,
  onEdit,
}) => {
  const statusConfig = HABIT_STATUS_OPTIONS.find((option) => option.value === habit.status);

  const renderActionMenu = () => {
    const menuItems = [];

    if (onComplete) {
      menuItems.push(
        <Menu.Item key="complete" onClick={onComplete}>
          <CheckOutlined /> 标记完成
        </Menu.Item>,
      );
    }
    if (onIncomplete) {
      menuItems.push(
        <Menu.Item key="incomplete" onClick={onIncomplete}>
          标记未完成
        </Menu.Item>,
      );
    }
    if (onResume) {
      menuItems.push(
        <Menu.Item key="resume" onClick={onResume}>
          恢复习惯
        </Menu.Item>,
      );
    }
    if (onPause) {
      menuItems.push(
        <Menu.Item key="pause" onClick={onPause}>
          暂停习惯
        </Menu.Item>,
      );
    }
    if (onAbandon) {
      menuItems.push(
        <Menu.Item key="abandon" onClick={onAbandon}>
          放弃习惯
        </Menu.Item>,
      );
    }
    if (onEdit) {
      menuItems.push(
        <Menu.Item key="edit" onClick={onEdit}>
          <EditOutlined /> 编辑习惯
        </Menu.Item>,
      );
    }
    if (onDelete) {
      menuItems.push(
        <Menu.Item key="delete" onClick={onDelete} className={styles.dangerAction}>
          <DeleteOutlined /> 删除习惯
        </Menu.Item>,
      );
    }

    return <Menu>{menuItems}</Menu>;
  };

  return (
    <Card
      className={styles.card}
      hoverable
      actions={[
        <Dropdown key="more" popupRender={() => renderActionMenu()} placement="bottomRight">
          <Button type="text" icon={<EllipsisOutlined />} />
        </Dropdown>,
      ]}
    >
      <Flex
        align="flex-start"
        justify="space-between"
        gap={12}
        className={styles.header}
      >
        <div className={styles.titleBlock}>
          <span className={styles.title}>{habit.name}</span>
        </div>
        <Badge status={statusConfig?.color as any} text={statusConfig?.label} className={styles.status} />
      </Flex>

      <Flex vertical gap={10}>
        {goalLabel ? <p className={styles.goalLabel}>{goalLabel}</p> : null}
        <p className={styles.repeatLabel}>执行规则：{formatHabitRepeatLabel(habit)}</p>
        <Flex align="center" justify="space-between" className={styles.progressHeader}>
          <span>当前连续</span>
          <strong>{habit.currentStreak || 0} 天</strong>
        </Flex>
        <Progress percent={Math.min(100, (habit.currentStreak || 0) * 7)} showInfo={false} />
      </Flex>

      {(onComplete || onIncomplete || onEdit) && (
        <div className={styles.footer}>
          <Flex gap={8} className={styles.footerActions}>
            {onComplete && (
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={onComplete}
                className={styles.completeButton}
              >
                完成
              </Button>
            )}
            {onIncomplete && (
              <Button size="small" onClick={onIncomplete}>
                未完成
              </Button>
            )}
            {onEdit && (
              <Button type="link" size="small" onClick={onEdit}>
                编辑
              </Button>
            )}
          </Flex>
        </div>
      )}
      {onResume && (
        <div className={styles.footer}>
          <Button type="primary" size="small" onClick={onResume} className={styles.fullButton}>
            恢复习惯
          </Button>
        </div>
      )}
    </Card>
  );
};

export default HabitCard;
