
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditSoal.css";
import { b6ApiFetch } from "./b6-api";
import { getQuestionTypeLabel } from "./b6-utils";

const EMPTY_FORM = {
  kelas: "",
  mapel: "",
  materi: "",
  jenis: "Pilihan Ganda",
  pertanyaan: "",
  pilihan: ["", "", "", ""],
  kunci: 0,
  pembahasan: "",
  bobot: 1,
};

function toEditForm(question, bank = {}, classId) {
  const options = question.question_options || question.options || question.pilihan || [];
  const correctIndex = options.findIndex((option) => (
    option.is_correct
    || option.key === question.kunciJawaban
    || option.key === question.kunci
  ));
  const jenis = question.tipe || question.jenis || getQuestionTypeLabel(question.question_type);
  const pilihan = jenis === "Esai"
    ? []
    : jenis === "Benar / Salah"
      ? ["Benar", "Salah"]
      : options.length
      ? options.map((option) => option.option_text || option.teks || option.jawaban || "")
      : ["", "", "", ""];

  return {
    kelas: (bank.courses || []).find(
      (course) => String(course.class_id) === String(classId),
    )?.classes?.name || bank.class_level || question.kelas || "",
    mapel: bank.subject_name || bank.name || question.mapel || "",
    materi: bank.topic_name || question.materi || "",
    jenis,
    pertanyaan: question.question_text || question.pertanyaan || "",
    pilihan,
    kunci: Math.max(correctIndex, 0),
    pembahasan: question.explanation || question.pembahasan || "",
    bobot: question.default_points ?? question.points ?? question.bobot ?? 1,
  };
}

