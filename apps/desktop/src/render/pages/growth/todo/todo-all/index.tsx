'use client';

import { useEffect, useState } from 'react';
import { TodoFilters } from './TodoFilters';
import { Button, Flex, message } from '@sue/design-web-react';
import { TodoService } from '@true-north/web-service';
import { TodoStatus } from '@true-north/enum';
import { TodoAllProvider } from './context';
import TodoTable from './TodoTable';
import { useTodoAllContext } from './context';
import styles from './style.module.less';
import { emitTodoChanged, onTodoChanged } from '../../events';

function TodoAll() {
  const { getTodoPage, todoList } = useTodoAllContext();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [batchLoading, setBatchLoading] = useState(false);
  useEffect(() => {
    void getTodoPage();
    return onTodoChanged(() => { void getTodoPage(); });
  }, []);

  useEffect(() => {
    setSelectedRowKeys((keys) => keys.filter((key) =>
      todoList.some((todo) =>
        todo.id === key &&
        todo.status === TodoStatus.TODO,
      ),
    ));
  }, [todoList]);

  const handleBatchDone = async () => {
    const selectedTodos = todoList.filter((todo) => selectedRowKeys.includes(todo.id));
    if (!selectedTodos.length) return;
    if (selectedTodos.length > 50) {
      message.error('单次最多完成 50 条待办');
      return;
    }
    try {
      setBatchLoading(true);
      await TodoService.doneBatch({
        todoWithRepeatList: selectedTodos.map((todo) => ({
          id: todo.id,
          relatedType: todo.relatedType,
        })),
      });
      setSelectedRowKeys([]);
      emitTodoChanged();
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <Flex vertical container="full" className={styles.page}>
      <Flex container="fixed" className={styles.filters}>
        <TodoFilters />
      </Flex>

      <Flex container="fill" className={styles.table}>
        <TodoTable
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
        />
      </Flex>
      {selectedRowKeys.length > 0 && (
        <Flex container="fixed" className={styles.batchBar} justify="flex-end" align="center">
          <Button type="primary" loading={batchLoading} onClick={handleBatchDone}>
            批量完成 ({selectedRowKeys.length})
          </Button>
        </Flex>
      )}
    </Flex>
  );
}

export default function TodoAllLayout() {
  return (
    <TodoAllProvider>
      <TodoAll></TodoAll>
    </TodoAllProvider>
  );
}
