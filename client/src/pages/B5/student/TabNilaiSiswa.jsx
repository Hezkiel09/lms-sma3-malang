import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, BookOpen, ChevronDown, AlertCircle } from 'lucide-react';
import { getStudentCourseGrades } from './studentApi';

const TabNilaiSiswa = ({ courseId, onPilihNilai }) => {
    const [sortBy, setSortBy] = useState('terbaru');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [gradesData, setGradesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGrades = async () => {
            if (!courseId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                const data = await getStudentCourseGrades(courseId);
                setGradesData(data);
            } catch (err) {
                console.error('[TabNilaiSiswa] Error fetching grades:', err);
                setError(err.message || 'Gagal memuat data nilai.');
            } finally {
                setLoading(false);
            }
        };
        fetchGrades();
    }, [courseId]);

    const stats = gradesData?.stats || {};
    const dataNilai = gradesData?.items || [];

    // Fungsi Logika Pengurutan (Sorting) Data Nilai
    const sortedDataNilai = [...dataNilai].sort((a, b) => {
        if (sortBy === 'tertinggi') {
            return b.nilaiAngka - a.nilaiAngka;
        } else if (sortBy === 'terendah') {
            return a.nilaiAngka - b.nilaiAngka;
        } else {
            // Default: Terbaru (berdasarkan deadline descending, lalu id)
            return 0; // sudah diurutkan dari backend
        }
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center py-16 text-xs text-gray-400">
                Memuat data nilai...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <AlertCircle size={24} className="text-red-400" />
                <p className="text-xs text-red-500 font-semibold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            {/* 3 KOTAK STATISTIK */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">RATA-RATA NILAI</p>
                        <h3 className="text-3xl font-extrabold text-[#17242E] tracking-tight">{stats.rata_rata || '0'}</h3>
                        <p className="text-[11px] text-[#71808D] mt-2">Rata-rata {stats.sudah_dinilai || 0} asesmen<br /><span className="text-gray-400">{stats.terlambat || 0} telat • {stats.terlewat || 0} terlewat</span></p>
                    </div>
                    <div className="p-3 bg-cyan-50 text-[#0088A8] rounded-2xl"><TrendingUp size={20} /></div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">PENYELESAIAN</p>
                            <h3 className="text-3xl font-extrabold text-[#17242E] tracking-tight">{stats.penyelesaian || '0%'}</h3>
                        </div>
                        <div className="p-3 bg-cyan-50 text-[#0088A8] rounded-2xl"><Award size={20} /></div>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-4">
                        <div className="bg-[#0088A8] h-full rounded-full" style={{ width: `${stats.penyelesaian_num || 0}%` }}></div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-2xs flex justify-between items-start">
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">JUMLAH ASESMEN</p>
                        <h3 className="text-3xl font-extrabold text-[#17242E] tracking-tight">{stats.total_asesmen || 0}</h3>
                        <p className="text-[11px] text-[#71808D] mt-2">{stats.sudah_dinilai || 0} asesmen dinilai<br /><span className="text-gray-400">{stats.terlambat || 0} telat • {stats.terlewat || 0} terlewat</span></p>
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

                {dataNilai.length === 0 ? (
                    <div className="py-10 text-center text-xs text-gray-400">
                        Belum ada data asesmen untuk course ini.
                    </div>
                ) : (
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
                                            {item.submission_id ? (
                                                <button
                                                    onClick={() => {
                                                        if (onPilihNilai) {
                                                            onPilihNilai(item.submission_id);
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-white border border-gray-200 hover:bg-cyan-50 hover:border-[#0088A8] text-[#17242E] font-bold rounded-xl transition cursor-pointer shadow-2xs"
                                                >
                                                    Lihat Penilaian
                                                </button>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">Belum dikumpulkan</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TabNilaiSiswa;
