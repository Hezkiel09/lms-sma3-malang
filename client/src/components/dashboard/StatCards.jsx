import { useEffect, useState } from 'react';
import { Users, GraduationCap, Monitor, FileText } from 'lucide-react';
import { mockStats } from '../../data/mockData';
import { apiFetch } from '../../lib/api';

const iconMap = {
  Users: Users,
  GraduationCap: GraduationCap,
  Monitor: Monitor,
  FileText: FileText,
};

export default function StatCards() {
  const [stats, setStats] = useState(mockStats);

  useEffect(() => {
    let active = true;

    apiFetch('/master/dashboard/summary')
      .then((res) => {
        const data = res?.data || res;
        if (active && data) {
          setStats([
            {
              id: 1,
              title: 'Total Siswa',
              value: data.total_students ? data.total_students.toLocaleString('id-ID') : '1.248',
              subtitle: `${data.total_classes || 36} rombel aktif`,
              change: '↗ 2,4%',
              icon: 'Users',
              iconBg: 'bg-cyan-50 text-cyan-600',
            },
            {
              id: 2,
              title: 'Guru & Staf',
              value: data.total_teachers ? data.total_teachers.toString() : '86',
              subtitle: '82 akun aktif',
              change: '↗ 2,4%',
              icon: 'GraduationCap',
              iconBg: 'bg-blue-50 text-blue-600',
            },
            {
              id: 3,
              title: 'Kehadiran Hari Ini',
              value: data.attendance_rate || '94,8%',
              subtitle: `${data.total_students || 1183} siswa hadir`,
              change: '↗ 2,4%',
              icon: 'Monitor',
              iconBg: 'bg-amber-50 text-amber-600',
            },
            {
              id: 4,
              title: 'Aktivitas Sistem',
              value: data.active_activities ? data.active_activities.toString() : '328',
              subtitle: '+12% dari kemarin',
              change: '↗ 2,4%',
              icon: 'FileText',
              iconBg: 'bg-purple-50 text-purple-600',
            },
          ]);
        }
      })
      .catch(() => {
        // Fallback to mock data quietly
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = iconMap[item.icon] || Users;
        return (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-shadow hover:shadow-md"
          >
            {/* Top row: Icon and Trend badge */}
            <div className="flex items-center justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold text-emerald-600">
                {item.change}
              </span>
            </div>

            {/* Bottom info */}
            <div className="mt-4">
              <div className="text-2xl font-bold tracking-tight text-slate-800">
                {item.value}
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-700">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-400">{item.subtitle}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