export default function EditSoal() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  const bankId = location.state?.bankId || search.get("bankId");
  const questionId = location.state?.questionId || search.get("questionId");
  const returnKelas = location.state?.returnKelas;
  const returnMapel = location.state?.returnMapel;
  const [form, setForm] = useState(
    location.state?.question
      ? toEditForm(location.state.question, location.state.bank, location.state.classId)
      : EMPTY_FORM,
  );
  const [questionRecord, setQuestionRecord] = useState(location.state?.question || null);
  const [bankRecord, setBankRecord] = useState(location.state?.bank || {});
  const [isLoading, setIsLoading] = useState(Boolean(bankId && questionId));
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [previewGambar, setPreviewGambar] = useState(
    location.state?.question?.image_url || null,
  );
  const [pesan, setPesan] = useState("");
  const [saveError, setSaveError] = useState("");

  const navigateToBankStep = (step) => {
    navigate("/b6/bank-soal", {
      state: returnKelas && returnMapel
        ? {
            restoreStep: step,
            restoreKelas: returnKelas,
            restoreMapel: returnMapel,
            hasReachedStepFour: location.state?.hasReachedStepFour,
          }
        : undefined,
    });
  };

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

        setQuestionRecord(question);
        setBankRecord(bank || {});
        setForm(toEditForm(question, bank || {}, location.state?.classId));
        setPreviewGambar(question.image_url || null);
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
  }, [bankId, questionId, location.state?.classId]);

  // Mengubah data form
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Mengubah pilihan jawaban
  const handlePilihanChange = (index, value) => {
    if (form.jenis !== "Pilihan Ganda") return;

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

    setPreviewGambar(URL.createObjectURL(file));
  };

  // Hapus gambar
  const handleHapusGambar = () => {
    if (previewGambar?.startsWith("blob:")) {
      URL.revokeObjectURL(previewGambar);
    }

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

    if (!bankId || !questionId || !questionRecord) {
      setLoadError("Data soal belum berhasil dimuat. Perubahan belum dapat disimpan.");
      return;
    }

    const type = form.jenis === "Esai"
      ? "ESAI"
      : form.jenis === "Benar / Salah"
        ? "BENAR_SALAH"
        : "PILIHAN_GANDA";
    const options = form.jenis === "Esai"
      ? []
      : (form.jenis === "Benar / Salah" ? ["Benar", "Salah"] : form.pilihan)
        .map((optionText, index) => ({
          option_label: form.jenis === "Benar / Salah"
            ? (index === 0 ? "B" : "S")
            : String.fromCharCode(65 + index),
          option_text: optionText.trim(),
          is_correct: index === form.kunci,
        }));

    setSaveError("");
    setIsSaving(true);
    b6ApiFetch(`/banks/${encodeURIComponent(bankId)}/questions/${encodeURIComponent(questionId)}`, {
      method: "PUT",
      body: JSON.stringify({
        question_text: form.pertanyaan.trim(),
        question_type: type,
        default_points: Number(form.bobot),
        explanation: form.pembahasan,
        reference_answer: questionRecord.reference_answer,
        grading_rubric: questionRecord.grading_rubric,
        scoring_method: questionRecord.scoring_method,
        image_url: questionRecord.image_url,
        options,
      }),
    })
      .then((savedQuestion) => {
        setQuestionRecord(savedQuestion);
        setPesan("Perubahan soal berhasil disimpan!");
        const query = new URLSearchParams({ bankId, questionId });
        navigate(`/b6/bank-soal/lihat-soal?${query.toString()}`, {
          state: {
            bankId,
            questionId,
            question: savedQuestion,
            bank: bankRecord,
            className: location.state?.className,
            classId: location.state?.classId,
            returnKelas: location.state?.returnKelas,
            returnMapel: location.state?.returnMapel,
            hasReachedStepFour: location.state?.hasReachedStepFour,
          },
        });
      })
        .catch((error) => setSaveError(error.message))
      .finally(() => setIsSaving(false));
  };

  const createdDate = questionRecord?.created_at
      ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
          new Date(questionRecord.created_at),
        )
      : "Tanggal tidak tersedia";
  const loadMessage = loadError || (
      !bankId || !questionId
        ? "ID bank atau soal tidak tersedia. Buka halaman edit dari soal yang dipilih."
        : ""
  );

  return (
    <div className="editsoal-layout">

      <main className="editsoal-page">

        {/* HEADER */}
        <header className="editsoal-header">

          <div className="editsoal-breadcrumb">
            <button type="button" onClick={() => navigate("/b6/beranda")}>Beranda</button>
            <b>›</b>
            <button type="button" onClick={() => navigateToBankStep(1)}>Bank Soal</button>
            {returnKelas && (
              <>
                <b>›</b>
                <button type="button" onClick={() => navigateToBankStep(2)}>
                  Kelas {returnKelas.romawi}
                </button>
              </>
            )}
            {returnMapel && (
              <>
                <b>›</b>
                <button type="button" onClick={() => navigateToBankStep(2)}>
                  Mapel
                </button>
                <b>›</b>
                <button type="button" onClick={() => navigateToBankStep(3)}>
                  {returnMapel.nama}
                </button>
              </>
            )}
            <b>›</b>
            <strong>Edit Soal</strong>
          </div>

          <h1>Edit Soal</h1>

          <p>
            {loadMessage || "Perbarui detail pertanyaan dan kunci jawaban di Bank Soal."}
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

            <span>Dibuat • {createdDate}</span>

          </div>

          {(isLoading || saveError) && (
            <p className="field-hint" role={saveError ? "alert" : "status"}>
              {isLoading ? "Memuat soal..." : saveError}
            </p>
          )}

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
                {form.kelas && !["X", "XI", "XII"].includes(form.kelas) && (
                  <option value={form.kelas}>{form.kelas}</option>
                )}
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
                {form.mapel && ![
                  "Matematika",
                  "Bahasa Indonesia",
                  "Bahasa Inggris",
                  "Fisika",
                  "Kimia",
                  "Biologi",
                ].includes(form.mapel) && <option>{form.mapel}</option>}
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
                {form.materi && ![
                  "Komposisi & invers",
                  "Fungsi",
                  "Limit",
                  "Turunan",
                  "Integral",
                ].includes(form.materi) && <option>{form.materi}</option>}
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

                    {form.jenis === "Benar / Salah" ? (
                      <span className="flex-1 text-sm text-slate-700">
                        {index === 0 ? "Benar" : "Salah"}
                      </span>
                    ) : (
                      <input
                        type="text"
                        value={jawaban}
                        onChange={(e) =>
                          handlePilihanChange(index, e.target.value)
                        }
                        aria-label={`Pilihan jawaban ${index + 1}`}
                        required
                      />
                    )}

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
              disabled={isLoading || isSaving || !questionRecord}
            >
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
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
