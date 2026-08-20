import styles from '../style.module.less';

export function EmptyWorkspace() {
  return (
    <div className={styles.emptyWorkspace}>
      点选对话中的「打开工作台」可在此审阅并采纳建议。
      <br />
      绑定发起后不会自动打开工作台。
    </div>
  );
}
