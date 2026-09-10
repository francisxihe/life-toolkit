'use client';

import { Drawer } from '@sue/design-web-react';
import type { TodoFormData } from '@true-north/web-service';
import type { TodoVo } from '@true-north/vo';
import { drawerPaddedBodyStyles } from '@/utils/drawerStyles';
import { TodoDetailProvider } from './context';
import TodoForm from './features/TodoForm';

export type TodoEditorProps = {
  todo: TodoVo;
  onClose?: () => void;
  afterSubmit: () => Promise<void>;
};

export type TodoCreatorProps = {
  initialFormData?: Partial<TodoFormData>;
  onClose?: () => Promise<void>;
  afterSubmit?: () => Promise<void>;
};

export function TodoEditor(props: TodoEditorProps) {
  return (
    <TodoDetailProvider
      todo={props.todo}
      mode="editor"
      afterSubmit={props.afterSubmit}
    >
      <TodoForm onClose={props.onClose} />
    </TodoDetailProvider>
  );
}

export function TodoCreator(props: TodoCreatorProps) {
  return (
    <TodoDetailProvider
      mode="creator"
      initialFormData={props.initialFormData}
      afterSubmit={props.afterSubmit}
    >
      <TodoForm onClose={props.onClose} />
    </TodoDetailProvider>
  );
}

export { formatTodoPlanTime, isTodoPlanRange } from './planTime';

type DrawerOptions = Omit<Parameters<typeof Drawer.open>[0], 'content'>;

export function useTodoDetail() {
  const openEditDrawer = (
    props: {
      contentProps: TodoEditorProps;
    } & DrawerOptions,
  ) => {
    const { contentProps, ...rest } = props;
    const instance = Drawer.open({
      ...rest,
      title: '编辑待办',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <TodoEditor
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
      contentProps: TodoCreatorProps;
    } & DrawerOptions,
  ) => {
    const { contentProps, ...rest } = props;
    const instance = Drawer.open({
      ...rest,
      title: '新建待办',
      size: 800,
      styles: drawerPaddedBodyStyles,
      content: (
        <TodoCreator
          {...contentProps}
          onClose={async () => {
            instance.destroy();
          }}
        />
      ),
    });
  };

  return {
    openEditDrawer,
    openCreateDrawer,
  };
}
