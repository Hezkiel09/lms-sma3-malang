import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, BookOpen, Check, TriangleAlert, X } from 'lucide-react';
import PresensiTabs from '../../components/PresensiTabs';
import { overviewMock } from '../../mocks/overviewMock';

const DOW = ['SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB', 'MIN'];
const LABEL = { hadir: 'Hadir', izin: 'Izin', sakit: 'Sakit', alpha: 'Alfa' };

const dateTitle = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

// TODO: sambungkan ke GET /attendances/student/me/overview?month=<prev_month|next_month>
function MonthNav({ label }) {
  return (
    <div className="monthnav">
      <button aria-label="Bulan sebelumnya"><ChevronLeft size={18} /></button>
      <span>{label}</span>
      <button aria-label="Bulan berikutnya"><ChevronRight size={18} /></button>
    </div>
  );
}

function Summary({ s }) {
  return (
    <div className="sum">
      <div className="sum-card main">
        <small>Persentase Hadir</small>
        <div className="val">
          {s.percent ?? '-'}{s.percent !== null && '%'}
          {s.level && <em>{s.level}</em>}
        </div>
      </div>
      <div className="sum-card">
        <small>Hadir</small>
        <div className="val">{s.hadir_days}<em>Hari</em></div>
      </div>
      <div className="sum-card">
        <small>Izin &amp; Sakit</small>
        <div className="val">{s.izin_sakit_days}<em>Hari</em></div>
      </div>
      <div className="sum-card">
        <small>Alfa</small>
        <div className="val">{s.alpha_days}<em>Hari</em></div>
      </div>
    </div>
  );
}

function Calendar({ data }) {
  const [selected, setSelected] = useState(null);
  const blanks = (data.days[0].weekday + 6) % 7; // minggu dimulai Senin
  const sel = data.days.find((d) => d.date === selected);

  return (
    <div className="panel">
      <h3>Kalender Presensi</h3>
      <p className="sub">Rekap kehadiran selama satu bulan.</p>

      <div className="cal-dow">{DOW.map((d) => <div key={d}>{d}</div>)}</div>
      <div className="cal-grid">
        {Array.from({ length: blanks }).map((_, i) => <div className="cal-cell" key={`b${i}`} />)}
        {data.days.map((d) => {
          const clickable = !d.is_weekend && d.status;
          return (
            <div
              key={d.date}
              className={`cal-cell ${d.is_weekend ? 'we' : ''} ${clickable ? 'click' : ''} ${selected === d.date ? 'sel' : ''}`}
              onClick={clickable ? () => setSelected(selected === d.date ? null : d.date) : undefined}
            >
              <span className={`cal-n ${d.is_today ? 'today' : ''}`}>{d.day}</span>
              {d.status && (
                <span className={`chip-st st-${d.status}`}>
                  {d.label}
                  {d.partial && <span className="pdot" title="Ada status berbeda di hari ini" />}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="cal-leg">
        <div>
          <span><i style={{ background: '#d3eef4' }} />Hadir</span>{'  '}
          <span><i style={{ background: '#fdecd9' }} />Izin</span>{'  '}
          <span><i style={{ background: '#fde2e2' }} />Sakit</span>{'  '}
          <span><i style={{ background: '#e3e6ea' }} />Alfa</span>{'  '}
          <span><span className="pd" />Ada status berbeda</span>
        </div>
        <span><i style={{ background: '#f1f8f9' }} />Akhir pekan</span>
      </div>

      {sel && sel.items.length > 0 && (
        <div className="day-detail">
          <div className="t">
            <b>{dateTitle(sel.date)}</b>
            <button className="x" onClick={() => setSelected(null)} aria-label="Tutup"><X size={16} /></button>
          </div>
          <p>
            Status hari ini: {sel.label}.
            {sel.partial && ' Ada mapel dengan status berbeda.'}
          </p>
          {sel.items.map((it) => (
            <div className="dd-row" key={it.subject}>
              <span>{it.subject}</span>
              <span className={`chip-st st-${it.status}`}>{LABEL[it.status]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// TODO: dropdown semester -> kirim from & to ke endpoint overview; "Lihat detail" -> halaman detail mapel
function Subjects({ data }) {
  const n = data.subjects_notice;
  return (
    <div className="panel">
      <div className="subj-head">
        <div>
          <h3>Presensi per Mata Pelajaran</h3>
          <p className="sub">
            Rekap kehadiran setiap mata pelajaran pada {data.month_label}. Pilih mata pelajaran untuk melihat rincian tiap pertemuan.
          </p>
        </div>
        <select className="semester" defaultValue="ganjil">
          <option value="ganjil">Semester ganjil 2024/2025</option>
          <option value="genap">Semester genap 2024/2025</option>
        </select>
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
        {data.subjects.map((s) => (
          <div className="tr tb" key={s.subject.id}>
            <div className="subj">
              <span className="ico"><BookOpen size={20} /></span>
              <div>
                <b>{s.subject.name}</b>
                <small>{s.teacher?.name}</small>
                <Link to={`/siswa/presensi/riwayat/${s.subject.id}`}>Lihat detail <ChevronRight size={12} /></Link>
              </div>
            </div>
            <span className="c h">{s.hadir}</span>
            <span className="c i">{s.izin}</span>
            <span className="c s">{s.sakit}</span>
            <span className="c a">{s.alpha}</span>
            <div className="pct">
              <div className="top"><span>Persentase</span><b>{s.percent ?? '-'}{s.percent !== null && '%'}</b></div>
              <div className="bar"><i className={s.below_threshold ? 'low' : ''} style={{ width: `${s.percent ?? 0}%` }} /></div>
            </div>
          </div>
        ))}
      </div>
      
      {data.subjects.length === 0 && (
        <p className="empty-note">Belum ada data presensi pada {data.month_label}.</p>
        )
      }

      <div className={`notice ${n.ok ? '' : 'warn'}`}>
        {n.ok ? <Check size={16} /> : <TriangleAlert size={16} />}
        {n.message}
      </div>
    </div>
  );
}

export default function Riwayat() {
  // Nanti diganti: GET /attendances/student/me/overview?month=YYYY-MM
  const data = overviewMock;

  return (
    <>
      <h1 className="title">Riwayat Presensi</h1>
      <p className="subtitle">Pantau kehadiranmu di sekolah secara berkala.</p>
      <PresensiTabs right={<MonthNav label={data.month_label} />} />
      <Summary s={data.summary} />
      <Calendar data={data} />
      <Subjects data={data} />
    </>
  );
}