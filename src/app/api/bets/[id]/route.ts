import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/bets/[id] — Fetch a single bet with legs
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const bet = await prisma.bet.findUnique({
      where: { id },
      include: { legs: true },
    });

    if (!bet || bet.userId !== session.user.id) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    return NextResponse.json(bet);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// PUT /api/bets/[id] — Update bet fields
export async function PUT(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingBet = await prisma.bet.findUnique({
      where: { id },
    });

    if (!existingBet || existingBet.userId !== session.user.id) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    const body = await request.json();

    // Extract only allowed fields for update
    const {
      betType,
      stake,
      odds,
      payout,
      teaserPoints,
      sportsbook,
      notes,
      imageUrl,
      placedAt,
      legs: legsInput,
    } = body;

    const updatedBet = await prisma.$transaction(async (tx) => {
      // Update the bet itself
      const bet = await tx.bet.update({
        where: { id },
        data: {
          ...(betType !== undefined && { betType }),
          ...(stake !== undefined && { stake }),
          ...(odds !== undefined && { odds }),
          ...(payout !== undefined && { payout }),
          ...(teaserPoints !== undefined && { teaserPoints }),
          ...(sportsbook !== undefined && { sportsbook }),
          ...(notes !== undefined && { notes }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(placedAt !== undefined && { placedAt: new Date(placedAt) }),
        },
      });

      // If legs are provided, replace them
      if (Array.isArray(legsInput)) {
        await tx.leg.deleteMany({ where: { betId: id } });
        await tx.leg.createMany({
          data: legsInput.map(
            (leg: {
              sport: string;
              league?: string | null;
              eventName: string;
              eventDate?: string | null;
              marketType: string;
              selection: string;
              odds: number;
              line?: number | null;
              status?: string;
            }) => ({
              betId: id,
              sport: leg.sport,
              league: leg.league ?? null,
              eventName: leg.eventName,
              eventDate: leg.eventDate ? new Date(leg.eventDate) : null,
              marketType: leg.marketType,
              selection: leg.selection,
              odds: leg.odds,
              line: leg.line ?? null,
              status: leg.status ?? "pending",
            })
          ),
        });
      }

      return tx.bet.findUnique({
        where: { id },
        include: { legs: true },
      });
    });

    return NextResponse.json(updatedBet);
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// DELETE /api/bets/[id] — Delete a bet (cascades to legs)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingBet = await prisma.bet.findUnique({
      where: { id },
    });

    if (!existingBet || existingBet.userId !== session.user.id) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    await prisma.bet.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
