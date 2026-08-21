# OpenAlex Research API Integration (Phase 3)

## 1. Architecture Overview

PaperScout connects directly to **OpenAlex**, an open, comprehensive index of global scholarly research containing hundreds of millions of academic papers, authors, and institutions.

To maintain security, performance, and data integrity, all OpenAlex interactions follow a strict server-side pipeline:

```text
User
 ↓
ResearchProfile (Interests)
 ↓
Next.js Server API (POST /api/research/discover)
 ↓
Discovery Service (lib/services/discoveryService.ts)
 ↓
OpenAlex Client (Polite Pool HTTPS request)
 ↓
Mapper & Abstract Reconstruction (lib/openalex/mapper.ts)
 ↓
PostgreSQL Deduplication (externalId + DOI matching)
 ↓
Prisma ORM (Paper + PaperInterest models)
 ↓
Dashboard Feed (/api/papers)
```

**Key Architectural Invariants**:
- The browser never queries OpenAlex directly; configuration and mailto credentials remain secure on the server.
- The UI displays real metadata (authors, journal/conference, DOI, citations, abstract) and eliminates fake AI metrics.

---

## 2. Environment Variables

OpenAlex requires polite pool identification via a contact email in the request parameters or user-agent header.

Configure the following in `.env`:

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@localhost:5432/paperscout?schema=public"

# OpenAlex API Base URL
OPENALEX_API_URL="https://api.openalex.org"

# Contact email for OpenAlex Polite Pool (enables faster queries and 100 req/s rate limits)
OPENALEX_MAILTO="alex.chen@university.edu"
```

---

## 3. How Searching Works

OpenAlex queries are dispatched via `searchOpenAlexWorks(query, options)` located in `lib/openalex/client.ts`.

- **Endpoint**: `GET /works?search={query}&per_page={limit}&mailto={email}`
- **Default Limit**: 10 papers per interest topic.
- **Pacing**: 100ms interval between sequential interest searches to ensure polite API etiquette.
- **Timeout**: 10-second bounded timeout per request using `AbortController`.

---

## 4. How Interests Become Queries

User research interests stored in the database (e.g., `Power Systems`, `Renewable Energy`, `Smart Grid`) are retrieved from the user's `ResearchProfile`:

1. All selected interest records for the user are loaded.
2. In-memory deduplication ensures duplicate interest entries in the profile are only searched once.
3. Each interest's natural language `name` is passed as the search query.

---

## 5. Paper Normalization & Abstract Reconstruction

OpenAlex responses return nested metadata, and abstracts are stored in an inverted index dictionary format (`Record<string, number[]>`) to optimize bandwidth.

`mapOpenAlexWorkToNormalizedPaper` in `lib/openalex/mapper.ts` normalizes each record:

### Abstract Reconstruction
`reconstructAbstract()` maps each word token to its designated word index positions:
$$\text{position} \mapsto \text{token}$$
Reconstructs the full original abstract sentence structure cleanly without hallucinating content.

### Authors Extraction
Extracts author display names from `authorships[].author.display_name` or `authorships[].raw_author_name`.

### Venue Resolution
Extracts journal or conference name from `primary_location.source.display_name` or `host_venue.display_name`.

### DOI Normalization
Strips `https://doi.org/`, `http://dx.doi.org/`, and `doi:` prefixes to store clean standard identifiers.

---

## 6. Duplicate Detection Strategy

To prevent duplicate paper entries when discovery runs multiple times:

1. **Step 1 — Source & External ID**: First queries PostgreSQL for `source = "OPENALEX"` and `externalId = work.id`.
2. **Step 2 — Digital Object Identifier (DOI)**: If not matched and a normalized DOI is present, queries for `doi = normalized.doi`.
3. **Step 3 — Upsert / Reuse**:
   - If paper exists: Updates citation counts or missing abstracts if newer data is available, and reuses existing `paper.id`.
   - If paper is new: Inserts a new record into `Paper`.
4. **Step 4 — Join Link**: Creates or updates a `PaperInterest` join record linking the paper to the respective `Interest` with `relevanceScore: null`.

---

## 7. Error Handling

- **Partial Failure Resiliency**: If querying one research interest fails due to a network timeout or upstream 500, the discovery loop logs the error, records it in the summary, and continues processing the remaining interests.
- **Graceful Nulls**: Missing fields (e.g. absent abstracts or DOIs) are stored as `null` and handled cleanly in the UI without placeholder text like "N/A".

---

## 8. How to Trigger Discovery

### Via Dashboard UI
Click the **"Discover new research"** button in the dashboard header. The UI will show an active loading state: *"Looking through recent research…"*, followed by a confirmation banner showing the number of newly indexed papers.

### Via API Request
```bash
curl -X POST http://localhost:3000/api/research/discover \
  -H "Content-Type: application/json" \
  -d '{"email": "alex.chen@university.edu", "resultsPerInterest": 10}'
```

Response format:
```json
{
  "success": true,
  "message": "Research discovery complete. Found 28 papers (19 newly saved, 9 already present).",
  "summary": {
    "interestsProcessed": 3,
    "papersFound": 28,
    "newPapersSaved": 19,
    "existingPapers": 9,
    "errors": []
  }
}
```

---

## 9. Current Limitations (Phase 3)

- **Single Academic Source**: Only OpenAlex is connected (arXiv, CrossRef, PubMed planned for future phases).
- **Keyword-based Querying**: Uses exact interest terms without semantic expansion or boolean logic.
- **Relevance Scoring**: `relevanceScore` is left as `null` (no artificial/fake scores are generated).

---

## 10. Next Phase Roadmap (Phase 4)

- **AI Analysis Engine**: Real LLM-driven synthesis of methodologies, key findings, and limitations.
- **Semantic Relevance Scoring**: Embedding-based ranking against the user's detailed research context.
- **Digest Generation**: Automated compilation of bi-weekly personalized PDF/HTML digests.
- **Research Opportunity Detection**: Cross-paper synthesis identifying genuine literature gaps.
