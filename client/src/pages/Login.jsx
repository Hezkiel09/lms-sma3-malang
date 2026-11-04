import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { login, logout, getUser, homeFor } from '../services/auth';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../demoAccounts';

const SHOW_DEMO = import.meta.env.VITE_DEMO_LOGIN === 'true';

const css = `
.lg-page{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--soft,#e6f5f9);padding:24px;font-family:inherit}
.lg-wrap{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;width:100%;max-width:900px}
.lg-card{background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:16px;padding:28px;flex:1 1 340px;max-width:420px;box-shadow:0 8px 30px rgba(11,85,102,.08)}
.lg-logo{height:36px;margin-bottom:18px}
.lg-card h1{margin:0 0 4px;font-size:22px;color:var(--text,#111827)}
.lg-card p{margin:0 0 18px;color:var(--muted,#6b7280);font-size:14px}
.lg-card label{display:block;font-size:13px;font-weight:600;margin:12px 0 6px;color:var(--text,#111827)}
.lg-card input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid var(--line,#e5e7eb);border-radius:10px;font-size:14px}
.lg-card input:focus{outline:2px solid var(--accent,#0e9bb5);border-color:transparent}
.lg-btn{margin-top:18px;width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;border:0;border-radius:10px;background:var(--primary,#0b5566);color:#fff;font-size:15px;font-weight:600;cursor:pointer}
.lg-btn:disabled{opacity:.6;cursor:default}
.lg-err{margin-top:14px;padding:10px 12px;border-radius:10px;background:#fef2f2;color:#b91c1c;font-size:13px}
.lg-demo h2{margin:0 0 4px;font-size:16px}
.lg-demo small{color:var(--muted,#6b7280)}
.lg-grp{margin:14px 0 6px;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--accent,#0e9bb5)}
.lg-acc{display:block;width:100%;text-align:left;padding:9px 12px;margin-bottom:6px;border:1px solid var(--line,#e5e7eb);border-radius:10px;background:#fff;cursor:pointer}
.lg-acc:hover{border-color:var(--accent,#0e9bb5);background:var(--soft,#e6f5f9)}
.lg-acc b{display:block;font-size:14px;color:var(--text,#111827)}
.lg-acc span{font-size:12px;color:var(--muted,#6b7280)}
`;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const user = getUser();
  if (user && homeFor(user.role)) return <Navigate to={homeFor(user.role)} replace />;

  const submit = async (addr, pass) => {
    setError('');
    setLoading(true);
    try {
      const me = await login(addr, pass);
      const home = homeFor(me.role);
      if (!home) {
        setError(`Akun ${me.role} belum punya halaman di aplikasi ini.`);
        await logout();
        return;
      }
      navigate(home, { replace: true });
    } catch (e) {
      setError(e.message || 'Gagal masuk');
    } finally {
      setLoading(false);
    }
  };

  const groups = ['Guru', 'Siswa', 'Orang Tua'];

  return (
    <div className="lg-page">
      <style>{css}</style>
      <div className="lg-wrap">
        <form className="lg-card" onSubmit={(e) => { e.preventDefault(); submit(email, password); }}>
          <img className="lg-logo" src="/logo.svg" alt="SMANTI Connect" />
          <h1>Masuk</h1>
          <p>Gunakan akun sekolah kamu.</p>
          <label htmlFor="lg-email">Email</label>
          <input id="lg-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="lg-pass">Kata sandi</label>
          <input id="lg-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <div className="lg-err">{error}</div>}
          <button className="lg-btn" type="submit" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        {SHOW_DEMO && (
          <div className="lg-card lg-demo">
            <h2>Masuk cepat (mode demo)</h2>
            <small>Klik salah satu akun. Kata sandi: {DEMO_PASSWORD}</small>
            {groups.map((g) => (
              <div key={g}>
                <div className="lg-grp">{g}</div>
                {DEMO_ACCOUNTS.filter((a) => a.role === g).map((a) => (
                  <button key={a.email} type="button" className="lg-acc" disabled={loading} onClick={() => submit(a.email, DEMO_PASSWORD)}>
                    <b>{a.name}</b>
                    <span>{a.info}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
