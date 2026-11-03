import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Info,
  Check,
  X,
} from 'lucide-react';
import { mockBankSoalPilihan } from '../../data/mockKuis';

export default function AmbilDariBankSoalPage() {
  const navigate = useNavigate();

  // Dropdowns source selection
  const [selectedKelas, setSelectedKelas] = useState('Kelas XI');
  const [selectedMapel, setSelectedMapel] = useState('Matematika');
  const [selectedMateri, setSelectedMateri] = useState('Komposisi & invers');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJenisSoal, setSelectedJenisSoal] = useState('Semua jenis');

  // Selected questions checkbox state
  const [items, setItems] = useState(mockBankSoalPilihan);
  const [previewItem, setPreviewItem] = useState(null);

  // Toggle single item
  const handleToggle = (id) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Toggle select all
  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const handleToggleAll = () => {
    const nextState = !allSelected;
    setItems((prev) => prev.map((i) => ({ ...i, selected: nextState })));
  };

  // Selected count
  const selectedCount = items.filter((i) => i.selected).length;

  const handleTambahkanKeKuis = () => {
    // Navigate to Buat Kuis with addedFromBank = true
    navigate('/guru/buat-kuis', { state: { addedFromBank: true } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <Link to="/guru/beranda" className="hover:text-slate-600">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link to="/guru/buat-kuis" className="hover:text-slate-600">
          Buat Kuis
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-[#005b64] font-semibold">Ambil dari Bank Soal</span>
      </nav>

      {/* 2. Header Title & Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
            Pilih Soal dari Bank Soal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Pilih soal yang ingin ditambahkan ke kuis yang sedang Anda buat.
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/guru/buat-kuis')}
            className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
          >
            Kembali ke Kuis
          </button>
        </div>
      </div>

      {/* 3. Card 1: Pilih Sumber Bank Soal */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-slate-800">
            Pilih sumber Bank Soal
          </h2>
          <span className="text-xs text-slate-400">
            Kelas &rarr; Mata pelajaran &rarr; Materi
          </span>
        </div>

        {/* 3 Dropdown Filters: Kelas, Mata Pelajaran, Materi */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Kelas */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Kelas
            </label>
            <div className="relative">
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                <option value="Kelas X">Kelas X</option>
                <option value="Kelas XI">Kelas XI</option>
                <option value="Kelas XII">Kelas XII</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Mata Pelajaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mata pelajaran
            </label>
            <div className="relative">
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                <option value="Matematika">Matematika</option>
                <option value="Fisika">Fisika</option>
                <option value="Kimia">Kimia</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Materi */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Materi
            </label>
            <div className="relative">
              <select
                value={selectedMateri}
                onChange={(e) => setSelectedMateri(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 pr-9 text-xs sm:text-sm font-medium text-slate-800 focus:border-[#004d57] focus:outline-none"
              >
                <option value="Komposisi & invers">Komposisi &amp; invers</option>
                <option value="Persamaan kuadrat">Persamaan kuadrat</option>
                <option value="Peluang">Peluang</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 pt-1">
          Daftar hanya menampilkan soal dari {selectedKelas} sesuai mata pelajaran dan materi yang dipilih.
        </p>
      </div>

      {/* 4. Card 2: Soal Komposisi & Invers (Checklist Soal) */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Soal {selectedMateri}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {items.length} soal tersedia untuk ditambahkan ke kuis.
            </p>
          </div>
          <span className="rounded-full bg-[#e6f7f8] px-3.5 py-1 text-xs font-semibold text-[#005b64]">
            {selectedKelas} • {selectedMapel}
          </span>
        </div>

        {/* Filter Bar: Cari & Jenis Soal */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pertanyaan dalam materi ini..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:border-[#004d57] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="relative w-full sm:w-48">
            <select
              value={selectedJenisSoal}
              onChange={(e) => setSelectedJenisSoal(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-9 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-[#004d57] focus:outline-none"
            >
              <option value="Semua jenis">Semua jenis</option>
              <option value="Pilihan Ganda">Pilihan Ganda</option>
              <option value="Benar / Salah">Benar / Salah</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Select All Row */}
        <div className="flex items-center justify-between border-y border-slate-100 py-3 text-xs">
          <label className="flex items-center gap-2.5 font-bold text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleToggleAll}
              className="h-4 w-4 rounded accent-[#004d57]"
            />
            <span>Pilih semua ({items.length} soal)</span>
          </label>
          <span className="text-slate-400">
            Menampilkan {items.length} dari {items.length} soal
          </span>
        </div>

        {/* Question Cards List */}
        <div className="space-y-3.5">
          {items.map((q) => (
            <div
              key={q.id}
              onClick={() => handleToggle(q.id)}
              className={`flex items-start gap-4 rounded-2xl border p-4 transition-all cursor-pointer select-none ${
                q.selected
                  ? 'border-cyan-200 bg-cyan-50/20 shadow-2xs'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              }`}
            >
              {/* Checkbox */}
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={q.selected}
                  onChange={() => {}} // handled by parent onClick
                  className="h-4 w-4 rounded accent-[#004d57]"
                />
              </div>

              {/* Question Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#e0f7fa] px-2 py-0.5 text-xs font-semibold text-[#006064]">
                      {q.tipe}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {q.metode} • {q.tanggal}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                  {q.pertanyaan}
                </p>

                <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-400">
                    <div>{q.tag}</div>
                    <div className="font-semibold text-slate-700 mt-0.5">
                      Kunci jawaban: {q.kunciJawaban}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewItem(q);
                    }}
                    className="rounded-xl bg-[#e6f7f8] px-4 py-1.5 text-xs font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
                  >
                    Pratinjau
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Bottom Floating/Sticky Card */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {selectedCount} soal dipilih
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              40 soal saat ini + {selectedCount} soal pilihan = {40 + selectedCount} soal
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/guru/buat-kuis')}
              className="rounded-xl bg-[#e6f7f8] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#005b64] hover:bg-[#d5f0f2] transition-colors"
            >
              Batal
            </button>

            <button
              onClick={handleTambahkanKeKuis}
              disabled={selectedCount === 0}
              className="rounded-xl bg-[#004d57] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#003c44] shadow-xs transition-colors disabled:opacity-50"
            >
              Tambahkan {selectedCount} Soal ke Kuis
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1 border-t border-slate-50">
          <Info className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <span>Soal disalin ke kuis. Soal pada Bank Soal sumber tidak berubah.</span>
        </div>
      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="rounded-lg bg-[#e0f7fa] px-2.5 py-1 text-xs font-semibold text-[#006064]">
                Pratinjau Soal • {previewItem.tipe}
              </span>
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                {previewItem.pertanyaan}
              </p>
              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Kunci Jawaban: </span>
                {previewItem.kunciJawaban}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewItem(null)}
                className="rounded-xl bg-[#004d57] px-5 py-2 text-xs font-semibold text-white hover:bg-[#003c44]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
