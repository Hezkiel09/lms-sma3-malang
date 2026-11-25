export const fmt = (n) => (n == null ? '-' : Number(n).toLocaleString('id-ID', { maximumFractionDigits: 1 }));

export const deltaText = (d) => {
  if (d == null) return '';
  if (d > 0) return `Naik ${fmt(d)} poin`;
  if (d < 0) return `Turun ${fmt(Math.abs(d))} poin`;
  return 'Stabil';
};