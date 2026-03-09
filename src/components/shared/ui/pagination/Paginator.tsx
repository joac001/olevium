'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import ButtonBase from '../buttons/ButtonBase';

export interface PaginatorProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | '...')[] = [1];

  const rangeStart = Math.max(2, currentPage - 1);
  const rangeEnd = Math.min(totalPages - 1, currentPage + 1);

  if (rangeStart > 2) pages.push('...');

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i);
  }

  if (rangeEnd < totalPages - 1) pages.push('...');

  pages.push(totalPages);
  return pages;
}

export default function Paginator({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: PaginatorProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={clsx(
        'flex items-center justify-center gap-1',
        isLoading && 'opacity-60 pointer-events-none'
      )}
      aria-label="Paginación"
    >
      <ButtonBase
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        ariaLabel="Página anterior"
        className="!px-2.5 !py-2 !md:px-3"
      >
        <ChevronLeft className="h-4 w-4" />
      </ButtonBase>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 py-1 text-sm text-[color:var(--text-muted)] select-none"
          >
            …
          </span>
        ) : (
          <ButtonBase
            key={page}
            onClick={() => onPageChange(page as number)}
            disabled={isLoading}
            ariaLabel={`Página ${page}`}
            variant={page === currentPage ? 'primary' : undefined}
            className={clsx('!px-3 !py-2 !md:px-3.5 min-w-[2.25rem]')}
          >
            <span className="text-sm font-medium">{page}</span>
          </ButtonBase>
        )
      )}

      <ButtonBase
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        ariaLabel="Página siguiente"
        className="!px-2.5 !py-2 !md:px-3"
      >
        <ChevronRight className="h-4 w-4" />
      </ButtonBase>
    </div>
  );
}
