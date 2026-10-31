import React, { useState } from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  LogOut, 
  Search, 
  Bell, 
  BookOpen, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight,
  Pencil, 
  MoreHorizontal, 
  Plus, 
  ArrowLeft,
  X,
  ClipboardList,
  ExternalLink,
  File,
  FileCode,
  Edit2,
  HelpCircle,
  Check,
  FolderPlus,
  Link as LinkIcon,
  Save
} from 'lucide-react';
import logoSmanti from '../../../assets/Logo.png';
import TambahMateri from './TambahMateri';
import EditFileGuru from './EditFileGuru';
import EditAssignmentGuru from './EditAssignmentGuru';
import TambahAssignmentGuru from './TambahAssignmentGuru';

const KelolaCourseGuru = ({ onKembali }) => {
  const [subHalaman, setSubHalaman] = useState(null); 
  const [showModalAktivitas, setShowModalAktivitas] = useState(false);
  const [pilihanAktivitas, setPilihanAktivitas] = useState('Tugas');
  const [activePopover, setActivePopover] = useState(null); 

  // State Form Tambah Link (URL) Khusus
  const [linkJudul, setLinkJudul] = useState('');
  const [linkURL, setLinkURL] = useState('');
  const [linkDeskripsi, setLinkDeskripsi] = useState('');

  // State Daftar Bab & Sub-bagian
  const [daftarBab, setDaftarBab] = useState([
    { 
      id: 1, 
      judul: 'Persamaan Garis Lurus', 
      isOpen: true, 
      type: 'file', 
      namaFile: 'Garis Lurus.pdf', 
      ukuran: '2.4 MB',
      subBagian: [
        { id: 101, judul: 'Sub-bagian Baru' }
      ]
    },
    { 
      id: 2, 
      judul: 'Fungsi Kuadrat', 
      isOpen: false, 
      type: 'file', 
      namaFile: 'Fungsi Kuadrat.pdf', 
      ukuran: '1.8 MB',
      subBagian: []
    },
    { 
      id: 3, 
      judul: 'Sistem Persamaan Linear', 
      isOpen: true, 
      type: 'tugas', 
      namaTugas: 'Latihan Mandiri: Grafik Parabola',
      subBagian: []
    },
    { id: 4, judul: 'Logaritma', isOpen: false, type: 'file', namaFile: 'Logaritma.pdf', ukuran: '2.1 MB', subBagian: [] },
    { id: 5, judul: 'Trigonometri', isOpen: false, type: 'file', namaFile: 'Trigonometri.pdf', ukuran: '3.0 MB', subBagian: [] },
  ]);

  // State Form Tambah Bab Utama
  const [isAddingBab, setIsAddingBab] = useState(false);
  const [newBabTitle, setNewBabTitle] = useState('');

  // State Input Tambah Sub-bagian per Bab ID
  const [addingSubBabId, setAddingSubBabId] = useState(null);
  const [newSubBabTitle, setNewSubBabTitle] = useState('');

  // State Edit Judul Bab Utama Inline (Pulpen)
  const [editingBabId, setEditingBabId] = useState(null);
  const [tempJudul, setTempJudul] = useState('');

  // State Edit Judul Sub-bagian Inline (Pulpen)
  const [editingSubId, setEditingSubId] = useState(null);
  const [tempSubJudul, setTempSubJudul] = useState('');

  const handleStartEditJudul = (id, currentTitle, e) => {
    if (e) e.stopPropagation();
    setEditingBabId(id);
    setTempJudul(currentTitle);
  };

  const handleSaveEditJudul = (id) => {
    if (tempJudul.trim() !== '') {
      setDaftarBab(prev => prev.map(bab => bab.id === id ? { ...bab, judul: tempJudul } : bab));
    }
    setEditingBabId(null);
  };

  const handleStartEditSub = (subId, currentTitle, e) => {
    if (e) e.stopPropagation();
    setEditingSubId(subId);
    setTempSubJudul(currentTitle);
  };

  const handleSaveEditSub = (babId, subId) => {
    if (tempSubJudul.trim() !== '') {
      setDaftarBab(prev => prev.map(bab => {
        if (bab.id === babId) {
          return {
            ...bab,
            subBagian: bab.subBagian.map(sub => sub.id === subId ? { ...sub, judul: tempSubJudul } : sub)
          };
        }
        return bab;
      }));
    }
    setEditingSubId(null);
  };

  const toggleBab = (id) => {
    setDaftarBab(prev => prev.map(bab => bab.id === id ? { ...bab, isOpen: !bab.isOpen } : bab));
  };

  const handleSimpanBabBaru = () => {
    if (newBabTitle.trim() !== '') {
      const newBab = {
        id: Date.now(),
        judul: newBabTitle,
        isOpen: true,
        type: 'file',
        namaFile: `${newBabTitle}.pdf`,
        ukuran: '1.5 MB',
        subBagian: []
      };
      setDaftarBab(prev => [...prev, newBab]);
      setNewBabTitle('');
      setIsAddingBab(false);
    }
  };

  const handleSimpanSubBab = (babId) => {
    if (newSubBabTitle.trim() !== '') {
      setDaftarBab(prev => prev.map(bab => {
        if (bab.id === babId) {
          return {
            ...bab,
            subBagian: [...bab.subBagian, { id: Date.now(), judul: newSubBabTitle }]
          };
        }
        return bab;
      }));
      setNewSubBabTitle('');
      setAddingSubBabId(null);
    }
  };

  // PENGONDISIAN SUB-HALAMAN
  if (subHalaman === 'tambahMateri') {
    return <TambahMateri onKembali={() => setSubHalaman(null)} />;
  }

  if (subHalaman === 'tambahAssignment') {
    return <TambahAssignmentGuru onKembali={() => setSubHalaman(null)} />;
  }

  if (subHalaman === 'editFile') {
    return <EditFileGuru onKembali={() => setSubHalaman(null)} />;
  }

  if (subHalaman === 'editAssignment') {
    return <EditAssignmentGuru onKembali={() => setSubHalaman(null)} />;
  }

  // TAMPILAN HALAMAN TAMBAH LINK (URL) KHUSUS
  if (subHalaman === 'tambahLink') {
    return (
      <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full relative">
        <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
          <div>
            <div className="mt-4 mb-8 pl-2">
              <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
            </div>
            <nav className="space-y-0">
              <button onClick={() => setSubHalaman(null)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm w-full text-left cursor-pointer">
                <Home size={24} />
                <span>Beranda</span>
              </button>
            </nav>
          </div>
        </aside>

        <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
          <div className="mb-4">
            <p className="text-[11px] text-[#71808D]">
              BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">MATEMATIKA X A</span>
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#17242E]">Tambah Link (URL)</h2>
            <p className="text-xs text-[#71808D] mt-1">Tambahkan tautan atau sumber eksternal untuk siswa.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-2xs space-y-6 w-full max-w-4xl">
            <div>
              <label className="block text-xs font-bold text-[#17242E] mb-2">Judul Link / Sumber</label>
              <input 
                type="text" 
                placeholder="Masukkan judul link..." 
                value={linkJudul}
                onChange={(e) => setLinkJudul(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-cyan-100 bg-[#E0F7FA]/20 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17242E] mb-2">External URL</label>
              <div className="relative">
                <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="https://example.com" 
                  value={linkURL}
                  onChange={(e) => setLinkURL(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-cyan-100 bg-[#E0F7FA]/20 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#17242E] mb-2">Deskripsi / Keterangan</label>
              <textarea 
                rows={4}
                placeholder="Masukkan deskripsi tautan..." 
                value={linkDeskripsi}
                onChange={(e) => setLinkDeskripsi(e.target.value)}
                className="w-full p-4 rounded-2xl border border-gray-200 text-xs text-[#17242E] focus:outline-none bg-[#E0F7FA]/10"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setSubHalaman(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer transition"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  alert('Link berhasil ditambahkan!');
                  setSubHalaman(null);
                }}
                className="px-7 py-2.5 bg-[#054C5A] text-white rounded-xl text-xs font-bold hover:bg-[#033742] cursor-pointer transition shadow-xs flex items-center gap-2"
              >
                <Save size={14} /> Simpan
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const daftarAktivitas = [
    { id: 'Tugas', title: 'Tugas', icon: ClipboardList },
    { id: 'Link (URL)', title: 'Link (URL)', icon: ExternalLink },
    { id: 'File', title: 'File', icon: File },
    { id: 'Page', title: 'Page', icon: FileCode },
    { id: 'Text and media area', title: 'Text and media area', icon: Edit2 },
    { id: 'Quiz', title: 'Quiz', icon: HelpCircle },
    { id: 'Forum', title: 'Forum', icon: MessageSquare },
  ];

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#17242E] w-full relative">
      
      {/* SIDEBAR */}
      <aside className="w-80 bg-white p-6 flex flex-col justify-between border-r border-gray-100 min-h-screen shrink-0 sticky top-0 h-screen">
        <div>
          <div className="mt-4 mb-8 pl-2">
            <img src={logoSmanti} alt="SMANTI Connect" className="h-10 object-contain" />
          </div>

          <nav className="space-y-0">
            <button 
              onClick={onKembali}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E0F7FA] text-[#007A99] font-bold text-sm w-full text-left cursor-pointer"
            >
              <Home size={24} className="text-[#0088A8]" />
              <span>Beranda</span>
            </button>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <BookOpen size={24} />
              <span>Bank Soal</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <FileText size={24} />
              <span>Rekap Nilai</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <CalendarIcon size={24} />
              <span>Presensi</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#71808D] hover:bg-gray-50 transition text-sm">
              <MessageSquare size={24} />
              <span>Pesan</span>
            </a>
          </nav>
        </div>

        <button className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#FFF0F0] text-[#E53935] font-semibold text-sm hover:bg-red-100 transition cursor-pointer">
          <span>Keluar</span>
          <LogOut size={22} />
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-7 overflow-y-auto w-full bg-white rounded-tl-[32px] rounded-bl-[32px] shadow-[0_0_30px_rgba(0,136,168,0.12)] border-l border-[#DDF6F9]">
        
        {/* TOPBAR */}
        <header className="flex justify-between items-center mb-6 w-full">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600" size={20} />
            <input 
              type="text" 
              placeholder="Cari informasi..." 
              className="w-full pl-11 pr-4 py-2 bg-white rounded-full text-sm border border-cyan-100 shadow-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 bg-[#E0F7FA] rounded-full text-[#0088A8] relative shadow-xs hover:bg-cyan-100 transition cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#00A8CC] rounded-full"></span>
            </button>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80" 
                alt="Karina" 
                className="w-9 h-9 rounded-full object-cover border border-cyan-200"
              />
              <div className="text-xs">
                <p className="font-bold text-[#17242E] leading-tight">Karina</p>
                <p className="text-[#71808D] text-[11px]">Guru</p>
              </div>
            </div>
          </div>
        </header>

        {/* BREADCRUMB */}
        <div className="mb-4 flex items-center gap-3">
          <button 
            onClick={onKembali}
            className="p-2 rounded-xl bg-[#F8FAFC] border border-gray-200 text-[#71808D] hover:bg-cyan-50 hover:text-[#0088A8] transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={18} />
          </button>
          <p className="text-[11px] text-[#71808D]">
            BERANDA &nbsp;/&nbsp; KELAS 10 &nbsp;/&nbsp; <span className="font-bold text-[#17242E]">KELOLA MATERI</span>
          </p>
        </div>

        {/* HEADER COURSE & TOMBOL SIMPAN PERUBAHAN */}
        <div className="flex justify-between items-start mb-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-[#17242E]">Matematika X A</h2>
            <p className="text-xs text-[#71808D] mt-1">Kelola dan atur materi pelajaran untuk siswa.</p>
          </div>

          <button 
            onClick={onKembali}
            className="px-6 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer tracking-wider uppercase"
          >
            SIMPAN PERUBAHAN
          </button>
        </div>

        {/* TAB NAVIGASI */}
        <div className="flex gap-8 border-b border-gray-200 mb-6 text-sm font-bold">
          <span className="pb-3 text-[#0088A8] border-b-2 border-[#0088A8] cursor-pointer">Materi</span>
          <span className="pb-3 text-gray-400 hover:text-gray-600 cursor-pointer">Tugas</span>
          <span className="pb-3 text-gray-400 hover:text-gray-600 cursor-pointer">Nilai</span>
        </div>

        {/* LIST BAB DINAMIS */}
        <div className="space-y-6 w-full">
          {daftarBab.map((bab) => (
            <div key={bab.id} className="bg-white rounded-3xl border border-gray-200 shadow-2xs overflow-visible relative">
              
              {/* HEADER BAB UTAMA */}
              <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100 rounded-t-3xl">
                <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleBab(bab.id)}>
                  {bab.isOpen ? <ChevronUp size={18} className="text-[#0088A8]" /> : <ChevronDown size={18} className="text-gray-400" />}
                  
                  {editingBabId === bab.id ? (
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="text" 
                        value={tempJudul} 
                        onChange={(e) => setTempJudul(e.target.value)} 
                        className="px-3 py-1 border border-cyan-200 rounded-lg text-sm font-bold text-[#17242E] focus:outline-none"
                        autoFocus
                      />
                      <button onClick={() => handleSaveEditJudul(bab.id)} className="p-1 bg-[#0088A8] text-white rounded-md cursor-pointer"><Check size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#17242E]">{bab.judul}</h3>
                      <Pencil size={14} className="text-gray-400 hover:text-[#0088A8] cursor-pointer" onClick={(e) => handleStartEditJudul(bab.id, bab.judul, e)} title="Ubah Nama Bab" />
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button onClick={() => setActivePopover(activePopover === `bab-${bab.id}` ? null : `bab-${bab.id}`)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                    <MoreHorizontal size={18} />
                  </button>
                  {activePopover === `bab-${bab.id}` && (
                    <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 w-28 z-50 space-y-1 text-xs font-medium">
                      <button 
                        onClick={() => { 
                          setShowModalAktivitas(true);
                          setActivePopover(null); 
                        }} 
                        className="w-full text-left px-3 py-1.5 text-[#17242E] hover:bg-cyan-50 rounded-lg cursor-pointer"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => { 
                          setDaftarBab(prev => prev.filter(b => b.id !== bab.id));
                          setActivePopover(null); 
                        }} 
                        className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ISI KONTEN BAB */}
              {bab.isOpen && (
                <div className="p-6 space-y-4">
                  <div className="text-xs text-[#71808D] leading-relaxed">
                    <p>Materi pembelajaran untuk bab {bab.judul}.</p>
                  </div>

                  {bab.type === 'tugas' ? (
                    <div className="bg-[#FFF0F5] border border-rose-100 p-3.5 rounded-2xl flex items-center justify-between relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E91E63] text-white flex items-center justify-center shrink-0">
                          <ClipboardList size={20} />
                        </div>
                        <div>
                          <span className="text-[9px] bg-rose-100 text-[#E91E63] px-2 py-0.5 rounded font-bold uppercase">TUGAS</span>
                          <p className="font-bold text-xs text-[#17242E] mt-0.5">{bab.namaTugas}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <button onClick={() => setActivePopover(activePopover === `tugas-${bab.id}` ? null : `tugas-${bab.id}`)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                          <MoreHorizontal size={18} />
                        </button>
                        {activePopover === `tugas-${bab.id}` && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 w-28 z-50 space-y-1 text-xs font-medium">
                            <button onClick={() => { setSubHalaman('editAssignment'); setActivePopover(null); }} className="w-full text-left px-3 py-1.5 text-[#17242E] hover:bg-cyan-50 rounded-lg cursor-pointer">Edit</button>
                            <button onClick={() => { alert('Tugas dihapus'); setActivePopover(null); }} className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">Hapus</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : bab.type === 'file' ? (
                    <div className="bg-[#E0F7FA]/40 border border-cyan-100 p-3.5 rounded-2xl flex items-center justify-between relative">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0088A8] text-white flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-[#17242E]">{bab.namaFile}</p>
                          <p className="text-[10px] text-[#71808D] uppercase font-semibold">DOKUMEN PDF • {bab.ukuran}</p>
                        </div>
                      </div>

                      <div className="relative">
                        <button onClick={() => setActivePopover(activePopover === `file-${bab.id}` ? null : `file-${bab.id}`)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer">
                          <MoreHorizontal size={18} />
                        </button>
                        {activePopover === `file-${bab.id}` && (
                          <div className="absolute right-0 top-8 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 w-28 z-50 space-y-1 text-xs font-medium">
                            <button onClick={() => { setSubHalaman('editFile'); setActivePopover(null); }} className="w-full text-left px-3 py-1.5 text-[#17242E] hover:bg-cyan-50 rounded-lg cursor-pointer">Edit</button>
                            <button onClick={() => { alert('File dihapus'); setActivePopover(null); }} className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">Hapus</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {bab.subBagian.map((sub) => (
                    <div key={sub.id} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronRight size={16} className="text-gray-400" />
                          
                          {editingSubId === sub.id ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={tempSubJudul} 
                                onChange={(e) => setTempSubJudul(e.target.value)} 
                                className="px-2 py-0.5 border border-cyan-200 rounded text-xs font-bold text-[#17242E] focus:outline-none"
                                autoFocus
                              />
                              <button onClick={() => handleSaveEditSub(bab.id, sub.id)} className="p-0.5 bg-[#0088A8] text-white rounded"><Check size={12} /></button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#17242E]">{sub.judul}</span>
                              <Pencil 
                                size={13} 
                                className="text-gray-400 hover:text-[#0088A8] cursor-pointer" 
                                onClick={(e) => handleStartEditSub(sub.id, sub.judul, e)} 
                                title="Ubah Nama Sub-bagian" 
                              />
                            </div>
                          )}
                        </div>

                        <div className="relative">
                          <button onClick={() => setActivePopover(activePopover === `sub-${sub.id}` ? null : `sub-${sub.id}`)} className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer">
                            <MoreHorizontal size={18} />
                          </button>
                          {activePopover === `sub-${sub.id}` && (
                            <div className="absolute right-0 top-7 bg-white border border-gray-100 rounded-xl shadow-xl p-1.5 w-28 z-50 space-y-1 text-xs">
                              <button onClick={() => { handleStartEditSub(sub.id, sub.judul); setActivePopover(null); }} className="w-full text-left px-3 py-1.5 text-[#17242E] hover:bg-cyan-50 rounded-lg cursor-pointer">Edit</button>
                              <button onClick={() => { 
                                setDaftarBab(prev => prev.map(b => b.id === bab.id ? { ...b, subBagian: b.subBagian.filter(s => s.id !== sub.id) } : b));
                                setActivePopover(null); 
                              }} className="w-full text-left px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer">Hapus</button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="border border-dashed border-cyan-200 rounded-xl p-2.5 text-center bg-cyan-50/20 hover:bg-cyan-50/50 transition">
                        <button 
                          onClick={() => setShowModalAktivitas(true)}
                          className="text-xs font-bold text-[#0088A8] flex items-center justify-center gap-2 w-full cursor-pointer"
                        >
                          <Plus size={16} /> Tambah Aktivitas atau Sumber
                        </button>
                      </div>
                    </div>
                  ))}

                  {addingSubBabId === bab.id ? (
                    <div className="p-4 border border-cyan-200 rounded-2xl bg-cyan-50/20 space-y-2">
                      <label className="block text-xs font-bold text-[#17242E]">Judul Sub-bagian Baru</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Rangkuman Materi" 
                        value={newSubBabTitle}
                        onChange={(e) => setNewSubBabTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-white rounded-xl border border-cyan-200 text-xs focus:outline-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setAddingSubBabId(null)} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold cursor-pointer">Batal</button>
                        <button onClick={() => handleSimpanSubBab(bab.id)} className="px-3 py-1.5 bg-[#054C5A] text-white rounded-xl text-xs font-bold cursor-pointer">Simpan Sub-bagian</button>
                      </div>
                    </div>
                  ) : (
                    <div className="relative pt-1">
                      <button 
                        onClick={() => setActivePopover(activePopover === `tambah-opt-${bab.id}` ? null : `tambah-opt-${bab.id}`)}
                        className="text-xs font-bold text-[#0088A8] flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cyan-50 transition cursor-pointer"
                      >
                        <Plus size={16} /> Tambah Aktivitas atau Sumber
                      </button>

                      {activePopover === `tambah-opt-${bab.id}` && (
                        <div className="absolute left-0 top-10 bg-white border border-gray-100 rounded-2xl shadow-2xl p-2 w-52 z-50 space-y-1">
                          <button 
                            onClick={() => { 
                              setShowModalAktivitas(true); 
                              setActivePopover(null); 
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#17242E] hover:bg-cyan-50 rounded-xl flex items-center gap-2 cursor-pointer"
                          >
                            <Plus size={14} className="text-[#0088A8]" /> Aktivitas atau Sumber
                          </button>
                          <button 
                            onClick={() => { 
                              setAddingSubBabId(bab.id); 
                              setActivePopover(null); 
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs font-semibold text-[#17242E] hover:bg-cyan-50 rounded-xl flex items-center gap-2 cursor-pointer"
                          >
                            <FolderPlus size={14} className="text-[#0088A8]" /> Tambah Sub-bagian
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          ))}

          {/* KOTAK TAMBAH BAGIAN BARU */}
          <div className="pt-2">
            {isAddingBab ? (
              <div className="bg-white p-5 rounded-3xl border border-cyan-300 shadow-sm space-y-3">
                <label className="block text-xs font-bold text-[#17242E]">Judul Bagian / Bab Baru</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Statistika & Peluang" 
                  value={newBabTitle}
                  onChange={(e) => setNewBabTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-cyan-200 text-xs focus:outline-none focus:border-[#0088A8]"
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setIsAddingBab(false)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 cursor-pointer">Batal</button>
                  <button onClick={handleSimpanBabBaru} className="px-4 py-2 bg-[#054C5A] text-white rounded-xl text-xs font-bold hover:bg-[#033742] cursor-pointer">Simpan Bab</button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsAddingBab(true)}
                className="w-full py-3.5 border border-cyan-200 rounded-2xl text-xs font-bold text-[#0088A8] bg-cyan-50/20 hover:bg-cyan-50/80 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs"
              >
                <Plus size={16} /> Tambah Bagian Baru
              </button>
            )}
          </div>

        </div>

      </main>

      {/* MODAL POPUP: PEMILIHAN AKTIVITAS ATAU SUMBER */}
      {showModalAktivitas && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#17242E]">Tambah Aktivitas atau Sumber</h3>
              <button 
                onClick={() => setShowModalAktivitas(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              {daftarAktivitas.map((item) => {
                const IconComponent = item.icon;
                const isSelected = pilihanAktivitas === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setPilihanAktivitas(item.id)}
                    className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-[#0088A8] bg-cyan-50/40 shadow-xs ring-1 ring-[#0088A8]' 
                        : 'border-gray-100 hover:border-cyan-200 hover:bg-gray-50/80'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#0088A8] flex items-center justify-center mb-3">
                      <IconComponent size={22} />
                    </div>
                    <span className="text-xs font-semibold text-[#17242E]">{item.title}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-medium">
                <span className="font-bold text-[#17242E]">{pilihanAktivitas}</span> terpilih
              </span>

              <button 
                onClick={() => {
                  setShowModalAktivitas(false);
                  if (pilihanAktivitas === 'Tugas') {
                    setSubHalaman('tambahAssignment');
                  } else if (pilihanAktivitas === 'Link (URL)') {
                    setSubHalaman('tambahLink'); // Mengarah ke form Tambah Link
                  } else {
                    setSubHalaman('tambahMateri'); // Mengarah ke form Tambah File
                  }
                }}
                className="px-7 py-2.5 bg-[#054C5A] hover:bg-[#033742] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Add
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default KelolaCourseGuru;