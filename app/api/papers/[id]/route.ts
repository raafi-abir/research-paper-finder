import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const paper = await prisma.paper.findUnique({
      where: { id },
      include: {
        interests: {
          include: {
            interest: true,
          },
        },
        gaps: true,
        ideas: true,
      },
    });

    if (!paper) {
      return NextResponse.json(
        { success: false, error: "Paper not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      paper,
    });
  } catch (error) {
    console.error("GET /api/papers/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch paper details" },
      { status: 500 }
    );
  }
}
