import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  /** Alias props used by some pages */
  page?: number;
  pageSize?: number;
  total?: number;
  onChange?: (p: number) => void;
}

export function Pagination(props: PaginationProps) {
  const currentPage = props.currentPage ?? props.page ?? 1;
  const totalPages = props.totalPages ?? (props.pageSize && props.total != null ? Math.max(1, Math.ceil(props.total / props.pageSize)) : 1);
  const onPageChange = props.onPageChange ?? props.onChange ?? (() => {});

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4 rounded-b-xl">
      <div className="hidden sm:block">
        <p className="text-sm text-[var(--text-muted)]">
          Showing page <span className="font-semibold text-[var(--text)]">{currentPage}</span> of{" "}
          <span className="font-semibold text-[var(--text)]">{totalPages}</span>
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="app-button-secondary py-2 px-3 flex items-center gap-1 shadow-sm hover:border-blue-300 transition-colors"
          title="Previous page"
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="app-button-secondary py-2 px-3 flex items-center gap-1 shadow-sm hover:border-blue-300 transition-colors"
          title="Next page"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
