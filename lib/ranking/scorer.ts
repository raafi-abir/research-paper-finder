// lib/ranking/scorer.ts
import {
  PaperCandidate,
  UserProfileContext,
  ScoreBreakdown,
  RankingWeights,
  UserInterestProfile,
} from "./types";
import {
  RANKING_WEIGHTS,
  RECENCY_CONFIG,
  CITATION_CONFIG,
} from "./config";
import {
  getStemmedTokenSet,
  containsPhrase,
  calculateCoverage,
  tokenize,
  stemWord,
} from "./textUtils";

/**
 * 1. Interest Match Scorer (35% weight)
 * Evaluates direct association between the paper and the user's defined interests.
 */
export function calculateInterestMatchScore(
  paper: PaperCandidate,
  userInterests: UserInterestProfile[]
): { score: number; matchedInterests: string[] } {
  if (!userInterests || userInterests.length === 0) {
    return { score: 50, matchedInterests: [] };
  }

  const matchedSet = new Set<string>();
  const paperText = `${paper.title || ""} ${paper.abstract || ""}`.toLowerCase();

  // A. Check explicit PaperInterest relationships
  if (Array.isArray(paper.interests)) {
    for (const pi of paper.interests) {
      const match = userInterests.find(
        (ui) =>
          ui.id === pi.interest.id ||
          ui.slug === pi.interest.slug ||
          ui.name.toLowerCase() === pi.interest.name.toLowerCase()
      );
      if (match) {
        matchedSet.add(match.name);
      }
    }
  }

  // B. Check full phrase match in paper title or abstract
  for (const ui of userInterests) {
    if (containsPhrase(paperText, ui.name)) {
      matchedSet.add(ui.name);
    }
  }

  const matchedCount = matchedSet.size;
  const totalUserInterests = userInterests.length;

  if (matchedCount === 0) {
    // If no direct interest matches, assign a low baseline (15)
    return { score: 15, matchedInterests: [] };
  }

  // Sublinear normalization curve:
  // 1 match -> ~70, 2 matches -> ~88, 3 matches -> ~96, 4+ matches -> 100
  const coverageRatio = matchedCount / totalUserInterests;
  const saturationBoost = Math.min(matchedCount * 25, 60);
  const normalizedScore = Math.min(35 + saturationBoost + coverageRatio * 30, 100);

  return {
    score: Math.round(normalizedScore),
    matchedInterests: Array.from(matchedSet),
  };
}

/**
 * 2. Topic / Text Match Scorer (25% weight)
 * Evaluates semantic keyword & phrase density across title and abstract.
 */
export function calculateTopicMatchScore(
  paper: PaperCandidate,
  userInterests: UserInterestProfile[],
  academicField?: string
): { score: number; matchedKeywords: string[] } {
  const matchedKeywords = new Set<string>();

  if (!userInterests || userInterests.length === 0) {
    return { score: 50, matchedKeywords: [] };
  }

  const titleTokens = getStemmedTokenSet(paper.title);
  const abstractTokens = getStemmedTokenSet(paper.abstract);
  const combinedPaperTokens = new Set([...titleTokens, ...abstractTokens]);
  const fullTitle = (paper.title || "").toLowerCase();
  const fullAbstract = (paper.abstract || "").toLowerCase();

  // Score match against each interest individually
  const interestScores: number[] = [];

  for (const interest of userInterests) {
    const interestWords = tokenize(interest.name);
    const interestStemmed = new Set(interestWords.map(stemWord));

    let titleHits = 0;
    for (const token of interestStemmed) {
      if (titleTokens.has(token)) {
        titleHits++;
        matchedKeywords.add(token);
      }
    }

    let abstractHits = 0;
    for (const token of interestStemmed) {
      if (abstractTokens.has(token)) {
        abstractHits++;
        matchedKeywords.add(token);
      }
    }

    const titleRatio = interestStemmed.size > 0 ? titleHits / interestStemmed.size : 0;
    const abstractRatio = interestStemmed.size > 0 ? abstractHits / interestStemmed.size : 0;

    let scoreForThisInterest = titleRatio * 65 + abstractRatio * 35;

    // Phrase bonuses
    if (containsPhrase(fullTitle, interest.name)) {
      scoreForThisInterest = Math.max(scoreForThisInterest, 90);
    } else if (containsPhrase(fullAbstract, interest.name)) {
      scoreForThisInterest = Math.max(scoreForThisInterest, 75);
    }

    interestScores.push(scoreForThisInterest);
  }

  // Sort interest scores descending
  interestScores.sort((a, b) => b - a);

  // Best matching interest carries 60% of topic score, second best carries 25%, third 15%
  const bestScore = interestScores[0] || 0;
  const secondScore = interestScores[1] || 0;
  const thirdScore = interestScores[2] || 0;

  let compositeScore = bestScore * 0.6 + secondScore * 0.25 + thirdScore * 0.15;

  // Academic field bonus
  if (academicField) {
    const fieldStemmed = new Set(tokenize(academicField).map(stemWord));
    const fieldCoverage = calculateCoverage(fieldStemmed, combinedPaperTokens);
    if (fieldCoverage > 0.3) {
      compositeScore = Math.min(100, compositeScore + 10);
    }
  }

  const finalScore = Math.max(15, Math.min(100, Math.round(compositeScore)));
  return {
    score: finalScore,
    matchedKeywords: Array.from(matchedKeywords),
  };
}


