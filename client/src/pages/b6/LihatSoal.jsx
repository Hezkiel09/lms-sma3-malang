
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LihatSoal.css";
import { BookOpen, Eye } from "lucide-react";

export default function LihatSoal() {
  const navigate = useNavigate();

  const [showDelete, setShowDelete] = useState(false);

  // Contoh data soal
  const [soal] = useState({
    kelas: "XI",
    mapel: "Matematika",
    materi: "Komposisi & invers",
    jenis: "Pilihan Ganda",
    asal: "Dibuat • 13 Okt 2026",
    pertanyaan:
      "Diketahui f(x) = 2x + 1 dan g(x) = x². Nilai (f ∘ g)(3) adalah ...",
    pilihan: [
      { label: "A.", jawaban: "7" },
      { label: "B.", jawaban: "10" },
      { label: "C.", jawaban: "18" },
      { label: "D.", jawaban: "19" },
    ],
    kunci: "D.",
    pembahasan: "g(3)=9 sehingga f(9)=19.",
    rumus: "g(3) = 3² = 9     →     (f ∘ g)(3) = f(9) = 2(9) + 1 = 19",
    bobot: 5,
  });

  const handleDelete = () => {
    setShowDelete(false);
    navigate("/bank-soal");
  };

  const handleEdit = () => {
    navigate("/bank-soal/edit-soal");
  };

  return (
    <div className="lihatsoal-layout">

      <main className="lihatsoal-page">

        {/* HEADER */}
        <header className="lihatsoal-header">

          <div className="lihatsoal-breadcrumb">
            <span>Beranda</span>
            <b>›</b>
            <span>Bank Soal</span>
            <b>›</b>
            <strong>Lihat Soal</strong>
          </div>

          <h1>Lihat Soal</h1>

          <p>
            Tinjau pertanyaan, kunci jawaban, dan pembahasan soal.
          </p>

        </header>

        {/* DETAIL SOAL */}
        <section className="lihatsoal-card">

          {/* JUDUL DETAIL */}
          <div className="detail-heading">

            <div className="detail-heading-left">

              <div className="detail-icon">
                <Eye size={22} />                  
              </div>

              <div>
                <h3>Detail Soal</h3>
                <p>Informasi lengkap soal di Bank Soal.</p>
              </div>

            </div>

            <span className="detail-type-badge">
              {soal.jenis}
            </span>

          </div>

          {/* INFORMASI SOAL */}
          <div className="detail-information">

            <div className="information-row">

              <div className="information-item">
                <span>Kelas</span>
                <strong>{soal.kelas}</strong>
              </div>

              <div className="information-item">
                <span>Mata pelajaran</span>
                <strong>{soal.mapel}</strong>
              </div>

              <div className="information-item">
                <span>Materi</span>
                <strong>{soal.materi}</strong>
              </div>

            </div>

            <div className="information-row second-row">

              <div className="information-item">
                <span>Jenis soal</span>
                <strong>{soal.jenis}</strong>
              </div>

              <div className="information-item">
                <span>Asal soal</span>
                <strong>{soal.asal}</strong>
              </div>

              <div className="information-item">
                <span>Gambar soal</span>
                <strong>Belum ada gambar</strong>
              </div>

            </div>

          </div>

          {/* PERTANYAAN */}
          <div className="detail-question">

            <h3>Pertanyaan</h3>

            <p>{soal.pertanyaan}</p>

          </div>

          {/* PILIHAN JAWABAN */}
          <div className="detail-answers">

            <h3>Pilihan Jawaban</h3>

            <p className="answer-description">
              Jawaban yang ditandai merupakan kunci jawaban soal.
            </p>

            <div className="answer-list">

              {soal.pilihan.map((item) => {
                const isCorrect = item.label === soal.kunci;

                return (
                  <div
                    key={item.label}
                    className={`answer-item ${
                      isCorrect ? "correct-answer" : ""
                    }`}
                  >

                    <strong>{item.label}</strong>

                    <span>{item.jawaban}</span>

                    {isCorrect && (
                      <b className="answer-key">
                        Kunci jawaban
                      </b>
                    )}

                  </div>
                );
              })}

            </div>

          </div>

          {/* PEMBAHASAN */}
          <div className="detail-discussion">

            <h3>
              <span><BookOpen size={20} /></span>
              Pembahasan
            </h3>

            <p>{soal.pembahasan}</p>

            <div className="discussion-formula">
              {soal.rumus}
            </div>

            <strong>
              Kunci jawaban: {soal.kunci} {soal.pilihan.find(
                (item) => item.label === soal.kunci
              )?.jawaban}
            </strong>

          </div>

          {/* BOBOT NILAI */}
          <div className="detail-score">

            <div className="score-title">
              <h3>Bobot Nilai</h3>
              <strong>{soal.bobot} poin</strong>
            </div>

            <p>
              Siswa mendapat {soal.bobot} poin jika menjawab benar.
              Jawaban salah atau kosong bernilai 0.
            </p>

          </div>

          {/* FOOTER BUTTON */}
          <div className="detail-footer">

            <button
              className="btn-detail-back"
              onClick={() => navigate("/bank-soal")}
            >
              Kembali
            </button>

            <div className="detail-footer-actions">

              <button
                className="btn-detail-delete"
                onClick={() => setShowDelete(true)}
              >
                Hapus
              </button>

              <button
                className="btn-detail-edit"
                onClick={handleEdit}
              >
                Edit Soal
              </button>

            </div>

          </div>

        </section>

        {/* FOOTER HALAMAN */}
        <footer className="lihatsoal-footer">
          <span>▤</span>
          <p>
            Lorem ipsum dolor sit amet consectetur. Ultrices fringilla
            morbi tortor mauris elementum morbi justo nullam.
          </p>
        </footer>

        {/* MODAL KONFIRMASI HAPUS */}
        {showDelete && (
          <div
            className="delete-overlay"
            onClick={() => setShowDelete(false)}
          >
            <div
              className="delete-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="delete-icon">
                !
              </div>

              <h2>Hapus Soal?</h2>

              <p>
                Apakah Anda yakin ingin menghapus soal ini dari
                Bank Soal? Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="delete-actions">

                <button
                  className="delete-cancel"
                  onClick={() => setShowDelete(false)}
                >
                  Batal
                </button>

                <button
                  className="delete-confirm"
                  onClick={handleDelete}
                >
                  Ya, Hapus
                </button>

              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
