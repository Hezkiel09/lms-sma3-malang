export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#008994] to-[#007682] p-6 sm:p-8 text-white shadow-sm">
      {/* Abstract decorative watermarks matching Figma */}
      <div className="pointer-events-none absolute -right-10 -bottom-24 h-72 w-72 rounded-full border-[28px] border-white/10" />
      <div className="pointer-events-none absolute right-32 -top-16 h-56 w-56 rounded-full border-[24px] border-white/10" />

      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-cyan-100 tracking-wide">
            Senin, 18 November 2024
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Selamat pagi, Pak Ahmad!
          </h1>
          <p className="text-xs sm:text-sm text-cyan-50/90 leading-relaxed">
            Seluruh layanan berjalan normal. Ada 4 data presensi yang perlu ditinjau hari ini.
          </p>
        </div>

        <div>
          <button className="whitespace-nowrap rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#008994] shadow-md hover:bg-slate-50 transition-all active:scale-95">
            Tinjau sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
