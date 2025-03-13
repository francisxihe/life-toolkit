import { Popover } from '@arco-design/web-react';
import { useState } from 'react';
import GoalEditor, { GoalEditorProps } from './GoalEditor';
import GoalCreator, { GoalCreatorProps } from './GoalCreator';
import { openDrawer, IDrawerOption } from '@/layout/Drawer';

export { GoalEditor, GoalCreator };

export function useGoalDetail() {
  const openEditDrawer = ({
    drawerProps,
    editorProps,
  }: {
    drawerProps?: Omit<IDrawerOption, 'content'>;
    editorProps: GoalEditorProps;
  }) => {
    const { closeDrawer } = openDrawer({
      ...drawerProps,
      title: '编辑目标',
      width: 800,
      content: (props) => {
        return <GoalEditor {...editorProps} onClose={props.onClose} />;
      },
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: GoalCreatorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { closeDrawer } = openDrawer({
      ...props,
      title: '新建目标',
      width: 800,
      content: () => {
        return <GoalCreator {...props.contentProps} onClose={props.onClose} />;
      },
    });
  };

  const [createPopoverVisible, setCreatePopoverVisible] = useState(false);

  const CreateGoalPopover = ({
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
            <GoalCreator size="small" {...creatorProps} />
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
    CreateGoalPopover,
  };
}
