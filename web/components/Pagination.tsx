'use client';

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      const pages: (number | string)[] = [];
      for (let i = 1; i <= 7; i++) {pages.push(i);}
      pages.push('...');
      pages.push(totalPages);
      return pages;
    }
    if (currentPage >= totalPages - 3) {
      const pages: (number | string)[] = [1, '...'];
      for (let i = totalPages - 6; i <= totalPages; i++) {pages.push(i);}
      return pages;
    }
    const pages: (number | string)[] = [1, '...'];
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {pages.push(i);}
    pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
      {currentPage > 1 && (
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          aria-label="Previous page"
        >
          &lt;
        </button>
      )}
      {pageNumbers.map((page, index) =>
        typeof page === 'number' ? (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
              currentPage === page
                ? 'bg-green-600 text-white'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {page}
          </button>
        ) : (
          <span
            key={`ellipsis-${index}`}
            className="w-10 h-10 flex items-center justify-center text-gray-500"
          >
            ...
          </span>
        )
      )}
      {currentPage < totalPages && (
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition-colors"
          aria-label="Next page"
        >
          &gt;
        </button>
      )}
    </div>
  );
}
