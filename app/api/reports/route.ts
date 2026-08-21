import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "alex.chen@university.edu";

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: true,
        source: "fallback",
        reports: [
          {
            id: "report-1",
            title: "PaperScout Research Digest — August 12, 2026",
            status: "COMPLETED",
            generatedAt: new Date().toISOString(),
            paperCount: 3,
          },
        ],
      });
    }

    const reports = await prisma.report.findMany({
      where: { userId: user.id },
      include: {
        papers: {
          include: {
            paper: true,
          },
          orderBy: { position: "asc" },
        },
      },
      orderBy: { generatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      source: "database",
      count: reports.length,
      reports: reports.map((r) => ({
        id: r.id,
        title: r.title,
        summary: r.summary,
        status: r.status,
        generatedAt: r.generatedAt,
        papers: r.papers.map((rp) => ({
          position: rp.position,
          id: rp.paper.id,
          title: rp.paper.title,
          doi: rp.paper.doi,
        })),
      })),
    });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
