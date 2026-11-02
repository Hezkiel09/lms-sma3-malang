import { NavLink } from 'react-router-dom';

export default function PresensiTabs({ right }) {
  const cls = ({ isActive }) => `tab ${isActive ? 'on' : ''}`;
  return (
    <div className="tabs-row">
      <div className="tabs">
        <NavLink to="/siswa/presensi" end className={cls}>Hari Ini</NavLink>
        <NavLink to="/siswa/presensi/riwayat" className={cls}>Riwayat per Mapel</NavLink>
      </div>
      {right}
    </div>
  );
}