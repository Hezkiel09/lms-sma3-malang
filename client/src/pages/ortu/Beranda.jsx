import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  BarChart3,
  MessageSquare,
  ChevronRight,
  Check
} from 'lucide-react';

import { presensiSiswaApi as api } from '../../services/presensiSiswaApi';
import { getChildId } from './PilihAnak';

const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const BAR_COLORS = [
  '#0e9bb5',
  '#4472ca',
  '#d17a2f',
  '#8368c4',
  '#2f9e6e'
];

// "2024-11-11" + "2024-11-15" -> "11–15 November 2024"
function formatRange(from, to) {
  const f = new Date(from);
  const t = new Date(to);

  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) {
    return `${from ?? '-'} – ${to ?? '-'}`;
  }

  const sameMonth =
    f.getMonth() === t.getMonth() &&
    f.getFullYear() === t.getFullYear();

  if (sameMonth) {
    return `${f.getDate()}–${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
  }

  return `${f.getDate()} ${BULAN[f.getMonth()]} – ${t.getDate()} ${BULAN[t.getMonth()]} ${t.getFullYear()}`;
}

function formatDecimal(n) {
  return Number(n).toLocaleString('id-ID', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
}

function StatCard({ icon: Icon, title, value, sub, to }) {
  return (
    <div className="ortu-stat">
      <div className="ortu-stat-top">
        <span className="ortu-ico">
          <Icon size={22} />
        </span>

        {to && (
          <Link to={to} className="ortu-ico" aria-label={title}>
            <ChevronRight size={20} />
          </Link>
        )}
      </div>

      <p className="ortu-stat-title">{title}</p>

      <p className="ortu-stat-val">
        {value}
        {sub && <em>{sub}</em>}
      </p>
    </div>
  );
}

export default function Beranda() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const studentId = getChildId();

  useEffect(() => {
    let active = true;

    setData(null);
    setError('');

    api.getParentDashboard({ studentId })
      .then((result) => {
        if (active) setData(result);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return <p>Memuat dashboard...</p>;
  }

  if (!data.selected) {
    return (
      <section className="ortu-card">
        <h2>Belum Ada Anak Dipilih</h2>
        <p>{data.message}</p>
        <Link to="/ortu/anak" className="ortu-more">
          Pilih Anak <ChevronRight size={16} />
        </Link>
      </section>
    );
  }

  const {
    selected,
    attendance: a,
    children = [],
    grades,
    notifications,
    parent
  } = data;

  const summary = a?.summary;
  const hasAttendance = !a?.message && !!summary;
  const week = a?.week ?? [];

  const gradeItems = grades?.available
    ? grades.items ?? []
    : [];

  // Rata-rata nilai: pakai grades.average jika ada, jika tidak hitung dari items
  const gradeAverage =
    grades?.average ??
    (gradeItems.length > 0
      ? gradeItems.reduce((sum, g) => sum + (Number(g.score) || 0), 0) /
        gradeItems.length
      : null);

  const gradeDelta = grades?.delta;

  const attendanceUrl = '/ortu/presensi';
  const gradesUrl = '/ortu/nilai';
  const messagesUrl = '/ortu/pesan';

  return (
    <>
      {/* BANNER SELAMAT DATANG */}
      <section className="ortu-hero">
        <div>
          <p className="ortu-hero-hi">
            Selamat Datang
          </p>

          <h1>
            {parent?.name || 'Orang Tua'}
          </h1>

          <p className="ortu-hero-sub">
            Pantau perkembangan anak Anda secara real-time
            dengan mudah dan cepat.
          </p>

          {children.length > 1 && (
            <Link to="/ortu/anak" className="ortu-hero-link">
              Ganti Anak
            </Link>
          )}
        </div>

        <img
          className="ortu-hero-img"
          src="/images/ortu-hero.png"
          alt=""
          aria-hidden="true"
        />
      </section>

      {/* RINGKASAN */}
      <section className="ortu-stats">
        <StatCard
          icon={CalendarDays}
          to={attendanceUrl}
          title="Kehadiran Bulan Ini"
          value={hasAttendance ? `${summary.percent}%` : '-'}
          sub={
            hasAttendance
              ? `${summary.hadir_days} dari ${summary.recorded_days} hari`
              : 'Belum ada data'
          }
        />

        <StatCard
          icon={BarChart3}
          to={gradesUrl}
          title="Rata-rata Nilai"
          value={gradeAverage !== null ? formatDecimal(gradeAverage) : '-'}
          sub={
            gradeDelta !== undefined && gradeDelta !== null
              ? `${gradeDelta >= 0 ? 'Naik' : 'Turun'} ${formatDecimal(
                  Math.abs(gradeDelta)
                )} poin`
              : 'Belum ada data'
          }
        />

        <StatCard
          icon={MessageSquare}
          to={messagesUrl}
          title="Pesan Belum Dibaca"
          value={notifications?.unreadCount ?? 0}
          sub={`dari ${notifications?.teacherCount ?? 0} guru`}
        />
      </section>

      {/* PRESENSI MINGGU INI */}
      <section className="ortu-card">
        <div className="ortu-card-head">
          <div>
            <h2>Presensi Minggu Ini</h2>
            <p>
              {formatRange(a?.week_period?.from, a?.week_period?.to)}
            </p>
          </div>

          <Link to={attendanceUrl} className="ortu-more">
            Selengkapnya <ChevronRight size={16} />
          </Link>
        </div>

        {week.length > 0 ? (
          <div className="ortu-week">
            {week.map((day) => (
              <div
                key={day.date}
                className={`ortu-day ${day.is_today ? 'today' : ''}`}
              >
                <span>{HARI[day.weekday]}</span>
                <b>{day.day}</b>

                <span
                  className={`ortu-day-label ${
                    day.label ? '' : 'empty'
                  }`}
                >
                  {day.label ?? '-'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="ortu-empty">
            Belum ada data presensi minggu ini.
          </p>
        )}

        {a?.today_note && (
          <div className="ortu-note">
            <Check size={18} />
            {a.today_note}
          </div>
        )}

        {a?.subjects_notice?.message && (
          <div
            className={`notice ${
              a.subjects_notice.ok ? '' : 'warn'
            }`}
          >
            {a.subjects_notice.message}
          </div>
        )}
      </section>

      {/* NILAI TERBARU */}
      <section className="ortu-card">
        <div className="ortu-card-head">
          <div>
            <h2>Nilai Terbaru</h2>
            <p>Rata-rata penilaian bulan ini</p>
          </div>

          <Link to={gradesUrl} className="ortu-more">
            Selengkapnya <ChevronRight size={16} />
          </Link>
        </div>

        {gradeItems.length === 0 ? (
          <p className="ortu-empty">
            {grades?.message ?? 'Belum ada data nilai.'}
          </p>
        ) : (
          gradeItems.map((grade, index) => (
            <div
              key={grade.subject ?? index}
              className="ortu-bar"
            >
              <div>
                <span>{grade.subject}</span>
                <b>{grade.score}</b>
              </div>

              <div className="ortu-bar-track">
                <i
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, Number(grade.score) || 0)
                    )}%`,
                    background: BAR_COLORS[
                      index % BAR_COLORS.length
                    ]
                  }}
                />
              </div>
            </div>
          ))
        )}
      </section>
    </>
  );
}