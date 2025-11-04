
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const searchParams = useSearchParams();

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center mt-12">
      <nav className="flex space-x-2">
        {/* Previous Button */}
        <Link
          href={createPageURL(currentPage - 1)}
          className={`px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 ${currentPage === 1 ? 'pointer-events-none text-gray-400' : ''}`}
        >
          Previous
        </Link>

        {pages.map((page) => (
          <Link
            key={page}
            href={createPageURL(page)}
            className={`px-4 py-2 rounded-md ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {page}
          </Link>
        ))}

        {/* Next Button */}
        <Link
          href={createPageURL(currentPage + 1)}
          className={`px-4 py-2 bg-white text-gray-700 rounded-md hover:bg-gray-100 ${currentPage === totalPages ? 'pointer-events-none text-gray-400' : ''}`}
        >
          Next
        </Link>
      </nav>
    </div>
  );
}
