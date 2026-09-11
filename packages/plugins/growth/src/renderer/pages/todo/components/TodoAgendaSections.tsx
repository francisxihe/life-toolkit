import { Flex } from '@sue/design-web-react';
import { TodoVo, TodoWithoutRelationsVo } from '@true-north/vo';
import TodoList from '../../components/todo-list';
import styles from './TodoAgendaSections.module.less';

export type TodoAgendaGroup = {
  key: string;
  label: string;
  todoList: TodoVo[];
};

type TodoAgendaSectionsProps = {
  groups: TodoAgendaGroup[];
  emptyLabel: string;
  onClickTodo: (todo: TodoWithoutRelationsVo) => Promise<void>;
  refreshTodoList: () => Promise<void>;
};

export default function TodoAgendaSections(props: TodoAgendaSectionsProps) {
  const visibleGroups = props.groups.filter((group) => group.todoList.length > 0);

  if (visibleGroups.length === 0) {
    return (
      <Flex className={styles.empty} align="center" justify="center">
        {props.emptyLabel}
      </Flex>
    );
  }

  return (
    <div className={styles.sections}>
      {visibleGroups.map((group) => (
        <section className={styles.section} key={group.key}>
          <Flex
            component="header"
            className={styles.sectionHeader}
            align="baseline"
          >
            <h2 className={styles.sectionTitle}>
              {group.label} ({group.todoList.length})
            </h2>
          </Flex>
          <TodoList
            todoList={group.todoList}
            onClickTodo={props.onClickTodo}
            refreshTodoList={props.refreshTodoList}
          />
        </section>
      ))}
    </div>
  );
}
