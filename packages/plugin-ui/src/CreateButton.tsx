import { Button, ButtonProps } from '@sue/design-web-react';
import { Plus } from 'lucide-react';

export function CreateButton({ ...props }: ButtonProps) {
  return (
    <Button {...props} type={props.type ?? 'primary'}>
      <div className="flex items-center gap-2">
        <Plus size={14} />
        {props.children}
      </div>
    </Button>
  );
}
