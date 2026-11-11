
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  CheckCircle2,
  TriangleAlert,
  RefreshCw
} from 'lucide-react';

import { presensiSiswaApi } from '../../services/presensiSiswaApi';
import { getChildId } from './PilihAnak';

const css = `
.detail-ortu { padding-bottom: 40px; color: #172b38; }
.detail-ortu h1 { font-size: 26px; margin: 12px 0 8px; }
.detail-ortu .subtitle { color: #738493; margin-bottom: 28px; }

.detail-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #008faa;
  font-size: 13px;
}
.detail-breadcrumb a {
  color: #008faa;
  text-decoration: none;
}

.detail-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 28px;
  border: 1px solid #b7e5ee;
  border-radius: 18px;
  background: #e6f7fa;
  margin-bottom: 30px;
}
.detail-subject {
  display: flex;
  align-items: center;
  gap: 16px;
}
.detail-subject-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d5f0f5;
  color: #07576c;
  border-radius: 13px;
  width: 54px;
  height: 54px;
}
.detail-subject small { color: #008faa; }
.detail-subject h2 {
  color: #07576c;
  font-size: 24px;
  margin: 5px 0;
}
.detail-subject p {
  color: #008faa;
  margin: 0;
  font-size: 14px;
}
.detail-percent {
  min-width: 170px;
  background: #d7f0f5;
  border-radius: 14px;
  padding: 16px;
}
.detail-percent-top {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  align-items: center;
}
.detail-percent-top span {
  color: #008faa;
  font-size: 12px;
}
.detail-percent-top strong {
  color: #07576c;
  font-size: 24px;
}
.detail-progress {
  height: 7px;
  background: #bddfe6;
  border-radius: 20px;
  margin: 10px 0 6px;
  overflow: hidden;
}
.detail-progress div {
  height: 100%;
  background: #008faa;
  border-radius: 20px;
}
.detail-level {
  color: #008faa;
  text-align: right;
  font-size: 12px;
}
.detail-card {
  padding: 28px;
  border: 1px solid #d9e6e9;
  background: white;
  border-radius: 18px;
  box-shadow: 0 5px 20px rgba(0, 63, 82, .05);
}
.detail-card h2 {
  margin: 0 0 6px;
  font-size: 20px;
}
.detail-card-desc {
  color: #7b8b98;
  font-size: 13px;
  margin-bottom: 22px;
}
.detail-table-wrap {
  border: 1px solid #d9e6e9;
  border-radius: 12px;
  overflow-x: auto;
}
.detail-table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
}
.detail-table th {
  background: #f0f6f7;
  text-align: left;
  color: #738694;
  padding: 15px;
  font-size: 11px;
}
.detail-table td {
  border-top: 1px solid #d9e6e9;
  padding: 18px 15px;
  font-size: 13px;
  vertical-align: middle;
}
.detail-table td:nth-child(4) {
  color: #738493;
  line-height: 1.6;
}
.detail-time {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #8a9ca8;
  margin-top: 6px;
  font-size: 12px;
}
.detail-status {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  min-width: 65px;
  text-align: center;
}
.detail-status-hadir { background: #e5f7ef; color: #00885d; }
.detail-status-izin { background: #fff0df; color: #c47a26; }
.detail-status-sakit { background: #eaf0ff; color: #4275d1; }
.detail-status-alpha { background: #fde8e8; color: #c34242; }

.detail-notice {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 24px;
  padding: 14px;
  border-radius: 12px;
  background: #e6f7fa;
  color: #087b93;
  font-size: 13px;
}
.detail-notice.warning {
  background: #fff1e3;
  color: #ae6423;
}
.detail-empty {
  padding: 28px;
  text-align: center;
  color: #7b8b98;
}
.detail-retry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #0e9bb5;
  color: white;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
}
@media (max-width: 700px) {
  .detail-hero { flex-direction: column; align-items: stretch; }
  .detail-card { padding: 16px; }
  .detail-ortu h1 { font-size: 22px; }
}
`;

function extractStudentId(child) {
  if (!child) return null;

  if (typeof child === 'string' || typeof child === 'number') {
    return String(child);
  }

  const id =
    child.student_id ??
    child.studentId ??
    child.student?.id ??
    child.id;

  return id == null || String(id).trim() === ''
    ? null
    : String(id);
}

// Jika halaman dibuka langsung, ambil ID anak dari BE.
async function resolveStudentId(fromLink) {
  if (fromLink != null && String(fromLink).trim()) {
    return String(fromLink);
  }

  const savedId = getChildId();

  const dashboard = await presensiSiswaApi.getParentDashboard({
    studentId: savedId || undefined
  });

  const children = Array.isArray(dashboard?.children)
    ? dashboard.children
    : [];

  const selectedId = extractStudentId(dashboard?.selected);
  const childIds = children.map(extractStudentId).filter(Boolean);

  return (
    selectedId ??
    (savedId && childIds.includes(String(savedId))
      ? String(savedId)
      : null) ??
    childIds[0] ??
    (savedId ? String(savedId) : null)
  );
}

