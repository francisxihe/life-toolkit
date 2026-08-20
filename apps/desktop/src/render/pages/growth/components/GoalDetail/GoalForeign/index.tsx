import { useGoalDetailContext } from '../context';
import { Spin, Flex } from '@sue/design-web-react';
import { GoalTaskList, CreateTask } from './TaskList';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { CreateGoal, GoalChildren } from './GoalChildren';

export type GoalForeignProps = {
  goalId: string;
  onChangeGoal?: (id: string) => Promise<void>;
  /** When provided, render one fixed tab for embedding in the Goal detail tabs. */
  activeTab?: 'children' | 'taskList';
};

export default function GoalForeign(props: GoalForeignProps) {
  const [loading, setLoading] = useState(false);
  const { goalId, onChangeGoal } = props;
  const { refreshGoalDetail, readonly } = useGoalDetailContext();

  useEffect(() => {
    async function init() {
      setLoading(true);
      await refreshGoalDetail(goalId);
      setLoading(false);
    }
    init();
  }, [refreshGoalDetail, goalId]);

  const [localActiveTab, setLocalActiveTab] = useState<'children' | 'taskList'>(
    'children',
  );
  const activeTab = props.activeTab ?? localActiveTab;
  const tabs = [
    {
      label: '子目标',
      value: 'children',
    },
    {
      label: '任务列表',
      value: 'taskList',
    },
  ] as const;

  if (loading) {
    return <Spin dot />;
  }

  return (
    <>
      {!props.activeTab && (
        <Flex
          container="fixed"
          className="w-full flex items-center justify-between"
        >
          <div className={clsx('h-10', 'flex gap-2 items-center')}>
            {tabs.map((item) => (
              <div
                key={item.value}
                className={clsx(
                  'px-3 py-2',
                  'rounded-lg',
                  'font-[500]',
                  'cursor-pointer',
                  'hover:bg-gray-100',
                  activeTab === item.value
                    ? ['bg-gray-100', 'text-text-1']
                    : ['text-text-2'],
                )}
                onClick={() => {
                  setLocalActiveTab(item.value);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>

          {!readonly && activeTab === 'children' && <CreateGoal />}
          {!readonly && activeTab === 'taskList' && <CreateTask />}
        </Flex>
      )}
      {props.activeTab && !readonly && (
        <Flex container="fixed" justify="end" className="w-full mb-2">
          {activeTab === 'children' ? <CreateGoal /> : <CreateTask />}
        </Flex>
      )}
      <Flex container="fill">
        {activeTab === 'children' && (
          <GoalChildren onChangeGoal={onChangeGoal} />
        )}
        {activeTab === 'taskList' && <GoalTaskList />}
      </Flex>
    </>
  );
}
