import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const LoginGuru = ({ onKembali, onKeLupaPassword, onLoginSubmit }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const cleanUsername = username.trim();

        if (!cleanUsername) {
            setErrorMsg('Username atau NIP wajib diisi.');
            return;
        }

        if (/\s/.test(cleanUsername)) {
            setErrorMsg('Username atau NIP tidak boleh mengandung spasi.');
            return;
        }

        if (password.length < 8) {
            setErrorMsg('Kata sandi minimal 8 karakter.');
            return;
        }

        if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
            setErrorMsg('Kata sandi harus mengandung kombinasi huruf dan angka.');
            return;
        }

        setErrorMsg('');
        if (onLoginSubmit) {
            onLoginSubmit({ username: cleanUsername, password, role: 'teacher' });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
            <div className="space-y-1">
                <div className="flex items-center gap-2 mb-2">
                    <button
                        type="button"
                        onClick={onKembali}
                        className="text-gray-400 hover:text-[#0088A8] transition cursor-pointer"
                        title="Kembali"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <span className="text-[11px] font-bold text-[#0088A8] uppercase tracking-wider">
                    </span>
                </div>
                <h1 className="text-2xl font-bold text-[#17242E]">Masuk ke Akun Anda</h1>
                <p className="text-xs text-[#71808D]">
                    Selamat datang! Masukkan kredensial Anda untuk melanjutkan.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">Username / NIP</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="Masukkan Username atau NIP"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8] transition bg-white"
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#71808D] uppercase tracking-wider">Kata Sandi</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errorMsg) setErrorMsg('');
                            }}
                            placeholder="••••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-[#17242E] focus:outline-none focus:border-[#0088A8] transition bg-white pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" className="rounded border-gray-300 text-[#0088A8] focus:ring-0" />
                        <span className="text-[#71808D] text-[11px]">Ingat saya</span>
                    </label>
                    <button
                        type="button"
                        onClick={onKeLupaPassword}
                        className="text-[11px] font-bold text-[#0088A8] hover:underline cursor-pointer"
                    >
                        LUPA KATA SANDI?
                    </button>
                </div>

                {errorMsg && (
                    <p className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
                        {errorMsg}
                    </p>
                )}
            </div>

            <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-2xl bg-[#0088A8] hover:bg-[#007088] text-white font-bold text-xs shadow-sm transition cursor-pointer"
            >
                Masuk
            </button>
        </form>
    );
};

export default LoginGuru;