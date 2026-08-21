// lib/openalex/__tests__/mapper.test.ts
import {
  reconstructAbstract,
  extractAuthors,
  normalizeDoi,
  extractExternalId,
  extractVenue,
  mapOpenAlexWorkToNormalizedPaper,
} from "../mapper";
import { OpenAlexWork } from "../types";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion Failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}

console.log("▶ Running OpenAlex Mapper Tests...");

// 1. Abstract Reconstruction Tests
console.log("  Testing reconstructAbstract()...");
{
  // Reconstruct from inverted index
  const invertedIndexWork = {
    abstract_inverted_index: {
      This: [0],
      paper: [1],
      presents: [2],
      a: [3],
      novel: [4],
      approach: [5],
      to: [6],
      power: [7],
      "systems.": [8],
    },
  };
  const result = reconstructAbstract(invertedIndexWork);
  assertEqual(
    result,
    "This paper presents a novel approach to power systems.",
    "Should reconstruct inverted index into readable string"
  );

  // Overlapping / multi-occurrence positions
  const multiOccurrenceWork = {
    abstract_inverted_index: {
      the: [0, 4],
      grid: [1, 5],
      and: [2],
      storage: [3],
    },
  };
  assertEqual(
    reconstructAbstract(multiOccurrenceWork),
    "the grid and storage the grid",
    "Should handle multiple position occurrences of the same word"
  );

  // Plain string abstract fallback
  const plainWork = { abstract: "   Direct string abstract.   " };
  assertEqual(
    reconstructAbstract(plainWork),
    "Direct string abstract.",
    "Should trim plain string abstract"
  );

  // Missing or empty abstract
  assertEqual(reconstructAbstract({}), null, "Should return null for missing abstract");
  assertEqual(
    reconstructAbstract({ abstract_inverted_index: {} }),
    null,
    "Should return null for empty inverted index"
  );
}

// 2. DOI Normalization Tests
console.log("  Testing normalizeDoi()...");
{
  assertEqual(
    normalizeDoi("https://doi.org/10.1109/TPWRS.2023.1234567"),
    "10.1109/TPWRS.2023.1234567",
    "Should strip https://doi.org/ prefix"
  );
  assertEqual(
    normalizeDoi("http://dx.doi.org/10.1016/j.epsr.2022.108000"),
    "10.1016/j.epsr.2022.108000",
    "Should strip http://dx.doi.org/ prefix"
  );
  assertEqual(
    normalizeDoi("doi:10.1049/iet-rpg.2021.0001"),
    "10.1049/iet-rpg.2021.0001",
    "Should strip doi: prefix"
  );
  assertEqual(
    normalizeDoi("10.1109/5.771073"),
    "10.1109/5.771073",
    "Should preserve already normalized DOI"
  );
  assertEqual(normalizeDoi(undefined), null, "Should return null for undefined DOI");
  assertEqual(normalizeDoi(null), null, "Should return null for null DOI");
}

// 3. Authors Extraction Tests
console.log("  Testing extractAuthors()...");
{
  const workWithAuthorships: OpenAlexWork = {
    id: "W123",
    title: "Test",
    authorships: [
      { author: { id: "A1", display_name: "Elena Rostova" } },
      { author: { id: "A2", display_name: "David K. Miller" } },
      { raw_author_name: "S. Tanaka" },
    ],
  };
  assertEqual(
    extractAuthors(workWithAuthorships),
    ["Elena Rostova", "David K. Miller", "S. Tanaka"],
    "Should extract author names from authorships"
  );

  const workWithNoAuthors: OpenAlexWork = {
    id: "W124",
    title: "Anonymous Study",
    authorships: [],
  };
  assertEqual(extractAuthors(workWithNoAuthors), [], "Should return empty array when no authors");
}

// 4. External ID Extraction Tests
console.log("  Testing extractExternalId()...");
{
  assertEqual(
    extractExternalId("https://openalex.org/W2741809807"),
    "W2741809807",
    "Should strip openalex URL prefix"
  );
  assertEqual(
    extractExternalId("W2741809807"),
    "W2741809807",
    "Should keep clean externalId"
  );
}

// 5. Full Work Mapping Tests
console.log("  Testing mapOpenAlexWorkToNormalizedPaper()...");
{
  const fullWork: OpenAlexWork = {
    id: "https://openalex.org/W3123456789",
    doi: "https://doi.org/10.1109/TPWRS.2024.9999999",
    title: "Deep Reinforcement Learning for Dynamic Grid Voltage Control",
    publication_date: "2024-03-15",
    cited_by_count: 42,
    abstract_inverted_index: {
      Dynamic: [0],
      voltage: [1],
      control: [2],
      is: [3],
      critical: [4],
      for: [5],
      renewable: [6],
      "integration.": [7],
    },
    authorships: [
      { author: { id: "A10", display_name: "Zhihua Wang" } },
      { author: { id: "A11", display_name: "Clara Schumann" } },
    ],
    primary_location: {
      landing_page_url: "https://ieeexplore.ieee.org/document/9999999",
      source: {
        id: "S1",
        display_name: "IEEE Transactions on Power Systems",
        type: "journal",
      },
    },
  };

  const normalized = mapOpenAlexWorkToNormalizedPaper(fullWork);

  assertEqual(normalized.externalId, "W3123456789", "externalId mapped");
  assertEqual(normalized.source, "OPENALEX", "source is OPENALEX");
  assertEqual(
    normalized.title,
    "Deep Reinforcement Learning for Dynamic Grid Voltage Control",
    "title mapped"
  );
  assertEqual(
    normalized.abstract,
    "Dynamic voltage control is critical for renewable integration.",
    "abstract mapped"
  );
  assertEqual(
    normalized.authors,
    ["Zhihua Wang", "Clara Schumann"],
    "authors mapped"
  );
  assertEqual(
    normalized.journal,
    "IEEE Transactions on Power Systems",
    "journal mapped"
  );
  assertEqual(normalized.conference, null, "conference is null for journals");
  assertEqual(
    normalized.doi,
    "10.1109/TPWRS.2024.9999999",
    "doi normalized"
  );
  assertEqual(normalized.citationCount, 42, "citations mapped");
  assert(
    normalized.publicationDate instanceof Date &&
      normalized.publicationDate.toISOString().startsWith("2024-03-15"),
    "publicationDate mapped"
  );

  // Missing fields resilience
  const minimalWork: OpenAlexWork = {
    id: "https://openalex.org/W0000000001",
  };
  const minimalNormalized = mapOpenAlexWorkToNormalizedPaper(minimalWork);

  assertEqual(minimalNormalized.externalId, "W0000000001", "minimal externalId mapped");
  assertEqual(minimalNormalized.title, "Untitled Research Paper", "fallback title used");
  assertEqual(minimalNormalized.abstract, null, "null abstract handled");
  assertEqual(minimalNormalized.authors, [], "empty authors array");
  assertEqual(minimalNormalized.journal, null, "null journal handled");
  assertEqual(minimalNormalized.doi, null, "null doi handled");
  assertEqual(minimalNormalized.citationCount, 0, "0 citations fallback");
}

console.log("✔ All OpenAlex Mapper unit tests passed successfully!\n");
