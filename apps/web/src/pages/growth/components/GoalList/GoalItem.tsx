'use client';

import { Typography, Popover, Button } from '@arco-design/web-react';
import { FlexibleContainer } from '@life-toolkit/components-web-ui';
import IconSelector from '../IconSelector';
import { SiteIcon } from '@life-toolkit/components-web-ui';
import { URGENCY_MAP, IMPORTANCE_MAP, GoalService } from '../../service';
import { GoalVo, GoalStatus } from '@life-toolkit/vo/growth';
import clsx from 'clsx';

const { Paragraph } = Typography;

export type GoalItemProps = {
  goal: {
    id: GoalVo['id'];
    name: GoalVo['name'];
    description?: GoalVo['description'];
    status?: GoalVo['status'];
    importance?: GoalVo['importance'];
    urgency?: GoalVo['urgency'];
    startAt?: GoalVo['startAt'];
    endAt?: GoalVo['endAt'];
    doneAt?: GoalVo['doneAt'];
    abandonedAt?: GoalVo['abandonedAt'];
  };
  onClickGoal: (id: string) => Promise<void>;
  refreshGoalList: () => Promise<void>;
  TriggerCheckbox: React.ReactNode;
};

function GoalItem(props: GoalItemProps) {
  const { goal } = props;
  return (
    <div className={'w-full pl-4 py-2 bg-bg-3'} key={goal.id}>
      <FlexibleContainer direction="vertical" className="items-start">
        <FlexibleContainer.Fixed className="flex items-start ">
          {props.TriggerCheckbox}
        </FlexibleContainer.Fixed>
        <FlexibleContainer.Shrink
          onClick={() => props.onClickGoal(goal.id)}
          className={clsx([
            'cursor-pointer border-b',
            'after:content-[""] after:block after:h-1 after:w-full',
          ])}
        >
          <div
            className={clsx(['flex items-center justify-between', 'leading-8'])}
          >
            <span className="text-text-1">{goal.name}</span>

            <div className="h-8 flex items-center">
              <Popover
                trigger="click"
                content={
                  <div className="w-40">
                    <div
                      className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                      onClick={() => {
                        GoalService.abandonGoal(goal.id);
                        props.refreshGoalList();
                      }}
                    >
                      放弃
                    </div>
                    <div
                      className="cursor-pointer px-3 h-9 leading-9 hover:bg-fill-2"
                      onClick={() => {
                        GoalService.deleteGoal(goal.id);
                        props.refreshGoalList();
                      }}
                    >
                      删除
                    </div>
                  </div>
                }
              >
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  iconOnly
                  type="text"
                  size="mini"
                  icon={<SiteIcon id="more-for-goal" />}
                  className="!flex justify-center items-center !text-text"
                />
              </Popover>
            </div>
          </div>
          {goal.description && (
            <Paragraph
              className="text-body-1 !mb-0.5"
              style={{
                textDecoration:
                  goal.status === GoalStatus.DONE ? 'line-through' : 'none',
                color: 'var(--color-text-3)',
              }}
            >
              {goal.description}
            </Paragraph>
          )}
          <div className={clsx(['flex items-center gap-2', 'text-body-2'])}>
            {goal.importance && (
              <IconSelector
                map={IMPORTANCE_MAP}
                iconName="priority-0"
                value={goal.importance}
                readonly
              />
            )}

            {goal.urgency && (
              <IconSelector
                map={URGENCY_MAP}
                iconName="urgency"
                value={goal.urgency}
                readonly
              />
            )}
          </div>
        </FlexibleContainer.Shrink>
      </FlexibleContainer>
    </div>
  );
}

export default GoalItem;
