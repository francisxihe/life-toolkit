import clsx from "clsx";
import styles from "./style.module.less";

type ContainerProps = {
  direction?: "vertical" | "horizontal";
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

export function Container(props: ContainerProps) {
  const { direction = "horizontal", className, children, ...rest } = props;
  return (
    <div
      className={clsx(
        styles["container"],
        direction === "vertical" ? styles["container-vertical"] : "",
        direction === "horizontal" ? styles["container-horizontal"] : "",
        className ?? ""
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ContainerFixed(props: ContainerProps) {
  const { direction, className, children, ...rest } = props;
  return (
    <div
      className={clsx(
        `${styles["container-fixed"]} container-fixed`,
        direction === "vertical"
          ? `${styles["container"]} ${styles["container-vertical"]}`
          : "",
        direction === "horizontal"
          ? `${styles["container"]} ${styles["container-horizontal"]}`
          : "",
        className ?? ""
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function ContainerShrink(
  props: {
    absolute?: boolean;
    overflowY?: "hidden" | "auto";
  } & ContainerProps
) {
  const { direction, className, children, absolute, overflowY, ...rest } =
    props;

  const containerClass = clsx(
    `${styles["container-shrink"]} container-shrink`,
    absolute
      ? ["relative"]
      : [
          direction === "vertical"
            ? `${styles["container"]} ${styles["container-vertical"]}`
            : "",
          direction === "horizontal"
            ? `${styles["container"]} ${styles["container-horizontal"]}`
            : "",
        ],
    className ?? ""
  );

  return absolute ? (
    <div className={containerClass} {...rest}>
      <div
        className={clsx("absolute w-full h-full", [
          direction === "vertical"
            ? `${styles["container"]} ${styles["container-vertical"]}`
            : "",
          direction === "horizontal"
            ? `${styles["container"]} ${styles["container-horizontal"]}`
            : "",
        ])}
        style={{
          overflowY,
        }}
      >
        {children}
      </div>
    </div>
  ) : (
    <div className={containerClass} style={{ overflowY }} {...rest}>
      {children}
    </div>
  );
}
