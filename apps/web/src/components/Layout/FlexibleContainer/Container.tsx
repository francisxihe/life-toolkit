import styles from './style.module.less';

export function Container(
  props: {
    direction?: 'vertical' | 'horizontal';
    className?: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  const { direction = 'horizontal', className, children, ...rest } = props;
  return (
    <div
      className={`${styles['container']} ${
        direction === 'vertical' && styles['container-vertical']
      } ${direction === 'horizontal' && styles['container-horizontal']} ${
        className ?? ''
      }`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ContainerFixed(
  props: {
    className?: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  const { className, children, ...rest } = props;
  return (
    <div
      className={`${styles['container-fixed']} container-fixed ${
        className ?? ''
      }`}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ContainerShrink(
  props: {
    className?: string;
    children: React.ReactNode;
    absolute?: boolean;
  } & React.HTMLAttributes<HTMLDivElement>,
) {
  const { className, children, absolute, ...rest } = props;
  return absolute ? (
    <div
      className={`${styles['container-shrink']} relative container-shrink ${
        className ?? ''
      }`}
      {...rest}
    >
      <div className="absolute w-full h-full">{children}</div>
    </div>
  ) : (
    <div
      className={`${styles['container-shrink']} container-shrink ${
        className ?? ''
      }`}
      {...rest}
    >
      {children}
    </div>
  );
}
