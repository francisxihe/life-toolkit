import React from 'react';
import { Badge, Flex } from '@sue/design-web-react';

import styles from './style/index.module.less';

interface TooltipProps {
  title: string;
  data: {
    name: string;
    value: string;
    color: string;
  }[];
  color?: string;
  name?: string;
  formatter?: (value: string) => React.ReactNode;
}

function CustomTooltip(props: TooltipProps) {
  const { formatter = (value) => value, color, name } = props;
  return (
    <div className={styles['customer-tooltip']}>
      <div className={styles['customer-tooltip-title']}>
        <span style={{ fontWeight: 'bold' }}>{props.title}</span>
      </div>
      <div>
        {props.data.map((item, index) => (
          <Flex
            className={styles['customer-tooltip-item']}
            justify="space-between"
            key={index}
          >
            <div>
              <Badge color={color || item.color} />
              {name || item.name}
            </div>
            <div>
              <span style={{ fontWeight: 'bold' }}>{formatter(item.value)}</span>
            </div>
          </Flex>
        ))}
      </div>
    </div>
  );
}

export default CustomTooltip;
