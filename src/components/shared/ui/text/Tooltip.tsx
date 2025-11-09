'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  placement?: TooltipPlacement;
  offset?: number;
  className?: string;
}

interface PositionStyle {
  top: number;
  left: number;
  transform: string;
}

const defaultTransform: Record<TooltipPlacement, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0, -50%)',
};

// Orden de prioridad en sentido de las agujas del reloj
const placementOrder: TooltipPlacement[] = ['top', 'right', 'bottom', 'left'];

export default function Tooltip({
  content,
  children,
  placement = 'top',
  offset = 12,
  className = '',
}: TooltipProps) {
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<PositionStyle>({
    top: 0,
    left: 0,
    transform: defaultTransform[placement],
  });

  const calculatePosition = useCallback(
    (anchor: DOMRect, tooltipPlacement: TooltipPlacement): PositionStyle => {
      const next: PositionStyle = {
        top: 0,
        left: 0,
        transform: defaultTransform[tooltipPlacement],
      };

      switch (tooltipPlacement) {
        case 'bottom':
          next.top = anchor.bottom + offset;
          next.left = anchor.left + anchor.width / 2;
          break;
        case 'left':
          next.top = anchor.top + anchor.height / 2;
          next.left = anchor.left - offset;
          break;
        case 'right':
          next.top = anchor.top + anchor.height / 2;
          next.left = anchor.right + offset;
          break;
        case 'top':
        default:
          next.top = anchor.top - offset;
          next.left = anchor.left + anchor.width / 2;
          break;
      }

      return next;
    },
    [offset]
  );

  const isPositionInViewport = useCallback(
    (pos: PositionStyle, tooltipPlacement: TooltipPlacement): boolean => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return true;

      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calcular las dimensiones estimadas del tooltip basadas en su posición
      let tooltipLeft = pos.left;
      let tooltipTop = pos.top;
      const tooltipWidth = tooltipRect.width || 200; // fallback width
      const tooltipHeight = tooltipRect.height || 40; // fallback height

      // Ajustar según el transform
      switch (tooltipPlacement) {
        case 'top':
          tooltipLeft -= tooltipWidth / 2;
          tooltipTop -= tooltipHeight;
          break;
        case 'bottom':
          tooltipLeft -= tooltipWidth / 2;
          break;
        case 'left':
          tooltipLeft -= tooltipWidth;
          tooltipTop -= tooltipHeight / 2;
          break;
        case 'right':
          tooltipTop -= tooltipHeight / 2;
          break;
      }

      // Verificar si está dentro del viewport
      return (
        tooltipLeft >= 0 &&
        tooltipTop >= 0 &&
        tooltipLeft + tooltipWidth <= viewportWidth &&
        tooltipTop + tooltipHeight <= viewportHeight
      );
    },
    []
  );

  const findBestPlacement = useCallback(
    (anchor: DOMRect): { placement: TooltipPlacement; position: PositionStyle } => {
      // Comenzar desde el placement preferido
      const startIndex = placementOrder.indexOf(placement);
      const orderedPlacements = [
        ...placementOrder.slice(startIndex),
        ...placementOrder.slice(0, startIndex),
      ];

      for (const testPlacement of orderedPlacements) {
        const testPosition = calculatePosition(anchor, testPlacement);
        if (isPositionInViewport(testPosition, testPlacement)) {
          return { placement: testPlacement, position: testPosition };
        }
      }

      // Si ninguno funciona, usar el placement original
      return {
        placement,
        position: calculatePosition(anchor, placement),
      };
    },
    [placement, calculatePosition, isPositionInViewport]
  );

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const { position: bestPosition } = findBestPlacement(rect);

    setPosition(bestPosition);
  }, [findBestPlacement]);

  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
    }
  }, [isVisible, placement, updatePosition]);

  useEffect(() => {
    if (!isVisible) return;

    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, updatePosition]);

  const tooltipNode = useMemo(() => {
    if (!isVisible || !content) return null;

    const tooltipStyle: CSSProperties = {
      top: position.top,
      left: position.left,
      transform: position.transform,
      backgroundImage: 'var(--surface)',
      backgroundColor: 'var(--surface-tint)',
      backdropFilter: 'blur(var(--glass-blur, 18px))',
    };

    return createPortal(
      <div
        ref={tooltipRef}
        style={tooltipStyle}
        className={`pointer-events-none fixed z-tooltip flex max-w-xs items-center rounded-md bg-transparent px-3 py-2 text-sm text-[color:var(--text-primary)] border border-[var(--border-soft)] shadow-xl transition-opacity duration-150`}
        role="tooltip"
      >
        {content}
      </div>,
      document.body
    );
  }, [content, isVisible, position.left, position.top, position.transform]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);
  const handleFocus = () => setIsVisible(true);
  const handleBlur = () => setIsVisible(false);

  return (
    <span
      ref={anchorRef}
      className={`${className} inline-flex w-fit h-fit`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
      {tooltipNode}
    </span>
  );
}
