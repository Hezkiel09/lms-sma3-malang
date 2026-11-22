import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import SiswaSidebar from '../components/layout/SiswaSidebar';

export default function SiswaLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <SiswaSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="flex h-16 items-center border-b border-slate-100 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Buka menu"><Menu className="h-6 w-6" /></button>
          <span className="ml-3 text-sm font-bold text-slate-800">SMANTI Connect - Siswa</span>
        </div>
        <main className="flex-1 p-5 sm:p-8 lg:p-10"><Outlet /></main>
      </div>
    </div>
  );
}
