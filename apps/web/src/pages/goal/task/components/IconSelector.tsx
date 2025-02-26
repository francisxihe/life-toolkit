import SiteIcon from '@/components/SiteIcon';
import { Popover, Tooltip } from '@arco-design/web-react';

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
        <div className="flex flex-col gap-4">
          <div className="py-1">
            {[...Array.from(map.entries())].map(([key, value], index) => {
              const { color, label } = value;
              return (
                <div
                  key={index}
                  className="px-3 py-1 flex items-center gap-2 cursor-pointer"
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
                </div>
              );
            })}
          </div>
        </div>
      }
      trigger={readonly ? 'hover' : 'click'}
    >
      <Tooltip
        content={<span className="text-text-2">{map.get(value)?.label}</span>}
        mini
        color="var(--color-bg-2)"
        disabled={!map.get(value)?.label}
      >
        <div
          className={`flex items-center justify-center rounded-sm ${
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
        </div>
      </Tooltip>
    </Popover>
  );
}
