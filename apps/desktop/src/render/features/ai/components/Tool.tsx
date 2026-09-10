import type { AiToolPartVo } from '@true-north/vo';
import styles from '../style.module.less';

type Props = {
  part: AiToolPartVo;
};

function toolStatusLabel(status: AiToolPartVo['status']): string {
  if (status === 'running') return '正在调用';
  if (status === 'error') return '调用失败';
  return '已完成';
}

export function Tool({ part }: Props) {
  return (
    <details className={styles.toolPart} key={part.status} open={part.status === 'running' ? true : undefined}>
      <summary>
        {toolStatusLabel(part.status)} {part.toolName}
      </summary>
      <div className={styles.toolPartBody}>
        {part.argsSummary ? <div>{part.argsSummary}</div> : null}
        {part.resultSummary ? <div>{part.resultSummary}</div> : null}
      </div>
    </details>
  );
}
