// lib/ranking/textUtils.ts

export const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
  "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
  "below", "between", "both", "but", "by", "can", "can't", "cannot", "could",
  "did", "do", "does", "doing", "don't", "down", "during", "each", "few", "for",
  "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers",
  "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is",
  "isn't", "it", "its", "itself", "let's", "me", "more", "most", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
  "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
  "so", "some", "such", "than", "that", "the", "their", "theirs", "them",
  "themselves", "then", "there", "these", "they", "this", "those", "through",
  "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "were",
  "what", "when", "where", "which", "while", "who", "whom", "why", "with",
  "would", "you", "your", "yours", "yourself", "yourselves", "paper", "presents",
  "proposed", "study", "using", "based", "results", "via", "towards", "approach",
]);

/**
 * Basic English stemmer / morphological suffix normalizer.
 * Handles common academic plurals and derivational suffixes.
 */
export function stemWord(word: string): string {
  if (word.length <= 3) return word;

  let stem = word.toLowerCase();

  // Strip possessive
  stem = stem.replace(/'s$/, "");

  // Common academic endings
  if (stem.endsWith("ies") && stem.length > 4) {
    return stem.slice(0, -3) + "y";
  }
  if (stem.endsWith("es") && stem.length > 4 && /(ch|sh|ss|x|z)es$/.test(stem)) {
    return stem.slice(0, -2);
  }
  if (stem.endsWith("s") && !stem.endsWith("ss") && stem.length > 3) {
    stem = stem.slice(0, -1);
  }

  // Common derivational suffixes normalization
  if (stem.endsWith("ing") && stem.length > 5) {
    stem = stem.slice(0, -3);
  } else if (stem.endsWith("ed") && stem.length > 4) {
    stem = stem.slice(0, -2);
  } else if (stem.endsWith("tion") && stem.length > 6) {
    stem = stem.slice(0, -4);
  } else if (stem.endsWith("tional") && stem.length > 7) {
    stem = stem.slice(0, -6);
  } else if (stem.endsWith("ment") && stem.length > 6) {
    stem = stem.slice(0, -4);
  }

  return stem;
}

/**
 * Clean and normalize a string into lowercase alphabetic tokens.
 */
export function tokenize(text?: string | null): string[] {
  if (!text || typeof text !== "string") return [];

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/[\s-]+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Extract stemmed unique token set.
 */
export function getStemmedTokenSet(text?: string | null): Set<string> {
  const tokens = tokenize(text);
  const stemmed = tokens.map(stemWord);
  return new Set(stemmed.filter((s) => s.length > 1));
}

/**
 * Extract multi-word phrase n-grams (bigrams and trigrams) from text.
 */
export function extractPhrases(text?: string | null): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const phrases: string[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const bigram = `${words[i]} ${words[i + 1]}`;
    phrases.push(bigram);

    if (i < words.length - 2) {
      const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      phrases.push(trigram);
    }
  }

  return phrases;
}

/**
 * Compute token overlap / coverage score (0 to 1).
 * Returns how well candidate text covers the query token set.
 */
export function calculateCoverage(queryTokens: Set<string>, targetTokens: Set<string>): number {
  if (queryTokens.size === 0) return 0;

  let matches = 0;
  for (const token of queryTokens) {
    if (targetTokens.has(token)) {
      matches++;
    }
  }

  return matches / queryTokens.size;
}

/**
 * Check if a normalized multi-word phrase appears in the target text.
 */
export function containsPhrase(targetText: string, phrase: string): boolean {
  if (!targetText || !phrase) return false;
  const cleanTarget = targetText.toLowerCase().replace(/[^\w\s]/g, " ");
  const cleanPhrase = phrase.toLowerCase().replace(/[^\w\s]/g, " ");
  return cleanTarget.includes(cleanPhrase);
}
