import type { CSSProperties } from 'react';
import clsx from 'clsx';
import AccentSurface from '@/components/shared/ui/content/AccentSurface';
import { ColorKey } from '@/types/ColorKey';
interface ChipProps {
  text?: string;
  color?: ColorKey;
  icon?: string;
}

export default function Chip({ text, color = 'neutral', icon }: ChipProps) {
  const chipStyle: CSSProperties = {
    borderColor: 'color-mix(in srgb, var(--bn-ring) 45%, transparent 55%)',
  };

  return (
    <AccentSurface
      tone={color}
      as="span"
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 select-none rounded-full border backdrop-blur-md',
        text
          ? 'h-6 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.14em] md:h-7 md:px-3.5 md:text-xs'
          : 'h-3 w-3 border-2',
        'shadow-[0_10px_24px_-18px_rgba(2,16,30,0.65)]'
      )}
      style={chipStyle}
    >
      {icon && text && <i className={icon} aria-hidden />}
      {text ? text : null}
    </AccentSurface>
  );
}
