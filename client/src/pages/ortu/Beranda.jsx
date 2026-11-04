import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, BarChart3, Bell, ChevronRight, Check } from 'lucide-react';
import { presensiSiswaApi as api } from '../../services/presensiSiswaApi';
import { getChildId } from './PilihAnak';

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BAR_COLORS = ['#0e9bb5', '#4472ca', '#d17a2f', '#8368c4', '#2f9e6e'];

function StatCard({ icon: Icon, to, title, value, sub }) {
  return (
    <div className="ortu-stat">
      <div className="ortu-stat-top">
        <span className="ortu-ico"><Icon size={22} /></span>
        {to && <Link to={to} className="ortu-ico" aria-label={title}><ChevronRight size={20} /></Link>}
      </div>
      <p className="ortu-stat-title">{title}</p>
      <p className="ortu-stat-val">{value}{sub && <em>{sub}</em>}</p>
    </div>
  );
}

export default function BerandaOrtu() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const studentId = getChildId();

  useEffect(() => {
    let alive = true;
    setData(null);
    setError('');
    api.getParentDashboard({ studentId })
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e.message));
    return () => { alive = false; };
  }, [studentId]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Memuat…</p>;
  if (!data.selected) return <p>{data.message}</p>;

  const { selected, attendance: a, children, grades, notifications } = data;
  const s = a?.summary;
  const hasAttendance = !a.message && s;
  const gradeItems = grades?.available ? grades.items ?? [] : [];

  return (
    <>
      {/* Banner */}
      <section className="ortu-hero">
        <div>
          <p className="ortu-hero-hi">Selamat Datang</p>
          <h1>{data.parent?.name}</h1>
          <p className="ortu-hero-sub">
            Pantau perkembangan <b>{selected.name}</b> ({selected.class_name ?? '-'}) secara real-time dengan mudah dan cepat.
          </p>
          {children.length > 1 && <Link to="/ortu/anak" className="ortu-hero-link">Ganti anak</Link>}
        </div>
      </section>

      {/* 3 kartu ringkasan */}
      <section className="ortu-stats">
        <StatCard
          icon={CalendarDays}
          to="/ortu/presensi"
          title="Kehadiran Bulan Ini"
          value={hasAttendance ? `${s.percent}%` : '-'}
          sub={hasAttendance ? `${s.hadir_days} dari ${s.recorded_days} hari` : 'Belum ada data'}
        />
        <StatCard
          icon={BarChart3}
          title="Rata-rata Nilai"
          value="-"
          sub="Belum terhubung"
        />
        <StatCard
          icon={Bell}
          title="Notifikasi Belum Dibaca"
          value={notifications?.unreadCount ?? 0}
        />
      </section>

      {/* Presensi minggu ini */}
      <section className="ortu-card">
        <div className="ortu-card-head">
          <div>
            <h2>Presensi Minggu Ini</h2>
            <p>{a.week_period?.from} – {a.week_period?.to}</p>
          </div>
          <Link to="/ortu/presensi" className="ortu-more">Selengkapnya <ChevronRight size={16} /></Link>
        </div>

        <div className="ortu-week">
          {a.week.map((d) => (
            <div key={d.date} className={`ortu-day ${d.is_today ? 'today' : ''}`}>
              <span>{HARI[d.weekday]}</span>
              <b>{d.day}</b>
              <span className={`ortu-day-label ${d.label ? '' : 'empty'}`}>{d.label ?? '-'}</span>
            </div>
          ))}
        </div>

        {a.today_note && (
          <div className="ortu-note"><Check size={18} /> {a.today_note}</div>
        )}
        {a.subjects_notice?.message && (
          <div className={`notice ${a.subjects_notice.ok ? '' : 'warn'}`}>{a.subjects_notice.message}</div>
        )}
      </section>

      {/* Nilai terbaru */}
      <section className="ortu-card">
        <div className="ortu-card-head">
          <div>
            <h2>Nilai Terbaru</h2>
            <p>Rata-rata penilaian bulan ini</p>
          </div>
        </div>

        {gradeItems.length === 0 ? (
          <p className="ortu-empty">{grades?.message ?? 'Belum ada nilai.'}</p>
        ) : (
          gradeItems.map((g, i) => (
            <div key={g.subject ?? i} className="ortu-bar">
              <div><span>{g.subject}</span><b>{g.score}</b></div>
              <div className="ortu-bar-track">
                <i style={{ width: `${Math.min(100, g.score)}%`, background: BAR_COLORS[i % BAR_COLORS.length] }} />
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}