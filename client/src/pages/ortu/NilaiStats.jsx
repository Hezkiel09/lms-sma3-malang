import { fmt, deltaText } from './nilaiFormat';

export default function NilaiStats({ s }) {
  const dcls = s.delta > 0 ? 'up' : s.delta < 0 ? 'down' : '';
  return (
    <section className="nl-stats">
      <div className="nl-stat">
        <small>Rata-rata Nilai</small>
        <div className="nl-stat-val"><b>{fmt(s.average)}</b><em className={dcls}>{deltaText(s.delta)}</em></div>
      </div>
      <div className="nl-stat">
        <small>Nilai Tertinggi</small>
        <div className="nl-stat-val"><b>{fmt(s.highest)}</b><em>{s.highest_subject}</em></div>
      </div>
      <div className="nl-stat">
        <small>Total Penilaian</small>
        <div className="nl-stat-val"><b>{s.total}</b><em>Semester ini</em></div>
      </div>
      <div className="nl-stat">
        <small>Status</small>
        <div className="nl-stat-val"><b>{s.status_percent}%</b><em>{s.subject_count} mata pelajaran</em></div>
      </div>
    </section>
  );
}