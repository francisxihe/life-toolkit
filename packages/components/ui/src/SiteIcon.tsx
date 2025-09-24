import React from 'react';
import clsx from 'clsx';

export default function SiteIcon({
  id,
  width = 16,
  height = 16,
  className,
  style,
  onClick,
}: {
  id: string;
  width?: number;
  height?: number;
  className?: string;
} & React.SVGAttributes<SVGSVGElement>) {
  // 在 Electron 环境中使用相对路径，在 Web 环境中使用绝对路径
  const iconPath = typeof window !== 'undefined' && (window as any).electronAPI ? './icons.svg' : '/icons.svg';

  return (
    <svg
      width={width}
      height={height}
      className={clsx(className)}
      onClick={onClick}
      style={{ ...style, fill: 'currentColor' }}
    >
      <use href={`${iconPath}#${id}`} />
    </svg>
  );
}
