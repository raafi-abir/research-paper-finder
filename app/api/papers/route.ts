import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MOCK_PAPERS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const interestSlug = searchParams.get("interest");
    const query = searchParams.get("q");

    const whereCondition: Record<string, unknown> = {};

    if (interestSlug) {
      whereCondition.interests = {
        some: {
          interest: {
            slug: interestSlug,
          },
        },
      };
    }

    if (query) {
      whereCondition.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { summary: { contains: query, mode: "insensitive" } },
        { abstract: { contains: query, mode: "insensitive" } },
      ];
    }

    const papers = await prisma.paper.findMany({
      where: whereCondition,
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
      },
      orderBy: [
        { publicationDate: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({
      success: true,
      source: "database",
      count: papers.length,
      papers: papers.map((p, index) => ({
        id: p.id,
        number: String(index + 1).padStart(2, "0"),
        title: p.title,
        abstract: p.abstract,
        authors: Array.isArray(p.authors) ? (p.authors as string[]) : [],
        journal: p.journal,
        conference: p.conference,
        publication: p.journal || p.conference || null,
        publicationDate: p.publicationDate ? p.publicationDate.toISOString() : null,
        date: p.publicationDate
          ? new Date(p.publicationDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : null,
        citationCount: p.citationCount,
        doi: p.doi,
        url: p.url || (p.doi ? `https://doi.org/${p.doi}` : null),
        source: p.source,
        externalId: p.externalId,
        interests: p.interests.map((pi) => ({
          id: pi.interest.id,
          name: pi.interest.name,
          slug: pi.interest.slug,
          category: pi.interest.category,
        })),
      })),
    });
  } catch (error) {
    console.warn("Database query for /api/papers failed:", error);
    return NextResponse.json({
      success: false,
      source: "error",
      count: 0,
      papers: [],
      error: error instanceof Error ? error.message : "Failed to load papers",
    });
  }
}

