
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./LihatSoal.css";
import { BookOpen, Eye } from "lucide-react";
import { apiFetch } from "../../lib/api";

export default function LihatSoal() {
  const navigate = useNavigate();
  const location = useLocation();
  const bankId = location.state?.bankId || location.state?.soal?.question_bank_id || location.state?.question?.question_bank_id;
  const questionId = location.state?.questionId || location.state?.soal?.id || location.state?.question?.id;

  const [showDelete, setShowDelete] = useState(false);
  const [soal, setSoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [notice] = useState(location.state?.flashMessage || '');

  useEffect(() => {
    let active = true;
    if (!bankId || !questionId) {
      setError('Bank soal atau ID soal tidak tersedia. Buka detail dari daftar soal.');
      setLoading(false);
      return undefined;
    }
    apiFetch(`/banks/${encodeURIComponent(bankId)}/questions`)
      .then((questions) => {
        const question = (Array.isArray(questions) ? questions : []).find((item) => String(item.id) === String(questionId));
        if (!question) throw new Error('Soal tidak ditemukan pada bank soal tersebut.');
        if (!active) return;
        const options = question.question_options || [];
        const correctOption = options.find((option) => option.is_correct);
        setSoal({
          jenis: question.question_type || '—',
          asal: question.created_at ? `Dibuat • ${new Date(question.created_at).toLocaleDateString('id-ID')}` : 'Tersimpan di Bank Soal',
          pertanyaan: question.question_text || '',
          pilihan: options.map((option) => ({ label: `${option.option_label}.`, jawaban: option.option_text })),
          kunci: correctOption ? `${correctOption.option_label}.` : '—',
          pembahasan: question.explanation || 'Belum ada pembahasan.',
          rumus: question.reference_answer || '',
          bobot: Number(question.default_points ?? 0),
          image: question.image_url,
        });
      })
      .catch((fetchError) => { if (active) setError(`Gagal memuat detail soal: ${fetchError.message}`); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [bankId, questionId]);

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await apiFetch(`/banks/${encodeURIComponent(bankId)}/questions/${encodeURIComponent(questionId)}`, { method: 'DELETE' });
      navigate('/b6/bank-soal', { state: { refreshBankId: bankId }, replace: true });
    } catch (deleteError) {
      setError(`Gagal menghapus soal: ${deleteError.message}`);
      setShowDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = () => {
    navigate("/b6/bank-soal/edit-soal", { state: { bankId, questionId } });
  };

  if (loading) return <main className="lihatsoal-page"><p role="status">Memuat detail soal...</p></main>;
  if (error || !soal) return <main className="lihatsoal-page"><p role="alert">{error || 'Detail soal tidak tersedia.'}</p><button className="btn-detail-back" onClick={() => navigate('/b6/bank-soal')}>Kembali ke Bank Soal</button></main>;

  return (
    <div className="lihatsoal-layout">

      <main className="lihatsoal-page">

        {notice && <p role="status" className="edit-success-message">{notice}</p>}

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
                <strong>—</strong>
              </div>

              <div className="information-item">
                <span>Mata pelajaran</span>
                <strong>—</strong>
              </div>

              <div className="information-item">
                <span>Materi</span>
                <strong>—</strong>
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
                <strong>{soal.image ? 'Tersedia' : 'Belum ada gambar'}</strong>
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

              {soal.pilihan.length ? soal.pilihan.map((item) => {
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
              }) : <p>Soal ini tidak memiliki opsi jawaban.</p>}

            </div>

          </div>

          {/* PEMBAHASAN */}
          <div className="detail-discussion">

            <h3>
              <span><BookOpen size={20} /></span>
              Pembahasan
            </h3>

            <p>{soal.pembahasan}</p>

              {soal.rumus && <div className="discussion-formula">
              {soal.rumus}
              </div>}

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
              onClick={() => navigate("/b6/bank-soal")}
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
                  disabled={deleting}
                >
                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                </button>

              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
