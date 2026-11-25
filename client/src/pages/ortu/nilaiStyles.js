export const nilaiCss = `
.nl-page { padding-bottom: 40px; color: #172b38; }
.nl-title { font-size: 28px; font-weight: 800; margin: 0 0 12px; }
.nl-sub { color: #738493; font-size: 17px; margin: 0 0 28px; }

.nl-crumb { display: flex; align-items: center; gap: 8px; color: #008faa; font-size: 13px; margin-bottom: 8px; }
.nl-crumb a { color: #008faa; text-decoration: none; }
.nl-crumb a:hover { text-decoration: underline; }
.nl-crumb span { color: #738493; }

.nl-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; margin-bottom: 32px; }
.nl-stat { background: #fff; border-radius: 20px; padding: 26px 24px; box-shadow: 0 2px 14px rgba(11, 85, 102, .10); }
.nl-stat > small { display: block; color: #6b7a86; font-size: 14px; margin-bottom: 14px; }
.nl-stat-val { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.nl-stat-val b { font-size: 34px; font-weight: 700; line-height: 1; color: #111827; }
.nl-stat-val em { font-style: normal; font-size: 13px; color: #738493; }
.nl-stat-val em.up { color: #0b7a55; }
.nl-stat-val em.down { color: #c2410c; }

.nl-panel { background: #fff; border-radius: 22px; padding: 28px 30px; margin-bottom: 32px; box-shadow: 0 2px 14px rgba(11, 85, 102, .10); }
.nl-panel-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
.nl-panel h2 { margin: 0 0 6px; font-size: 24px; font-weight: 700; }
.nl-panel p { margin: 0; color: #738493; font-size: 14px; }

.nl-badge { display: inline-flex; align-items: center; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; white-space: nowrap; }
.nl-badge.ok { background: #e3f5ee; color: #0b7a55; }
.nl-badge.warn { background: #fdecd9; color: #c2410c; }

.nl-chart-wrap { overflow-x: auto; }
.nl-chart { width: 100%; height: auto; display: block; }
.nl-chart text { font-family: inherit; }

.nl-tbl-wrap { overflow-x: auto; border: 2px solid #cfe7ee; border-radius: 18px; margin-top: 8px; }
.nl-tbl { min-width: 720px; }
.nl-tr { display: grid; align-items: center; column-gap: 12px; padding: 0 22px; }
.nl-tr.detail { grid-template-columns: 120px 110px minmax(160px, 1fr) 90px 140px 130px; }
.nl-tr.list { grid-template-columns: minmax(220px, 1.6fr) 110px 110px 110px 120px 150px; }
.nl-th { background: #f1f7f9; height: 48px; font-size: 11px; font-weight: 700; letter-spacing: .04em; color: #5a6b77; border-bottom: 1px solid #d6e8ee; }
.nl-tb { min-height: 62px; font-size: 14px; border-bottom: 1px solid #d6e8ee; }
.nl-tb:last-child { border-bottom: 0; }
.nl-muted { color: #738493; }
.nl-score { color: #0b8aa3; font-weight: 800; font-size: 16px; }
.nl-score.low { color: #c2410c; }
.nl-topic { font-weight: 700; }

.nl-type { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 700; }
.nl-type.kuis { background: #e4eefc; color: #3566c4; }
.nl-type.tugas { background: #def2f6; color: #0e8aa3; }
.nl-type.ulangan { background: #fdecd9; color: #d9772a; }

.nl-status { display: inline-flex; align-items: center; gap: 7px; padding: 6px 14px; border-radius: 999px; font-size: 12px; font-weight: 700; }
.nl-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.nl-status.tuntas { background: #e3f5ee; color: #0b7a55; }
.nl-status.remedial { background: #fdecd9; color: #c2410c; }

.nl-subj { display: flex; align-items: center; gap: 14px; padding: 12px 0; }
.nl-subj-ico { width: 42px; height: 42px; border-radius: 12px; background: #e6f5f9; color: #0b7c93; display: grid; place-items: center; flex-shrink: 0; }
.nl-subj b { display: block; font-size: 15px; }
.nl-subj small { display: block; color: #738493; font-size: 12px; }
.nl-subj a { display: inline-flex; align-items: center; gap: 2px; margin-top: 2px; color: #008faa; font-weight: 700; font-size: 12px; text-decoration: none; }
.nl-subj a:hover { text-decoration: underline; }
.nl-delta.up { color: #0b7a55; font-weight: 700; }
.nl-delta.down { color: #c2410c; font-weight: 700; }

.nl-empty { color: #738493; text-align: center; padding: 40px 0; }

@media (max-width: 1100px) {
  .nl-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
}
@media (max-width: 640px) {
  .nl-chart { min-width: 600px; }
  .nl-stats { grid-template-columns: 1fr; }
  .nl-panel { padding: 22px 18px; }
  .nl-title { font-size: 24px; }
  .nl-sub { font-size: 15px; }
  .nl-panel-head { flex-direction: column; }
}
`;