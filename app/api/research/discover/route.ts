import { NextRequest, NextResponse } from "next/server";
import { discoverPapersForUser } from "@/lib/services/discoveryService";

export async function POST(request: NextRequest) {
  try {
    let body: { userId?: string; email?: string; resultsPerInterest?: number } = {};
    try {
      body = await request.json();
    } catch {
      // Empty or invalid body is acceptable in dev mode, defaults will apply
    }

    const { searchParams } = new URL(request.url);
    const email = body.email || searchParams.get("email") || "alex.chen@university.edu";
    const userId = body.userId || searchParams.get("userId") || undefined;
    const resultsPerInterest = body.resultsPerInterest
      ? Number(body.resultsPerInterest)
      : undefined;

    const summary = await discoverPapersForUser({
      userId,
      email,
      resultsPerInterest,
    });

    return NextResponse.json({
      success: true,
      message: `Research discovery complete. Found ${summary.papersFound} papers (${summary.newPapersSaved} newly saved, ${summary.existingPapers} already present).`,
      summary,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Discovery process encountered an error";
    console.error("Discovery API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
