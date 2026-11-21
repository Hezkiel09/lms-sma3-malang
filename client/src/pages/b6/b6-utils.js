export function getQuestionTypeLabel(type) {
  const normalizedType = String(type || '').toUpperCase();
  if (normalizedType.includes('ESSAY') || normalizedType.includes('ESAI')) return 'Esai';
  if (normalizedType.includes('TRUE_FALSE') || normalizedType.includes('BENAR')) {
    return 'Benar / Salah';
  }
  return 'Pilihan Ganda';
}

export function toQuestionViewModel(question, bank = {}) {
  const options = question.question_options || question.options || [];
  const correctOption = options.find((option) => option.is_correct);
  const createdAt = question.created_at ? new Date(question.created_at) : null;
  const date = createdAt && !Number.isNaN(createdAt.getTime())
    ? new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(createdAt)
    : '—';
  const isEssay = getQuestionTypeLabel(question.question_type) === 'Esai';
  const referenceAnswer = question.reference_answer || '';

  return {
    ...question,
    tipe: getQuestionTypeLabel(question.question_type),
    metode: 'Dibuat',
    tanggal: date,
    pertanyaan: question.question_text || '',
    tag: [bank.class_level, bank.subject_name || bank.name, bank.topic_name].filter(Boolean).join(' • '),
    pilihan: options.map((option) => ({
      key: option.option_label,
      teks: option.option_text,
    })),
    kunciJawaban: correctOption?.option_label || correctOption?.option_text || referenceAnswer,
    jawabanAcuan: referenceAnswer,
    pedomanPenilaian: question.grading_rubric || [],
    labelJawaban: isEssay ? 'Jawaban acuan' : 'Kunci jawaban',
    pembahasan: question.explanation || '',
  };
}

export function getClassLabel(classLevel) {
  const value = String(classLevel || '').trim();
  if (!value) return 'Kelas tidak ditentukan';
  return /^kelas\b/i.test(value) ? value : `Kelas ${value}`;
}

export function getClassLevel(classLevel) {
  return getClassLabel(classLevel).replace(/^kelas\s*/i, '').trim();
}
