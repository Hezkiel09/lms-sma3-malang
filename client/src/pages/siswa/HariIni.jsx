import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Radio, Clock, Check, School, FileText, Activity, Info, X, CalendarDays, ChevronRight, TriangleAlert, MessageSquare } from 'lucide-react';
import { todayOpen, todaySubmitted, todayEnded, todayEmpty, todayWeekend, todayEndedNext, todayOver } from '../../mocks/todayMock';

// true  = kartu Alfa tetap tampil sampai akhir hari, walau jam pelajarannya sudah lewat
// false = semua kartu hilang setelah jam pelajaran habis (lihat di Riwayat)
const KEEP_ALFA_UNTIL_END_OF_DAY = true;

// Hanya untuk pengembangan: pilih tampilan lewat ?state=open|submitted|ended|endednext|empty|weekend|over
const MOCKS = {
  open: todayOpen,
  submitted: todaySubmitted,
  ended: todayEnded,
  endednext: todayEndedNext,
  empty: todayEmpty,
  weekend: todayWeekend,
  over: todayOver,
};

const OPT = {
  hadir: { icon: School, desc: 'Saya hadir di sekolah' },
  izin: { icon: FileText, desc: 'Saya izin tidak hadir' },
  sakit: { icon: Activity, desc: 'Saya tidak hadir karena sakit' },
};
const STATE_BADGE = { open: 'Sedang Berlangsung', submitted: 'Presensi Terkirim', ended: 'Sesi Berakhir' };

// Kartu yang jam pelajarannya sudah lewat disembunyikan (kecuali Alfa, kalau diaktifkan di atas)
const isVisible = (card) =>
  !card.lesson_over || (KEEP_ALFA_UNTIL_END_OF_DAY && card.result?.status === 'alpha');

// TODO: arahkan ke /siswa/pesan?guru=<user_id> setelah halaman Pesan dari kelompok lain siap
function HubungiGuru() {
  return <a href="#" onClick={(e) => e.preventDefault()}>Hubungi guru</a>;
}

function HubungiGuruBtn() {
  return <button className="btn" onClick={() => {}}><MessageSquare size={18} /> Hubungi Guru</button>;
}

