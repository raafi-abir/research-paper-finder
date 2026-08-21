// lib/ai/types.ts
import { z } from "zod";

/**
 * 1. Paper Summary Schema
 */
export const PaperSummarySchema = z.object({
  summary: z.string().describe("Concise 100-180 word research summary"),
  keyPoints: z.array(z.string()).min(2).max(6).describe("Key takeaway bullet points"),
});

export type PaperSummary = z.infer<typeof PaperSummarySchema>;

/**
 * 2. Methodology Schema
 */
export const MethodologySchema = z.object({
  approach: z.string().describe("Core research paradigm, e.g., Simulation, Experimental, Machine Learning"),
  methods: z.array(z.string()).describe("Specific algorithms, architectures, or protocols used"),
  dataset: z.string().nullable().optional().describe("Dataset name/size or null if not stated"),
  experimentalSetup: z.string().nullable().optional().describe("Hardware/simulation environment details or null"),
  evaluationMetrics: z.array(z.string()).default([]).describe("Metrics used to measure performance"),
});

export type Methodology = z.infer<typeof MethodologySchema>;

/**
 * 3. Findings Schema
 */
export const FindingsSchema = z.object({
  mainFindings: z.array(z.string()).min(1).describe("Major empirical or theoretical results"),
  contributions: z.array(z.string()).min(1).describe("Specific novel contributions introduced by the authors"),
});

export type Findings = z.infer<typeof FindingsSchema>;

/**
 * 4. Limitations Schema (Strict separation between author-stated vs inferred)
 */
export const LimitationsSchema = z.object({
  authorStated: z.array(z.string()).describe("Limitations explicitly acknowledged by the paper's authors"),
  inferred: z.array(z.string()).describe("Potential limitations or scope constraints inferred from the methodology"),
});

export type Limitations = z.infer<typeof LimitationsSchema>;

/**
 * 5. Research Gap Item Schema
 */
export const ResearchGapItemSchema = z.object({
  gap: z.string().describe("Unresolved problem or limitation identified"),
  evidence: z.string().describe("Specific observation or methodological evidence from the paper"),
});

export type ResearchGapItem = z.infer<typeof ResearchGapItemSchema>;

/**
 * 6. Full Paper Analysis Schema
 */
export const PaperAnalysisSchema = z.object({
  summary: z.string().describe("Concise 100-180 word research summary"),
  keyPoints: z.array(z.string()).min(2).max(6),
  methodology: MethodologySchema,
  findings: FindingsSchema,
  limitations: LimitationsSchema,
  researchGaps: z.array(ResearchGapItemSchema).default([]),
  analysisSource: z.enum(["FULL_TEXT", "ABSTRACT", "METADATA"]).default("ABSTRACT"),
});

export type PaperAnalysisResult = z.infer<typeof PaperAnalysisSchema>;

/**
 * 7. Multi-Paper Comparison Item Schema
 */
export const PaperComparisonItemSchema = z.object({
  paperId: z.string(),
  title: z.string(),
  approach: z.string(),
  methodology: z.string(),
  mainFinding: z.string(),
  strengths: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
});

export type PaperComparisonItem = z.infer<typeof PaperComparisonItemSchema>;

/**
 * 8. Multi-Paper Comparison Schema (Up to 5 papers)
 */
export const PaperComparisonSchema = z.object({
  overview: z.string().describe("High-level synthesis explaining how these papers relate"),
  commonThemes: z.array(z.string()).min(1).describe("Shared research objectives or thematic patterns"),
  comparison: z.array(PaperComparisonItemSchema).min(1).max(5),
  methodologicalDifferences: z.array(z.string()).describe("Key architectural/methodological trade-offs"),
  findingsAgreement: z.array(z.string()).describe("Areas where the papers reach consensus"),
  findingsDisagreement: z.array(z.string()).describe("Areas where findings or methodologies diverge"),
  researchGaps: z.array(z.string()).describe("Unresolved questions across the collection of papers"),
  promisingDirections: z.array(z.string()).describe("Promising research directions suggested by collective evidence"),
});

export type PaperComparisonResult = z.infer<typeof PaperComparisonSchema>;

/**
 * AI Provider Interface
 */
export interface AIProvider {
  name: string;
  generateStructured<T>(
    prompt: string,
    schema: z.ZodType<T>,
    systemPrompt?: string
  ): Promise<T>;
}
