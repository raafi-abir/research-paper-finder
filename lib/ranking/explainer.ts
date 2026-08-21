// lib/ranking/explainer.ts
import {
  PaperCandidate,
  UserProfileContext,
  ScoreBreakdown,
  RelevanceLevel,
} from "./types";
import { RELEVANCE_THRESHOLDS } from "./config";

/**
 * Categorize a 0–100 numerical score into a clean RelevanceLevel.
 */
export function getRelevanceLevel(score: number): RelevanceLevel {
  if (score >= RELEVANCE_THRESHOLDS.highlyRelevant) {
    return "HIGHLY_RELEVANT";
  }
  if (score >= RELEVANCE_THRESHOLDS.relevant) {
    return "RELEVANT";
  }
  if (score >= RELEVANCE_THRESHOLDS.potentiallyRelevant) {
    return "POTENTIALLY_RELEVANT";
  }
  return "LOW_RELEVANCE";
}

/**
 * Generate human-readable, deterministic explanation of why a paper is relevant to a user.
 */
export function generateExplanation(
  paper: PaperCandidate,
  userProfile: UserProfileContext,
  breakdown: ScoreBreakdown,
  matchedInterests: string[],
  matchedKeywords: string[]
): string {
  const parts: string[] = [];

  // 1. Interest Match statement
  if (matchedInterests.length >= 2) {
    parts.push(
      `Matches your research interests in ${matchedInterests.slice(0, 2).join(" and ")}${
        matchedInterests.length > 2 ? ` and ${matchedInterests.length - 2} other areas` : ""
      }`
    );
  } else if (matchedInterests.length === 1) {
    parts.push(`Directly aligned with your interest in ${matchedInterests[0]}`);
  } else if (matchedKeywords.length > 0) {
    parts.push(`Addresses key concepts related to your academic field`);
  } else {
    parts.push(`Indexed as relevant to your general academic profile`);
  }

  // 2. Context overlap statement
  if (breakdown.researchContext >= 75 && userProfile.researchContext) {
    parts.push("closely overlaps with your specific research focus");
  } else if (breakdown.topicMatch >= 80) {
    parts.push("demonstrates high topical relevance in title and findings");
  }

  // 3. Recency / Impact signal
  const pubYear = paper.publicationDate
    ? new Date(paper.publicationDate).getFullYear()
    : null;
  const isRecent = pubYear && pubYear >= new Date().getFullYear() - 1;

  if (isRecent && breakdown.recency >= 80) {
    parts.push("published recently with up-to-date findings");
  } else if (breakdown.citationSignal >= 75 && (paper.citationCount ?? 0) > 20) {
    parts.push(`frequently referenced in current literature (${paper.citationCount} citations)`);
  }

  // Combine into a clean sentence
  if (parts.length === 1) {
    return `${parts[0]}.`;
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}.`;
  }
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}.`;
}
