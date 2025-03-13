import { Popover } from '@arco-design/web-react';
import { useState } from 'react';
import TodoEditor, { TodoEditorProps } from './TodoEditor';
import TodoCreator, { TodoCreatorProps } from './TodoCreator';
import { openDrawer, IDrawerOption } from '@/layout/Drawer';

export { TodoEditor, TodoCreator };

export function useTodoDetail() {
  const openEditDrawer = (
    props: {
      contentProps: TodoEditorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    openDrawer({
      ...props,
      title: '编辑待办',
      width: 800,
      content: () => {
        return <TodoEditor {...props.contentProps} onClose={props.onClose} />;
      },
    });
  };

  const openCreateDrawer = (
    props: {
      contentProps: TodoCreatorProps;
    } & Omit<IDrawerOption, 'content'>,
  ) => {
    openDrawer({
      ...props,
      title: '新建待办',
      width: 800,
      content: () => {
        return <TodoCreator {...props.contentProps} onClose={props.onClose} />;
      },
    });
  };

  const [createPopoverVisible, setCreatePopoverVisible] = useState(false);

  const CreatePopover = ({
    children,
    creatorProps,
  }: {
    children: React.ReactNode;
    creatorProps: TodoCreatorProps;
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
            <TodoCreator {...creatorProps} />
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
