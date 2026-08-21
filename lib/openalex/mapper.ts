// lib/openalex/mapper.ts
import { OpenAlexWork, NormalizedPaper } from "./types";

/**
 * Reconstruct an abstract from OpenAlex's inverted_index format into a readable string.
 * If the abstract is already provided as a string, return it trimmed.
 * If abstract is absent or empty, return null.
 */
export function reconstructAbstract(work: {
  abstract?: string | null;
  abstract_inverted_index?: Record<string, number[]> | null;
}): string | null {
  if (work.abstract && typeof work.abstract === "string" && work.abstract.trim().length > 0) {
    return work.abstract.trim();
  }

  if (!work.abstract_inverted_index || typeof work.abstract_inverted_index !== "object") {
    return null;
  }

  const entries = Object.entries(work.abstract_inverted_index);
  if (entries.length === 0) {
    return null;
  }

  let maxPos = -1;
  for (const [, positions] of entries) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        if (typeof pos === "number" && pos > maxPos) {
          maxPos = pos;
        }
      }
    }
  }

  if (maxPos < 0) {
    return null;
  }

  const words: string[] = new Array(maxPos + 1).fill("");
  for (const [word, positions] of entries) {
    if (Array.isArray(positions)) {
      for (const pos of positions) {
        if (typeof pos === "number" && pos >= 0 && pos <= maxPos) {
          words[pos] = word;
        }
      }
    }
  }

  const reconstructed = words.filter(Boolean).join(" ").trim();
  return reconstructed.length > 0 ? reconstructed : null;
}

/**
 * Extract clean author names array from OpenAlex work.
 */
export function extractAuthors(work: OpenAlexWork): string[] {
  const authors: string[] = [];

  if (Array.isArray(work.authorships)) {
    for (const authorship of work.authorships) {
      if (authorship.author?.display_name) {
        authors.push(authorship.author.display_name.trim());
      } else if (authorship.raw_author_name) {
        authors.push(authorship.raw_author_name.trim());
      }
    }
  } else if (Array.isArray(work.authors)) {
    for (const a of work.authors) {
      if (typeof a === "string" && a.trim().length > 0) {
        authors.push(a.trim());
      } else if (typeof a === "object" && a?.display_name) {
        authors.push(a.display_name.trim());
      }
    }
  }

  return authors.filter(Boolean);
}

/**
 * Normalize DOI string into standard format (without https://doi.org/ prefix).
 */
export function normalizeDoi(rawDoi?: string | null): string | null {
  if (!rawDoi || typeof rawDoi !== "string") {
    return null;
  }
  const clean = rawDoi
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
    .replace(/^doi:/i, "")
    .trim();
  return clean.length > 0 ? clean : null;
}

/**
 * Extract clean OpenAlex work ID (e.g. "W2741809807" or full URL if preferred, but cleaned).
 */
export function extractExternalId(rawId: string): string {
  if (!rawId) return "";
  return rawId.replace(/^https?:\/\/openalex\.org\//i, "").trim();
}

/**
 * Extract venue / source name.
 */
export function extractVenue(work: OpenAlexWork): { journal: string | null; conference: string | null } {
  const sourceName =
    work.primary_location?.source?.display_name ||
    work.host_venue?.display_name ||
    work.locations?.find((loc) => loc.source?.display_name)?.source?.display_name ||
    null;

  const sourceType =
    work.primary_location?.source?.type ||
    work.host_venue?.type ||
    work.type ||
    "";

  if (!sourceName) {
    return { journal: null, conference: null };
  }

  if (sourceType.toLowerCase().includes("conference") || sourceType.toLowerCase().includes("proceedings")) {
    return { journal: null, conference: sourceName.trim() };
  }

  return { journal: sourceName.trim(), conference: null };
}

/**
 * Map an OpenAlex work record to the application's NormalizedPaper object.
 */
export function mapOpenAlexWorkToNormalizedPaper(work: OpenAlexWork): NormalizedPaper {
  const externalId = extractExternalId(work.id);
  const title = (work.title || work.display_name || "Untitled Research Paper").trim();
  const abstract = reconstructAbstract(work);
  const authors = extractAuthors(work);
  const { journal, conference } = extractVenue(work);
  const doi = normalizeDoi(work.doi);

  let publicationDate: Date | null = null;
  if (work.publication_date) {
    const parsed = new Date(work.publication_date);
    if (!isNaN(parsed.getTime())) {
      publicationDate = parsed;
    }
  } else if (work.publication_year) {
    publicationDate = new Date(`${work.publication_year}-01-01T00:00:00Z`);
  }

  const url = work.primary_location?.landing_page_url || (doi ? `https://doi.org/${doi}` : work.id || null);
  const citationCount = typeof work.cited_by_count === "number" && work.cited_by_count >= 0 ? work.cited_by_count : 0;

  return {
    externalId,
    source: "OPENALEX",
    title,
    abstract,
    authors,
    journal,
    conference,
    publicationDate,
    doi,
    url,
    citationCount,
  };
}

// Alias for phase-3 spec naming
export const mapOpenAlexWorkToPaper = mapOpenAlexWorkToNormalizedPaper;

