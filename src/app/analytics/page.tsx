import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBetPL } from "@/lib/odds";
import { BET_TYPE_LABELS, type BetType } from "@/lib/types";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { PLChart } from "@/components/analytics/pl-chart";
import { BreakdownTable } from "@/components/analytics/breakdown-table";

interface BreakdownRow {
  category: string;
  bets: number;
  wins: number;
  losses: number;
  pushes: number;
  staked: number;
  pl: number;
}

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch all bets for this user with legs included
  const allBets = await prisma.bet.findMany({
    where: { userId: session.user.id },
    include: { legs: true },
    orderBy: { placedAt: "desc" },
  });

  // If no bets at all, show empty state
  if (allBets.length === 0) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-4xl uppercase tracking-wide">Analytics</h1>
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground">
            No bets to analyze yet. Start by placing your first bet!
          </p>
        </div>
      </div>
    );
  }

  // Separate resolved and total
  const totalBets = allBets.length;
  const resolvedBets = allBets.filter((b) => b.status !== "pending");

  // Aggregate stats
  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let totalStaked = 0;
  let totalPL = 0;

  for (const bet of resolvedBets) {
    const pl = calculateBetPL(bet.status, bet.stake, bet.payout);
    totalStaked += bet.stake;
    totalPL += pl;

    if (bet.status === "won" || bet.status === "cashout") {
      wins++;
    } else if (bet.status === "lost") {
      losses++;
    } else if (bet.status === "push") {
      pushes++;
    }
  }

  // P&L over time (only resolved bets, sorted by resolvedAt ascending)
  const resolvedWithDate = resolvedBets
    .filter((b) => b.resolvedAt !== null)
    .sort(
      (a, b) =>
        new Date(a.resolvedAt!).getTime() - new Date(b.resolvedAt!).getTime()
    );

  let cumulativePL = 0;
  const plOverTime = resolvedWithDate.map((bet) => {
    const pl = calculateBetPL(bet.status, bet.stake, bet.payout);
    cumulativePL += pl;
    return {
      date: new Date(bet.resolvedAt!).toISOString().split("T")[0],
      pl,
      cumulativePL,
    };
  });

  // Breakdown by Sport
  // A bet can have multiple legs with different sports; attribute the bet to each sport
  const sportMap = new Map<string, BreakdownRow>();
  for (const bet of resolvedBets) {
    const sports = new Set(bet.legs.map((leg) => leg.sport));
    if (sports.size === 0) continue;
    const pl = calculateBetPL(bet.status, bet.stake, bet.payout);

    for (const sport of sports) {
      const existing = sportMap.get(sport) ?? {
        category: sport,
        bets: 0,
        wins: 0,
        losses: 0,
        pushes: 0,
        staked: 0,
        pl: 0,
      };
      existing.bets++;
      existing.staked += bet.stake;
      existing.pl += pl;
      if (bet.status === "won" || bet.status === "cashout") existing.wins++;
      else if (bet.status === "lost") existing.losses++;
      else if (bet.status === "push") existing.pushes++;
      sportMap.set(sport, existing);
    }
  }
  const bySport = Array.from(sportMap.values()).sort(
    (a, b) => b.bets - a.bets
  );

  // Breakdown by Bet Type
  const betTypeMap = new Map<string, BreakdownRow>();
  for (const bet of resolvedBets) {
    const label =
      BET_TYPE_LABELS[bet.betType as BetType] ?? bet.betType;
    const existing = betTypeMap.get(label) ?? {
      category: label,
      bets: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      staked: 0,
      pl: 0,
    };
    const pl = calculateBetPL(bet.status, bet.stake, bet.payout);
    existing.bets++;
    existing.staked += bet.stake;
    existing.pl += pl;
    if (bet.status === "won" || bet.status === "cashout") existing.wins++;
    else if (bet.status === "lost") existing.losses++;
    else if (bet.status === "push") existing.pushes++;
    betTypeMap.set(label, existing);
  }
  const byBetType = Array.from(betTypeMap.values()).sort(
    (a, b) => b.bets - a.bets
  );

  // Breakdown by Sportsbook
  const sportsbookMap = new Map<string, BreakdownRow>();
  for (const bet of resolvedBets) {
    const book = bet.sportsbook ?? "Unknown";
    const existing = sportsbookMap.get(book) ?? {
      category: book,
      bets: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
      staked: 0,
      pl: 0,
    };
    const pl = calculateBetPL(bet.status, bet.stake, bet.payout);
    existing.bets++;
    existing.staked += bet.stake;
    existing.pl += pl;
    if (bet.status === "won" || bet.status === "cashout") existing.wins++;
    else if (bet.status === "lost") existing.losses++;
    else if (bet.status === "push") existing.pushes++;
    sportsbookMap.set(book, existing);
  }
  const bySportsbook = Array.from(sportsbookMap.values()).sort(
    (a, b) => b.bets - a.bets
  );

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your betting performance at a glance.
        </p>
      </div>

      <SummaryCards
        totalBets={totalBets}
        wins={wins}
        losses={losses}
        pushes={pushes}
        totalStaked={totalStaked}
        totalPL={totalPL}
      />

      <PLChart data={plOverTime} />

      <BreakdownTable
        bySport={bySport}
        byBetType={byBetType}
        bySportsbook={bySportsbook}
      />
    </div>
  );
}