function StatusBadge({ meeting }) {
  const status = String(meeting.status ?? '').toLowerCase();
  const label = meeting.label ??
    (status === 'alpha'
      ? 'Alfa'
      : status || '-');

  return (
    <span className={`detail-status detail-status-${status}`}>
      • {label}
    </span>
  );
}

export default function DetailPresensiAnak() {
  const { subjectId } = useParams();
  const location = useLocation();

  const studentIdFromLink = location.state?.studentId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      setError('');
      setData(null);

      try {
        if (!subjectId) {
          throw new Error('ID mata pelajaran tidak tersedia.');
        }

        const studentId = await resolveStudentId(
          studentIdFromLink
        );

        if (!studentId) {
          throw new Error(
            'Data anak tidak ditemukan pada akun orang tua.'
          );
        }

        // Ambil seluruh detail langsung dari Backend.
        const result = await presensiSiswaApi.getSubject(
          subjectId,
          { studentId }
        );

        if (active) setData(result);
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Gagal mengambil detail presensi.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [subjectId, studentIdFromLink, reload]);

  const subject = data?.subject ?? {};
  const teacher = data?.teacher ?? {};
  const summary = data?.summary ?? {};

  const meetings = Array.isArray(data?.meetings)
    ? data.meetings
    : [];

  const hasPercent =
    summary.percent !== null &&
    summary.percent !== undefined;

  const percent = hasPercent
    ? Math.min(100, Math.max(0, Number(summary.percent) || 0))
    : 0;

  const noticeMessage =
    typeof data?.notice === 'string'
      ? data.notice
      : data?.notice?.message;

  return (
    <div className="detail-ortu">
      <style>{css}</style>

      {/* BREADCRUMB */}
      <div className="detail-breadcrumb">
        <Link to="/ortu/presensi">Presensi Anak</Link>
        <ChevronRight size={15} />
        <span>Detail Mata Pelajaran</span>
      </div>

      <h1>
        Detail Presensi {subject.name ?? 'Mata Pelajaran'}
      </h1>

      <p className="subtitle">
        Pantau riwayat kehadiran dan materi setiap pertemuan.
      </p>

      {loading && (
        <section className="detail-card">
          <p>Memuat detail presensi anak...</p>
        </section>
      )}

      {!loading && error && (
        <section className="detail-card">
          <h2>Gagal Memuat Detail Presensi</h2>
          <p className="error">{error}</p>

          <button
            type="button"
            className="detail-retry"
            onClick={() => setReload((n) => n + 1)}
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </section>
      )}

      {!loading && !error && data && (
        <>
          {/* INFORMASI MATA PELAJARAN */}
          <section className="detail-hero">
            <div className="detail-subject">
              <span className="detail-subject-icon">
                <BookOpen size={25} />
              </span>

              <div>
                <small>Mata Pelajaran</small>
                <h2>{subject.name ?? '-'}</h2>
                <p>{teacher.name ?? '-'}</p>
              </div>
            </div>

            <div className="detail-percent">
              <div className="detail-percent-top">
                <span>Kehadiran</span>
                <strong>
                  {hasPercent ? `${summary.percent}%` : '-'}
                </strong>
              </div>

              <div className="detail-progress">
                <div style={{ width: `${percent}%` }} />
              </div>

              <div className="detail-level">
                {summary.level ?? '-'}
              </div>
            </div>
          </section>

          {/* RIWAYAT PERTEMUAN */}
          <section className="detail-card">
            <h2>Riwayat Pertemuan</h2>

            <p className="detail-card-desc">
              Rincian materi dan kehadiran anak
              pada setiap pertemuan.
            </p>

            <div className="detail-table-wrap">
              <table className="detail-table">
                <thead>
                  <tr>
                    <th>PERTEMUAN</th>
                    <th>TANGGAL & WAKTU</th>
                    <th>MATERI</th>
                    <th>SUB CAPAIAN PEMBELAJARAN</th>
                    <th>STATUS</th>
                  </tr>
                </thead>

                <tbody>
                  {meetings.map((meeting, index) => (
                    <tr key={`${meeting.number ?? index}-${index}`}>
                      <td>
                        <b>#{meeting.number ?? '-'}</b>
                      </td>

                      <td>
                        <b>{meeting.date_label ?? '-'}</b>

                        <div className="detail-time">
                          <Clock3 size={13} />
                          {meeting.time ?? '-'}
                        </div>
                      </td>

                      <td>
                        <b>{meeting.topic ?? '-'}</b>
                      </td>

                      <td>
                        {meeting.learning_outcome ?? '-'}
                      </td>

                      <td>
                        <StatusBadge meeting={meeting} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {meetings.length === 0 && (
                <div className="detail-empty">
                  Belum ada riwayat pertemuan
                  untuk mata pelajaran ini.
                </div>
              )}
            </div>

            {/* CATATAN BERDASARKAN RESPONS BE */}
            {noticeMessage && (
              <div
                className={`detail-notice ${
                  data.above_threshold === false
                    ? 'warning'
                    : ''
                }`}
              >
                {data.above_threshold === false
                  ? <TriangleAlert size={18} />
                  : <CheckCircle2 size={18} />
                }

                <span>{noticeMessage}</span>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
