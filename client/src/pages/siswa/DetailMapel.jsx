import { Link, useParams } from 'react-router-dom';
import { BookOpen, Clock, Check, TriangleAlert, ChevronRight, MessageSquare } from 'lucide-react';
import { getSubjectDetailMock } from '../../mocks/subjectDetailMock';

function Breadcrumb() {
  return (
    <nav className="dm-crumb" aria-label="Breadcrumb">
      <Link to="/siswa/presensi/riwayat">Riwayat Presensi</Link>
      <ChevronRight size={14} />
      <span className="cur">Detail Mata Pelajaran</span>
    </nav>
  );
}

export default function DetailMapel() {
  const { subjectId } = useParams();
  // Nanti diganti: GET /attendances/student/me/subjects/:subjectId (opsional from, to, limit)
  const data = getSubject(subjectId, { studentId })

  if (!data) {
    return (
      <>
        <Breadcrumb />
        <h1 className="title">Mata pelajaran tidak ditemukan</h1>
        <p className="subtitle">Kembali ke riwayat presensi untuk memilih mata pelajaran lain.</p>
      </>
    );
  }

  const { subject, teacher, summary, meetings } = data;

  return (
    <>
      <Breadcrumb />
      <h1 className="title">Detail Presensi {subject.name}</h1>
      <p className="subtitle">Pantau riwayat kehadiran dan materi setiap pertemuan.</p>

      <div className="dm-hero">
        <div className="dm-hero-l">
          <span className="dm-ico"><BookOpen size={28} /></span>
          <div>
            <small>Mata Pelajaran</small>
            <h2>{subject.name}</h2>
            <p>{teacher?.name}</p>
            <button className="dm-contact" onClick={() => {}}><MessageSquare size={16} /> Hubungi guru</button>
          </div>
        </div>
        <div className="dm-att">
          <div className="top">
            <span>Kehadiran</span>
            <b>{summary.percent ?? '-'}{summary.percent !== null && '%'}</b>
          </div>
          <div className="bar">
            <i className={data.above_threshold ? '' : 'low'} style={{ width: `${summary.percent ?? 0}%` }} />
          </div>
          {summary.level && <em>{summary.level}</em>}
        </div>
      </div>
      
      <div className="panel">
        <h3>Riwayat Pertemuan</h3>
        <p className="sub">Rincian materi dan kehadiran {data.student.name} pada setiap pertemuan</p>
        
        <div className="dm-tbl">
          <div className="dm-tr dm-th">
            <span>PERTEMUAN</span>
            <span>TANGGAL &amp; WAKTU</span>
            <span>MATERI</span>
            <span>SUB CAPAIAN PEMBELAJARAN</span>
            <span>STATUS</span>
          </div>

          {meetings.map((m) => (
            <div className="dm-tr dm-tb" key={m.session_id}>
              <b>#{m.number ?? '-'}</b>
              <div>
                <b>{m.date_label}</b>
                <small><Clock size={12} /> {m.time}</small>
              </div>
              <b>{m.topic ?? '-'}</b>
              <span className="dm-muted">{m.learning_outcome ?? '-'}</span>
              <div>
                <span className={`dm-pill dm-${m.status}`}><i />{m.label}</span>
                {m.status === 'alpha' && (
                  <a href="#" className="dm-link" onClick={(e) => e.preventDefault()}>Hubungi guru</a>
                )}
              </div>
            </div>
          ))}
        </div>

        {meetings.length === 0 && (
          <p className="empty-note">Belum ada pertemuan yang tercatat untuk mata pelajaran ini.</p>
        )}

        <div className={`notice ${data.above_threshold ? '' : 'warn'}`}>
          {data.above_threshold ? <Check size={16} /> : <TriangleAlert size={16} />}
          {data.notice}
        </div>
      </div>
    </>
  );
}