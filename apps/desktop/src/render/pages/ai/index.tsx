import { Flex } from '@sue/design-web-react';
import { ProductSurface } from '@true-north/product-server';
import { productRef } from '@true-north/product-wiki';
import { AiSessionProvider } from './context';
import { ConversationPane } from './features/ConversationPane';
import { SessionList } from './features/SessionList';
import { WorkspaceHost } from './features/WorkspaceHost';
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
          <ProductSurface id={productRef('ai.session.view.workspace-host')}>
            <WorkspaceHost />
          </ProductSurface>
        </Flex>
      </ProductSurface>
    </AiSessionProvider>
  );
}
