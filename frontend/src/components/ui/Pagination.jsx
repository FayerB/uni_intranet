import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) {
  const pages = [];
  const maxVisiblePages = 5;

  // Calculate start and end page for visible range
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust startPage if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Previous button
  if (currentPage > 1) {
    pages.push(
      <button
        key="prev"
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <FiChevronLeft size={20} />
      </button>
    );
  }

  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`flex items-center justify-center w-10 h-10 rounded-lg border border-transparent ${i === currentPage ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600'} transition-colors duration-200`}
      >
        {i}
      </button>
    );
  }

  // Next button
  if (currentPage < totalPages) {
    pages.push(
      <button
        key="next"
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <FiChevronRight size={20} />
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      {pages}
    </div>
  );
}
