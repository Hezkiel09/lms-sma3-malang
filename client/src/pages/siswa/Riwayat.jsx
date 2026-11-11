
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Check,
  TriangleAlert,
  X
} from 'lucide-react';

import PresensiTabs from '../../components/PresensiTabs';
import { presensiSiswaApi } from '../../services/presensiSiswaApi';
import { getUser } from '../../services/auth';
import { getChildId } from '../ortu/PilihAnak';

const DOW = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];

const LABEL = {
  hadir: 'Hadir',
  izin: 'Izin',
  sakit: 'Sakit',
  alpha: 'Alfa',
  alfa: 'Alfa'
};

// Format tanggal tanpa pergeseran zona waktu
function dateTitle(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

// Menentukan bulan berdasarkan data dari backend
function getMonthKey(data) {
  const month = data?.month;

  if (typeof month === 'string' && /^\d{4}-\d{2}$/.test(month)) {
    return month;
  }

  const firstDate = data?.days?.find((d) =>
    /^\d{4}-\d{2}-\d{2}$/.test(d.date ?? '')
  )?.date;

  if (firstDate) return firstDate.slice(0, 7);

  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;
}

function changeMonth(monthKey, offset) {
  const [year, month] = monthKey.split('-').map(Number);

  const date = new Date(year, month - 1 + offset, 1);

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, '0')}`;
}

// NAVIGASI BULAN
function MonthNav({ label, onPrevious, onNext }) {
  return (
    <div className="monthnav">
      <button
        type="button"
        aria-label="Bulan sebelumnya"
        onClick={onPrevious}
      >
        <ChevronLeft size={18} />
      </button>

      <span>{label}</span>

      <button
        type="button"
        aria-label="Bulan berikutnya"
        onClick={onNext}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// RINGKASAN PRESENSI
function Summary({ s = {} }) {
  const hasPercent = s.percent !== null &&
    s.percent !== undefined;

  return (
    <div className="sum">
      <div className="sum-card main">
        <small>Persentase Hadir</small>

        <div className="val">
          {hasPercent ? `${s.percent}%` : '-'}

          {s.level && <em>{s.level}</em>}
        </div>
      </div>

      <div className="sum-card">
        <small>Hadir</small>

        <div className="val">
          {s.hadir_days ?? 0}
          <em>Hari</em>
        </div>
      </div>

      <div className="sum-card">
        <small>Izin &amp; Sakit</small>

        <div className="val">
          {s.izin_sakit_days ?? 0}
          <em>Hari</em>
        </div>
      </div>

      <div className="sum-card">
        <small>Alfa</small>

        <div className="val">
          {s.alpha_days ?? 0}
          <em>Hari</em>
        </div>
      </div>
    </div>
  );
}

// KALENDER PRESENSI
function Calendar({ data, isParent, monthNav }) {
  const [selected, setSelected] = useState(null);

  const days = Array.isArray(data?.days)
    ? data.days
    : [];

  const firstDay = days[0];

  const weekday = firstDay
    ? Number.isInteger(Number(firstDay.weekday))
      ? Number(firstDay.weekday)
      : new Date(`${firstDay.date}T00:00:00Z`).getUTCDay()
    : 1;

  const blanks = (weekday + 6) % 7;

  const sel = days.find((d) => d.date === selected);

  // Hilangkan pilihan tanggal lama saat bulan berubah
  useEffect(() => {
    setSelected(null);
  }, [data.month_label]);

  return (
    <div className="panel">
      <div className="subj-head">
        <div>
          <h3>Kalender Presensi</h3>

          <p className="sub">
            {isParent
              ? 'Rekap kehadiran anak selama satu bulan.'
              : 'Rekap kehadiran selama satu bulan.'}
          </p>
        </div>

        {isParent && monthNav}
      </div>

      <div className="cal-dow">
        {DOW.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="cal-grid">
        {Array.from({ length: blanks }).map((_, i) => (
          <div className="cal-cell" key={`blank-${i}`} />
        ))}

        {days.map((d) => {
          const clickable = !d.is_weekend && !!d.status;

          const toggleDate = () => {
            if (!clickable) return;

            setSelected((current) =>
              current === d.date ? null : d.date
            );
          };

          return (
            <div
              key={d.date}
              role={clickable ? 'button' : undefined}
              tabIndex={clickable ? 0 : undefined}
              aria-label={
                clickable
                  ? `${d.date}, ${d.label ?? d.status}`
                  : undefined
              }
              className={`cal-cell ${
                d.is_weekend ? 'we' : ''
              } ${
                clickable ? 'click' : ''
              } ${
                selected === d.date ? 'sel' : ''
              }`}
              onClick={clickable ? toggleDate : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleDate();
                      }
                    }
                  : undefined
              }
            >
              <span className={`cal-n ${d.is_today ? 'today' : ''}`}>
                {d.day}
              </span>

              {d.status && (
                <span className={`chip-st st-${d.status}`}>
                  {d.label ?? LABEL[d.status] ?? d.status}

                  {d.partial && (
                    <span
                      className="pdot"
                      title="Ada status berbeda di hari ini"
                    />
                  )}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {days.length === 0 && (
        <p className="empty-note">
          Belum ada data kalender presensi pada bulan ini.
        </p>
      )}

      {/* LEGENDA */}
      <div className="cal-leg">
        <div>
          <span>
            <i style={{ background: '#d3eef4' }} />
            Hadir
          </span>

          <span>
            <i style={{ background: '#fdecd9' }} />
            Izin
          </span>

          <span>
            <i style={{ background: '#e2eafc' }} />
            Sakit
          </span>

          <span>
            <i style={{ background: '#fde2e2' }} />
            Alfa
          </span>

          <span>
            <span className="pd" />
            Ada status berbeda
          </span>
        </div>

        <span>
          <i style={{ background: '#f1f8f9' }} />
          Akhir pekan
        </span>
      </div>

      {/* DETAIL TANGGAL */}
      {sel && (
        <div className="day-detail">
          <div className="t">
            <b>{dateTitle(sel.date)}</b>

            <button
              type="button"
              className="x"
              onClick={() => setSelected(null)}
              aria-label="Tutup detail tanggal"
            >
              <X size={16} />
            </button>
          </div>

          <p>
            Status kehadiran: {sel.label ?? LABEL[sel.status] ?? '-'}.
            {sel.partial &&
              ' Ada mata pelajaran dengan status berbeda.'}
          </p>

          {(sel.items ?? []).map((item, index) => (
            <div
              className="dd-row"
              key={`${item.subject}-${index}`}
            >
              <span>{item.subject}</span>

              <span className={`chip-st st-${item.status}`}>
                {LABEL[item.status] ?? item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// PRESENSI PER MATA PELAJARAN
function Subjects({ data, basePath, studentId, isParent }) {
  const subjects = Array.isArray(data?.subjects)
    ? data.subjects
    : [];

  const notice = data?.subjects_notice;

  return (
    <div className="panel">
      <div className="subj-head">
        <div>
          <h3>Presensi per Mata Pelajaran</h3>

          <p className="sub">
            {isParent
              ? 'Rekap kehadiran anak setiap mata pelajaran'
              : 'Rekap kehadiran setiap mata pelajaran'
            } pada {data.month_label ?? 'bulan ini'}.
            Pilih mata pelajaran untuk melihat rincian tiap pertemuan.
          </p>
        </div>
      </div>

      <div className="tbl">
        <div className="tr th">
          <span>MATA PELAJARAN</span>
          <span className="c">HADIR</span>
          <span className="c">IZIN</span>
          <span className="c">SAKIT</span>
          <span className="c">ALFA</span>
          <span>KEHADIRAN</span>
        </div>

        {subjects.map((s, index) => {
          const subject = s.subject ?? {};
          const hasPercent = s.percent !== null &&
            s.percent !== undefined;

          const percent = Number(s.percent) || 0;

          return (
            <div
              className="tr tb"
              key={subject.id ?? index}
            >
              <div className="subj">
                <span className="ico">
                  <BookOpen size={20} />
                </span>

                <div>
                  <b>{subject.name ?? 'Mata Pelajaran'}</b>

                  <small>{s.teacher?.name ?? '-'}</small>

                  {subject.id != null && (
                    <Link
                      to={`${basePath}/riwayat/${subject.id}`}
                      state={isParent ? { studentId } : undefined}
                    >
                      Lihat detail
                      <ChevronRight size={12} />
                    </Link>
                  )}
                </div>
              </div>

              <span className="c h">{s.hadir ?? 0}</span>
              <span className="c i">{s.izin ?? 0}</span>
              <span className="c s">{s.sakit ?? 0}</span>
              <span className="c a">{s.alpha ?? 0}</span>

              <div className="pct">
                <div className="top">
                  <span>Persentase</span>

                  <b>
                    {hasPercent ? `${s.percent}%` : '-'}
                  </b>
                </div>

                <div className="bar">
                  <i
                    className={s.below_threshold ? 'low' : ''}
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, percent)
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {subjects.length === 0 && (
        <p className="empty-note">
          Belum ada data presensi mata pelajaran pada{' '}
          {data.month_label ?? 'bulan ini'}.
        </p>
      )}

      {notice?.message && (
        <div className={`notice ${notice.ok ? '' : 'warn'}`}>
          {notice.ok
            ? <Check size={16} />
            : <TriangleAlert size={16} />
          }

          {notice.message}
        </div>
      )}
    </div>
  );
}

// HALAMAN UTAMA
// Digunakan oleh siswa dan orang tua
export default function Riwayat({
  basePath = '/siswa/presensi',
  studentId: selectedStudentId
}) {
  const isParent = getUser()?.role === 'parent';

  // Orang tua menggunakan ID anak, siswa menggunakan akun sendiri
  const studentId = isParent
    ? (selectedStudentId ?? getChildId())
    : undefined;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // null = menggunakan bulan default dari backend
  const [month, setMonth] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadPresensi() {
      setLoading(true);
      setError('');

      if (isParent && !studentId) {
        setData(null);
        setError(
          'Data anak belum ditemukan. Pastikan akun orang tua terhubung dengan data siswa.'
        );
        setLoading(false);
        return;
      }

      try {
        const result = await presensiSiswaApi.getOverview({
          studentId,
          ...(month ? { month } : {})
        });

        if (active) {
          setData(result);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Gagal mengambil data presensi.');
          setData(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPresensi();

    return () => {
      active = false;
    };
  }, [studentId, month, isParent]);

  const moveMonth = (offset) => {
    const currentMonth = month ?? getMonthKey(data);
    setMonth(changeMonth(currentMonth, offset));
  };

  if (loading) {
    return (
      <section className="panel">
        <p>Memuat data presensi...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>{isParent ? 'Presensi Anak' : 'Riwayat Presensi'}</h2>

        <p className="error">{error}</p>

        {isParent && !studentId && (
          <Link to="/ortu/anak" className="ortu-more">
            Lihat Data Anak
            <ChevronRight size={16} />
          </Link>
        )}

        <button
          type="button"
          onClick={() => setMonth(null)}
          style={{
            marginTop: 12,
            cursor: 'pointer'
          }}
        >
          Kembali ke bulan saat ini
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="panel">
        <p>Data presensi belum tersedia.</p>
      </section>
    );
  }

  const monthNav = (
    <MonthNav
      label={data.month_label ?? month ?? '-'}
      onPrevious={() => moveMonth(-1)}
      onNext={() => moveMonth(1)}
    />
  );

  return (
    <>
      {/* JUDUL HALAMAN */}
      <div className="presensi-heading">
        <h1 className="title">
          {isParent ? 'Presensi Anak' : 'Riwayat Presensi'}
        </h1>

        <p className="subtitle">
          {isParent
            ? 'Pantau kehadiran anak di sekolah secara berkala.'
            : 'Pantau kehadiranmu di sekolah secara berkala.'
          }
        </p>
      </div>

      {/* TAB KHUSUS SISWA */}
      {!isParent && (
        <PresensiTabs right={monthNav} />
      )}

      {/* KARTU RINGKASAN */}
      <Summary s={data.summary ?? {}} />

      {/* KALENDER KEHADIRAN */}
      <Calendar
        data={data}
        isParent={isParent}
        monthNav={monthNav}
      />

      {/* REKAP PER MATA PELAJARAN */}
      <Subjects
        data={data}
        basePath={basePath}
        studentId={studentId}
        isParent={isParent}
      />
    </>
  );
}
