import React, { useState } from 'react';
import { TrendingUp, Award, BookOpen, ChevronDown } from 'lucide-react';

const TabNilaiSiswa = ({ onPilihNilai }) => {
    const [sortBy, setSortBy] = useState('terbaru');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const dataNilai = [
        { id: 1, asesmen: 'Tugas 1', jenis: 'TUGAS', dikumpulkan: '12/02/2025', status: 'SUDAH DINILAI', nilaiAngka: 85, nilai: '85/100', badgeColor: 'bg-emerald-100 text-emerald-700' },
        { id: 2, asesmen: 'Quiz 1', jenis: 'QUIZ', dikumpulkan: '19/02/2025', status: 'SUDAH DINILAI', nilaiAngka: 90, nilai: '90/100', badgeColor: 'bg-emerald-100 text-emerald-700' },
        { id: 3, asesmen: 'UTS Matematika', jenis: 'UTS', dikumpulkan: '05/03/2025', status: 'SUDAH DINILAI', nilaiAngka: 80, nilai: '80/100', badgeColor: 'bg-emerald-100 text-emerald-700' },
        { id: 4, asesmen: 'UAS Matematika', jenis: 'UAS', dikumpulkan: '18/03/2025', status: 'SUDAH DINILAI', nilaiAngka: 88, nilai: '88/100', badgeColor: 'bg-emerald-100 text-emerald-700' },
        { id: 5, asesmen: 'Tugas 2', jenis: 'TUGAS', dikumpulkan: '25/03/2025', status: 'TERLAMBAT', nilaiAngka: 75, nilai: '75/100', badgeColor: 'bg-amber-100 text-amber-700' },
        { id: 6, asesmen: 'Quiz 2', jenis: 'QUIZ', dikumpulkan: '—', status: 'TERLEWAT', nilaiAngka: 0, nilai: '—', badgeColor: 'bg-rose-100 text-rose-700' },
    ];

    // Fungsi Logika Pengurutan (Sorting) Data Nilai
    const sortedDataNilai = [...dataNilai].sort((a, b) => {
        if (sortBy === 'tertinggi') {
            return b.nilaiAngka - a.nilaiAngka;
        } else if (sortBy === 'terendah') {
            return a.nilaiAngka - b.nilaiAngka;
        } else {
            // Default: Terbaru (berdasarkan ID atau urutan awal)
            return b.id - a.id;
        }
    });

    return (
        <div className="space-y-6 w-full">
            {/* 3 KOTAK STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">RATA-RATA NILAI</p>
                        <h3 className="text-3xl font-extrabold text-[#17242E] tracking-tight">83,60</h3>
                        <p className="text-[11px] text-[#71808D] mt-2">Rata-rata 5 asesmen<br /><span className="text-gray-400">1 telat • 1 terlewat</span></p>
                    </div>
                    <div className="p-3 bg-cyan-50 text-[#0088A8] rounded-2xl"><TrendingUp size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PENYELESAIAN</p>
                            <h3 className="text-3xl font-extrabold text-[#17242E] tracking-tight">83,3%</h3>
                        </div>
                        <div className="p-3 bg-cyan-50 text-[#0088A8] rounded-2xl"><Award size={20} /></div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-4">
                        <div className="bg-[#0088A8] h-full rounded-full" style={{ width: '83.3%' }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">JUMLAH ASESMEN</p>
                        <h3 className="text-3xl font-extrabold text-[#17242E] tracking-tight">6</h3>
                        <p className="text-[11px] text-[#71808D] mt-2">5 asesmen dinilai<br /><span className="text-gray-400">1 telat • 1 terlewat</span></p>
                    </div>
                    <div className="p-3 bg-cyan-50 text-[#0088A8] rounded-2xl"><BookOpen size={20} /></div>
                </div>
            </div>

            {/* TABEL RINCIAN NILAI */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex justify-between items-center relative">
                    <h3 className="text-base font-bold text-[#17242E]">Rincian Nilai</h3>
                    
                    {/* TOMBOL & DROPDOWN SORT BY */}
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="px-4 py-2 bg-white border border-gray-200 hover:bg-cyan-50 hover:border-[#0088A8] rounded-xl text-xs font-bold text-[#17242E] flex items-center gap-2 shadow-2xs cursor-pointer transition"
                        >
                            Sort By: <span className="text-[#0088A8] capitalize">{sortBy}</span> <ChevronDown size={14} />
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-2xl shadow-lg py-2 z-20 text-xs font-medium">
                                <button
                                    onClick={() => { setSortBy('terbaru'); setDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 hover:bg-cyan-50 hover:text-[#0088A8] transition ${sortBy === 'terbaru' ? 'font-bold text-[#0088A8] bg-cyan-50/50' : 'text-[#17242E]'}`}
                                >
                                    Terbaru
                                </button>
                                <button
                                    onClick={() => { setSortBy('tertinggi'); setDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 hover:bg-cyan-50 hover:text-[#0088A8] transition ${sortBy === 'tertinggi' ? 'font-bold text-[#0088A8] bg-cyan-50/50' : 'text-[#17242E]'}`}
                                >
                                    Nilai Tertinggi
                                </button>
                                <button
                                    onClick={() => { setSortBy('terendah'); setDropdownOpen(false); }}
                                    className={`w-full text-left px-4 py-2 hover:bg-cyan-50 hover:text-[#0088A8] transition ${sortBy === 'terendah' ? 'font-bold text-[#0088A8] bg-cyan-50/50' : 'text-[#17242E]'}`}
                                >
                                    Nilai Terendah
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="bg-[#E0F7FA]/40 text-[10px] font-bold text-[#006064] uppercase border-b border-cyan-100">
                                <th className="py-3.5 px-4">Asesmen</th>
                                <th className="py-3.5 px-4">Jenis Asesmen</th>
                                <th className="py-3.5 px-4">Dikumpulkan</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Nilai</th>
                                <th className="py-3.5 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sortedDataNilai.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50 transition">
                                    <td className="py-4 px-4 font-bold text-[#17242E]">{item.asesmen}</td>
                                    <td className="py-4 px-4">
                                        <span className="px-2.5 py-1 bg-cyan-50 text-[#0088A8] rounded-md font-bold text-[10px] border border-cyan-100">
                                            {item.jenis}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-[#71808D]">{item.dikumpulkan}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${item.badgeColor}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-bold text-[#17242E]">{item.nilai}</td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => {
                                                if (onPilihNilai) {
                                                    onPilihNilai(item.id);
                                                } else {
                                                    console.error("onPilihNilai belum dikirim ke TabNilaiSiswa!");
                                                }
                                            }}
                                            className="px-4 py-2 bg-white border border-gray-200 hover:bg-cyan-50 hover:border-[#0088A8] text-[#17242E] font-bold rounded-xl transition cursor-pointer shadow-2xs"
                                        >
                                            Lihat Penilaian
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TabNilaiSiswa;