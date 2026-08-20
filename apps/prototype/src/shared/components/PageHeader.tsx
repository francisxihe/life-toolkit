import type React from 'react';
import { Flex } from '@sue/design-web-react';
import type { ProductRef } from '../../product-wiki';
import styles from './PageHeader.module.css';

export function PageHeader({ title, action, productReference }: { title: string; action?: React.ReactNode; productReference?: ProductRef }) {
  return <Flex justify="space-between" align="start" className={styles.pageHeader} data-product-ref={productReference}><h1>{title}</h1>{action}</Flex>;
}
