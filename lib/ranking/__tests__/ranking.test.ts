// lib/ranking/__tests__/ranking.test.ts
import {
  calculateInterestMatchScore,
  calculateTopicMatchScore,
  calculateResearchContextScore,
  calculateResearchGoalScore,
  calculateRecencyScore,
  calculateCitationScore,
  computeFinalScore,
} from "../scorer";
import { rankPaper, rankAndDiversifyPapers } from "../engine";
import { generateExplanation } from "../explainer";
import {
  PaperCandidate,
  UserProfileContext,
  UserInterestProfile,
  ScoreBreakdown,
} from "../types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion Failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}

console.log("▶ Running Phase 4 Relevance & Ranking Engine Tests...");

const sampleInterests: UserInterestProfile[] = [
  { id: "1", name: "Power Systems", slug: "power-systems" },
  { id: "2", name: "Renewable Energy", slug: "renewable-energy" },
  { id: "3", name: "Smart Grid", slug: "smart-grid" },
  { id: "4", name: "Power Electronics", slug: "power-electronics" },
];

const sampleProfile: UserProfileContext = {
  academicField: "Electrical & Electronic Engineering",
  researchLevel: "GRADUATE",
  researchContext:
    "I'm interested in machine learning applications in power systems, especially dynamic grid stability and inverter control.",
  researchGoals: ["Find thesis ideas", "Discover research gaps"],
  interests: sampleInterests,
};

// 1. Interest Match Tests
console.log("  Testing calculateInterestMatchScore()...");
{
  // A. Zero matches
  const paperNoMatch: PaperCandidate = {
    id: "p0",
    title: "Quantum Cryptography Protocols",
    interests: [],
  };
  const res0 = calculateInterestMatchScore(paperNoMatch, sampleInterests);
  assert(res0.score <= 20, "No interest match should produce low score");
  assertEqual(res0.matchedInterests, [], "No matched interests");

  // B. Single interest match
  const paperSingleMatch: PaperCandidate = {
    id: "p1",
    title: "Modern Power Systems Operational Reliability",
    interests: [{ interest: { id: "1", name: "Power Systems", slug: "power-systems" } }],
  };
  const res1 = calculateInterestMatchScore(paperSingleMatch, sampleInterests);
  assert(res1.score >= 60, "Single interest match should score >= 60");
  assert(res1.matchedInterests.includes("Power Systems"), "Matched Power Systems");

  // C. Multiple interest matches
  const paperMultiMatch: PaperCandidate = {
    id: "p2",
    title: "Renewable Energy Integration in Smart Grid and Power Systems",
    interests: [
      { interest: { id: "1", name: "Power Systems", slug: "power-systems" } },
      { interest: { id: "2", name: "Renewable Energy", slug: "renewable-energy" } },
      { interest: { id: "3", name: "Smart Grid", slug: "smart-grid" } },
    ],
  };
  const resMulti = calculateInterestMatchScore(paperMultiMatch, sampleInterests);
  assert(
    resMulti.score > res1.score,
    "Multi-interest match score should be higher than single match"
  );
  assert(resMulti.score >= 90, "3-interest match should score >= 90");
}

// 2. Topic Match Tests
console.log("  Testing calculateTopicMatchScore()...");
{
  const paperExact: PaperCandidate = {
    id: "t1",
    title: "Deep Learning for Smart Grid Voltage Control",
    abstract: "This paper investigates renewable energy resources in power systems.",
  };
  const resTopic = calculateTopicMatchScore(
    paperExact,
    sampleInterests,
    "Electrical & Electronic Engineering"
  );
  assert(resTopic.score >= 70, "Relevant title and abstract should score high on topic match");
  assert(resTopic.matchedKeywords.length > 0, "Keywords identified");

  // Pluralization and stemming test
  const paperPlurals: PaperCandidate = {
    id: "t2",
    title: "Analysis of Inverters and Grids in Renewable Energies",
    abstract: "Modeling electrical systems and power electronics converters.",
  };
  const resPlurals = calculateTopicMatchScore(paperPlurals, sampleInterests);
  assert(
    resPlurals.score >= 60,
    "Stemmed plural/singular tokens should match user interests"
  );
}

// 3. Research Context Scorer Tests
console.log("  Testing calculateResearchContextScore()...");
{
  const paperStrongContext: PaperCandidate = {
    id: "c1",
    title: "Machine Learning for Dynamic Grid Stability and Inverter Fault Detection",
    abstract: "Dynamic stability analysis using neural networks in power systems.",
  };
  const scoreStrong = calculateResearchContextScore(
    paperStrongContext,
    sampleProfile.researchContext
  );

  const paperWeakContext: PaperCandidate = {
    id: "c2",
    title: "High Voltage Underground Cable Insulation Assessment",
    abstract: "Thermal degradation of cross-linked polyethylene cables.",
  };
  const scoreWeak = calculateResearchContextScore(
    paperWeakContext,
    sampleProfile.researchContext
  );

  assert(
    scoreStrong > scoreWeak,
    "Strong contextual match must score higher than weak contextual match"
  );

  const scoreNull = calculateResearchContextScore(paperStrongContext, null);
  assertEqual(scoreNull, 60, "Null research context returns neutral default score (60)");
}

