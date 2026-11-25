import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { getNilaiOverviewMock } from '../../mocks/nilaiMock';
import { nilaiCss } from './nilaiStyles';
import NilaiStats from './NilaiStats';
import { fmt, deltaText } from './nilaiFormat';

export default function RekapNilai() {
  // Nanti diganti: ambil dari backend modul nilai (kelompok lain) untuk anak yang dipilih (getChildId)
  const data = getNilaiOverviewMock();
  const { student, subjects, summary } = data;

  return (
    <div className="nl-page">
      <style>{nilaiCss}</style>
      <h1 className="nl-title">Rekap Nilai</h1>
      <p className="nl-sub">Pantau perkembangan nilai {student.name} di setiap mata pelajaran.</p>

      <NilaiStats s={summary} />

      <section className="nl-panel">
        <h2>Nilai per Mata Pelajaran</h2>
        <p>Pilih mata pelajaran untuk melihat rincian setiap penilaian.</p>

        {subjects.length === 0 ? (
          <p className="nl-empty">Belum ada nilai yang tercatat.</p>
        ) : (
          <div className="nl-tbl-wrap">
            <div className="nl-tbl">
              <div className="nl-tr list nl-th">
                <span>MATA PELAJARAN</span>
                <span>RATA-RATA</span>
                <span>PENILAIAN</span>
                <span>TERAKHIR</span>
                <span>TREN</span>
                <span>STATUS</span>
              </div>
              {subjects.map((s) => (
                <div className="nl-tr list nl-tb" key={s.subject.id}>
                  <div className="nl-subj">
                    <span className="nl-subj-ico"><BookOpen size={20} /></span>
                    <div>
                      <b>{s.subject.name}</b>
                      <small>{s.teacher?.name}</small>
                      <Link to={`/ortu/nilai/${s.subject.id}`}>Lihat detail <ChevronRight size={12} /></Link>
                    </div>
                  </div>
                  <span className={`nl-score ${s.above_kkm ? '' : 'low'}`}>{fmt(s.average)}</span>
                  <span className="nl-muted">{s.total}</span>
                  <span>{fmt(s.latest)}</span>
                  <span className={`nl-delta ${s.delta > 0 ? 'up' : s.delta < 0 ? 'down' : ''}`}>{deltaText(s.delta)}</span>
                  <span>
                    <span className={`nl-status ${s.above_kkm ? 'tuntas' : 'remedial'}`}>
                      {s.above_kkm ? 'Di atas KKM' : 'Di bawah KKM'}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}