import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { presensiSiswaApi as api } from '../../services/presensiSiswaApi';

const KEY = 'b8-child-id';

export function getChildId() {
  try { return sessionStorage.getItem(KEY) || undefined; } catch { return undefined; }
}
export function setChildId(id) {
  try { sessionStorage.setItem(KEY, id); } catch { /* abaikan */ }
}

export default function PilihAnak() {
  const [children, setChildren] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const current = getChildId();

  useEffect(() => {
    api.getParentDashboard()
      .then((d) => setChildren(d.children ?? []))
      .catch((e) => setError(e.message));
  }, []);

  const pick = (id) => {
    setChildId(id);
    navigate('/ortu');
  };

  if (error) return <main className="page"><p className="error">{error}</p></main>;
  if (!children) return <main className="page"><p>Memuat…</p></main>;
  if (!children.length) return <main className="page"><p>Akun belum terhubung dengan data siswa.</p></main>;

  return (
    <main className="page">
      <h1>Pilih anak</h1>
      {children.map((c) => (
        <button
          key={c.id}
          type="button"
          className="card"
          onClick={() => pick(c.id)}
          style={{ display: 'block', width: '100%', textAlign: 'left', fontWeight: c.id === current ? 700 : 400 }}
        >
          {c.name} · {c.class_name ?? '-'} · NIS {c.nis}
        </button>
      ))}
    </main>
  );
}