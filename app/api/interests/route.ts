import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ACADEMIC_FIELDS } from "@/lib/mockData";

export async function GET() {
  try {
    // Attempt database query
    const dbInterests = await prisma.interest.findMany({
      orderBy: { category: "asc" },
    });

    if (dbInterests.length > 0) {
      // Group by category
      const categories: Record<string, Array<{ id: string; name: string; slug: string }>> = {};
      for (const item of dbInterests) {
        if (!categories[item.category]) {
          categories[item.category] = [];
        }
        categories[item.category].push({
          id: item.id,
          name: item.name,
          slug: item.slug,
        });
      }

      return NextResponse.json({
        success: true,
        source: "database",
        categories,
      });
    }
  } catch (error) {
    console.warn("Database unavailable for /api/interests, serving fallback static data:", error);
  }

  // Fallback to static academic fields structure if DB not populated yet
  return NextResponse.json({
    success: true,
    source: "fallback",
    fields: ACADEMIC_FIELDS,
  });
}
