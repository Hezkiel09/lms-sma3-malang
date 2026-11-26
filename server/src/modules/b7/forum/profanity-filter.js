const inappropriateWords = [
  'anjing', 'anjir', 'anjay', 'asu', 'bajingan', 'bangsat', 'babi', 'bego', 'goblok', 'tolol', 'idiot', 'bodoh', 'kampret', 'brengsek',
  'kontol', 'memek', 'jembut', 'pepek', 'pantek', 'puki', 'itil', 'jancuk', 'jancok', 'dancok', 'cuk', 'taik', 'tai', 'beol',
  'ngentot', 'entot', 'bokep', 'porno', 'sange', 'lonte', 'perek', 'pelacur', 'sialan', 'setan', 'iblis', 'keparat', 'modar',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
];

export const containsInappropriateLanguage = (text) => {
  const normalized = String(text || '').toLowerCase()
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
    .replace(/4/g, 'a').replace(/5/g, 's').replace(/@/g, 'a').replace(/\$/g, 's');
  return inappropriateWords.some((word) => normalized.includes(word));
};
