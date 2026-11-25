export default function UserTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Data tidak ditemukan.',
  onDetail,
  detailLabel = 'Detail ...',
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm text-slate-600">
        <thead className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : ''} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
            {onDetail && (
              <th className="py-3 px-4 text-right">AKSI</th>
            )}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 font-medium">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (onDetail ? 1 : 0)}
                className="py-10 text-center text-slate-400"
              >
                Memuat data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onDetail ? 1 : 0)}
                className="py-10 text-center text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={item.id || rowIdx}
                className="hover:bg-slate-50/70 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`py-4 px-4 ${col.align === 'right' ? 'text-right' : ''} ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(item) : (col.key ? item[col.key] ?? '-' : '-')}
                  </td>
                ))}

                {onDetail && (
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDetail(item)}
                      className="text-xs font-semibold text-[#008994] hover:text-[#00707a] transition-colors"
                    >
                      {detailLabel}
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
