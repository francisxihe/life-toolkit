import { Popover } from '@arco-design/web-react';
import { useState } from 'react';
import GoalEditor, { GoalEditorProps } from './GoalEditor';
import GoalCreator, { GoalCreatorProps } from './GoalCreator';
import { openDrawer, IDrawerOption } from '@/layout/Drawer';

export { GoalEditor, GoalCreator };

export function useGoalDetail() {
  const openEditDrawer = (
    props: {
      contentProps: GoalEditorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { contentProps, ...rest } = props;
    openDrawer({
      ...rest,
      title: '编辑目标',
      width: 800,
      content: (props) => {
        return <GoalEditor {...contentProps} onClose={props.onClose} />;
      },
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: GoalCreatorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { contentProps, ...rest } = props;
    openDrawer({
      ...rest,
      title: '新建目标',
      width: 800,
      content: (props) => {
        return <GoalCreator {...contentProps} onClose={props.onClose} />;
      },
    });
  };

  const [createPopoverVisible, setCreatePopoverVisible] = useState(false);

  const CreatePopover = ({
    children,
    creatorProps,
  }: {
    children: React.ReactNode;
    creatorProps: GoalCreatorProps;
  }) => {
    return (
      <Popover
        trigger="click"
        popupVisible={createPopoverVisible}
        onVisibleChange={(visible) => {
          setCreatePopoverVisible(visible);
        }}
        position="bl"
        style={{
          maxWidth: 'unset',
        }}
        content={
          <div className="w-[600px] p-4">
            <GoalCreator
              size="small"
              {...creatorProps}
              onClose={async () => {
                await creatorProps.onClose?.();
                setCreatePopoverVisible(false);
              }}
            />
          </div>
        }
      >
        <span
          className="cursor-pointer"
          onClick={() => setCreatePopoverVisible(true)}
        >
          {children}
        </span>
      </Popover>
    );
  };

  return {
    openEditDrawer,
    openCreateDrawer,
    CreatePopover,
  };
}
