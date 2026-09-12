import React, { CSSProperties, ReactNode } from 'react';
import { Dropdown } from '@sue/design-web-react';

export interface ContextMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
  children?: ContextMenuItem[];
  onClick?: (item: ContextMenuItem) => void;
}

export interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  style?: CSSProperties;
  className?: string;
  menuStyle?: CSSProperties;
  menuClassName?: string;
  blurToHide?: boolean;
  onItemClick?: (item: ContextMenuItem) => void;
  onVisibleChange?: (visible: boolean) => void;
}

function toMenuItems(
  items: ContextMenuItem[],
  onItemClick?: (item: ContextMenuItem) => void,
) {
  return items.map((item) => {
    if (item.divider) {
      return { type: 'divider' as const, key: item.key };
    }
    return {
      key: item.key,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      children: item.children ? toMenuItems(item.children, onItemClick) : undefined,
      onClick: () => {
        item.onClick?.(item);
        onItemClick?.(item);
      },
    };
  });
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  items,
  style,
  className,
  menuStyle,
  menuClassName,
  onItemClick,
  onVisibleChange,
}) => {
  return (
    <Dropdown
      menu={{
        items: toMenuItems(items, onItemClick),
        className: menuClassName,
        style: menuStyle,
      }}
      trigger={['contextMenu']}
      onOpenChange={onVisibleChange}
    >
      <div className={className} style={{ display: 'inline-block', ...style }}>
        {children}
      </div>
    </Dropdown>
  );
};

export default ContextMenu;
