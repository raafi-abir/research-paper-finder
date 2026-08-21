import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProfileSubmissionSchema } from "@/lib/validations";
import { ResearchLevel, DeliveryFrequency } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "alex.chen@university.edu";

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

    if (!user || !user.profile) {
      return NextResponse.json({
        success: true,
        source: "fallback",
        profile: {
          academicField: "Electrical & Electronic Engineering",
          researchLevel: "GRADUATE",
          researchContext: "I'm interested in machine learning applications in power systems.",
          deliveryFrequency: "EVERY_3_DAYS",
          papersPerDigest: 5,
          interests: [
            { slug: "power-systems", name: "Power Systems" },
            { slug: "renewable-energy", name: "Renewable Energy" },
            { slug: "power-electronics", name: "Power Electronics" },
            { slug: "smart-grid", name: "Smart Grid" },
          ],
        },
      });
    }

    return NextResponse.json({
      success: true,
      source: "database",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      profile: {
        id: user.profile.id,
        academicField: user.profile.academicField,
        researchLevel: user.profile.researchLevel,
        researchContext: user.profile.researchContext,
        researchGoals: user.profile.researchGoals,
        deliveryFrequency: user.profile.deliveryFrequency,
        papersPerDigest: user.profile.papersPerDigest,
        interests: user.profile.interests.map((pi) => ({
          id: pi.interest.id,
          name: pi.interest.name,
          slug: pi.interest.slug,
          category: pi.interest.category,
        })),
      },
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = ProfileSubmissionSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validated.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validated.data;

    // 1. Upsert User
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name || "PaperScout User" },
      create: {
        email: data.email,
        name: data.name || "PaperScout User",
      },
    });

    // Map enum values safely
    const researchLevel = (data.researchLevel as ResearchLevel) || ResearchLevel.GRADUATE;
    const deliveryFrequency =
      (data.deliveryFrequency as DeliveryFrequency) || DeliveryFrequency.EVERY_3_DAYS;

    // 2. Upsert Research Profile
    const profile = await prisma.researchProfile.upsert({
      where: { userId: user.id },
      update: {
        academicField: data.academicField,
        researchLevel,
        researchContext: data.researchContext || "",
        researchGoals: data.researchGoals || [],
        deliveryFrequency,
        papersPerDigest: data.papersPerDigest,
      },
      create: {
        userId: user.id,
        academicField: data.academicField,
        researchLevel,
        researchContext: data.researchContext || "",
        researchGoals: data.researchGoals || [],
        deliveryFrequency,
        papersPerDigest: data.papersPerDigest,
      },
    });

    // 3. Clear existing profile interests and link selected interest slugs
    await prisma.researchProfileInterest.deleteMany({
      where: { researchProfileId: profile.id },
    });

    const interestRecords = await prisma.interest.findMany({
      where: { slug: { in: data.interestSlugs } },
    });

    if (interestRecords.length > 0) {
      await prisma.researchProfileInterest.createMany({
        data: interestRecords.map((i) => ({
          researchProfileId: profile.id,
          interestId: i.id,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Research profile updated successfully",
      profileId: profile.id,
      userId: user.id,
    });
  } catch (error) {
    console.error("POST /api/profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error saving profile" },
      { status: 500 }
    );
  }
}
