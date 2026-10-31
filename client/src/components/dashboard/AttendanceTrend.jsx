import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { mockAttendanceTrend } from '../../data/mockData';

export default function AttendanceTrend() {
  const [selectedClass, setSelectedClass] = useState('Semua kelas');

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
      {/* Header with Title and Dropdown */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-800">Tren Kehadiran</h2>
          <p className="text-xs text-slate-400">
            Persentase kehadiran tujuh hari terakhir
          </p>
        </div>

        {/* Dropdown filter */}
        <div className="relative inline-block">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <span>{selectedClass}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="pt-4">
        <div className="flex h-52 items-end justify-between gap-2 sm:gap-4 px-2">
          {mockAttendanceTrend.map((item, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-1 flex-col items-center h-full justify-end group"
              >
                {/* Percentage label */}
                <span className="mb-2 text-[11px] font-semibold text-slate-500">
                  {item.percentage}%
                </span>

                {/* Vertical Bar */}
                <div className="relative w-full max-w-[42px] h-40 rounded-xl overflow-hidden flex items-end">
                  <div
                    style={{ height: `${item.percentage}%` }}
                    className={`w-full rounded-xl transition-all duration-500 ${
                      item.isToday
                        ? 'bg-[#008994]'
                        : 'bg-cyan-50 group-hover:bg-cyan-100'
                    }`}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`mt-3 text-[11px] font-medium ${
                    item.isToday ? 'font-bold text-[#008994]' : 'text-slate-400'
                  }`}
                >
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