// 4. Research Goal Scorer Tests
console.log("  Testing calculateResearchGoalScore()...");
{
  const paperThesisGoals: PaperCandidate = {
    id: "g1",
    title: "A Novel Framework for Microgrid Protection: Challenges and Future Work",
    abstract: "Identifies key limitations and unexplored opportunities in grid control.",
  };
  const scoreGoal = calculateResearchGoalScore(
    paperThesisGoals,
    ["Find thesis ideas", "Discover research gaps"],
    new Date()
  );
  assert(scoreGoal >= 85, "Papers discussing challenges & future work align with thesis goals");
}

// 5. Recency Scorer Tests
console.log("  Testing calculateRecencyScore()...");
{
  const recentDate = new Date();
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  const fiveYearsAgo = new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000);

  const scoreRecent = calculateRecencyScore(recentDate);
  const score1Year = calculateRecencyScore(oneYearAgo);
  const score5Years = calculateRecencyScore(fiveYearsAgo);
  const scoreMissing = calculateRecencyScore(null);

  assert(scoreRecent >= 95, "Very recent paper scores ~100");
  assert(score1Year < scoreRecent, "1 year old paper has decayed");
  assert(score5Years < score1Year, "5 year old paper has decayed further");
  assert(score5Years >= 25, "Decay does not drop below baseline");
  assertEqual(scoreMissing, 60, "Missing date defaults to neutral 60");
}

// 6. Citation Scorer Tests
console.log("  Testing calculateCitationScore()...");
{
  const score0 = calculateCitationScore(0);
  const score50 = calculateCitationScore(50);
  const score1000 = calculateCitationScore(1000);
  const scoreNull = calculateCitationScore(null);

  assert(score0 >= 40, "0 citations has baseline score");
  assert(score50 > score0, "50 citations scores higher than 0");
  assert(score1000 >= 95, "1000 citations reaches near maximum");
  assertEqual(scoreNull, 50, "Null citations defaults to 50");
}

// 7. Score Combination & Explanation Tests
console.log("  Testing generateExplanation()...");
{
  const sampleBreakdown: ScoreBreakdown = {
    interestMatch: 95,
    topicMatch: 90,
    researchContext: 85,
    researchGoal: 80,
    recency: 90,
    citationSignal: 70,
  };
  const explanation = generateExplanation(
    { id: "p1", title: "Smart Grid Stability" },
    sampleProfile,
    sampleBreakdown,
    ["Power Systems", "Smart Grid"],
    ["stability", "grid"]
  );
  assert(explanation.includes("Power Systems"), "Explanation mentions primary interest");
  assert(explanation.includes("Smart Grid"), "Explanation mentions secondary interest");
  assert(typeof explanation === "string" && explanation.length > 20, "Explanation is valid string");
}

// 8. Full End-to-End Ranking & Topic Diversity Tests
console.log("  Testing rankAndDiversifyPapers()...");
{
  const candidates: PaperCandidate[] = [
    {
      id: "p_ps1",
      title: "Power Systems State Estimation Using Neural Networks",
      abstract: "Machine learning for dynamic grid stability in power systems.",
      publicationDate: new Date(),
      citationCount: 45,
      interests: [{ interest: { id: "1", name: "Power Systems", slug: "power-systems" } }],
    },
    {
      id: "p_ps2",
      title: "Power Systems Fault Detection Algorithms",
      abstract: "Distribution network fault analysis.",
      publicationDate: new Date(),
      citationCount: 30,
      interests: [{ interest: { id: "1", name: "Power Systems", slug: "power-systems" } }],
    },
    {
      id: "p_ps3",
      title: "Power Systems Frequency Regulation",
      abstract: "Primary frequency control in conventional grids.",
      publicationDate: new Date(),
      citationCount: 20,
      interests: [{ interest: { id: "1", name: "Power Systems", slug: "power-systems" } }],
    },
    {
      id: "p_re1",
      title: "Renewable Energy and Solar Integration in Smart Grids",
      abstract: "High penetration inverter stability and grid dynamics.",
      publicationDate: new Date(),
      citationCount: 35,
      interests: [
        { interest: { id: "2", name: "Renewable Energy", slug: "renewable-energy" } },
        { interest: { id: "3", name: "Smart Grid", slug: "smart-grid" } },
      ],
    },
    {
      id: "p_unrelated",
      title: "Quantum Annealing for Combinatorial Portfolio Optimization",
      abstract: "Financial mechanics using D-Wave processors.",
      publicationDate: new Date("2018-01-01"),
      citationCount: 2,
      interests: [],
    },
  ];

  const { papers: ranked } = rankAndDiversifyPapers(candidates, sampleProfile);

  assert(ranked.length === 5, "All candidate papers scored and returned");

  // Top paper should be highly relevant (>= 85)
  assert(ranked[0].relevanceScore >= 80, "Top ranked paper has high relevance score");

  // Unrelated paper should rank at the bottom with low score
  const lastPaper = ranked[ranked.length - 1];
  assertEqual(lastPaper.id, "p_unrelated", "Unrelated paper ranks last");
  assert(lastPaper.relevanceScore < 60, "Unrelated paper has score < 60");

  // Multi-interest renewable + smart grid paper should rank near top
  const rePaper = ranked.find((p) => p.id === "p_re1");
  assert(
    rePaper !== undefined && ranked.indexOf(rePaper) <= 2,
    "Multi-interest paper ranks in top 3"
  );
}

console.log("✔ All Phase 4 Relevance & Ranking Engine unit tests passed successfully!\n");
