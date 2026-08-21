// lib/ai/__tests__/ai.test.ts
import {
  PaperSummarySchema,
  PaperAnalysisSchema,
  PaperComparisonSchema,
} from "../types";
import { MockAIProvider } from "../providers/mockProvider";
import { buildSummarizePrompt, SUMMARIZE_SYSTEM_PROMPT } from "../prompts/summarize";
import { buildAnalyzePrompt, ANALYZE_SYSTEM_PROMPT } from "../prompts/analyze";
import { buildComparePrompt, COMPARE_SYSTEM_PROMPT } from "../prompts/compare";

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

console.log("▶ Running Phase 5 AI Research Intelligence Tests...");

const mockProvider = new MockAIProvider();

// 1. Paper Summarization Test
console.log("  Testing Paper Summarization with structured validation...");
async function testSummarization() {
  const paper = {
    title: "Physics-Informed Neural Networks for Power System State Estimation",
    abstract:
      "This paper introduces a physics-informed deep learning approach for state estimation in electrical transmission grids. By embedding power flow equations directly into the network loss function, the model achieves high estimation accuracy with noisy and incomplete measurements.",
    authors: ["Elena Rostova", "Marcus Chen"],
    journal: "IEEE Transactions on Power Systems",
    publicationDate: new Date("2024-04-10"),
    doi: "10.1109/TPWRS.2024.1234567",
  };

  const prompt = buildSummarizePrompt(paper);
  const result = await mockProvider.generateStructured(
    prompt,
    PaperSummarySchema,
    SUMMARIZE_SYSTEM_PROMPT
  );

  assert(typeof result.summary === "string", "Summary must be a string");
  assert(result.summary.length > 50, "Summary must be substantive");
  assert(Array.isArray(result.keyPoints), "Key points must be an array");
  assert(result.keyPoints.length >= 2, "Must contain at least 2 key points");
}

// 2. Paper Analysis Test (Methodology, Findings, Limitations)
console.log("  Testing Paper Analysis with structured schema validation...");
async function testAnalysis() {
  const paper = {
    title: "Graph Neural Networks for Microgrid Islanding Detection",
    abstract:
      "We propose a spatial-temporal graph neural network to detect islanding conditions in inverter-dominated microgrids. Evaluated across IEEE 33-bus systems under stochastic load variations.",
    authors: ["Kenji Sato"],
    journal: "IEEE Transactions on Smart Grid",
    publicationDate: new Date("2024-02-15"),
    doi: "10.1109/TSG.2024.9876543",
  };

  const prompt = buildAnalyzePrompt(paper);
  const result = await mockProvider.generateStructured(
    prompt,
    PaperAnalysisSchema,
    ANALYZE_SYSTEM_PROMPT
  );

  // Methodology check
  assert(typeof result.methodology.approach === "string", "Methodology approach is present");
  assert(Array.isArray(result.methodology.methods), "Methodology methods is array");
  assert(result.methodology.methods.length > 0, "At least one method identified");

  // Findings check
  assert(Array.isArray(result.findings.mainFindings), "Main findings is array");
  assert(result.findings.mainFindings.length > 0, "At least one finding identified");
  assert(Array.isArray(result.findings.contributions), "Contributions is array");

  // Limitations check (Strict separation between author-stated vs inferred)
  assert(Array.isArray(result.limitations.authorStated), "Author-stated limitations is array");
  assert(Array.isArray(result.limitations.inferred), "Inferred limitations is array");
  assert(
    result.limitations.authorStated.length > 0 || result.limitations.inferred.length > 0,
    "Limitations must be captured"
  );

  // Research Gaps check
  assert(Array.isArray(result.researchGaps), "Research gaps is array");
  if (result.researchGaps.length > 0) {
    assert(typeof result.researchGaps[0].gap === "string", "Gap description is present");
    assert(typeof result.researchGaps[0].evidence === "string", "Gap evidence is present");
  }
}

// 3. Multi-Paper Comparison Test (1 to 5 papers)
console.log("  Testing Multi-Paper Comparative Synthesis (up to 5 papers)...");
async function testComparison() {
  const papers = [
    {
      id: "paper_1",
      title: "Physics-Informed Neural Networks for State Estimation",
      abstract: "Physics-constrained deep learning for transmission grids.",
      authors: ["E. Rostova"],
      journal: "IEEE TPWRS",
      publicationDate: new Date("2024-01-01"),
    },
    {
      id: "paper_2",
      title: "Deep Learning for Distribution System State Estimation",
      abstract: "Purely data-driven CNN approach for active distribution networks.",
      authors: ["J. Miller"],
      journal: "IEEE TSG",
      publicationDate: new Date("2023-11-01"),
    },
    {
      id: "paper_3",
      title: "Robust State Estimation Under Heavy Noise",
      abstract: "Nonlinear optimization with Huber loss estimation.",
      authors: ["A. Tanaka"],
      journal: "Electric Power Systems Research",
      publicationDate: new Date("2023-08-01"),
    },
  ];

  const prompt = buildComparePrompt(papers);
  const result = await mockProvider.generateStructured(
    prompt,
    PaperComparisonSchema,
    COMPARE_SYSTEM_PROMPT
  );

  assert(typeof result.overview === "string", "Overview is present");
  assert(Array.isArray(result.commonThemes), "Common themes is array");
  assert(result.commonThemes.length > 0, "At least one common theme identified");

  // Comparison table items
  assert(Array.isArray(result.comparison), "Comparison table is array");
  assertEqual(result.comparison.length, 3, "3 comparison rows returned for 3 papers");

  // Synthesis dimensions
  assert(Array.isArray(result.methodologicalDifferences), "Methodological differences is array");
  assert(Array.isArray(result.findingsAgreement), "Points of agreement is array");
  assert(Array.isArray(result.findingsDisagreement), "Points of disagreement is array");
  assert(Array.isArray(result.researchGaps), "Research gaps is array");
  assert(Array.isArray(result.promisingDirections), "Promising directions is array");
}

// 4. Missing Abstract & Edge Case Test
console.log("  Testing missing abstract handling...");
async function testMissingAbstract() {
  const paperMinimal = {
    title: "Fundamental Equations of High Voltage DC Transmission",
    abstract: null,
    authors: ["Anonymous"],
  };

  const prompt = buildAnalyzePrompt(paperMinimal);
  const result = await mockProvider.generateStructured(
    prompt,
    PaperAnalysisSchema,
    ANALYZE_SYSTEM_PROMPT
  );

  assert(typeof result.summary === "string", "Generates summary even with null abstract");
  assertEqual(result.analysisSource, "METADATA", "Correctly flags analysisSource as METADATA");
}

async function runAllTests() {
  await testSummarization();
  await testAnalysis();
  await testComparison();
  await testMissingAbstract();
  console.log("✔ All Phase 5 AI Research Intelligence unit tests passed successfully!\n");
}

runAllTests().catch((err) => {
  console.error("AI Unit Tests Failed:", err);
  process.exit(1);
});
