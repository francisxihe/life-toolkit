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
  return (
    <svg
      width={width}
      height={height}
      className={clsx(className, 'fill-[currentColor]')}
      onClick={onClick}
      style={style}
    >
      <use href={`/icons.svg#${id}`} />
    </svg>
  );
}
