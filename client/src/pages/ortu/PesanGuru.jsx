import { useEffect, useRef, useState } from 'react';
import { Search, Info, Paperclip, Send, X, FileText, BookOpen, Users } from 'lucide-react';
import { pesanMock } from '../../mocks/pesanMock';

const MAX_FILE = 5 * 1024 * 1024; // 5 MB (sementara, sesuaikan dengan backend Pesan)

const nowLabel = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');

const sizeLabel = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

function Avatar({ initials, online, large }) {
  return (
    <span className={`ch-av ${large ? 'lg' : ''}`}>
      {initials}
      {online && <i className="ch-online" />}
    </span>
  );
}

export default function PesanGuru() {
  // Nanti diganti: daftar guru + percakapan dari backend (modul Pesan)
  const [convs, setConvs] = useState(pesanMock);
  const [activeId, setActiveId] = useState(pesanMock[0].id);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const infoRef = useRef(null);

  const active = convs.find((c) => c.id === activeId);
  const totalUnread = convs.reduce((n, c) => n + c.unread, 0);
  const list = convs.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [activeId, active?.messages.length]);

  // Tutup panel info kalau klik di luar atau tekan Esc
  useEffect(() => {
    const onClick = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) setInfoOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setInfoOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const open = (id) => {
    setActiveId(id);
    setInfoOpen(false);
    setDraft('');
    setFiles([]);
    setFileError('');
    setConvs((arr) => arr.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  };

  const pickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = ''; // supaya file yang sama bisa dipilih lagi
    const tooBig = picked.find((f) => f.size > MAX_FILE);
    setFileError(tooBig ? `"${tooBig.name}" lebih dari 5 MB.` : '');
    const ok = picked.filter((f) => f.size <= MAX_FILE).map((f) => ({ name: f.name, size: f.size }));
    setFiles((prev) => [...prev, ...ok].slice(0, 5));
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const canSend = draft.trim() || files.length > 0;
  
  const send = () => {
    if (!canSend) return;
    const time = nowLabel();
    // TODO: kirim teks + lampiran ke backend modul Pesan (upload file)
    const msg = { id: `m${Date.now()}`, from: 'me', time, text: draft.trim(), files };
    setConvs((arr) => {
      const target = arr.find((c) => c.id === activeId);
      const updated = { ...target, last_time: time, messages: [...target.messages, msg] };
      return [updated, ...arr.filter((c) => c.id !== activeId)];
    });
    setDraft('');
    setFiles([]);
    setFileError('');
  };

  const previewOf = (c) => {
    const last = c.messages[c.messages.length - 1];
    if (!last) return <em className="ch-none-msg">Belum ada pesan</em>;
    return last.text || `Lampiran: ${last.files?.[0]?.name ?? ''}`;
  };

  return (
    <>
      <h1 className="title">Chat dengan Guru</h1>
      <p className="subtitle">Komunikasikan perkembangan dan kebutuhan belajar anak.</p>

      <div className="ch-card">
        <aside className="ch-side">
          <div className="ch-side-head">
            <b>Pesan</b>
            <small>{totalUnread > 0 ? `${totalUnread} pesan belum dibaca` : 'Semua pesan sudah dibaca'}</small>
            <label className="ch-search">
              <Search size={16} />
              <input placeholder="Cari guru..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
          </div>

          <div className="ch-list">
            {list.length === 0 && <p className="ch-none">Guru tidak ditemukan.</p>}
            {list.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`ch-conv ${c.id === activeId ? 'on' : ''}`}
                onClick={() => open(c.id)}
              >
                <Avatar initials={c.initials} online={c.online} />
                <span className="ch-conv-body">
                  <span className="ch-conv-top">
                    <b>{c.name}</b>
                    <small>{c.last_time}</small>
                  </span>
                  <span className="ch-conv-role">{c.role}</span>
                  <span className="ch-conv-prev">
                    <span>{previewOf(c)}</span>
                    {c.unread > 0 && <i className="ch-badge">{c.unread}</i>}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </aside>

        <section className="ch-main">
          {active && (
            <>
              <header className="ch-head">
                <Avatar initials={active.initials} online={active.online} />
                <div>
                  <b>{active.name}</b>
                  <small>{active.online ? 'Aktif Sekarang' : 'Tidak aktif'}</small>
                </div>

                <div className="ch-info-wrap" ref={infoRef}>
                  <button
                    type="button"
                    className={`ch-info ${infoOpen ? 'on' : ''}`}
                    aria-label="Info guru"
                    aria-expanded={infoOpen}
                    onClick={() => setInfoOpen((v) => !v)}
                  >
                    <Info size={18} />
                  </button>

                  {infoOpen && (
                    <div className="ch-infobox">
                      <div className="ch-infobox-top">
                        <Avatar initials={active.initials} online={active.online} large />
                        <b>{active.name}</b>
                        <small>{active.online ? 'Aktif Sekarang' : 'Tidak aktif'}</small>
                      </div>
                      <div className="ch-infobox-row">
                        <BookOpen size={16} />
                        <span><small>Peran</small>{active.role}</span>
                      </div>
                      <div className="ch-infobox-row">
                        <FileText size={16} />
                        <span><small>Mata pelajaran</small>{active.subject}</span>
                      </div>
                      <div className="ch-infobox-row">
                        <Users size={16} />
                        <span><small>Mengajar di kelas</small>{active.class_name}</span>
                      </div>
                    </div>
                  )}
                </div>
              </header>

              <div className="ch-msgs">
                {active.messages.length === 0 ? (
                  <div className="ch-empty">
                    <Avatar initials={active.initials} online={active.online} large />
                    <b>Belum ada percakapan</b>
                    <p>Mulai dengan menyapa {active.name}. Pesanmu akan muncul di sini.</p>
                  </div>
                ) : (
                  <div className="ch-day"><span>Hari ini</span></div>
                )}

                {active.messages.map((m) => (
                  <div key={m.id} className={`ch-bubble ${m.from === 'me' ? 'me' : 'them'}`}>
                    {m.text && <p>{m.text}</p>}
                    {m.files?.map((f, i) => (
                      <div className="ch-file" key={i}>
                        <FileText size={16} />
                        <span>{f.name}<small>{sizeLabel(f.size)}</small></span>
                      </div>
                    ))}
                    <small>{m.time}</small>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <footer className="ch-compose-wrap">
                {(files.length > 0 || fileError) && (
                  <div className="ch-attach">
                    {files.map((f, i) => (
                      <span className="ch-chip" key={i}>
                        <FileText size={14} />
                        {f.name}
                        <button type="button" onClick={() => removeFile(i)} aria-label={`Hapus ${f.name}`}><X size={14} /></button>
                      </span>
                    ))}
                    {fileError && <span className="ch-ferr">{fileError}</span>}
                  </div>
                )}
                <div className="ch-compose">
                  <input ref={fileRef} type="file" multiple hidden onChange={pickFiles} />
                  <button type="button" className="ch-clip" aria-label="Lampirkan file" onClick={() => fileRef.current?.click()}>
                    <Paperclip size={20} />
                  </button>
                  <input
                    className="ch-text"
                    placeholder="Tulis pesan..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && send()}
                  />
                  <button type="button" className="ch-send" onClick={send} disabled={!canSend} aria-label="Kirim">
                    <Send size={20} />
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </>
  );
}