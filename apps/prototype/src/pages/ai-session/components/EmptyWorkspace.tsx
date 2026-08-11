import { productRef } from '../../../product-wiki';
import styles from '../style.module.css';

export function EmptyWorkspace() {
  return (
    <div className={styles.emptyWorkspace} data-product-ref={productRef('ai.session.view.workspace-host')}>
      在消息中点击「打开工作台」以审阅结构化结果
    </div>
  );
}
