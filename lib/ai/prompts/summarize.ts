// lib/ai/prompts/summarize.ts

export const SUMMARIZE_PROMPT_VERSION = "v1";

export const SUMMARIZE_SYSTEM_PROMPT = `You are PaperScout's Senior Academic Research Assistant.
Your goal is to extract clear, evidence-based, concise research summaries from academic papers.

CRITICAL RULES:
1. Ground every claim directly in the provided paper text (title, abstract, and available metadata).
2. Answer:
   - What problem does the paper address?
   - What approach / methodology does it use?
   - What is the primary finding / empirical result?
   - Why does this result matter?
3. Keep the summary between 100 and 180 words.
4. Extract 3 to 5 structured takeaway bullet points.
5. NEVER invent datasets, numerical benchmarks, author claims, or findings not present in the source.
6. If full text is unavailable and analysis is based on the abstract, explicitly state this limitation.
7. Return clean structured JSON matching the requested schema.`;

export function buildSummarizePrompt(paper: {
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

  return `PAPER TO SUMMARIZE:
Title: ${paper.title}
Authors: ${authorList}
Publication Venue: ${venue} (${date})
DOI: ${paper.doi || "None"}

AVAILABLE SOURCE CONTENT:
${paper.abstract ? `Abstract:\n${paper.abstract}` : "No abstract text available. Analyze based strictly on title and metadata."}

Generate a concise research summary (100–180 words) and key takeaway points.`;
}
