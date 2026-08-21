import { NextRequest, NextResponse } from "next/server";
import { analyzePaper } from "@/lib/ai/services/paperAnalysisService";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    let forceRefresh = false;
    try {
      const body = await request.json();
      if (body?.forceRefresh) forceRefresh = true;
    } catch {
      // Body is optional
    }

    const analysis = await analyzePaper(id, { forceRefresh });

    return NextResponse.json({
      success: true,
      paperId: id,
      ...analysis,
    });
  } catch (error) {
    console.error("AI analyze API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to analyze paper",
      },
      { status: 500 }
    );
  }
}
