import nlp from 'compromise';

export function analyzeTextWithNLP(message: string): { keywords: string[]; normalized: string } {
  const doc = nlp(message);
  const normalized = doc.normalize({ whitespace: true, punctuation: true }).text();
  const keywords = doc.nouns().out('array').map((k) => k.toLowerCase());

  return { keywords, normalized };
}
