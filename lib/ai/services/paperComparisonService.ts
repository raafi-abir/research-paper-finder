// lib/ai/services/paperComparisonService.ts
import { prisma } from "@/lib/prisma";
import { getAIProvider } from "../client";
import {
  PaperComparisonResult,
  PaperComparisonSchema,
} from "../types";
import {
  buildComparePrompt,
  COMPARE_SYSTEM_PROMPT,
} from "../prompts/compare";

export interface ComparisonServiceOptions {
  model?: string;
}

/**
 * Compare up to 5 papers using structured AI synthesis.
 */
export async function comparePapers(
  paperIds: string[],
  _options: ComparisonServiceOptions = {}
): Promise<PaperComparisonResult & { model: string }> {
  // 1. Validation: 1 to 5 papers
  if (!Array.isArray(paperIds) || paperIds.length === 0) {
    throw new Error("At least 1 paper ID is required for comparison.");
  }
  if (paperIds.length > 5) {
    throw new Error("A maximum of 5 papers can be compared simultaneously.");
  }

  // 2. Fetch papers from database
  const papers = await prisma.paper.findMany({
    where: { id: { in: paperIds } },
  });

  if (papers.length === 0) {
    throw new Error("None of the specified papers were found in the database.");
  }

  // 3. Build synthesis prompt
  const candidateList = papers.map((p) => ({
    id: p.id,
    title: p.title,
    abstract: p.abstract,
    authors: p.authors,
    journal: p.journal || p.conference,
    publicationDate: p.publicationDate,
  }));

  const provider = getAIProvider();
  const prompt = buildComparePrompt(candidateList);

  const result = await provider.generateStructured<PaperComparisonResult>(
    prompt,
    PaperComparisonSchema,
    COMPARE_SYSTEM_PROMPT
  );

  return {
    ...result,
    model: provider.name,
  };
}
