import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { ConversationPane } from './features/ConversationPane';
import styles from './style.module.less';
import { Flex } from '@sue/design-web-react';

export default function AiSessionPage() {
  return (
    <Flex className={styles.page} justify="center" container="full">
      <ProductSurface id={productRef('ai.session.view.shell')}>
        <div className={styles.shell}>
          <ProductSurface id={productRef('ai.session.view.conversation')}>
            <ConversationPane />
          </ProductSurface>
        </div>
      </ProductSurface>
    </Flex>
  );
}
