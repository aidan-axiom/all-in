import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resolveBetSchema } from "@/lib/validators";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/bets/[id]/resolve — Resolve/settle a bet
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const existingBet = await prisma.bet.findUnique({
      where: { id },
      include: { legs: true },
    });

    if (!existingBet || existingBet.userId !== session.user.id) {
      return NextResponse.json({ error: "Bet not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = resolveBetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status, payout, closingOdds, legResults } = parsed.data;

    const updatedBet = await prisma.$transaction(async (tx) => {
      // Update the bet status, payout, closing odds, and resolved timestamp
      const bet = await tx.bet.update({
        where: { id },
        data: {
          status,
          payout: payout ?? null,
          closingOdds: closingOdds ?? null,
          resolvedAt: new Date(),
        },
      });

      // Update individual leg statuses if provided
      if (legResults && legResults.length > 0) {
        for (const legResult of legResults) {
          await tx.leg.update({
            where: { id: legResult.legId },
            data: { status: legResult.status },
          });
        }
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
