// Grafik garis sederhana (SVG) untuk tren lima penilaian terakhir, dengan garis putus-putus KKM.
const W = 1040;
const H = 270;
const X0 = 100;
const X1 = 950;
const TOP = 40;
const BOTTOM = 205; // dasar area plot

export default function TrendChart({ points, kkm }) {
  if (!points?.length) return null;

  const values = points.map((p) => p.value);
  const lo = Math.floor((Math.min(...values, kkm) - 2) / 5) * 5;
  const hi = Math.ceil((Math.max(...values) + 2) / 5) * 5;
  const ticks = [];
  for (let t = lo; t <= hi; t += 5) ticks.push(t);

  const y = (v) => TOP + ((hi - v) / (hi - lo)) * (BOTTOM - TOP);
  const x = (i) => (points.length === 1 ? (X0 + X1) / 2 : X0 + (i * (X1 - X0)) / (points.length - 1));

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');
  const area = `${line} L${x(points.length - 1)},${BOTTOM} L${x(0)},${BOTTOM} Z`;

  return (
    <div className="nl-chart-wrap">
    <svg
      className="nl-chart"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Grafik perkembangan nilai: ${points.map((p) => p.value).join(', ')}`}
    >
      <defs>
        <linearGradient id="nlArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e9bb5" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#0e9bb5" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((t) => (
        <g key={t}>
          <line x1={X0 - 10} x2={X1 + 20} y1={y(t)} y2={y(t)} stroke="#dfe8eb" strokeDasharray="4 5" />
          <text x={X0 - 28} y={y(t) + 4} textAnchor="end" fontSize="12" fill="#6b7a86">{t}</text>
        </g>
      ))}

      <line x1={X0 - 10} x2={X1 + 20} y1={y(kkm)} y2={y(kkm)} stroke="#d99a5b" strokeWidth="1.5" strokeDasharray="6 5" />
      <text x={X1 + 28} y={y(kkm) + 4} textAnchor="start" fontSize="11" fontWeight="700" fill="#c2410c">KKM {kkm}</text>

      <path d={area} fill="url(#nlArea)" />
      <path d={line} fill="none" stroke="#0e9bb5" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.value)} r="8" fill="#fff" stroke="#0e9bb5" strokeWidth="4" />
          <text x={x(i)} y={y(p.value) - 16} textAnchor="middle" fontSize="14" fontWeight="800" fill="#111827">{p.value}</text>
          <text x={x(i)} y={BOTTOM + 40} textAnchor="middle" fontSize="12" fill="#6b7a86">{p.label}</text>
        </g>
      ))}
    </svg>
    </div>
  );
}