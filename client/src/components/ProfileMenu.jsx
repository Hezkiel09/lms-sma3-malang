import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/auth';
import { ChevronDown, User, Lock, Bell, CircleHelp, LogOut } from 'lucide-react';

const ITEMS = [
  { key: 'profil', label: 'Profil saya', icon: User },
  { key: 'sandi', label: 'Ubah kata sandi', icon: Lock },
  { key: 'notif', label: 'Notifikasi', icon: Bell },
  { key: 'bantuan', label: 'Bantuan', icon: CircleHelp },
];

function Avatar({ initial, large }) {
  const [broken, setBroken] = useState(false);
  return (
    <span className={`pf-av ${large ? 'lg' : ''}`}>
      {broken ? initial : (
        <img src="/avatar.png" alt="" onError={() => setBroken(true)} />
      )}
    </span>
  );
}

export default function ProfileMenu({ student }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  const fullName = student?.name ?? 'Karina Anindya';
  const firstName = fullName.split(' ')[0];
  const initial = fullName.charAt(0).toUpperCase();
  const kelas = student?.class_name ?? 'X-A';
  const nis = student?.nis ?? '10246';
  const avatarSrc = student?.avatar_url ?? '/avatar.png';

  return (
    <div className="pf-wrap" ref={ref}>
      <button
        type="button"
        className={`pf-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar src={avatarSrc} initial={initial} />
        <span className="pf-info">
          <b>{firstName}</b>
          <small>Siswa · Kelas {kelas}</small>
        </span>
        <ChevronDown size={18} className={`pf-chev ${open ? 'up' : ''}`} />
      </button>

      {open && (
        <div className="pf-menu" role="menu">
          <div className="pf-head">
            <Avatar src={avatarSrc} initial={initial} large />
            <div>
              <b>{fullName}</b>
              <small>Siswa · Kelas {kelas}</small>
              <small>NIS {nis}</small>
            </div>
          </div>

          <div className="pf-list">
            {ITEMS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="menuitem"
                className="pf-item"
                onClick={() => setOpen(false)} // TODO: navigate ke halaman terkait
              >
                <span className="pf-ico"><Icon size={18} /></span>
                {label}
              </button>
            ))}
          </div>

          <div className="pf-sep" />

          <div className="pf-list">
            <button
              type="button"
              role="menuitem"
              className="pf-item danger"
              onClick={async () => {
                setOpen(false);
                await logout();
                navigate('/login', { replace: true });
              }}
            >
              <span className="pf-ico"><LogOut size={18} /></span>
              Keluar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}