// lib/ranking/engine.ts
import {
  PaperCandidate,
  UserProfileContext,
  RankingResult,
  RankedPaper,
  RankingWeights,
  ScoreBreakdown,
} from "./types";
import { RANKING_WEIGHTS, RELEVANCE_LABELS, DIVERSITY_CONFIG } from "./config";
import {
  calculateInterestMatchScore,
  calculateTopicMatchScore,
  calculateResearchContextScore,
  calculateResearchGoalScore,
  calculateRecencyScore,
  calculateCitationScore,
  computeFinalScore,
} from "./scorer";
import { getRelevanceLevel, generateExplanation } from "./explainer";

/**
 * Score a single paper candidate for a specific user profile.
 */
export function rankPaper(
  paper: PaperCandidate,
  userProfile: UserProfileContext,
  weights: RankingWeights = RANKING_WEIGHTS
): RankingResult {
  const { score: interestScore, matchedInterests } = calculateInterestMatchScore(
    paper,
    userProfile.interests
  );

  const { score: topicScore, matchedKeywords } = calculateTopicMatchScore(
    paper,
    userProfile.interests,
    userProfile.academicField
  );

  const contextScore = calculateResearchContextScore(
    paper,
    userProfile.researchContext
  );

  const goalScore = calculateResearchGoalScore(
    paper,
    userProfile.researchGoals,
    paper.publicationDate
  );

  const recencyScore = calculateRecencyScore(paper.publicationDate);
  const citationScore = calculateCitationScore(paper.citationCount);

  const breakdown: ScoreBreakdown = {
    interestMatch: interestScore,
    topicMatch: topicScore,
    researchContext: contextScore,
    researchGoal: goalScore,
    recency: recencyScore,
    citationSignal: citationScore,
  };

  const { score, rawScore } = computeFinalScore(breakdown, weights);
  const relevanceLevel = getRelevanceLevel(score);
  const explanation = generateExplanation(
    paper,
    userProfile,
    breakdown,
    matchedInterests,
    matchedKeywords
  );

  return {
    paperId: paper.id,
    score,
    rawScore,
    relevanceLevel,
    breakdown,
    matchedInterests,
    matchedKeywords,
    explanation,
  };
}

/**
 * Rank a list of candidate papers for a user profile, applying tie-breaking and topic diversity.
 */
export function rankAndDiversifyPapers(
  papers: PaperCandidate[],
  userProfile: UserProfileContext,
  options: {
    limit?: number;
    offset?: number;
    sortBy?: "relevance" | "recent" | "cited";
    weights?: RankingWeights;
  } = {}
): { total: number; papers: RankedPaper[] } {
  const { limit = 20, offset = 0, sortBy = "relevance", weights = RANKING_WEIGHTS } = options;

  if (papers.length === 0) {
    return { total: 0, papers: [] };
  }

  // 1. Score each candidate paper
  const scoredPapers = papers.map((paper) => {
    const result = rankPaper(paper, userProfile, weights);
    return {
      paper,
      result,
    };
  });

  // 2. Sort based on mode
  if (sortBy === "recent") {
    scoredPapers.sort((a, b) => {
      const dateA = a.paper.publicationDate ? new Date(a.paper.publicationDate).getTime() : 0;
      const dateB = b.paper.publicationDate ? new Date(b.paper.publicationDate).getTime() : 0;
      return dateB - dateA;
    });
  } else if (sortBy === "cited") {
    scoredPapers.sort((a, b) => (b.paper.citationCount ?? 0) - (a.paper.citationCount ?? 0));
  } else {
    // Default: Sort descending by relevance rawScore with deterministic secondary tie-breaking
    scoredPapers.sort((a, b) => {
      if (b.result.rawScore !== a.result.rawScore) {
        return b.result.rawScore - a.result.rawScore;
      }
      // Secondary sort: publicationDate DESC
      const dateA = a.paper.publicationDate ? new Date(a.paper.publicationDate).getTime() : 0;
      const dateB = b.paper.publicationDate ? new Date(b.paper.publicationDate).getTime() : 0;
      if (dateB !== dateA) return dateB - dateA;

      // Tertiary sort: citations DESC
      return (b.paper.citationCount ?? 0) - (a.paper.citationCount ?? 0);
    });

    // 3. Topic Diversity Interleaving (for default relevance sort)
    // Prevents more than maxConsecutiveSameInterest papers from dominating the top
    const diversified: typeof scoredPapers = [];
    const pool = [...scoredPapers];
    const consecutiveTopicCounts: Record<string, number> = {};
    let lastPrimaryTopic: string | null = null;

    while (pool.length > 0) {
      let selectedIndex = 0;

      // If top candidate has the same primary topic consecutively, look ahead for a diverse candidate with comparable score
      const topCandidate = pool[0];
      const primaryTopic = topCandidate.result.matchedInterests[0] || "general";

      if (
        lastPrimaryTopic === primaryTopic &&
        (consecutiveTopicCounts[primaryTopic] || 0) >= DIVERSITY_CONFIG.maxConsecutiveSameInterest
      ) {
        // Find next candidate from a different topic within a small score delta (<= 8 points)
        const alternateIndex = pool.findIndex(
          (cand) =>
            (cand.result.matchedInterests[0] || "general") !== primaryTopic &&
            topCandidate.result.rawScore - cand.result.rawScore <= 8
        );

        if (alternateIndex > 0) {
          selectedIndex = alternateIndex;
        }
      }

      const chosen = pool.splice(selectedIndex, 1)[0];
      const chosenTopic = chosen.result.matchedInterests[0] || "general";

      if (lastPrimaryTopic === chosenTopic) {
        consecutiveTopicCounts[chosenTopic] = (consecutiveTopicCounts[chosenTopic] || 0) + 1;
      } else {
        lastPrimaryTopic = chosenTopic;
        consecutiveTopicCounts[chosenTopic] = 1;
      }

      diversified.push(chosen);
    }

    scoredPapers.length = 0;
    scoredPapers.push(...diversified);
  }

  // 4. Paginate and format
  const paginated = scoredPapers.slice(offset, offset + limit);

  const rankedPapers: RankedPaper[] = paginated.map((item, index) => {
    const { paper, result } = item;
    return {
      ...paper,
      number: String(offset + index + 1).padStart(2, "0"),
      relevanceScore: result.score,
      relevanceLevel: result.relevanceLevel,
      relevanceLabel: RELEVANCE_LABELS[result.relevanceLevel],
      explanation: result.explanation,
      scoreBreakdown: result.breakdown,
      matchedInterests: result.matchedInterests,
    };
  });

  return {
    total: scoredPapers.length,
    papers: rankedPapers,
  };
}
