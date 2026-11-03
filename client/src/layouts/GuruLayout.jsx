import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import GuruSidebar from '../components/layout/GuruSidebar';
import { Menu } from 'lucide-react';

export default function GuruLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar Guru */}
      <GuruSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Mobile top bar with hamburger */}
        <div className="flex h-16 items-center px-4 border-b border-slate-100 bg-white lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Buka menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-3 font-bold text-slate-800 text-sm">SMANTI Connect - Guru</span>
        </div>

        {/* Dynamic Content */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
