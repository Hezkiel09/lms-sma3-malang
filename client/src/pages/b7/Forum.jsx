import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MessageSquare, Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createForum, getForumSubjects, getForums } from '../../services/b7/b7-api';

export default function Forum() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [forums, setForums] = useState([]);
  const [loadedSubjectId, setLoadedSubjectId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let active = true;
    getForumSubjects().then((data) => {
      if (!active) return;
      const list = Array.isArray(data) ? data : [];
      setSubjects(list);
      setSubjectId((current) => current || list[0]?.id || '');
    }).catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!subjectId) return () => { active = false; };
    getForums(subjectId).then((data) => {
      if (active) {
        setForums(Array.isArray(data) ? data : []);
        setLoadedSubjectId(subjectId);
        setError('');
      }
    }).catch((err) => {
      if (active) {
        setForums([]);
        setLoadedSubjectId(subjectId);
        setError(err.message);
      }
    });
    return () => { active = false; };
  }, [subjectId]);

  const subject = subjects.find((item) => String(item.id) === String(subjectId));
  const isLoading = loading || Boolean(subjectId && loadedSubjectId !== subjectId);
  const filtered = useMemo(() => (loadedSubjectId === subjectId ? forums : []).filter((forum) => (
    `${forum.title} ${forum.creatorName}`.toLowerCase().includes(search.toLowerCase())
  )), [loadedSubjectId, subjectId, forums, search]);

  const submitForum = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createForum({ subjectId, title });
      setTitle('');
      setShowCreate(false);
      setForums(await getForums(subjectId));
    } catch (err) { setError(err.message || 'Gagal membuat Forum.'); }
    finally { setSaving(false); }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">B7 · Forum mata pelajaran</p><h1 className="mt-1 text-3xl font-bold text-slate-900">Forum Diskusi</h1><p className="mt-2 text-sm text-slate-500">Diskusi bersama guru dan siswa dalam mata pelajaran yang sama.</p></div>
        <div className="flex items-center gap-3">
          {user?.role === 'student' && <Link className="text-sm font-semibold text-teal-700 hover:underline" to="/siswa">Dashboard</Link>}
          {['admin', 'teacher'].includes(user?.role) && <button onClick={() => setShowCreate(true)} disabled={!subjectId} className="inline-flex items-center gap-2 rounded-xl bg-[#005b64] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Plus className="h-4 w-4" />Buat forum</button>}
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-[1fr_320px]">
          <label className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari forum atau pembuat" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-teal-600" /></label>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3"><BookOpen className="h-4 w-4 text-teal-700" /><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="w-full bg-transparent py-2.5 text-sm outline-none">{subjects.length === 0 && <option value="">Belum ada mata pelajaran</option>}{subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        </div>
        {subject && <p className="mt-3 text-xs text-slate-500">Mata pelajaran: {subject.name}</p>}
      </section>

      {isLoading ? <p className="py-10 text-center text-sm text-slate-500">Memuat forum…</p>
        : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><MessageSquare className="mx-auto h-8 w-8 text-teal-600" /><p className="mt-3 font-semibold text-slate-800">Belum ada forum diskusi</p><p className="mt-1 text-sm text-slate-500">Forum untuk mata pelajaran ini akan muncul di sini.</p></div>
          : <div className="grid gap-4 md:grid-cols-2">{filtered.map((forum) => <Link key={forum.id} to={`/b7/forum/${encodeURIComponent(forum.id)}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
            <div><p className="text-xs font-semibold text-teal-700">{forum.subjectName}</p><h2 className="mt-2 font-bold text-slate-900">{forum.title}</h2></div>
            <div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-500"><span>{forum.creatorName} · {new Date(forum.createdAt).toLocaleDateString('id-ID')}</span><span>{forum.postCount} posting</span></div>
          </Link>)}</div>}

      {showCreate && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowCreate(false); }}>
        <form onSubmit={submitForum} className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
          <div><h2 className="text-xl font-bold text-slate-900">Buat forum mata pelajaran</h2><p className="mt-1 text-sm text-slate-500">{subject?.name}</p></div>
          <label className="block text-sm font-medium text-slate-700">Judul<input required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-teal-600" /></label>
          <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowCreate(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600">Batal</button><button disabled={saving} className="rounded-xl bg-[#005b64] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan…' : 'Buat forum'}</button></div>
        </form>
      </div>}
    </main>
  );
}
