import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateBetPL, calculateCLV } from "@/lib/odds";
import { BET_TYPE_LABELS, type BetType } from "@/lib/types";
import { filterBetsByTime, computeDayOfWeekStats, type TimeRange } from "@/lib/time-filters";
import { computeStreaks, computeStreaksBySport } from "@/lib/streaks";
import { SummaryCards } from "@/components/analytics/summary-cards";
import { PLChart } from "@/components/analytics/pl-chart";
import { BreakdownTable } from "@/components/analytics/breakdown-table";
import { TimeFilterBar } from "@/components/analytics/time-filter-bar";
import { StreakCards } from "@/components/analytics/streak-cards";
import { DayOfWeekChart } from "@/components/analytics/day-of-week-chart";
import { CLVSection } from "@/components/analytics/clv-section";
import { EVCalculator } from "@/components/analytics/ev-calculator";
import { UnitSettings } from "@/components/analytics/unit-settings";

interface BreakdownRow {
  category: string;
  bets: number;
  wins: number;
  losses: number;
  pushes: number;
  staked: number;
  pl: number;
}

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

export default async function AnalyticsPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const timeRange = (params.range as TimeRange) ?? "all";

  // Fetch user settings and all bets in parallel
  const [user, allBets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { unitSize: true },
    }),
    prisma.bet.findMany({
      where: { userId: session.user.id },
      include: { legs: true },
      orderBy: { placedAt: "desc" },
    }),
  ]);

  const unitSize = user?.unitSize ?? null;

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

  // Apply time filter
  const filteredBets = filterBetsByTime(allBets, timeRange);
  const totalBets = filteredBets.length;
  const resolvedBets = filteredBets.filter((b) => b.status !== "pending");

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

  // P&L over time (resolved bets sorted by resolvedAt ascending)
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

  // Streaks (computed on resolved bets sorted ascending by resolvedAt)
  const streaks = computeStreaks(resolvedWithDate);
  const streaksBySport = computeStreaksBySport(resolvedWithDate);

  // Day of week stats
  const dayOfWeekStats = computeDayOfWeekStats(resolvedBets, calculateBetPL);

  // CLV data (bets with both odds and closingOdds)
  const betsWithCLV = resolvedWithDate.filter(
    (b) => b.odds !== null && b.closingOdds !== null
  );
  const clvValues = betsWithCLV.map((b) => ({
    date: new Date(b.resolvedAt!).toISOString().split("T")[0],
    clv: calculateCLV(b.odds!, b.closingOdds!),
    odds: b.odds!,
    closingOdds: b.closingOdds!,
  }));
  const averageCLV =
    clvValues.length > 0
      ? clvValues.reduce((sum, v) => sum + v.clv, 0) / clvValues.length
      : 0;
  const beatClosePercent =
    clvValues.length > 0
      ? (clvValues.filter((v) => v.clv > 0).length / clvValues.length) * 100
      : 0;

  // Breakdown by Sport
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl uppercase tracking-wide">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your betting performance at a glance.
          </p>
        </div>
        <UnitSettings unitSize={unitSize} />
      </div>

      <Suspense>
        <TimeFilterBar />
      </Suspense>

      <SummaryCards
        totalBets={totalBets}
        wins={wins}
        losses={losses}
        pushes={pushes}
        totalStaked={totalStaked}
        totalPL={totalPL}
        unitSize={unitSize}
      />

      <StreakCards streaks={streaks} streaksBySport={streaksBySport} />

      <PLChart data={plOverTime} />

      <DayOfWeekChart data={dayOfWeekStats} />

      <CLVSection
        averageCLV={averageCLV}
        beatClosePercent={beatClosePercent}
        totalWithCLV={betsWithCLV.length}
        clvData={clvValues}
      />

      <EVCalculator defaultStake={unitSize ?? 100} />

      <BreakdownTable
        bySport={bySport}
        byBetType={byBetType}
        bySportsbook={bySportsbook}
        unitSize={unitSize}
      />
    </div>
  );
}
