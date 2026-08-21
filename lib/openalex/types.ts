// lib/openalex/types.ts

export interface OpenAlexAuthor {
  id?: string;
  display_name?: string;
}

export interface OpenAlexAuthorship {
  author?: OpenAlexAuthor;
  raw_author_name?: string;
  author_position?: string;
}

export interface OpenAlexSource {
  id?: string;
  display_name?: string;
  type?: string;
  issn_l?: string;
}

export interface OpenAlexLocation {
  is_oa?: boolean;
  landing_page_url?: string;
  pdf_url?: string;
  source?: OpenAlexSource;
}

export interface OpenAlexWork {
  id: string; // e.g. "https://openalex.org/W2741809807"
  doi?: string | null;
  title?: string | null;
  display_name?: string | null;
  publication_date?: string | null; // e.g. "2019-01-01"
  publication_year?: number | null;
  type?: string | null;
  cited_by_count?: number | null;
  abstract_inverted_index?: Record<string, number[]> | null;
  abstract?: string | null;
  authorships?: OpenAlexAuthorship[] | null;
  authors?: (OpenAlexAuthor | string)[] | null;
  primary_location?: OpenAlexLocation | null;
  host_venue?: OpenAlexSource | null;
  locations?: OpenAlexLocation[] | null;
}

export interface OpenAlexResponse {
  meta: {
    count?: number;
    db_response_time_ms?: number;
    page?: number;
    per_page?: number;
  };
  results: OpenAlexWork[];
}

export interface NormalizedPaper {
  externalId: string;
  source: "OPENALEX";
  title: string;
  abstract: string | null;
  authors: string[];
  journal: string | null;
  conference: string | null;
  publicationDate: Date | null;
  doi: string | null;
  url: string | null;
  citationCount: number;
}

export interface OpenAlexSearchOptions {
  perPage?: number;
  page?: number;
  fromPublicationDate?: string;
  toPublicationDate?: string;
}

