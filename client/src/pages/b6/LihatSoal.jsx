
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LihatSoal.css";
import { BookOpen, Eye } from "lucide-react";
import { b6ApiFetch } from "./b6-api";
import { getQuestionTypeLabel } from "./b6-utils";

function toQuestionDetails(question, bank = {}, className) {
  const options = question.pilihan || question.question_options || question.options || [];
  const normalizedOptions = options.map((option) => {
    const key = option.key || option.option_label || option.label || "";
    return {
      key: String(key).replace(/\.$/, ""),
      label: `${String(key).replace(/\.$/, "")}.`,
      jawaban: option.teks || option.option_text || option.jawaban || "",
      isCorrect: Boolean(option.is_correct),
    };
  });
  const correctOption = normalizedOptions.find((option) => option.isCorrect);
  const correctKey = String(
    question.kunciJawaban || question.kunci || correctOption?.key || "",
  ).replace(/\.$/, "");
  const date = question.created_at
    ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(question.created_at))
    : question.tanggal || "—";

  return {
    id: question.id,
    bankId: bank.id || question.question_bank_id,
    kelas: className || bank.class_level || "—",
    mapel: bank.subject_name || bank.name || "—",
    materi: bank.topic_name || "—",
    jenis: question.tipe || question.jenis || getQuestionTypeLabel(question.question_type),
    asal: `${question.metode || "Dibuat"} • ${date}`,
    imageUrl: question.image_url || "",
    pertanyaan: question.pertanyaan || question.question_text || "",
    pilihan: normalizedOptions,
    kunci: correctKey,
    pembahasan: question.pembahasan || question.explanation || question.reference_answer || "Belum ada pembahasan.",
    rumus: question.rumus
      || (Array.isArray(question.grading_rubric)
        ? question.grading_rubric.map((item) => item.text || item).join(" • ")
        : ""),
    bobot: question.default_points ?? question.points ?? question.bobot ?? 0,
  };
}

function getBankClassName(bank, classId, fallback) {
  const course = (bank.courses || []).find(
    (item) => String(item.class_id) === String(classId),
  );
  return course?.classes?.name || fallback || bank.class_level || "—";
}

export default function LihatSoal() {
  const navigate = useNavigate();
  const location = useLocation();
  const bankId = location.state?.bankId || new URLSearchParams(location.search).get("bankId");
  const questionId = location.state?.questionId || new URLSearchParams(location.search).get("questionId");
  const initialQuestion = location.state?.question || location.state?.soal;
  const [soal, setSoal] = useState(
    initialQuestion
      ? toQuestionDetails(initialQuestion, location.state?.bank, location.state?.className)
      : null,
  );
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(bankId && questionId && !initialQuestion));
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!bankId || !questionId) return undefined;

    let active = true;
    Promise.all([
      b6ApiFetch(`/banks/${encodeURIComponent(bankId)}`),
      b6ApiFetch(`/banks/${encodeURIComponent(bankId)}/questions`),
    ])
      .then(([bank, questions]) => {
        if (!active) return;
        const question = (Array.isArray(questions) ? questions : []).find(
          (item) => String(item.id) === String(questionId),
        );
        if (!question) {
          setLoadError("Soal yang dipilih tidak ditemukan pada bank soal ini.");
          return;
        }
        setSoal(toQuestionDetails(
          question,
          bank,
          getBankClassName(bank, location.state?.classId, location.state?.className),
        ));
        setLoadError("");
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bankId, questionId, location.state?.className, location.state?.classId]);

  const handleDelete = () => {
    setShowDelete(false);
    navigate("/bank-soal");
  };

  const handleEdit = () => {
    const query = new URLSearchParams({ bankId, questionId });
    navigate(`/b6/bank-soal/edit-soal?${query.toString()}`, {
      state: {
        question: location.state?.question || location.state?.soal || soal,
        questionId,
        bankId,
        bank: location.state?.bank,
        className: location.state?.className,
        classId: location.state?.classId,
        returnKelas: location.state?.returnKelas,
        returnMapel: location.state?.returnMapel,
        hasReachedStepFour: location.state?.hasReachedStepFour,
      },
    });
  };

  const handleBack = () => {
    const { returnKelas, returnMapel } = location.state || {};
    navigate("/b6/bank-soal", {
      state: returnKelas && returnMapel
        ? {
            restoreStep: 3,
            restoreKelas: returnKelas,
            restoreMapel: returnMapel,
            hasReachedStepFour: location.state?.hasReachedStepFour,
          }
        : undefined,
      replace: true,
    });
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
            {loadError || "Tinjau pertanyaan, kunci jawaban, dan pembahasan soal."}
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
              {soal?.jenis || "—"}
            </span>

          </div>

          {/* INFORMASI SOAL */}
          <div className="detail-information">

            <div className="information-row">

              <div className="information-item">
                <span>Kelas</span>
                <strong>{soal?.kelas || "—"}</strong>
              </div>

              <div className="information-item">
                <span>Mata pelajaran</span>
                <strong>{soal?.mapel || "—"}</strong>
              </div>

              <div className="information-item">
                <span>Materi</span>
                <strong>{soal?.materi || "—"}</strong>
              </div>

            </div>

            <div className="information-row second-row">

              <div className="information-item">
                <span>Jenis soal</span>
                <strong>{soal?.jenis || "—"}</strong>
              </div>

              <div className="information-item">
                <span>Asal soal</span>
                <strong>{soal?.asal || "—"}</strong>
              </div>

              <div className="information-item">
                <span>Gambar soal</span>
                <strong>{soal?.imageUrl ? "Tersedia" : "Belum ada gambar"}</strong>
              </div>

            </div>

          </div>

          {/* PERTANYAAN */}
          <div className="detail-question">

            <h3>Pertanyaan</h3>

            <p>{isLoading ? "Memuat soal..." : soal?.pertanyaan || "Soal tidak tersedia."}</p>

          </div>

          {/* PILIHAN JAWABAN */}
          {soal?.pilihan.length > 0 && <div className="detail-answers">

            <h3>Pilihan Jawaban</h3>

            <p className="answer-description">
              Jawaban yang ditandai merupakan kunci jawaban soal.
            </p>

            <div className="answer-list">

              {soal.pilihan.map((item) => {
                const isCorrect = item.key === soal.kunci;

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

          </div>}

          {/* PEMBAHASAN */}
          <div className="detail-discussion">

            <h3>
              <span><BookOpen size={20} /></span>
              Pembahasan
            </h3>

            <p>{soal?.pembahasan || "Belum ada pembahasan."}</p>

            {soal?.rumus && <div className="discussion-formula">{soal.rumus}</div>}

            {soal?.kunci && (
              <strong>
                Kunci jawaban: {soal.kunci} {soal.pilihan.find(
                  (item) => item.key === soal.kunci
                )?.jawaban}
              </strong>
            )}

          </div>

          {/* BOBOT NILAI */}
          <div className="detail-score">

            <div className="score-title">
              <h3>Bobot Nilai</h3>
              <strong>{soal?.bobot ?? 0} poin</strong>
            </div>

            <p>
              {soal?.jenis === "Esai"
                ? "Nilai diberikan berdasarkan jawaban dan rubrik yang tersedia."
                : `Siswa mendapat ${soal?.bobot ?? 0} poin jika menjawab benar. Jawaban salah atau kosong bernilai 0.`}
            </p>

          </div>

          {/* FOOTER BUTTON */}
          <div className="detail-footer">

            <button
              className="btn-detail-back"
              onClick={handleBack}
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
