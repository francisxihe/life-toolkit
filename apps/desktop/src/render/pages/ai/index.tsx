import { Flex } from '@sue/design-web-react';
import { ProductSurface } from '@ylib/product-surface-react';
import { productRef } from '@ylib/product-server';
import { AiSessionProvider } from './context';
import { ConversationPane } from './features/ConversationPane';
import { SessionList } from './features/SessionList';
import styles from './style.module.less';

export default function AiSessionPage() {
  return (
    <AiSessionProvider>
      <ProductSurface id={productRef('ai.session.view.shell')}>
        <Flex container="full" className={styles.shell}>
          <ProductSurface id={productRef('ai.session.view.session-list')}>
            <SessionList />
          </ProductSurface>
          <ProductSurface id={productRef('ai.session.view.conversation')}>
            <ConversationPane />
          </ProductSurface>
        </Flex>
      </ProductSurface>
    </AiSessionProvider>
  );
}
