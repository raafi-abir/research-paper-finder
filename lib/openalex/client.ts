// lib/openalex/client.ts
import { OpenAlexResponse, OpenAlexSearchOptions } from "./types";

export const DEFAULT_RESULTS_PER_INTEREST = 10;

/**
 * Perform a search for academic works in OpenAlex.
 *
 * Requirements:
 * - Server-side only
 * - Adds mailto param for OpenAlex Polite Pool (faster response time and higher rate limit)
 * - 10-second timeout per request
 * - Configurable result limit and publication date filters
 */
export async function searchOpenAlexWorks(
  query: string,
  options: OpenAlexSearchOptions = {}
): Promise<OpenAlexResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { meta: { count: 0, page: 1, per_page: 0 }, results: [] };
  }

  const apiUrl = (process.env.OPENALEX_API_URL || "https://api.openalex.org").replace(/\/$/, "");
  const mailto = process.env.OPENALEX_MAILTO || "researcher@paperscout.internal";

  const perPage = Math.min(Math.max(options.perPage || DEFAULT_RESULTS_PER_INTEREST, 1), 50);
  const page = Math.max(options.page || 1, 1);

  const params = new URLSearchParams({
    search: cleanQuery,
    per_page: String(perPage),
    page: String(page),
    mailto: mailto,
  });

  // Date filters
  const filterParts: string[] = [];
  if (options.fromPublicationDate) {
    filterParts.push(`from_publication_date:${options.fromPublicationDate}`);
  }
  if (options.toPublicationDate) {
    filterParts.push(`to_publication_date:${options.toPublicationDate}`);
  }
  if (filterParts.length > 0) {
    params.set("filter", filterParts.join(","));
  }

  const targetUrl = `${apiUrl}/works?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": `PaperScout/1.0 (mailto:${mailto})`,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `OpenAlex API responded with status ${response.status} (${response.statusText}): ${errorText.slice(0, 200)}`
      );
    }

    const data: OpenAlexResponse = await response.json();
    return {
      meta: data.meta || {},
      results: Array.isArray(data.results) ? data.results : [],
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenAlex API request timed out after 10s for query: "${cleanQuery}"`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

