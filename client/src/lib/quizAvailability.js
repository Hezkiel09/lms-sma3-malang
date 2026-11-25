export const isQuizAvailableNow = (quiz, now = Date.now()) => {
  const startsAt = quiz.start_at ? Date.parse(quiz.start_at) : null;
  const endsAt = quiz.end_at ? Date.parse(quiz.end_at) : null;

  return String(quiz.status || '').toUpperCase() === 'PUBLISHED'
    && (startsAt === null || (Number.isFinite(startsAt) && startsAt <= now))
    && (endsAt === null || (Number.isFinite(endsAt) && endsAt > now));
};
