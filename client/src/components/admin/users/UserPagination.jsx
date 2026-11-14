export default function UserPagination({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  startIndex = 0,
  endIndex = 0,
  itemsPerPage = 10,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
}) {
  return (
    <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
      {/* Info + Items Per Page */}
      <div className="flex items-center gap-2">
        <span>
          Menampilkan{' '}
          {totalItems === 0 ? 0 : startIndex + 1}
          -
          {Math.min(endIndex, totalItems)}
          {' '}dari{' '}
          {totalItems}
          {' '}data
        </span>

        {onItemsPerPageChange && (
          <>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-600 focus:outline-none focus:border-[#008994]"
            >
              {itemsPerPageOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <span>per halaman</span>
          </>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`rounded-xl border px-3 py-1.5 font-medium transition-colors ${
            currentPage === 1
              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Sebelumnya
        </button>

        {/* Page numbers */}
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 rounded-xl font-bold transition-all ${
              currentPage === page
                ? 'bg-[#008994] text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Next */}
        <button
          type="button"
          disabled={currentPage === totalPages || totalPages === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className={`rounded-xl border px-3 py-1.5 font-medium transition-colors ${
            currentPage === totalPages || totalPages === 0
              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
