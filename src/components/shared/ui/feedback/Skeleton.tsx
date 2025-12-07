import clsx from 'clsx';
import type { CSSProperties } from 'react';

type SkeletonProps = {
  width?: string | number;
  height?: string | number;
  rounded?: string | number;
  circle?: boolean;
  className?: string;
  style?: CSSProperties;
};

export default function Skeleton({
  width = '100%',
  height = '1rem',
  rounded = '0.75rem',
  circle = false,
  className,
  style,
}: SkeletonProps) {
  return (
    <span
      className={clsx('skeleton block', className)}
      style={{
        width,
        height,
        borderRadius: circle ? '9999px' : rounded,
        ...style,
      }}
      aria-hidden
    />
  );
}
