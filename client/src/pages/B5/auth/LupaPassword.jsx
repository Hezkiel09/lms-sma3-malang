import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const LupaPassword = ({ onKembali, onResetSubmit }) => {
    const [emailReset, setEmailReset] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onResetSubmit) onResetSubmit(emailReset);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        type="button"
                        onClick={onKembali}
                        className="text-gray-400 hover:text-[#0088A8] transition cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="text-[11px] font-bold text-[#0088A8] uppercase tracking-wider"></span>
                </div>
                <h1 className="text-2xl font-bold text-[#17242E]">Lupa Kata Sandi</h1>
                <p className="text-xs text-[#71808D]">
                    Masukkan Email Anda untuk mengirim permintaan reset kata sandi akun SMANTI Connect.
                </p>
            </div>

            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">Email</label>
                <input
                    type="email"
                    value={emailReset}
                    onChange={(e) => setEmailReset(e.target.value)}
                    placeholder="Masukkan alamat email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8] transition bg-white"
                    required
                />
            </div>

            <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0088A8] hover:bg-[#007088] text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
                Kirim Permintaan
            </button>
        </form>
    );
};

export default LupaPassword;