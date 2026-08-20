'use client';

import { Popover, Button, Card } from '@sue/design-web-react';
import SiteIcon from '@/components/SiteIcon';
import IconSelector from '../IconSelector';
import { GoalService } from '@true-north/web-service';
import { IMPORTANCE_MAP, DIFFICULTY_MAP } from '../../constants';
import { GoalVo } from '@true-north/vo';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { GoalStatus } from '@true-north/enum';

export type GoalItemProps = {
  goal: {
    id: GoalVo['id'];
    name: GoalVo['name'];
    description?: GoalVo['description'];
    status?: GoalVo['status'];
    importance?: GoalVo['importance'];
    difficulty?: GoalVo['difficulty'];
    startAt?: GoalVo['startAt'];
    endAt?: GoalVo['endAt'];
    doneAt?: GoalVo['doneAt'];
    abandonedAt?: GoalVo['abandonedAt'];
  };
  onClickGoal: (id: string) => Promise<void>;
  refreshGoalList: () => Promise<void>;
};

function GoalItem(props: GoalItemProps) {
  const { goal } = props;
  return (
    <Card
      size="small"
      className={clsx(
        'w-full bg-bg-3',
        '!border-border-1',
        'cursor-pointer',
        'hover:!bg-fill-1'
      )}
      key={goal.id}
      onClick={() => props.onClickGoal(goal.id)}>

      <div className={clsx('flex items-center justify-between', 'leading-8')}>
        <span className="text-text-1">{goal.name}</span>
        <div className="h-8 flex items-center">
          <Popover
            trigger="click"
            content={
            <div className="w-40">
                <div
                className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                onClick={() => {
                  GoalService.abandon(goal.id);
                  props.refreshGoalList();
                }}>

                  放弃
                </div>
                <div
                className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                onClick={() => {
                  GoalService.delete(goal.id);
                  props.refreshGoalList();
                }}>

                  删除
                </div>
              </div>
            }>

            <Button
              onClick={(e) => {
                e.stopPropagation();
              }}
              type="text"
              size="small"
              icon={<SiteIcon id="more-for-goal" />}
              className="!flex justify-center items-center !text-text" />

          </Popover>
        </div>
      </div>
      {goal.description &&
      <p
        className="text-body-1 !mb-0.5"
        style={{
          textDecoration:
          goal.status === GoalStatus.DONE ? 'line-through' : 'none',
          color: 'var(--color-text-3)'
        }}>

          {goal.description}
        </p>
      }
      <div className={clsx('flex items-center gap-2', 'text-body-2')}>
        {goal.importance &&
        <IconSelector
          map={IMPORTANCE_MAP}
          iconName="priority-0"
          value={goal.importance}
          readonly />

        }

        {goal.difficulty &&
        <IconSelector
          map={DIFFICULTY_MAP}
          iconName="urgency"
          value={goal.difficulty}
          readonly />

        }
        <span className="text-text-1">
          {dayjs(goal.startAt).format('YYYY-MM-DD')}
        </span>
        <span className="text-text-1">
          {dayjs(goal.endAt).format('YYYY-MM-DD')}
        </span>
      </div>
    </Card>);

}

export default GoalItem;
