import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HariIni from './pages/siswa/HariIni'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/siswa/presensi" replace />} />
        <Route path="/siswa/presensi" element={<HariIni />} />
      </Routes>
    </BrowserRouter>
  )
}