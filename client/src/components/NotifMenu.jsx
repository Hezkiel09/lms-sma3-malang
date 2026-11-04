import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, Lock, Radio } from 'lucide-react';
import { presensiSiswaApi as api } from '../services/presensiSiswaApi';
import { getUser } from '../services/auth';

const ICON = {
  closed: { icon: Lock, cls: 'closed' },
  open: { icon: Radio, cls: 'open' },
  reminder: { icon: BellRing, cls: 'reminder' },
};

const GROUPS = [
  { key: 'today', label: 'HARI INI' },
  { key: 'earlier', label: 'SEBELUMNYA' },
];

const SOURCE_API = import.meta.env.VITE_PRESENSI_SOURCE === 'api';

function mapNotif(n, role) {
  const d = n.data ?? {};
  let action = null;
  if (d.action === 'isi_presensi') action = { label: 'Isi presensi', to: '/siswa/presensi' };
  else if (d.action === 'lihat_riwayat') {
    action = role === 'parent'
      ? { label: 'Lihat riwayat', to: `/ortu/presensi?anak=${d.studentId ?? ''}` }
      : { label: 'Lihat riwayat', to: '/siswa/presensi/riwayat' };
  }
  // 'hubungi_guru' sengaja tanpa aksi sampai fitur Pesan ada
  return {
    id: n.id,
    group: n.group,
    time_label: n.time_label,
    title: n.title,
    body: n.message,
    read: n.is_read,
    type: n.title?.startsWith('Pengingat') ? 'reminder' : d.action === 'isi_presensi' ? 'open' : 'closed',
    action,
  };
}

export default function NotifMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'unread'
    const role = getUser()?.role;
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!SOURCE_API) return;
    let alive = true;
    const load = () =>
      api.listNotifications()
        .then((d) => alive && setItems((d.notifications ?? []).map((n) => mapNotif(n, role))))
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => { alive = false; clearInterval(t); };
  }, [role]);

  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const shown = tab === 'unread' ? items.filter((n) => !n.read) : items;

  // TODO: panggil endpoint "tandai dibaca" di backend
  const markOne = (id) => {
    const n = items.find((x) => x.id === id);
    if (!n || n.read) return;
    setItems((arr) => arr.map((x) => (x.id === id ? { ...x, read: true } : x)));
    if (SOURCE_API) api.markNotificationRead(id).catch(() => {});
  };
  const markAll = () => {
    setItems((arr) => arr.map((x) => ({ ...x, read: true })));
    if (SOURCE_API) api.markAllNotificationsRead().catch(() => {});
  };

  const runAction = (e, n) => {
    e.stopPropagation();
    markOne(n.id);
    if (n.action?.to) {
      navigate(n.action.to);
      setOpen(false);
    }
    // TODO: "Hubungi guru" nanti diarahkan ke tab Pesan (kelompok lain)
  };

  return (
    <div className="nf-wrap" ref={ref}>
      <button
        type="button"
        className="tb-bell"
        aria-label="Notifikasi"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={20} />
        {unread > 0 && <span className="tb-badge">{unread}</span>}
      </button>

      {open && (
        <div className="nf-menu">
          <div className="nf-head">
            <h3>Notifikasi</h3>
            {unread > 0 && (
              <button type="button" className="nf-all" onClick={markAll}>Tandai semua dibaca</button>
            )}
          </div>

          <div className="nf-tabs">
            <button type="button" className={tab === 'all' ? 'on' : ''} onClick={() => setTab('all')}>
              Semua {items.length}
            </button>
            <button type="button" className={tab === 'unread' ? 'on' : ''} onClick={() => setTab('unread')}>
              Belum dibaca {unread}
            </button>
          </div>

          <div className="nf-list">
            {shown.length === 0 && (
              <p className="nf-empty">
                {tab === 'unread' ? 'Semua notifikasi sudah dibaca.' : 'Belum ada notifikasi.'}
              </p>
            )}

            {GROUPS.map(({ key, label }) => {
              const rows = shown.filter((n) => n.group === key);
              if (rows.length === 0) return null;
              return (
                <section key={key} className={`nf-group ${key}`}>
                  <div className="nf-glabel">{label}</div>
                  {rows.map((n) => {
                    const { icon: Icon, cls } = ICON[n.type] ?? ICON.open;
                    return (
                      <div
                        key={n.id}
                        className={`nf-item ${n.read ? '' : 'unread'}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => markOne(n.id)}
                        onKeyDown={(e) => e.key === 'Enter' && markOne(n.id)}
                      >
                        <span className={`nf-ico ${cls}`}><Icon size={20} /></span>
                        <div className="nf-body">
                          <div className="nf-top">
                            <b>{n.title}</b>
                            <small>{n.time_label}</small>
                          </div>
                          <p>{n.body}</p>
                          {n.action && (
                            <button type="button" className="nf-act" onClick={(e) => runAction(e, n)}>
                              {n.action.label}
                            </button>
                          )}
                        </div>
                        <span className="nf-dotcol">{!n.read && <i className="nf-dot" />}</span>
                      </div>
                    );
                  })}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}