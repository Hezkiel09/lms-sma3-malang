
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import Riwayat from '../siswa/Riwayat';
import { presensiSiswaApi } from '../../services/presensiSiswaApi';
import { getChildId } from './PilihAnak';

// Mengambil ID siswa dari respons Backend.
function getStudentId(child) {
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

export default function PresensiAnak() {
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAnak() {
      try {
        setLoading(true);
        setError('');
        setStudentId(null);

        // ID anak yang sebelumnya tersimpan.
        const savedId = getChildId();

        // Ambil data anak dari Backend.
        const dashboard =
          await presensiSiswaApi.getParentDashboard({
            studentId: savedId || undefined
          });

        if (!active) return;

        const children = Array.isArray(dashboard?.children)
          ? dashboard.children
          : [];

        // Anak yang dipilih oleh Backend.
        const selectedId = getStudentId(dashboard?.selected);

        // Daftar ID anak yang terhubung.
        const childIds = children
          .map(getStudentId)
          .filter(Boolean);

        // Prioritaskan pilihan Backend.
        // Jika belum ada, gunakan pilihan tersimpan,
        // kemudian anak pertama yang tersedia.
        const id =
          selectedId ??
          (savedId && childIds.includes(String(savedId))
            ? String(savedId)
            : null) ??
          childIds[0] ??
          (savedId ? String(savedId) : null);

        if (!id) {
          throw new Error(
            'Belum ada data anak yang terhubung dengan akun orang tua.'
          );
        }

        setStudentId(id);
      } catch (err) {
        if (active) {
          setError(
            err.message || 'Gagal memuat informasi anak.'
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnak();

    return () => {
      active = false;
    };
  }, [reload]);

  if (loading) {
    return (
      <section className="panel">
        <h1 className="title">Presensi Anak</h1>
        <p>Memuat data presensi anak...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h1 className="title">Presensi Anak</h1>
        <p className="error">{error}</p>

        <button
          type="button"
          onClick={() => setReload((n) => n + 1)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginTop: 12,
            padding: '10px 16px',
            border: 0,
            borderRadius: 9,
            background: '#0e9bb5',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </section>
    );
  }

  // Riwayat menampilkan statistik, kalender dan
  // rekap mata pelajaran menggunakan data Backend.
  return (
    <Riwayat
      basePath="/ortu/presensi"
      studentId={studentId}
    />
  );
}
