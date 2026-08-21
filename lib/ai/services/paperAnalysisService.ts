// lib/ai/services/paperAnalysisService.ts
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "../client";
import {
  PaperSummary,
  PaperSummarySchema,
  PaperAnalysisResult,
  PaperAnalysisSchema,
} from "../types";
import {
  buildSummarizePrompt,
  SUMMARIZE_SYSTEM_PROMPT,
  SUMMARIZE_PROMPT_VERSION,
} from "../prompts/summarize";
import {
  buildAnalyzePrompt,
  ANALYZE_SYSTEM_PROMPT,
  ANALYZE_PROMPT_VERSION,
} from "../prompts/analyze";

export interface AnalysisServiceOptions {
  forceRefresh?: boolean;
}

/**
 * Generate or retrieve a cached research summary for a paper.
 */
export async function summarizePaper(
  paperId: string,
  options: AnalysisServiceOptions = {}
): Promise<PaperSummary & { source: "cache" | "generated"; model: string }> {
  // 1. Check existing cached analysis
  if (!options.forceRefresh) {
    try {
      const cached = await prisma.paperAnalysis.findFirst({
        where: {
          paperId,
          promptVersion: SUMMARIZE_PROMPT_VERSION,
        },
        orderBy: { createdAt: "desc" },
      });

      if (cached && cached.summary && Array.isArray(cached.keyPoints)) {
        return {
          summary: cached.summary,
          keyPoints: cached.keyPoints as string[],
          source: "cache",
          model: cached.model,
        };
      }
    } catch (err) {
      console.warn("DB query for cached analysis failed, proceeding to generate:", err);
    }
  }

  // 2. Load paper from database
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
  });

  if (!paper) {
    throw new Error(`Paper with id "${paperId}" not found.`);
  }

  // 3. Generate summary via AI provider
  const provider = getAIProvider();
  const prompt = buildSummarizePrompt({
    title: paper.title,
    abstract: paper.abstract,
    authors: paper.authors,
    journal: paper.journal || paper.conference,
    publicationDate: paper.publicationDate,
    doi: paper.doi,
  });

  const result = await provider.generateStructured<PaperSummary>(
    prompt,
    PaperSummarySchema,
    SUMMARIZE_SYSTEM_PROMPT
  );

  // 4. Save to PaperAnalysis cache
  try {
    await prisma.paperAnalysis.create({
      data: {
        paperId,
        summary: result.summary,
        keyPoints: result.keyPoints,
        methodology: {},
        findings: {},
        limitations: {},
        analysisSource: paper.abstract ? "ABSTRACT" : "METADATA",
        model: provider.name,
        promptVersion: SUMMARIZE_PROMPT_VERSION,
      },
    });
  } catch (err) {
    console.warn("Failed to persist summary to PaperAnalysis:", err);
  }

  return {
    ...result,
    source: "generated",
    model: provider.name,
  };
}

/**
 * Generate or retrieve a cached in-depth research analysis (methodology, findings, limitations).
 */
export async function analyzePaper(
  paperId: string,
  options: AnalysisServiceOptions = {}
): Promise<PaperAnalysisResult & { source: "cache" | "generated"; model: string }> {
  // 1. Check existing cached analysis
  if (!options.forceRefresh) {
    try {
      const cached = await prisma.paperAnalysis.findFirst({
        where: {
          paperId,
          promptVersion: ANALYZE_PROMPT_VERSION,
        },
        orderBy: { createdAt: "desc" },
      });

      if (
        cached &&
        cached.methodology &&
        typeof cached.methodology === "object" &&
        Object.keys(cached.methodology).length > 0
      ) {
        return {
          summary: cached.summary,
          keyPoints: cached.keyPoints as string[],
          methodology: cached.methodology as any,
          findings: cached.findings as any,
          limitations: cached.limitations as any,
          researchGaps: (cached.researchGaps as any) || [],
          analysisSource: cached.analysisSource as any,
          source: "cache",
          model: cached.model,
        };
      }
    } catch (err) {
      console.warn("DB query for cached analysis failed, proceeding to generate:", err);
    }
  }

  // 2. Load paper from database
  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
  });

  if (!paper) {
    throw new Error(`Paper with id "${paperId}" not found.`);
  }

  // 3. Generate analysis via AI provider
  const provider = getAIProvider();
  const prompt = buildAnalyzePrompt({
    title: paper.title,
    abstract: paper.abstract,
    authors: paper.authors,
    journal: paper.journal || paper.conference,
    publicationDate: paper.publicationDate,
    doi: paper.doi,
  });

  const result = await provider.generateStructured<PaperAnalysisResult>(
    prompt,
    PaperAnalysisSchema,
    ANALYZE_SYSTEM_PROMPT
  );

  // 4. Save to PaperAnalysis cache
  try {
    await prisma.paperAnalysis.create({
      data: {
        paperId,
        summary: result.summary,
        keyPoints: result.keyPoints,
        methodology: result.methodology,
        findings: result.findings,
        limitations: result.limitations,
        researchGaps: result.researchGaps,
        analysisSource: paper.abstract ? "ABSTRACT" : "METADATA",
        model: provider.name,
        promptVersion: ANALYZE_PROMPT_VERSION,
      },
    });
  } catch (err) {
    console.warn("Failed to persist analysis to PaperAnalysis:", err);
  }

  return {
    ...result,
    source: "generated",
    model: provider.name,
  };
}
