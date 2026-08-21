// lib/ranking/config.ts
import { RankingWeights } from "./types";

/**
 * Standard signal weights configuration for PaperScout's Relevance Ranking Engine.
 * Sum = 1.0 (100%).
 */
export const RANKING_WEIGHTS: RankingWeights = {
  interestMatch: 0.35, // Explicit user interest match (PaperInterest + exact name)
  topicMatch: 0.25, // Title & Abstract keyword / phrase overlap
  researchContext: 0.15, // Free-form user research context overlap
  researchGoal: 0.1, // Alignment with user's research intent (thesis, gaps, etc.)
  recency: 0.1, // Publication date recency decay curve
  citationSignal: 0.05, // Log-normalized citation count impact
};

/**
 * Categorical relevance thresholds.
 */
export const RELEVANCE_THRESHOLDS = {
  highlyRelevant: 90,
  relevant: 75,
  potentiallyRelevant: 60,
};

export const RELEVANCE_LABELS = {
  HIGHLY_RELEVANT: "Highly relevant",
  RELEVANT: "Relevant",
  POTENTIALLY_RELEVANT: "Potentially relevant",
  LOW_RELEVANCE: "Low relevance",
};

/**
 * Configuration for recency decay.
 * Half-life in days: after 365 days (~1 year), recency score drops to ~50% of maximum.
 */
export const RECENCY_CONFIG = {
  halfLifeDays: 365,
  minRecencyScore: 25, // Baseline score for historical foundational papers
  maxRecencyScore: 100, // Score for papers published today
  defaultNeutralScore: 60, // Fallback when publication date is missing
};

/**
 * Configuration for citation compression.
 * Uses log(1 + citations) / log(1 + maxBenchmark) * 100.
 */
export const CITATION_CONFIG = {
  benchmarkCitations: 500, // 500+ citations maps to maximum signal score (100)
  defaultNeutralScore: 50, // Fallback when citation count is missing
};

/**
 * Maximum number of consecutive papers from the exact same primary interest topic
 * allowed before triggering diversity interleaving.
 */
export const DIVERSITY_CONFIG = {
  maxConsecutiveSameInterest: 2,
  diversityPenalty: 3.0, // Small score adjustment to promote topic interleaving
};
