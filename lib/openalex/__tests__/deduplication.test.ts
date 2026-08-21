// lib/openalex/__tests__/deduplication.test.ts
import { mapOpenAlexWorkToNormalizedPaper } from "../mapper";
import { OpenAlexWork, NormalizedPaper } from "../types";

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Assertion Failed: ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`
    );
  }
}

console.log("▶ Running Paper Deduplication Tests...");

// Mock in-memory repository to verify deduplication logic
class MockPaperStore {
  private papers: (NormalizedPaper & { id: string })[] = [];
  private paperInterests: { paperId: string; interestId: string }[] = [];

  async findDuplicate(normalized: NormalizedPaper) {
    // Match 1: Source + ExternalId
    let found = this.papers.find(
      (p) => p.source === normalized.source && p.externalId === normalized.externalId
    );
    // Match 2: DOI (if present)
    if (!found && normalized.doi) {
      found = this.papers.find((p) => p.doi === normalized.doi);
    }
    return found;
  }

  async insertOrReuse(normalized: NormalizedPaper, interestId: string) {
    const existing = await this.findDuplicate(normalized);
    let paperId: string;
    let isNew = false;

    if (existing) {
      paperId = existing.id;
      // Enrich existing record with higher citations if applicable
      if (normalized.citationCount > existing.citationCount) {
        existing.citationCount = normalized.citationCount;
      }
    } else {
      paperId = `paper_${this.papers.length + 1}`;
      this.papers.push({ ...normalized, id: paperId });
      isNew = true;
    }

    // Link paper ↔ interest (no duplicate relations)
    const alreadyLinked = this.paperInterests.some(
      (pi) => pi.paperId === paperId && pi.interestId === interestId
    );
    if (!alreadyLinked) {
      this.paperInterests.push({ paperId, interestId });
    }

    return { paperId, isNew };
  }

  get totalPapers() {
    return this.papers.length;
  }

  get totalLinks() {
    return this.paperInterests.length;
  }
}

async function runTest() {
  const store = new MockPaperStore();

  const work1: OpenAlexWork = {
    id: "https://openalex.org/W100",
    doi: "https://doi.org/10.1016/j.grid.2023.01",
    title: "Microgrid Stability Under High Inverter Penetration",
    authorships: [{ author: { display_name: "Sarah Jenkins" } }],
    cited_by_count: 15,
  };

  const work2: OpenAlexWork = {
    id: "https://openalex.org/W200",
    doi: "https://doi.org/10.1016/j.grid.2023.02",
    title: "Solid-State Transformer Design for Fast DC Charging",
    authorships: [{ author: { display_name: "Kenji Sato" } }],
    cited_by_count: 8,
  };

  const norm1 = mapOpenAlexWorkToNormalizedPaper(work1);
  const norm2 = mapOpenAlexWorkToNormalizedPaper(work2);

  // 1. First discovery run: Interest A (Power Systems)
  const res1 = await store.insertOrReuse(norm1, "interest_power_systems");
  const res2 = await store.insertOrReuse(norm2, "interest_power_systems");
  assertEqual(res1.isNew, true, "Work 1 is new on first run");
  assertEqual(res2.isNew, true, "Work 2 is new on first run");
  assertEqual(store.totalPapers, 2, "Store has 2 papers");
  assertEqual(store.totalLinks, 2, "Store has 2 paper-interest links");

  // 2. Second discovery run: same query / interest A -> Should not duplicate papers
  const res1_again = await store.insertOrReuse(norm1, "interest_power_systems");
  assertEqual(res1_again.isNew, false, "Work 1 is recognized as duplicate");
  assertEqual(store.totalPapers, 2, "Paper count remains 2 (no duplicate created)");
  assertEqual(store.totalLinks, 2, "Link count remains 2 (no duplicate link)");

  // 3. Third discovery run: Interest B (Renewable Energy) also returns work 1
  const res1_interestB = await store.insertOrReuse(norm1, "interest_renewable_energy");
  assertEqual(res1_interestB.isNew, false, "Work 1 is reused across interests");
  assertEqual(store.totalPapers, 2, "Paper count remains 2");
  assertEqual(store.totalLinks, 3, "New PaperInterest link created for Interest B");

  // 4. Duplicate detected by DOI even if external ID is slightly varied
  const work1_alternateId: OpenAlexWork = {
    id: "https://openalex.org/W100_ALT",
    doi: "10.1016/j.grid.2023.01", // same DOI
    title: "Microgrid Stability Under High Inverter Penetration (Revised)",
    authorships: [{ author: { display_name: "Sarah Jenkins" } }],
    cited_by_count: 20,
  };
  const norm1_alt = mapOpenAlexWorkToNormalizedPaper(work1_alternateId);
  const res_alt = await store.insertOrReuse(norm1_alt, "interest_smart_grid");
  assertEqual(res_alt.isNew, false, "Duplicate recognized by DOI");
  assertEqual(store.totalPapers, 2, "Paper count remains 2 after DOI deduplication");
  assertEqual(store.totalLinks, 4, "Link created for smart grid interest");

  console.log("✔ Deduplication test passed successfully!\n");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