function SessionCard({ card, onSubmit }) {
  const [choice, setChoice] = useState(null);
  const [notes, setNotes] = useState('');
  const [confirming, setConfirming] = useState(false);

  const needsNotes = choice === 'izin' || choice === 'sakit';
  const chosenLabel = card.options.find((o) => o.value === choice)?.label;

  const send = () => {
    setConfirming(false);
    onSubmit(card.session_id, choice, notes.trim());
  };

  const isAlpha = card.state === 'ended' && card.result?.status === 'alpha';

  const rightText =
    card.state === 'open'
      ? card.remaining_label
      : card.state === 'ended'
        ? `Berakhir pukul ${card.time.end}`
        : `Sesi berakhir pukul ${card.time.end}`;

  return (
    <>
      <div className="card">
        <div className="card-head">
          <span className={`pill ${card.state === 'ended' ? 'gray' : ''}`}>{STATE_BADGE[card.state]}</span>
          <div className="left">
            <h2>{card.subject.name} · Sesi {card.session_number} ({card.time.start} - {card.time.end})</h2>
            <small>{card.teacher.name}</small>
          </div>
          <div className="remain">
            <Clock size={18} />
            {rightText}
          </div>
        </div>

        {card.state === 'open' && card.can_submit && (
          <>
            <div className="opts">
              {card.options.map((o) => {
                const Icon = choice === o.value ? Check : OPT[o.value].icon;
                return (
                  <div key={o.value} className={`opt ${o.value} ${choice === o.value ? 'on' : ''}`}>
                    <div className="top">
                      <span className="dot"><Icon size={20} /></span>
                      <div><b>{o.label}</b><small>{OPT[o.value].desc}</small></div>
                    </div>
                    <button onClick={() => setChoice(o.value)}>
                      {choice === o.value ? `${o.label} dipilih` : `Pilih ${o.label}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {needsNotes && (
              <textarea
                rows={3}
                maxLength={500}
                placeholder="Keterangan (opsional). Contoh: demam, ada acara keluarga"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            )}

            <div className="foot">
              <div className="hint"><Info size={16} /> Pilihan tidak dapat diubah setelah dikirim.</div>
              <button className="btn" disabled={!choice} onClick={() => setConfirming(true)}>Kirim Presensi</button>
            </div>
          </>
        )}

        {card.state === 'submitted' && (
          <div className="res">
            <span className="ic"><Check size={26} /></span>
            <div className="body">
              <b>{card.result.title}</b>
              <p>Dikirim pukul {card.my.time} · Salah mengisi? <HubungiGuru /></p>
            </div>
            <button className="btn" title="Segera hadir">Lihat riwayat <ChevronRight size={16} /></button>
          </div>
        )}

        {card.state === 'ended' && card.result && (
          isAlpha ? (
            <div className="res neutral">
              <span className="ic"><TriangleAlert size={26} /></span>
              <div className="body">
                <b>{card.result.title} <span className="chip">{card.result.badge}</span></b>
                <p>{card.result.message}</p>
                <p className="tiny">{card.result.hint}</p>
              </div>
              <div className="acts">
                <HubungiGuruBtn />
                <button className="btn ghost" title="Segera hadir">Lihat riwayat</button>
              </div>
            </div>
          ) : (
            <div className="res">
              <span className="ic"><Check size={26} /></span>
              <div className="body">
                <b>{card.result.title}</b>
                <p>{card.result.message}</p>
              </div>
              <button className="btn" title="Segera hadir">Lihat riwayat <ChevronRight size={16} /></button>
            </div>
          )
        )}

        {confirming && (
          <div className="overlay">
            <div className="dialog">
              <h3>Kirim presensi "{chosenLabel}"?</h3>
              <p>Presensi tidak dapat diubah setelah dikirim. Kalau salah mengisi, kamu harus menghubungi guru.</p>
              <div className="row">
                <button className="btn ghost" onClick={() => setConfirming(false)}>Batal</button>
                <button className="btn" onClick={send}>Ya, kirim</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {card.state !== 'open' && !isAlpha && (
        <div className="card stats-card">
          <h3>Kehadiran Kelas di {card.subject.name} Hari Ini</h3>
          <p className="sub">Total dari {card.class_summary.total} siswa {card.class_name}.</p>
          <div className="stats">
            <div className="stat hadir"><small>Hadir</small><strong>{card.class_summary.hadir}</strong></div>
            <div className="stat izin"><small>Izin</small><strong>{card.class_summary.izin}</strong></div>
            <div className="stat sakit"><small>Sakit</small><strong>{card.class_summary.sakit}</strong></div>
          </div>
        </div>
      )}
    </>
  );
}

function NextCard({ next, full }) {
  return (
    <div className="next" style={full ? { maxWidth: 'none' } : undefined}>
      <span className="pill">{next.label ?? 'Berikutnya'}</span>
      <div className="info">
        <b>{next.subject.name} · Sesi {next.session_number}</b><br />
        <small>{next.teacher.name}</small>
      </div>
      <span className="time"><Clock size={16} /> {next.time.start} - {next.time.end}</span>
    </div>
  );
}

function EmptyState({ next }) {
  return (
    <div className="empty">
      <div className="big"><CalendarDays size={32} /></div>
      <h2>{next ? 'Tidak ada sesi presensi saat ini' : 'Tidak ada sesi presensi hari ini'}</h2>
      <p>
        {next
          ? 'Formulir presensi akan muncul di sini saat sesi berikutnya dimulai.'
          : 'Tidak ada jadwal pelajaran yang tersisa hari ini, atau hari ini libur. Presensi akan tersedia lagi di hari sekolah berikutnya.'}
      </p>
      {next && <NextCard next={next} />}
      <button className="btn" title="Segera hadir">Lihat riwayat presensi <ChevronRight size={18} /></button>
    </div>
  );
}

export default function HariIni() {
  const [params] = useSearchParams();
  const [data, setData] = useState(MOCKS[params.get('state')] ?? todayOpen);
  const [dismissed, setDismissed] = useState([]);

  // Nanti diganti: POST /attendance-sessions/:id/checkin, lalu muat ulang me/today.
  const handleSubmit = (sessionId, status, notes) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
    setData((d) => ({
      ...d,
      sessions: d.sessions.map((s) => {
        if (s.session_id !== sessionId) return s;
        const label = s.options.find((o) => o.value === status).label;
        return {
          ...s,
          state: 'submitted',
          can_submit: false,
          announcement: null,
          my: { status, label, time, notes },
          result: { title: `Presensi terkirim: ${label}`, message: `Dikirim pukul ${time}. Salah mengisi? Hubungi guru.` },
        };
      }),
    }));
  };

  const visible = data.sessions.filter(isVisible);
  const subtitle = visible.length === 0 ? 'Isi kehadiranmu saat sesi berlangsung.' : data.subtitle;
  const banners = visible.filter((s) => s.announcement && !dismissed.includes(s.session_id));

  return (
    <>
      <h1 className="title">Isi Presensi</h1>
      <p className="subtitle">{subtitle}</p>

      <div className="tabs">
        <button className="tab on">Hari Ini</button>
        <button className="tab" disabled title="Segera hadir">Riwayat per Mapel</button>
      </div>

      {banners.map((s) => (
        <div className="banner" key={s.session_id}>
          <span className="ic"><Radio size={22} /></span>
          <div className="txt"><b>{s.announcement.title}</b><span>{s.announcement.message}</span></div>
          <button onClick={() => setDismissed((x) => [...x, s.session_id])} aria-label="Tutup"><X size={20} /></button>
        </div>
      ))}

      {visible.length === 0 && <EmptyState next={data.next} />}
      {visible.map((s) => (
        <SessionCard key={s.session_id} card={s} onSubmit={handleSubmit} />
      ))}
      {visible.length > 0 && data.next && <NextCard next={data.next} full />}
    </>
  );
}