/**
 * 3. Research Context Scorer (15% weight)
 * Evaluates overlap with user's free-form contextual description.
 */
export function calculateResearchContextScore(
  paper: PaperCandidate,
  researchContext?: string | null
): number {
  if (!researchContext || researchContext.trim().length === 0) {
    return 60; // Neutral baseline when user hasn't specified research context
  }

  const contextStemmed = getStemmedTokenSet(researchContext);
  if (contextStemmed.size === 0) return 60;

  const combinedPaperTokens = new Set([
    ...getStemmedTokenSet(paper.title),
    ...getStemmedTokenSet(paper.abstract),
  ]);

  const coverage = calculateCoverage(contextStemmed, combinedPaperTokens);

  // Scaling: 30% coverage of a detailed context paragraph indicates very strong relevance
  const scaledScore = 30 + Math.min(coverage * 200, 70);
  return Math.min(100, Math.round(scaledScore));
}

/**
 * 4. Research Goal Alignment Scorer (10% weight)
 * Deterministic mapping based on research intent.
 */
export function calculateResearchGoalScore(
  paper: PaperCandidate,
  researchGoals?: string[] | null,
  publicationDate?: Date | string | null
): number {
  if (!researchGoals || researchGoals.length === 0) {
    return 65; // Neutral baseline
  }

  let totalPoints = 0;
  const paperText = `${paper.title || ""} ${paper.abstract || ""}`.toLowerCase();

  for (const goal of researchGoals) {
    const g = goal.toLowerCase();

    if (g.includes("thesis") || g.includes("gap") || g.includes("discover")) {
      // Prioritizes papers discussing challenges, limitations, future directions, or novel frameworks
      if (
        paperText.includes("challenge") ||
        paperText.includes("future work") ||
        paperText.includes("novel") ||
        paperText.includes("framework") ||
        paperText.includes("limitation")
      ) {
        totalPoints += 90;
      } else {
        totalPoints += 60;
      }
    } else if (g.includes("project") || g.includes("build") || g.includes("implement")) {
      // Prioritizes applied, experimental, prototype, or benchmark studies
      if (
        paperText.includes("implement") ||
        paperText.includes("experimental") ||
        paperText.includes("prototype") ||
        paperText.includes("case study") ||
        paperText.includes("dataset")
      ) {
        totalPoints += 90;
      } else {
        totalPoints += 60;
      }
    } else if (g.includes("updated") || g.includes("latest") || g.includes("learn")) {
      // Prioritizes recent publications and comprehensive reviews
      const isRecent =
        publicationDate &&
        new Date().getFullYear() - new Date(publicationDate).getFullYear() <= 1;
      if (isRecent || paperText.includes("survey") || paperText.includes("review")) {
        totalPoints += 90;
      } else {
        totalPoints += 65;
      }
    } else {
      totalPoints += 70;
    }
  }

  const avgScore = totalPoints / researchGoals.length;
  return Math.min(100, Math.round(avgScore));
}

/**
 * 5. Publication Recency Scorer (10% weight)
 * Uses smooth exponential decay: score = minScore + (max - min) * 2^(-days / halfLife).
 */
export function calculateRecencyScore(publicationDate?: Date | string | null): number {
  if (!publicationDate) {
    return RECENCY_CONFIG.defaultNeutralScore;
  }

  const pubTime = new Date(publicationDate).getTime();
  if (isNaN(pubTime)) {
    return RECENCY_CONFIG.defaultNeutralScore;
  }

  const now = Date.now();
  const diffDays = Math.max(0, (now - pubTime) / (1000 * 60 * 60 * 24));

  const { halfLifeDays, minRecencyScore, maxRecencyScore } = RECENCY_CONFIG;
  const decayFactor = Math.pow(0.5, diffDays / halfLifeDays);

  const score = minRecencyScore + (maxRecencyScore - minRecencyScore) * decayFactor;
  return Math.min(100, Math.max(0, Math.round(score)));
}

/**
 * 6. Citation Signal Scorer (5% weight)
 * Log-compressed normalized impact signal.
 */
export function calculateCitationScore(citationCount?: number | null): number {
  if (citationCount === undefined || citationCount === null || citationCount < 0) {
    return CITATION_CONFIG.defaultNeutralScore;
  }

  if (citationCount === 0) {
    return 40; // Recent papers often have 0 citations; don't penalize heavily
  }

  const { benchmarkCitations } = CITATION_CONFIG;
  const logScore = (Math.log(1 + citationCount) / Math.log(1 + benchmarkCitations)) * 100;

  // Bounded between 40 and 100
  return Math.min(100, Math.max(40, Math.round(logScore)));
}

/**
 * Compute the final weighted score from all signal breakdowns.
 */
export function computeFinalScore(
  breakdown: ScoreBreakdown,
  weights: RankingWeights = RANKING_WEIGHTS
): { score: number; rawScore: number } {
  const rawScore =
    breakdown.interestMatch * weights.interestMatch +
    breakdown.topicMatch * weights.topicMatch +
    breakdown.researchContext * weights.researchContext +
    breakdown.researchGoal * weights.researchGoal +
    breakdown.recency * weights.recency +
    breakdown.citationSignal * weights.citationSignal;

  const bounded = Math.max(0, Math.min(100, rawScore));
  return {
    score: Math.round(bounded),
    rawScore: Math.round(bounded * 100) / 100,
  };
}
