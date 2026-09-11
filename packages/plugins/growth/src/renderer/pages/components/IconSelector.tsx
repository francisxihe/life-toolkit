import type { LucideIcon } from 'lucide-react';
import { Flex, Popover, Tooltip } from '@sue/design-web-react';

function tokenColor(color?: string) {
  return color ? `rgb(var(--${color}-6))` : undefined;
}

export default function IconSelector(props: {
  map: Map<number, { color: string; label: string }>;
  value: number | null;
  icon: LucideIcon;
  readonly?: boolean;
  onChange?: (value: number | null) => void;
}) {
  const { map, icon: Icon, value, readonly, onChange } = props;
  const label = map.get(value)?.label;

  const trigger = (
    <Flex
      align="center"
      justify="center"
      className={`rounded-sm ${
        readonly ? 'w-4 h-4' : 'w-7 h-7 cursor-pointer hover:bg-fill-3'
      }`}
    >
      <Icon
        size={16}
        className="cursor-pointer"
        style={{ color: tokenColor(map.get(value)?.color) }}
      />
    </Flex>
  );

  const labeled = label ? (
    <Tooltip title={<span className="text-text-2">{label}</span>} color="var(--color-bg-2)">
      {trigger}
    </Tooltip>
  ) : (
    trigger
  );

  if (readonly) {
    return labeled;
  }

  return (
    <Popover
      content={
        <Flex vertical gap={16}>
          <div className="py-1">
            {[...Array.from(map.entries())].map(([key, option], index) => {
              const { color, label: optionLabel } = option;
              return (
                <Flex
                  key={index}
                  align="center"
                  gap={8}
                  className="px-3 py-1 cursor-pointer"
                  onClick={() => {
                    onChange?.(key);
                  }}
                >
                  <Icon size={16} style={{ color: tokenColor(color) }} />
                  <div className="text-body-3">{optionLabel}</div>
                </Flex>
              );
            })}
          </div>
        </Flex>
      }
      trigger="click"
    >
      {labeled}
    </Popover>
  );
}
