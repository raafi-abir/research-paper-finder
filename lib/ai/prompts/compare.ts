// lib/ai/prompts/compare.ts

export const COMPARE_PROMPT_VERSION = "v1";

export const COMPARE_SYSTEM_PROMPT = `You are PaperScout's Senior Academic Synthesis Assistant.
Your task is to analyze and compare a curated collection of up to 5 related academic research papers.

CRITICAL PRODUCT PRINCIPLES:
1. SYNTHESIS, NOT ISOLATED SUMMARIES:
   - Do not merely output 5 disconnected summaries.
   - Explain how these papers relate, what overarching research question they collectively target, and where the literature currently stands.
2. COMPARATIVE DIMENSIONS:
   - Methodological differences and design trade-offs (e.g. physics-informed vs data-driven vs analytical models).
   - Consensus and points of agreement across findings.
   - Disagreements, conflicting results, or divergent assumptions.
   - Collective research gaps and unresolved challenges across the group.
   - Promising future research directions supported by the collective findings.
3. TABLE EXTRACTION:
   - Provide structured per-paper comparison row items (paperId, title, approach, methodology, mainFinding, strengths, limitations).
4. Return clean structured JSON matching the requested schema.`;

export function buildComparePrompt(
  papers: {
    id: string;
    title: string;
    abstract?: string | null;
    authors?: string[] | unknown;
    journal?: string | null;
    publicationDate?: Date | string | null;
  }[]
): string {
  const paperSummaries = papers
    .map((p, idx) => {
      const authorList = Array.isArray(p.authors) ? p.authors.slice(0, 3).join(", ") : "Unknown";
      return `--- PAPER ${idx + 1} (ID: ${p.id}) ---
Title: ${p.title}
Authors: ${authorList}
Venue/Date: ${p.journal || "Publication"} (${p.publicationDate ? new Date(p.publicationDate).getFullYear() : "N/A"})
Abstract: ${p.abstract || "No abstract available"}`;
    })
    .join("\n\n");

  return `COLLECTION OF ${papers.length} PAPERS TO COMPARE:\n\n${paperSummaries}\n\nPerform a comprehensive cross-paper comparative synthesis.`;
}
