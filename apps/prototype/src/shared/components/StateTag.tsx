import { Tag } from '@sue/design-web-react';
import { statusLabel } from '../utils';

export function StateTag({ status }: { status: string }) {
  const color = status === 'done' || status === 'completed' ? 'green' : status === 'abandoned' || status === 'archived' ? 'red' : status === 'paused' ? 'default' : 'blue';
  return <Tag color={color}>{statusLabel(status)}</Tag>;
}
