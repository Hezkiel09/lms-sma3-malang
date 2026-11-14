
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
//import Sidebar from "../components/Sidebar";
import "./BuatSoal.css";

export default function BuatSoal() {
  const navigate = useNavigate();

  const [jenisSoal, setJenisSoal] = useState("");

  const handleJenisSoal = (jenis) => {
    setJenisSoal(jenis);

    // Menuju halaman input soal sesuai jenis
    navigate(`/bank-soal/buat/${jenis.toLowerCase().replaceAll(" ", "-").replace("/", "-")}`);
  };

  const handleImportExcel = () => {
    navigate("/bank-soal/import-excel");
  };

  return (
    <div className="buatsoal-layout">

      {/* SIDEBAR */}
      <Sidebar />

      <main className="buatsoal-page">

        {/* HEADER */}
        <header className="buatsoal-header">

          <div className="buatsoal-header-left">

            <div className="buatsoal-breadcrumb">
              <span>Beranda</span>
              <b>›</b>
              <span>Bank Soal</span>
              <b>›</b>
              <span>Kelas XI</span>
              <b>›</b>
              <span>Matematika</span>
              <b>›</b>
              <strong>Buat Soal</strong>
            </div>

            <h1>Buat Soal</h1>

            <p>
              Pilih cara menambahkan soal ke Bank Soal XI / Matematika.
            </p>

          </div>

          <button
            className="btn-kembali-mapel"
            onClick={() => navigate("/bank-soal")}
          >
            Kembali ke Kelas Mapel
          </button>

        </header>

        {/* INFORMASI KELAS */}
        <section className="buatsoal-info-card">

          <div className="info-item">
            <span>Kelas</span>
            <strong>XI</strong>
          </div>

          <div className="info-item">
            <span>Mata pelajaran</span>
            <strong>Matematika</strong>
          </div>

          <div className="info-item">
            <span>Materi</span>
            <strong>Komposisi & invers</strong>
          </div>

        </section>

        {/* PILIH CARA MEMBUAT SOAL */}
        <section className="buatsoal-main-card">

          <div className="buatsoal-title">
            <h2>Pilih Cara Membuat Soal</h2>

            <p>
              Input satu per satu atau impor soal yang sudah disiapkan
              dalam Excel.
            </p>
          </div>

          {/* TAHAPAN */}
          <div className="buatsoal-steps">

            <span className="step-done">
              1. Pilih Kelas
            </span>

            <b>›</b>

            <span className="step-done">
              2. Pilih Mata Pelajaran
            </span>

            <b>›</b>

            <span className="step-done">
              3. Lihat Soal
            </span>

            <b>›</b>

            <span className="step-active">
              4. Tambah / Impor Soal
            </span>

          </div>

          {/* DUA KOLOM */}
          <div className="buatsoal-method-grid">

            {/* INPUT MANUAL */}
            <div className="method-card">

              <div className="method-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="29"
                  height="29"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                  <path d="M15 5l4 4" />
                </svg>
              </div>

              <h2>Input Manual</h2>

              <p className="method-description">
                Tulis pertanyaan, kunci jawaban, dan pembahasan
                langsung di aplikasi. Pilih jenis soal untuk mulai.
              </p>

              <div className="manual-buttons">

                <button
                  onClick={() => handleJenisSoal("Pilihan Ganda")}
                >
                  Pilihan Ganda
                </button>

                <button
                  onClick={() => handleJenisSoal("Benar-Salah")}
                >
                  Benar / Salah
                </button>

                <button
                  onClick={() => handleJenisSoal("Esai")}
                >
                  Esai
                </button>

              </div>

            </div>

            {/* IMPOR EXCEL */}
            <div className="method-card">

              <div className="method-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="29"
                  height="29"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                  <path d="M14 2v6h6" />
                  <path d="M8 13h2" />
                  <path d="M8 17h2" />
                  <path d="M14 13h2" />
                  <path d="M14 17h2" />
                </svg>
              </div>

              <h2>Impor dari Excel</h2>

              <p className="method-description">
                Tambahkan soal dari file Excel sesuai templat.
                Periksa isi soal sebelum menyimpan ke bank soal.
              </p>

              <div className="excel-instructions">

                <p>Unduh dan isi templat Excel.</p>

                <p>Unggah file dan tinjau soal yang diimpor.</p>

                <p>
                  Simpan pada konteks kelas, mapel, dan materi ini.
                </p>

              </div>

              <button
                className="btn-import-excel"
                onClick={handleImportExcel}
              >
                Impor dari Excel
              </button>

            </div>

          </div>

          {/* INFORMASI BAWAH */}
          <div className="buatsoal-bottom-info">

            <span className="info-icon">ⓘ</span>

            <p>
              Soal baru akan ditambahkan ke Kelas XI · Matematika ·
              Komposisi & invers.
            </p>

          </div>

        </section>

        {/* FOOTER */}
        <footer className="buatsoal-footer">

          <span>▤</span>

          <p>
            Lorem ipsum dolor sit amet consectetur. Risus aenean
            massa congue bibendum nibh consectetur.
          </p>

        </footer>

      </main>

    </div>
  );
}
