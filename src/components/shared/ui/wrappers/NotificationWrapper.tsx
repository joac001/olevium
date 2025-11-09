'use client';

import React, { ReactNode, useEffect, useState } from 'react';

import OverlayBase from '@/components/shared/ui/wrappers/OverlayBase';

const normalize = (c: string) => (c === 'secondary' ? 'accent' : c === 'error' ? 'danger' : c);

interface NotificationWrapperProps {
  children?: ReactNode;
  isOpen: boolean;
  duration: number;
  onClose?: () => void;
  props: {
    icon?: string;
    color?: string;
    title?: string;
    description?: string;
  };
}

const NotificationWrapper: React.FC<NotificationWrapperProps> = ({
  isOpen,
  duration,
  onClose,
  props,
}) => {
  const [visible, setVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setIsFadingOut(false);
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsFadingOut(true);
          const t2 = setTimeout(() => {
            setVisible(false);
            onClose?.();
          }, 300);
          return () => clearTimeout(t2);
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      setIsFadingOut(true);
      setVisible(false);
    }
  }, [isOpen, duration, onClose]);

  const { color = 'info', icon = 'info-circle', title = '', description = '' } = props || {};

  const variant = normalize(color);

  return (
    <OverlayBase shouldRender={visible}>
      <div
        role="status"
        aria-live="polite"
        data-ntf={variant}
        className={[
          'fixed top-5 left-1/2 -translate-x-1/2 z-notification',
          'max-w-md w-fit rounded-xl px-3 py-2 md:px-4 md:py-3',
          'shadow-[0_10px_25px_-5px_rgba(0,0,0,.12),_0_8px_10px_-6px_rgba(0,0,0,.12)]',
          'bg-[color:var(--ntf-bg)] text-[color:var(--ntf-fg)]',
          'transition-all duration-500 ease-in-out',
          isFadingOut ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0',
        ].join(' ')}
      >
        <div className="flex items-start gap-3">
          <i className={`${icon} mt-0.5 text-lg md:text-xl`} />
          <div className="text-pretty">
            {!!title && <h2 className="text-base font-semibold md:text-lg">{title}</h2>}
            {!!description && (
              <p className="text-sm font-normal opacity-90 md:text-base">{description}</p>
            )}
          </div>
        </div>
      </div>
    </OverlayBase>
  );
};

export default NotificationWrapper;
