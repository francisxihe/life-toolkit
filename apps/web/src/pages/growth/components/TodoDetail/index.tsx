import { Popover } from '@arco-design/web-react';
import { useState } from 'react';
import TodoEditor, { TodoEditorProps } from './TodoEditor';
import TodoCreatorSimple, { TodoCreatorSimpleProps } from './TodoCreatorSimple';
import TodoCreator, { TodoCreatorProps } from './TodoCreator';
import { openDrawer, IDrawerOption } from '@/layout/Drawer';

export { TodoEditor, TodoCreator, TodoCreatorSimple };

export function useTodoDetail() {
  const openEditDrawer = (
    props: {
      contentProps: TodoEditorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { contentProps, ...rest } = props;
    openDrawer({
      ...rest,
      title: '编辑待办',
      width: 800,
      content: (props) => {
        return <TodoEditor {...contentProps} onClose={props.onClose} />;
      },
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: TodoCreatorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    const { contentProps, ...rest } = props;
    openDrawer({
      ...rest,
      title: '新建待办',
      width: 800,
      content: (props) => {
        return <TodoCreator {...contentProps} onClose={props.onClose} />;
      },
    });
  };

  const [createPopoverVisible, setCreatePopoverVisible] = useState(false);

  const CreatePopover = ({
    children,
    creatorProps,
  }: {
    children: React.ReactNode;
    creatorProps: TodoCreatorSimpleProps;
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
          <div className="w-[400px] p-2">
            <TodoCreatorSimple
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
    createPopoverVisible,
  };
}
