import { useState } from 'react'
import { todayMock } from '../../mocks/todayMock'

export default function HariIni() {
  const data = todayMock
  const [pilihan, setPilihan] = useState(null)

  return (
    <main style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Isi Presensi</h1>
      <p>{data.date_label} · {data.subtitle}</p>
      {data.sessions.map((s) => (
        <section key={s.session_id} style={{ border: '1px solid #ccc', borderRadius: 16, padding: 24 }}>
          <h2>{s.subject.name} · Sesi {s.session_number} ({s.time.start} - {s.time.end})</h2>
          <p>{s.teacher.name} · Sisa {s.remaining_label}</p>
          {s.options.map((o) => (
            <button
              key={o.value}
              onClick={() => setPilihan(o.value)}
              aria-pressed={pilihan === o.value}
              style={{ marginRight: 8, fontWeight: pilihan === o.value ? 'bold' : 'normal' }}
            >
              {o.label}
            </button>
          ))}
          <div style={{ marginTop: 16 }}>
            <button disabled={!pilihan}>Kirim Presensi</button>
          </div>
        </section>
      ))}
    </main>
  )
}