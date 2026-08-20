import { Flex } from '@sue/design-web-react';
import { TaskWithoutRelationsVo } from '@true-north/vo';
import TaskList from '../../components/TaskList';
import styles from './TaskAgendaSections.module.less';

export type TaskAgendaGroup = {
  key: string;
  label: string;
  taskList: TaskWithoutRelationsVo[];
};

type TaskAgendaSectionsProps = {
  groups: TaskAgendaGroup[];
  emptyLabel: string;
  onClickTask: (id: string) => Promise<void>;
  refreshTaskList: () => Promise<void>;
};

export default function TaskAgendaSections(props: TaskAgendaSectionsProps) {
  const visibleGroups = props.groups.filter(
    (group) => group.taskList.length > 0,
  );

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
              {group.label} ({group.taskList.length})
            </h2>
          </Flex>
          <TaskList
            taskList={group.taskList}
            onClickTask={props.onClickTask}
            refreshTaskList={props.refreshTaskList}
          />
        </section>
      ))}
    </div>
  );
}
