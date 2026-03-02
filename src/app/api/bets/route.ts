import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createBetSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createBetSchema.parse(body);

    const bet = await prisma.$transaction(async (tx) => {
      const createdBet = await tx.bet.create({
        data: {
          userId: session.user!.id!,
          betType: parsed.betType,
          stake: parsed.stake,
          odds: parsed.odds ?? null,
          teaserPoints: parsed.teaserPoints ?? null,
          sportsbook: parsed.sportsbook ?? null,
          notes: parsed.notes ?? null,
          imageUrl: parsed.imageUrl ?? null,
          placedAt: parsed.placedAt,
          legs: {
            create: parsed.legs.map((leg) => ({
              sport: leg.sport,
              league: leg.league ?? null,
              eventName: leg.eventName,
              eventDate: leg.eventDate ?? null,
              marketType: leg.marketType,
              selection: leg.selection,
              odds: leg.odds,
              line: leg.line ?? null,
              status: leg.status ?? "pending",
            })),
          },
        },
        include: {
          legs: true,
        },
      });

      return createdBet;
    });

    return NextResponse.json(bet, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Failed to create bet:", error);
    return NextResponse.json(
      { error: "Failed to create bet" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get("status");
    const sport = searchParams.get("sport");
    const betType = searchParams.get("betType");
    const sportsbook = searchParams.get("sportsbook");
    const sort = searchParams.get("sort") || "placedAt";
    const order = searchParams.get("order") || "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (betType) {
      where.betType = betType;
    }

    if (sportsbook) {
      where.sportsbook = sportsbook;
    }

    // If filtering by sport, we need to filter through legs
    if (sport) {
      where.legs = {
        some: {
          sport: sport,
        },
      };
    }

    // Validate sort field against allowed fields
    const allowedSortFields = [
      "placedAt",
      "createdAt",
      "stake",
      "odds",
      "status",
    ];
    const sortField = allowedSortFields.includes(sort) ? sort : "placedAt";
    const sortOrder = order === "asc" ? "asc" : "desc";

    const [bets, total] = await Promise.all([
      prisma.bet.findMany({
        where,
        include: { legs: true },
        orderBy: { [sortField]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.bet.count({ where }),
    ]);

    return NextResponse.json({
      bets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Failed to fetch bets:", error);
    return NextResponse.json(
      { error: "Failed to fetch bets" },
      { status: 500 }
    );
  }
}
