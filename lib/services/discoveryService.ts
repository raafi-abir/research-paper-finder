// lib/services/discoveryService.ts
import { prisma } from "@/lib/prisma";
import { searchOpenAlexWorks, DEFAULT_RESULTS_PER_INTEREST } from "@/lib/openalex/client";
import { mapOpenAlexWorkToNormalizedPaper } from "@/lib/openalex/mapper";

export interface DiscoveryOptions {
  resultsPerInterest?: number;
  userId?: string;
  email?: string;
}

export interface DiscoverySummary {
  interestsProcessed: number;
  papersFound: number;
  newPapersSaved: number;
  existingPapers: number;
  errors: { interest: string; error: string }[];
}

/**
 * Service that discovers academic papers for a user from OpenAlex based on their research interests.
 *
 * Pipeline:
 * 1. Find User and ResearchProfile -> get user interests
 * 2. Deduplicate interest queries
 * 3. Search OpenAlex for each interest
 * 4. Normalize records (abstract reconstruction, authors, venues, DOI)
 * 5. Deduplicate against PostgreSQL (by externalId or DOI)
 * 6. Save new papers or reuse existing
 * 7. Upsert PaperInterest relationships
 * 8. Return comprehensive summary
 */
export async function discoverPapersForUser(
  options: DiscoveryOptions = {}
): Promise<DiscoverySummary> {
  const email = options.email || "alex.chen@university.edu";
  const resultsPerInterest = options.resultsPerInterest || DEFAULT_RESULTS_PER_INTEREST;

  // 1. Locate user & profile
  let user = null;
  if (options.userId) {
    user = await prisma.user.findUnique({
      where: { id: options.userId },
      include: {
        profile: {
          include: {
            interests: {
              include: {
                interest: true,
              },
            },
          },
        },
      },
    });
  }

  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          include: {
            interests: {
              include: {
                interest: true,
              },
            },
          },
        },
      },
    });
  }

  if (!user || !user.profile) {
    throw new Error(
      `Research profile not found for ${options.userId ? `userId "${options.userId}"` : `email "${email}"`}`
    );
  }

  const profileInterests = user.profile.interests.map((pi) => pi.interest);
  if (profileInterests.length === 0) {
    return {
      interestsProcessed: 0,
      papersFound: 0,
      newPapersSaved: 0,
      existingPapers: 0,
      errors: [],
    };
  }

  const summary: DiscoverySummary = {
    interestsProcessed: 0,
    papersFound: 0,
    newPapersSaved: 0,
    existingPapers: 0,
    errors: [],
  };

  // In-memory query deduplication within this discovery run
  const processedInterestSlugs = new Set<string>();

  for (const interest of profileInterests) {
    if (processedInterestSlugs.has(interest.slug)) {
      continue;
    }
    processedInterestSlugs.add(interest.slug);
    summary.interestsProcessed++;

    try {
      // Respectful pacing between sequential queries
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await searchOpenAlexWorks(interest.name, {
        perPage: resultsPerInterest,
      });

      const works = response.results || [];
      summary.papersFound += works.length;

      for (const work of works) {
        if (!work.id) continue;

        const normalized = mapOpenAlexWorkToNormalizedPaper(work);

        // Deduplication Step:
        // 1. Match by source + externalId
        let existingPaper = await prisma.paper.findFirst({
          where: {
            source: "OPENALEX",
            externalId: normalized.externalId,
          },
        });

        // 2. If not found by externalId, match by DOI if DOI is present
        if (!existingPaper && normalized.doi) {
          existingPaper = await prisma.paper.findFirst({
            where: {
              doi: normalized.doi,
            },
          });
        }

        let paperId: string;

        if (existingPaper) {
          paperId = existingPaper.id;
          summary.existingPapers++;

          // Update citation count if higher or if missing fields can be enriched
          if (
            normalized.citationCount > existingPaper.citationCount ||
            (!existingPaper.abstract && normalized.abstract)
          ) {
            await prisma.paper.update({
              where: { id: existingPaper.id },
              data: {
                citationCount: Math.max(existingPaper.citationCount, normalized.citationCount),
                abstract: existingPaper.abstract || normalized.abstract,
                journal: existingPaper.journal || normalized.journal,
                conference: existingPaper.conference || normalized.conference,
              },
            });
          }
        } else {
          const createdPaper = await prisma.paper.create({
            data: {
              title: normalized.title,
              abstract: normalized.abstract,
              authors: normalized.authors,
              journal: normalized.journal,
              conference: normalized.conference,
              publicationDate: normalized.publicationDate,
              doi: normalized.doi,
              url: normalized.url,
              citationCount: normalized.citationCount,
              source: normalized.source,
              externalId: normalized.externalId,
            },
          });
          paperId = createdPaper.id;
          summary.newPapersSaved++;
        }

        // Link Paper to Interest
        await prisma.paperInterest.upsert({
          where: {
            paperId_interestId: {
              paperId: paperId,
              interestId: interest.id,
            },
          },
          update: {},
          create: {
            paperId: paperId,
            interestId: interest.id,
            relevanceScore: null,
          },
        });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`Error discovering papers for interest "${interest.name}":`, errorMessage);
      summary.errors.push({
        interest: interest.name,
        error: errorMessage,
      });
      // Do not crash the entire process if one interest fails
    }
  }

  return summary;
}

