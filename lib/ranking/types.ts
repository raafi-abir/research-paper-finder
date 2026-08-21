// lib/ranking/types.ts

export type RelevanceLevel =
  | "HIGHLY_RELEVANT"
  | "RELEVANT"
  | "POTENTIALLY_RELEVANT"
  | "LOW_RELEVANCE";

export interface RankingWeights {
  interestMatch: number; // default: 0.35
  topicMatch: number; // default: 0.25
  researchContext: number; // default: 0.15
  researchGoal: number; // default: 0.10
  recency: number; // default: 0.10
  citationSignal: number; // default: 0.05
}

export interface ScoreBreakdown {
  interestMatch: number; // 0–100
  topicMatch: number; // 0–100
  researchContext: number; // 0–100
  researchGoal: number; // 0–100
  recency: number; // 0–100
  citationSignal: number; // 0–100
}

export interface RankingResult {
  paperId: string;
  score: number; // 0–100 (rounded)
  rawScore: number; // 0–100 (unrounded float)
  relevanceLevel: RelevanceLevel;
  breakdown: ScoreBreakdown;
  matchedInterests: string[];
  matchedKeywords: string[];
  explanation: string;
}

export interface UserInterestProfile {
  id: string;
  name: string;
  slug: string;
  category?: string;
}

export interface UserProfileContext {
  userId?: string;
  academicField?: string;
  researchLevel?: string;
  researchContext?: string | null;
  researchGoals?: string[] | null;
  interests: UserInterestProfile[];
}

export interface PaperCandidate {
  id: string;
  title: string;
  abstract?: string | null;
  authors?: string[] | unknown;
  journal?: string | null;
  conference?: string | null;
  publicationDate?: Date | string | null;
  citationCount?: number | null;
  doi?: string | null;
  url?: string | null;
  source?: string | null;
  externalId?: string | null;
  interests?: {
    interest: {
      id: string;
      name: string;
      slug: string;
    };
  }[];
}

export interface RankedPaper extends PaperCandidate {
  number: string;
  relevanceScore: number;
  relevanceLevel: RelevanceLevel;
  relevanceLabel: string;
  explanation: string;
  scoreBreakdown: ScoreBreakdown;
  matchedInterests: string[];
}
