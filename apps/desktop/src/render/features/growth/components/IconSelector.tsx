import SiteIcon from '@/components/SiteIcon';
import { Flex, Popover, Tooltip } from '@sue/design-web-react';

export default function IconSelector(props: {
  map: Map<number, { color: string; label: string }>;
  value: number | null;
  iconName: string;
  readonly?: boolean;
  onChange?: (value: number | null) => void;
}) {
  const { map, iconName, value, readonly, onChange } = props;

  return (
    <Popover
      disabled={readonly}
      content={
        <Flex vertical gap={16}>
          <div className="py-1">
            {[...Array.from(map.entries())].map(([key, value], index) => {
              const { color, label } = value;
              return (
                <Flex
                  key={index}
                  align="center"
                  gap={8}
                  className="px-3 py-1 cursor-pointer"
                  onClick={() => {
                    onChange(key);
                  }}
                >
                  <SiteIcon
                    width={16}
                    height={16}
                    id={iconName}
                    style={{ color: `rgb(var(--${color}-6))` }}
                  />
                  <div className="text-body-3">{label}</div>
                </Flex>
              );
            })}
          </div>
        </Flex>
      }
      trigger={readonly ? 'hover' : 'click'}
    >
      <Tooltip
        content={<span className="text-text-2">{map.get(value)?.label}</span>}
        mini
        color="var(--color-bg-2)"
        disabled={!map.get(value)?.label}
      >
        <Flex
          align="center"
          justify="center"
          className={`rounded-sm ${
            readonly ? 'w-4 h-4' : 'w-7 h-7 cursor-pointer hover:bg-fill-3'
          }`}
        >
          <SiteIcon
            width={16}
            height={16}
            id={iconName}
            className={`cursor-pointer`}
            style={{ color: `rgb(var(--${map.get(value)?.color}-6))` }}
          />
        </Flex>
      </Tooltip>
    </Popover>
  );
}
