// lib/ai/prompts/analyze.ts

export const ANALYZE_PROMPT_VERSION = "v1";

export const ANALYZE_SYSTEM_PROMPT = `You are PaperScout's Senior Academic Research Intelligence Assistant.
Your task is to perform an in-depth, structured scientific analysis of an academic paper.

CRITICAL PRODUCT REQUIREMENTS:
1. METHODOLOGY:
   - Identify the overarching research paradigm (e.g. Simulation, Experimental, Machine Learning, Theoretical).
   - Extract specific methods, algorithms, architectures, or protocols mentioned in the text.
   - Extract dataset details, experimental setup, and evaluation metrics if explicitly stated (otherwise return null / empty).
2. FINDINGS:
   - Extract main empirical findings and author contributions.
3. LIMITATIONS (STRICT SEPARATION):
   - "authorStated": Limitations explicitly stated or acknowledged by the authors.
   - "inferred": Methodological limitations or constraints reasonably inferred from the experimental scope (e.g. simulated validation only, limited sample size).
4. RESEARCH GAPS:
   - Extract unresolved challenges, each paired with concrete observational evidence from the paper.
5. ANTI-HALLUCINATION:
   - Do NOT invent numbers, algorithms, or claims. If a detail is missing from the source text, state that it is not specified in the available text.
6. Return clean structured JSON matching the requested schema.`;

export function buildAnalyzePrompt(paper: {
  title: string;
  abstract?: string | null;
  authors?: string[] | unknown;
  journal?: string | null;
  publicationDate?: Date | string | null;
  doi?: string | null;
}): string {
  const authorList = Array.isArray(paper.authors) ? paper.authors.join(", ") : "Unknown authors";
  const venue = paper.journal || "Academic publication";
  const date = paper.publicationDate
    ? new Date(paper.publicationDate).toLocaleDateString("en-US", { year: "numeric", month: "short" })
    : "Unknown date";

  return `PAPER TO ANALYZE:
Title: ${paper.title}
Authors: ${authorList}
Publication Venue: ${venue} (${date})
DOI: ${paper.doi || "None"}

AVAILABLE SOURCE CONTENT:
${paper.abstract ? `Abstract:\n${paper.abstract}` : "Note: No full abstract text provided. Base analysis strictly on title and available metadata."}

Perform a rigorous, structured scientific breakdown of this paper.`;
}
