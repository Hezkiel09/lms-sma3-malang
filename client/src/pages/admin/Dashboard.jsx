import HeroBanner from '../../components/dashboard/HeroBanner';
import StatCards from '../../components/dashboard/StatCards';
import AttendanceTrend from '../../components/dashboard/AttendanceTrend';
import QuickAccess from '../../components/dashboard/QuickAccess';
import RecentActivities from '../../components/dashboard/RecentActivities';

export default function AdminDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Hero Banner: Sapaan Selamat Pagi & Notifikasi Tinjau */}
      <HeroBanner />

      {/* 2. 4 Kartu Metrik Statistik (Total Siswa, Guru & Staf, Kehadiran, Aktivitas) */}
      <StatCards />

      {/* 3. Grid Tengah: Tren Kehadiran & Akses Cepat */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTrend />
        </div>
        <div className="lg:col-span-1">
          <QuickAccess />
        </div>
      </div>

      {/* 4. Bagian Bawah: Aktivitas Terkini Sistem */}
      <RecentActivities />
    </div>
  );
}
