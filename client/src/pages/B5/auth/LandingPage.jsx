import React from 'react';

const LandingPage = ({ onPilihLoginSiswa, onPilihLoginGuru }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#17242E]">
                    Selamat Datang di SMANTI Connect!
                </h1>
                <p className="text-xs sm:text-sm text-[#71808D] leading-relaxed">
                    Platform digital terintegrasi untuk mendukung kegiatan belajar mengajar dan administrasi sekolah yang lebih efisien.
                </p>
            </div>

            <div className="space-y-3 pt-4">
                <button
                    onClick={onPilihLoginSiswa}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#0088A8] hover:bg-[#007088] text-white font-bold text-xs sm:text-sm shadow-sm transition cursor-pointer flex items-center justify-center"
                >
                    Masuk sebagai Siswa
                </button>
                <button
                    onClick={onPilihLoginGuru}
                    className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-[#0088A8] text-[#0088A8] hover:bg-cyan-50 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center"
                >
                    Masuk sebagai Guru
                </button>
            </div>
        </div>
    );
};

export default LandingPage;