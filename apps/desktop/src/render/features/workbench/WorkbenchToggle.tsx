import { Compass } from 'lucide-react';
import { Tooltip } from '@sue/design-web-react';
import { useWorkbenchOptional } from './context';
import useLocale from '@/utils/useLocale';

export function WorkbenchToggle() {
  const t = useLocale();
  const workbench = useWorkbenchOptional();
  if (!workbench || !window.electronAPI?.isElectron) return null;
  const title = workbench.open ? t['navbar.workbench.close'] : t['navbar.workbench.open'];
  return (
    <Tooltip title={title} placement="right">
      <button type="button" aria-label={title} onClick={workbench.toggle}>
        <Compass size={16} />
      </button>
    </Tooltip>
  );
}
