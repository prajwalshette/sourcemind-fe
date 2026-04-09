import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}) => {
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (currentPage >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
      {/* Left side: Page size selector and counts */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2.5">
          <span className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wider">
            Rows:
          </span>
          <div className="relative">
            <select
              value={pageSize.toString()}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className={cn(
                "h-7 pl-2 pr-6 rounded-lg bg-muted/40 border border-border/40 text-[11px] font-semibold appearance-none focus:outline-none focus:ring-1 focus:ring-primary/30 cursor-pointer transition-all hover:bg-muted/60",
                "bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_6px_center] bg-no-repeat"
              )}
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size.toString()} className="bg-card">
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-[11px] font-medium text-muted-foreground">
          Showing <span className="text-foreground">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to{" "}
          <span className="text-foreground">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
          <span className="text-foreground">{totalCount}</span> results
        </div>
      </div>

      {/* Right side: Navigation buttons */}
      <div className="flex items-center space-x-1.5 focus:outline-none">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 cursor-pointer rounded-lg border-border/40 bg-background/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1 mx-1.5">
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              className={cn(
                "h-8 w-8 p-0 cursor-pointer rounded-lg text-xs font-bold transition-all duration-200",
                currentPage === pageNum
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                  : "bg-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 cursor-pointer rounded-lg border-border/40 bg-background/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

