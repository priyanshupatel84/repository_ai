"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type Props = {
  page: number;
  setPage: (set: number) => void;
  totalPages: number;
};

export function PaginationPage({ page, setPage, totalPages }: Props) {
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };



  return (
    <Pagination>
      <PaginationContent className="cursor-pointer">
        <PaginationItem>
          <PaginationPrevious
            className={page <= 1 ? "cursor-not-allowed opacity-50" : ""}
            onClick={() => handlePageChange(page - 1)}
          />
        </PaginationItem>
        
        {/* First page */}
        {page > 2 && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(1)}>1</PaginationLink>
          </PaginationItem>
        )}
        
        {/* Ellipsis if needed */}
        {page > 3 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Previous page */}
        {page > 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(page - 1)}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Current page */}
        <PaginationItem>
          <PaginationLink isActive>{page}</PaginationLink>
        </PaginationItem>

        {/* Next page */}
        {page < totalPages && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(page + 1)}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}

        {/* Ellipsis if needed */}
        {page < totalPages - 2 && (
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
        )}

        {/* Last page */}
        {page < totalPages - 1 && (
          <PaginationItem>
            <PaginationLink onClick={() => handlePageChange(totalPages)}>
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        )}

        <PaginationItem>
          <PaginationNext
            className={page >= totalPages ? "cursor-not-allowed opacity-50" : ""}
            onClick={() => handlePageChange(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
