import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing, Lock, Radio } from 'lucide-react';
import { notifMock } from '../mocks/notifMock';

const ICON = {
  closed: { icon: Lock, cls: 'closed' },
  open: { icon: Radio, cls: 'open' },
  reminder: { icon: BellRing, cls: 'reminder' },
};

const GROUPS = [
  { key: 'today', label: 'HARI INI' },
  { key: 'earlier', label: 'SEBELUMNYA' },
];

export default function NotifMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all'); // 'all' | 'unread'
  const [items, setItems] = useState(notifMock);
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
  const markOne = (id) => setItems((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAll = () => setItems((arr) => arr.map((n) => ({ ...n, read: true })));

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