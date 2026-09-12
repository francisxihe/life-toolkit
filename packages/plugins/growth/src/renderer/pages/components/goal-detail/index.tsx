import { Drawer, Popover } from '@sue/design-web-react';
import { useState } from 'react';
import { drawerBodyStyles } from '@true-north/plugin-ui';
import GoalEditor, { GoalEditorFooter, GoalEditorProps } from './GoalEditor';
import GoalForeign from './goal-foreign';
import GoalForm from './GoalForm';
import GoalCreator, { GoalCreatorProps } from './GoalCreator';
import { GoalDetailProvider } from './context';

export {
  GoalDetailProvider,
  GoalCreator,
  GoalEditor,
  GoalEditorFooter,
  GoalForeign,
  GoalForm,
};

type DrawerOptions = Omit<Parameters<typeof Drawer.open>[0], 'content'>;

export function useGoalDetail() {
  const openEditDrawer = (
    props: {
      contentProps: GoalEditorProps;
    } & DrawerOptions,
  ) => {
    const { contentProps, ...rest } = props;
    const instance = Drawer.open({
      ...rest,
      title: '编辑目标',
      size: 800,
      styles: drawerBodyStyles,
      content: (
        <GoalEditor
          {...contentProps}
          onClose={async () => {
            instance.destroy();
          }}
        />
      ),
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: GoalCreatorProps;
    } & DrawerOptions,
  ) => {
    const { contentProps, ...rest } = props;
    const instance = Drawer.open({
      ...rest,
      title: '新建目标',
      size: 800,
      styles: drawerBodyStyles,
      content: (
        <GoalCreator
          {...contentProps}
          onClose={async () => {
            instance.destroy();
          }}
        />
      ),
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
        open={createPopoverVisible}
        onOpenChange={(visible) => {
          setCreatePopoverVisible(visible);
        }}
        placement="bottomLeft"
        style={{
          maxWidth: 'unset',
        }}
        content={
          <div className="w-[720px] p-4">
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
