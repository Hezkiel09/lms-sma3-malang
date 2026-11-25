import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getNilaiDetailMock, KKM } from '../../mocks/nilaiMock';
import { nilaiCss } from './nilaiStyles';
import NilaiStats from './NilaiStats';
import { fmt } from './nilaiFormat';
import TrendChart from './TrendChart';

const TYPE_LABEL = { kuis: 'Kuis', tugas: 'Tugas', ulangan: 'Ulangan' };
const STATUS_LABEL = { tuntas: 'Tuntas', remedial: 'Remedial' };

function Crumb() {
  return (
    <nav className="nl-crumb" aria-label="Breadcrumb">
      <Link to="/ortu/nilai">Rekap Nilai</Link>
      <ChevronRight size={14} />
      <span>Detail Nilai</span>
    </nav>
  );
}

export default function DetailNilai() {
  const { subjectId } = useParams();
  // Nanti diganti: ambil dari backend modul nilai (kelompok lain) untuk anak yang dipilih (getChildId)
  const data = getNilaiDetailMock(subjectId);

  if (!data) {
    return (
      <div className="nl-page">
        <style>{nilaiCss}</style>
        <Crumb />
        <h1 className="nl-title">Mata pelajaran tidak ditemukan</h1>
        <p className="nl-sub">Kembali ke Rekap Nilai untuk memilih mata pelajaran lain.</p>
      </div>
    );
  }

  const { student, subject, summary, trend, items, above_kkm: above } = data;
  const kkm = data.kkm ?? KKM;

  return (
    <div className="nl-page">
      <style>{nilaiCss}</style>
      <Crumb />
      <h1 className="nl-title">Detail Nilai {subject.name}</h1>
      <p className="nl-sub">Pantau perkembangan dan hasil setiap penilaian {student.name}.</p>

      <NilaiStats s={summary} />

      <section className="nl-panel">
        <div className="nl-panel-head">
          <div>
            <h2>Perkembangan Nilai</h2>
            <p>Tren lima penilaian terakhir pada mata pelajaran {subject.name}</p>
          </div>
          <span className={`nl-badge ${above ? 'ok' : 'warn'}`}>{above ? 'Di atas KKM' : 'Di bawah KKM'}</span>
        </div>
        <TrendChart points={trend} kkm={kkm} />
      </section>

      <section className="nl-panel">
        <h2>Riwayat Penilaian</h2>
        <p>Daftar tugas, kuis, dan ulangan yang telah dinilai</p>

        {items.length === 0 ? (
          <p className="nl-empty">Belum ada penilaian untuk mata pelajaran ini.</p>
        ) : (
          <div className="nl-tbl-wrap">
            <div className="nl-tbl">
              <div className="nl-tr detail nl-th">
                <span>TANGGAL</span>
                <span>JENIS</span>
                <span>MATERI</span>
                <span>NILAI</span>
                <span>RATA-RATA KELAS</span>
                <span>STATUS</span>
              </div>
              {items.map((it) => (
                <div className="nl-tr detail nl-tb" key={it.id}>
                  <span className="nl-muted">{it.date_label}</span>
                  <span><span className={`nl-type ${it.type}`}>{TYPE_LABEL[it.type] ?? it.type}</span></span>
                  <span className="nl-topic">{it.topic}</span>
                  <span className={`nl-score ${it.score < kkm ? 'low' : ''}`}>{fmt(it.score)}</span>
                  <span className="nl-muted">{fmt(it.class_average)}</span>
                  <span><span className={`nl-status ${it.status}`}>{STATUS_LABEL[it.status] ?? it.status}</span></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}