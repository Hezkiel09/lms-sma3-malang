import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  createForumPost,
  getForum,
  getForumPosts,
} from '../../services/b7/b7-api';
import { connectForumSocket } from '../../services/b7/b7-socket';

const formatTime = (value) => value
  ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
  : '';

export default function ForumDetail() {
  const { topicId: forumId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [forum, setForum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [replyTarget, setReplyTarget] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getForum(forumId), getForumPosts(forumId)])
      .then(([forumData, postData]) => {
        if (!active) return;
        setForum(forumData);
        setPosts(Array.isArray(postData) ? postData : []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Gagal memuat Forum.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [forumId]);

  useEffect(() => {
    if (!token || !forumId) return undefined;
    const socket = connectForumSocket(token);
    const join = () => socket.emit('forum:join', { forumId });
    const addPost = (post) => {
      if (String(post.forumId) === String(forumId)) {
        setPosts((current) => current.some((item) => item.id === post.id) ? current : [...current, post]);
      }
    };
    const socketError = ({ message }) => setError(message || 'Koneksi Forum terputus.');
    socket.on('connect', join);
    socket.on('forum:post-created', addPost);
    socket.on('forum:error', socketError);
    return () => {
      socket.emit('forum:leave', { forumId });
      socket.off('connect', join);
      socket.off('forum:post-created', addPost);
      socket.off('forum:error', socketError);
      socket.disconnect();
    };
  }, [token, forumId]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError('');
    try {
      const saved = await createForumPost(forumId, {
        content: content.trim(),
        parentPostId: replyTarget?.id || null,
      });
      setPosts((current) => current.some((post) => post.id === saved.id) ? current : [...current, saved]);
      setContent('');
      setReplyTarget(null);
    } catch (requestError) {
      setError(requestError.message || 'Gagal mengirim posting.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <main className="mx-auto max-w-4xl px-4 py-10 text-center text-sm text-slate-500">Memuat forum…</main>;
  if (!forum) return <main className="mx-auto max-w-4xl space-y-4 px-4 py-10"><p role="alert" className="text-sm text-rose-700">{error || 'Forum tidak ditemukan.'}</p><button onClick={() => navigate('/b7/forum')} className="text-sm font-semibold text-teal-700">Kembali ke Forum</button></main>;

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/b7/forum" className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline"><ArrowLeft className="h-4 w-4" /> Daftar forum</Link>
        {user?.role === 'student' && <Link to="/siswa" className="text-sm font-semibold text-teal-700 hover:underline">Dashboard</Link>}
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold text-teal-700">{forum.subjectName}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{forum.title}</h1>
        <p className="mt-2 text-sm text-slate-500">Dibuat {forum.creatorName} · {formatTime(forum.createdAt)}</p>
      </article>

      <section className="space-y-3" aria-label="Posting forum">
        <h2 className="flex items-center gap-2 font-bold text-slate-900"><MessageSquare className="h-4 w-4 text-teal-700" /> Percakapan <span className="text-sm font-medium text-slate-400">({posts.length})</span></h2>
        {posts.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Belum ada posting. Mulai diskusi di bawah.</div>
          : posts.map((post) => {
            const parent = post.parentPostId && posts.find((item) => item.id === post.parentPostId);
            return <article key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              {parent && <p className="mb-2 border-l-2 border-teal-300 pl-2 text-xs text-slate-500">Membalas {parent.senderName}: {parent.content}</p>}
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-bold text-slate-800">{post.senderName} <span className="ml-1 text-xs font-medium capitalize text-teal-700">{post.senderRole}</span></p><time className="text-xs text-slate-400">{formatTime(post.createdAt)}</time></div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{post.content}</p>
              <div className="mt-3 border-t border-slate-100 pt-2"><button onClick={() => setReplyTarget(post)} className="text-xs font-semibold text-teal-700 hover:underline">Balas</button></div>
            </article>;
          })}
      </section>

      <form onSubmit={handleSend} className="sticky bottom-3 space-y-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
        {replyTarget && <div className="flex items-center justify-between rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-900"><span>Balas {replyTarget.senderName}: {replyTarget.content.slice(0, 100)}</span><button type="button" onClick={() => setReplyTarget(null)} className="font-bold">Batal</button></div>}
        <div className="flex items-end gap-2"><textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} rows={2} placeholder="Tulis posting atau balasan…" className="min-h-12 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-teal-600" /><button disabled={sending || !content.trim()} className="inline-flex items-center gap-2 rounded-xl bg-[#005b64] px-4 py-3 text-sm font-semibold text-white hover:bg-[#00464d] disabled:opacity-50"><Send className="h-4 w-4" />{sending ? 'Mengirim…' : 'Kirim'}</button></div>
      </form>
    </main>
  );
}
