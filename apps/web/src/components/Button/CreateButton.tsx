import { Button, ButtonProps } from '@arco-design/web-react';
import SiteIcon from '../SiteIcon';

export function CreateButton({ ...props }: ButtonProps) {
  return (
    <Button {...props} type="primary">
      <div className="flex items-center gap-2">
        <SiteIcon id="add" width={14} height={14} />
        {props.children}
      </div>
    </Button>
  );
}
