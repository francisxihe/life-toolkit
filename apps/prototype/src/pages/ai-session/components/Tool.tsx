import type { AiToolPart } from '../../../shared/types';
import styles from '../style.module.css';

type Props = {
  part: AiToolPart;
};

function toolStatusLabel(status: AiToolPart['status']): string {
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
