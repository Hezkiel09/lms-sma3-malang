export default function SiswaPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight sm:text-3xl">
          Data Siswa
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola data induk peserta didik SMAN 3 Malang.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h3 className="text-base font-semibold text-slate-700">Area Slicing Halaman Siswa</h3>
        <p className="mt-1 text-sm text-slate-400">
          Silakan letakkan komponen tabel atau form data siswa Anda di sini.
        </p>
      </div>
    </div>
  );
}
