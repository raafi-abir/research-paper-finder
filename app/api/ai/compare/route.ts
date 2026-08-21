import { NextRequest, NextResponse } from "next/server";
import { comparePapers } from "@/lib/ai/services/paperComparisonService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const paperIds = body?.paperIds;

    if (!Array.isArray(paperIds) || paperIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "An array of 1 to 5 paperIds is required.",
        },
        { status: 400 }
      );
    }

    if (paperIds.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "A maximum of 5 papers can be compared simultaneously.",
        },
        { status: 400 }
      );
    }

    const comparison = await comparePapers(paperIds);

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error) {
    console.error("AI compare API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to compare papers",
      },
      { status: 500 }
    );
  }
}
