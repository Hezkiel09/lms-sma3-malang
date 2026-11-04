
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "./EditSoal.css";

export default function EditSoal() {
  const navigate = useNavigate();

  // Data soal awal
  const [form, setForm] = useState({
    kelas: "XI",
    mapel: "Matematika",
    materi: "Komposisi & invers",
    jenis: "Pilihan Ganda",
    pertanyaan:
      "Diketahui f(x) = 2x + 1 dan g(x) = x². Nilai (f ∘ g)(3) adalah ...",
    pilihan: ["7", "10", "18", "19"],
    kunci: 3,
    pembahasan: "g(3)=9 sehingga f(9)=19.",
    bobot: 5,
  });

  const [gambar, setGambar] = useState(null);
  const [previewGambar, setPreviewGambar] = useState(null);
  const [pesan, setPesan] = useState("");

  // Mengubah data form
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mengubah pilihan jawaban
  const handlePilihanChange = (index, value) => {
    const pilihanBaru = [...form.pilihan];
    pilihanBaru[index] = value;

    setForm((prev) => ({
      ...prev,
      pilihan: pilihanBaru,
    }));
  };

  // Mengubah jenis soal
  const handleJenisChange = (jenis) => {
    let pilihan = form.pilihan;
    let kunci = form.kunci;

    if (jenis === "Benar / Salah") {
      pilihan = ["Benar", "Salah"];
      kunci = 0;
    } else if (jenis === "Esai") {
      pilihan = [];
      kunci = -1;
    } else if (form.jenis !== "Pilihan Ganda") {
      pilihan = ["", "", "", ""];
      kunci = 0;
    }

    setForm((prev) => ({
      ...prev,
      jenis,
      pilihan,
      kunci,
    }));
  };

  // Upload gambar
  const handleUploadGambar = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formatValid = ["image/png", "image/jpeg"];

    if (!formatValid.includes(file.type)) {
      alert("Format gambar harus PNG atau JPG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 5 MB.");
      return;
    }

    setGambar(file);
    setPreviewGambar(URL.createObjectURL(file));
  };

  // Hapus gambar
  const handleHapusGambar = () => {
    if (previewGambar) {
      URL.revokeObjectURL(previewGambar);
    }

    setGambar(null);
    setPreviewGambar(null);
  };

  // Simpan perubahan
  const handleSimpan = (e) => {
    e.preventDefault();

    if (!form.pertanyaan.trim()) {
      alert("Pertanyaan tidak boleh kosong.");
      return;
    }

    if (
      form.jenis === "Pilihan Ganda" &&
      form.pilihan.some((item) => !item.trim())
    ) {
      alert("Semua pilihan jawaban harus diisi.");
      return;
    }

    if (
      form.jenis !== "Esai" &&
      form.kunci < 0
    ) {
      alert("Silakan tentukan kunci jawaban.");
      return;
    }

    // Simulasi penyimpanan data
    const dataTersimpan = {
      ...form,
      gambar,
    };

    console.log("Data soal diperbarui:", dataTersimpan);

    setPesan("Perubahan soal berhasil disimpan!");

    // Kembali ke halaman detail setelah menyimpan
    setTimeout(() => {
      navigate("/bank-soal/lihat-soal", {
        state: { soal: dataTersimpan },
      });
    }, 700);
  };

  return (
    <div className="editsoal-layout">

      {/* SIDEBAR */}
      <Sidebar />

      <main className="editsoal-page">

        {/* HEADER */}
        <header className="editsoal-header">

          <div className="editsoal-breadcrumb">
            <span>Beranda</span>
            <b>›</b>
            <span>Bank Soal</span>
            <b>›</b>
            <strong>Edit Soal</strong>
          </div>

          <h1>Edit Soal</h1>

          <p>
            Perbarui detail pertanyaan dan kunci jawaban di Bank Soal.
          </p>

        </header>

        {/* FORM EDIT */}
        <form
          className="editsoal-card"
          onSubmit={handleSimpan}
        >

          {/* JUDUL FORM */}
          <div className="editsoal-card-heading">

            <div>
              <h3>Detail Soal</h3>
              <p>
                Sesuaikan informasi soal sebelum menyimpan perubahan.
              </p>
            </div>

            <span>Dibuat • 13 Okt 2026</span>

          </div>

          {/* KELAS MAPEL MATERI */}
          <div className="editsoal-grid">

            <div className="editsoal-field">
              <label>Kelas</label>

              <select
                value={form.kelas}
                onChange={(e) =>
                  handleChange("kelas", e.target.value)
                }
              >
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>
            </div>

            <div className="editsoal-field">
              <label>Mata pelajaran</label>

              <select
                value={form.mapel}
                onChange={(e) =>
                  handleChange("mapel", e.target.value)
                }
              >
                <option>Matematika</option>
                <option>Bahasa Indonesia</option>
                <option>Bahasa Inggris</option>
                <option>Fisika</option>
                <option>Kimia</option>
                <option>Biologi</option>
              </select>
            </div>

            <div className="editsoal-field">
              <label>Materi</label>

              <select
                value={form.materi}
                onChange={(e) =>
                  handleChange("materi", e.target.value)
                }
              >
                <option>Komposisi & invers</option>
                <option>Fungsi</option>
                <option>Limit</option>
                <option>Turunan</option>
                <option>Integral</option>
              </select>
            </div>

          </div>

          {/* JENIS SOAL */}
          <div className="editsoal-section">

            <label className="editsoal-label">
              Jenis Soal
            </label>

            <div className="jenis-soal-options">

              {["Pilihan Ganda", "Benar / Salah", "Esai"].map(
                (jenis) => (
                  <button
                    key={jenis}
                    type="button"
                    className={
                      form.jenis === jenis
                        ? "jenis-option active"
                        : "jenis-option"
                    }
                    onClick={() => handleJenisChange(jenis)}
                  >
                    {form.jenis === jenis && (
                      <span className="jenis-check">✓</span>
                    )}
                    {jenis}
                  </button>
                )
              )}

            </div>

          </div>

          {/* PERTANYAAN */}
          <div className="editsoal-section">

            <label className="editsoal-label">
              Pertanyaan
            </label>

            <textarea
              className="pertanyaan-input"
              value={form.pertanyaan}
              onChange={(e) =>
                handleChange("pertanyaan", e.target.value)
              }
              placeholder="Tulis pertanyaan soal..."
              required
            />

            <span className="field-hint">
              Tulis pertanyaan secara lengkap dan jelas.
            </span>

          </div>

          {/* GAMBAR SOAL */}
          <div className="editsoal-section">

            <label className="editsoal-label">
              Gambar Soal (Opsional)
            </label>

            <div className="upload-area">

              {previewGambar ? (
                <div className="uploaded-image">

                  <img
                    src={previewGambar}
                    alt="Pratinjau gambar soal"
                  />

                  <button
                    type="button"
                    className="remove-image"
                    onClick={handleHapusGambar}
                  >
                    Hapus gambar
                  </button>

                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <svg
                      viewBox="0 0 24 24"
                      width="27"
                      height="27"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 16V4" />
                      <path d="m7 9 5-5 5 5" />
                      <path d="M20 16v4H4v-4" />
                    </svg>
                  </div>

                  <strong>
                    Belum ada gambar. Pilih gambar untuk
                    melampirkan ke soal.
                  </strong>

                  <span>
                    Format PNG atau JPG, ukuran maksimal 5 MB
                  </span>
                </>
              )}

              <label className="btn-pilih-gambar">
                {previewGambar ? "Ganti Gambar" : "Pilih Gambar"}

                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleUploadGambar}
                  hidden
                />
              </label>

            </div>

          </div>

          {/* PILIHAN JAWABAN */}
          {form.jenis !== "Esai" && (
            <div className="editsoal-section">

              <label className="editsoal-label">
                Pilihan Jawaban & Kunci Jawaban
              </label>

              <p className="field-hint answer-hint">
                Pilih lingkaran pada satu jawaban yang benar sebagai
                kunci.
              </p>

              <div className="edit-answer-list">

                {form.pilihan.map((jawaban, index) => (
                  <div
                    key={index}
                    className={
                      form.kunci === index
                        ? "edit-answer-item answer-selected"
                        : "edit-answer-item"
                    }
                  >

                    <input
                      type="radio"
                      name="kunci-jawaban"
                      checked={form.kunci === index}
                      onChange={() =>
                        handleChange("kunci", index)
                      }
                    />

                    <strong>
                      {form.jenis === "Benar / Salah"
                        ? ""
                        : `${String.fromCharCode(65 + index)}.`}
                    </strong>

                    <input
                      type="text"
                      value={jawaban}
                      onChange={(e) =>
                        handlePilihanChange(index, e.target.value)
                      }
                      aria-label={`Pilihan jawaban ${index + 1}`}
                      required
                    />

                    {form.kunci === index && (
                      <span className="answer-key-label">
                        Kunci jawaban
                      </span>
                    )}

                  </div>
                ))}

              </div>

              {form.jenis === "Pilihan Ganda" && (
                <button
                  type="button"
                  className="btn-add-option"
                  onClick={() => {
                    if (form.pilihan.length < 6) {
                      handleChange("pilihan", [
                        ...form.pilihan,
                        "",
                      ]);
                    }
                  }}
                  disabled={form.pilihan.length >= 6}
                >
                  + Tambah Pilihan Jawaban
                </button>
              )}

            </div>
          )}

          {/* PEMBAHASAN */}
          <div className="editsoal-section">

            <label className="editsoal-label">
              Pembahasan
            </label>

            <textarea
              className="pembahasan-input"
              value={form.pembahasan}
              onChange={(e) =>
                handleChange("pembahasan", e.target.value)
              }
              placeholder="Tuliskan pembahasan soal..."
            />

          </div>

          {/* BOBOT NILAI */}
          <div className="editsoal-section bobot-section">

            <label className="editsoal-label">
              Bobot Nilai
            </label>

            <div className="bobot-row">

              <div className="bobot-input-wrapper">

                <input
                  type="number"
                  min="0"
                  value={form.bobot}
                  onChange={(e) =>
                    handleChange(
                      "bobot",
                      Math.max(0, Number(e.target.value))
                    )
                  }
                />

                <span>poin</span>

              </div>

              <p>
                Siswa mendapat {form.bobot} poin jika menjawab benar.
                Jawaban salah atau kosong bernilai 0.
              </p>

            </div>

          </div>

          {/* TOMBOL */}
          <div className="editsoal-footer">

            <button
              type="button"
              className="btn-edit-cancel"
              onClick={() => navigate(-1)}
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn-edit-save"
            >
              Simpan Perubahan
            </button>

          </div>

          {pesan && (
            <p className="edit-success-message">
              {pesan}
            </p>
          )}

        </form>

        {/* FOOTER HALAMAN */}
        <footer className="editsoal-page-footer">
          <span>▤</span>
          <p>
            Lorem ipsum dolor sit amet consectetur. Sapien pellentesque
            et feugiat quam iaculis vitae hendrerit.
          </p>
        </footer>

      </main>

    </div>
  );
}
