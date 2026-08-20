import type { ReactNode } from 'react';
import { Collapse } from '@sue/design-web-react';
import type { ExecutionGroup, ExecutionItem } from '../utils';

type Props<T extends ExecutionItem> = {
  groups: ExecutionGroup<T>[];
  renderItem: (item: T) => ReactNode;
};

export function ExecutionGroupList<T extends ExecutionItem>({ groups, renderItem }: Props<T>) {
  return (
    <Collapse bordered={false} defaultActiveKey={['overdue', 'current']}>
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <Collapse.Panel header={`${group.title} (${group.items.length})`} key={group.key}>
            {group.items.map(renderItem)}
          </Collapse.Panel>
        ))}
    </Collapse>
  );
}
