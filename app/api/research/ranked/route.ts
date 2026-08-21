import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rankAndDiversifyPapers } from "@/lib/ranking/engine";
import { UserProfileContext, PaperCandidate } from "@/lib/ranking/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "alex.chen@university.edu";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20", 10), 1), 100);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);
    const sortBy = (searchParams.get("sort") as "relevance" | "recent" | "cited") || "relevance";
    const interestFilter = searchParams.get("interest");

    // 1. Fetch User and ResearchProfile
    const user = await prisma.user.findUnique({
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

    const userProfileContext: UserProfileContext = {
      userId: user?.id,
      academicField: user?.profile?.academicField || "Electrical & Electronic Engineering",
      researchLevel: user?.profile?.researchLevel || "GRADUATE",
      researchContext:
        user?.profile?.researchContext ||
        "I'm interested in machine learning applications in power systems.",
      researchGoals: Array.isArray(user?.profile?.researchGoals)
        ? (user?.profile?.researchGoals as string[])
        : ["Find thesis ideas", "Stay updated with research"],
      interests:
        user?.profile?.interests.map((pi) => ({
          id: pi.interest.id,
          name: pi.interest.name,
          slug: pi.interest.slug,
          category: pi.interest.category,
        })) || [
          { id: "1", name: "Power Systems", slug: "power-systems" },
          { id: "2", name: "Renewable Energy", slug: "renewable-energy" },
          { id: "3", name: "Power Electronics", slug: "power-electronics" },
          { id: "4", name: "Smart Grid", slug: "smart-grid" },
        ],
    };

    // 2. Fetch candidate papers from database
    const whereCondition: Record<string, unknown> = {};
    if (interestFilter) {
      whereCondition.interests = {
        some: {
          interest: {
            OR: [{ slug: interestFilter }, { name: interestFilter }],
          },
        },
      };
    }

    const candidatePapers = await prisma.paper.findMany({
      where: whereCondition,
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
      },
    });

    // 3. Map candidates to ranking structure
    const candidates: PaperCandidate[] = candidatePapers.map((p) => ({
      id: p.id,
      title: p.title,
      abstract: p.abstract,
      authors: Array.isArray(p.authors) ? (p.authors as string[]) : [],
      journal: p.journal,
      conference: p.conference,
      publicationDate: p.publicationDate,
      citationCount: p.citationCount,
      doi: p.doi,
      url: p.url,
      source: p.source,
      externalId: p.externalId,
      interests: p.interests.map((pi) => ({
        interest: {
          id: pi.interest.id,
          name: pi.interest.name,
          slug: pi.interest.slug,
        },
      })),
    }));

    // 4. Rank and diversify
    const rankingResult = rankAndDiversifyPapers(candidates, userProfileContext, {
      limit,
      offset,
      sortBy,
    });

    return NextResponse.json({
      success: true,
      source: "ranking_engine",
      total: rankingResult.total,
      count: rankingResult.papers.length,
      papers: rankingResult.papers.map((p) => ({
        id: p.id,
        number: p.number,
        title: p.title,
        abstract: p.abstract,
        authors: p.authors,
        publication: p.journal || p.conference || null,
        journal: p.journal,
        conference: p.conference,
        publicationDate: p.publicationDate
          ? new Date(p.publicationDate).toISOString()
          : null,
        date: p.publicationDate
          ? new Date(p.publicationDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        citationCount: p.citationCount ?? 0,
        doi: p.doi,
        url: p.url || (p.doi ? `https://doi.org/${p.doi}` : null),
        source: p.source,
        externalId: p.externalId,
        relevanceScore: p.relevanceScore,
        relevanceLevel: p.relevanceLevel,
        relevanceLabel: p.relevanceLabel,
        explanation: p.explanation,
        scoreBreakdown: p.scoreBreakdown,
        matchedInterests: p.matchedInterests,
        interests: p.interests?.map((i) => ({
          id: i.interest.id,
          name: i.interest.name,
          slug: i.interest.slug,
        })),
      })),
    });
  } catch (error) {
    console.error("Ranked research API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to rank papers",
        papers: [],
      },
      { status: 500 }
    );
  }
}
