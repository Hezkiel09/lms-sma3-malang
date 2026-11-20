import React, { useState } from "react";
import landingImg from "../../../assets/landing.png";
import logoImg from "../../../assets/Logo.png";
import LoginGuru from "./LoginGuru";
import LupaPassword from "./LupaPassword";
import LandingPage from "./LandingPage";
import LoginSiswa from "./LoginSiswa";

const AuthLayout = ({ onLoginSuccess }) => {
    // Navigasi view: 'landing', 'login-siswa', 'login-guru', 'forgot'
    const [activeView, setActiveView] = useState("landing");

    const handleLoginSubmit = (credentials) => {
        // credentials berisi { username, password, role: 'student' | 'teacher' }
        if (onLoginSuccess) {
            onLoginSuccess(credentials.role);
        }
    };

    const handleResetSubmit = (email) => {
        alert(`Instruksi reset kata sandi telah dikirim ke: ${email}`);
        setActiveView("login-siswa");
    };

    return (
        <div className="flex h-screen w-full bg-white font-sans text-[#17242E] overflow-hidden">
            {/* SISI KIRI: ILUSTRASI LANDING PAGE */}
            <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] lg:shrink-0 h-full items-center justify-start overflow-hidden">
                <img
                    src={landingImg}
                    alt="Ilustrasi SMANTI Connect"
                    className="h-full w-full object-cover object-center select-none"
                />
            </div>

            {/* SISI KANAN: KONTEN DINAMIS FORM */}
            <div className="flex-1 h-full flex flex-col justify-center items-center px-6 sm:px-10 lg:px-16 overflow-y-auto">
                <div className="w-full max-w-md space-y-6">
                    {/* LOGO SMANTI CONNECT */}
                    <div className="-ml-4">
                        <img
                            src={logoImg}
                            alt="SMANTI Connect"
                            className="h-11 w-auto object-contain"
                        />
                    </div>

                    {/* RENDER KOMPONEN BERDASARKAN STATE ACTIVE VIEW */}
                    {activeView === "landing" && (
                        <LandingPage
                            onPilihLoginSiswa={() =>
                                setActiveView("login-siswa")
                            }
                            onPilihLoginGuru={() => setActiveView("login-guru")}
                        />
                    )}

                    {activeView === "login-siswa" && (
                        <LoginSiswa
                            onKembali={() => setActiveView("landing")}
                            onKeLupaPassword={() => setActiveView("forgot")}
                            onLoginSubmit={handleLoginSubmit}
                        />
                    )}

                    {activeView === "login-guru" && (
                        <LoginGuru
                            onKembali={() => setActiveView("landing")}
                            onKeLupaPassword={() => setActiveView("forgot")}
                            onLoginSubmit={handleLoginSubmit}
                        />
                    )}

                    {activeView === "forgot" && (
                        <LupaPassword
                            onKembali={() => setActiveView("login-siswa")}
                            onResetSubmit={handleResetSubmit}
                        />
                    )}

                    {/* FOOTER BANTUAN */}
                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-[11px] text-[#71808D]">
                            Belum punya akun? Silakan hubungi{" "}
                            <span className="font-bold text-[#0088A8] cursor-pointer hover:underline">
                                Administrator IT Sekolah
                            </span>{" "}
                            untuk informasi pendaftaran dan bantuan teknis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;