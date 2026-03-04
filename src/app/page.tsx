import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, calculateBetPL } from "@/lib/odds";
import { BetCard } from "@/components/bets/bet-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LiveScoresFeed } from "@/components/scores/live-scores-feed";
import type { BetWithLegs } from "@/lib/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Start of current month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Run all queries in parallel
  const [
    pendingCount,
    pendingStakeAgg,
    resolvedBetsThisMonth,
    allResolvedBets,
    pendingBets,
    recentResolvedBets,
  ] = await Promise.all([
    // 1. Count of pending bets
    prisma.bet.count({
      where: { userId, status: "pending" },
    }),

    // 2. Sum of stakes on pending bets
    prisma.bet.aggregate({
      where: { userId, status: "pending" },
      _sum: { stake: true },
    }),

    // 3. All resolved bets for this month (for monthly P&L)
    prisma.bet.findMany({
      where: {
        userId,
        status: { not: "pending" },
        resolvedAt: { gte: monthStart },
      },
    }),

    // 4. All resolved bets (for win rate and total P&L)
    prisma.bet.findMany({
      where: {
        userId,
        status: { not: "pending" },
      },
    }),

    // 5. 5 most recent pending bets with legs
    prisma.bet.findMany({
      where: { userId, status: "pending" },
      include: { legs: true },
      orderBy: { placedAt: "desc" },
      take: 5,
    }),

    // 6. 5 most recently resolved bets with legs
    prisma.bet.findMany({
      where: { userId, status: { not: "pending" } },
      include: { legs: true },
      orderBy: { resolvedAt: "desc" },
      take: 5,
    }),
  ]);

  // Compute stats
  const pendingStake = pendingStakeAgg._sum.stake ?? 0;

  const monthlyPL = resolvedBetsThisMonth.reduce(
    (sum, bet) => sum + calculateBetPL(bet.status, bet.stake, bet.payout),
    0
  );

  const totalPL = allResolvedBets.reduce(
    (sum, bet) => sum + calculateBetPL(bet.status, bet.stake, bet.payout),
    0
  );

  // Win rate: wins / (wins + losses), excluding pushes
  const wins = allResolvedBets.filter((b) => b.status === "won").length;
  const losses = allResolvedBets.filter((b) => b.status === "lost").length;
  const winRateDenominator = wins + losses;
  const winRate = winRateDenominator > 0 ? (wins / winRateDenominator) * 100 : 0;

  const hasNoBets =
    pendingCount === 0 && allResolvedBets.length === 0;

  // P&L color helper
  function plColor(value: number) {
    if (value > 0) return "text-primary";
    if (value < 0) return "text-destructive";
    return "text-muted-foreground";
  }

  // Empty state
  if (hasNoBets) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display uppercase tracking-wide">
            Welcome to BetTracker
          </h1>
          <p className="text-muted-foreground max-w-md">
            Track your sports bets, analyze your performance, and make smarter
            decisions. Get started by placing your first bet.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/bets/new">Place Your First Bet</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">Dashboard</h1>
        <p className="text-muted-foreground">
          Your betting overview at a glance.
        </p>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Bets */}
        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs tracking-wider font-medium">Pending Bets</CardDescription>
            <CardTitle className="stat-value text-3xl">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(pendingStake)} at stake
            </p>
          </CardContent>
        </Card>

        {/* This Month's P&L */}
        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs tracking-wider font-medium">This Month&apos;s P&amp;L</CardDescription>
            <CardTitle className={`stat-value text-3xl ${plColor(monthlyPL)}`}>
              {monthlyPL > 0 ? "+" : ""}
              {formatCurrency(monthlyPL)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {resolvedBetsThisMonth.length} bet
              {resolvedBetsThisMonth.length !== 1 ? "s" : ""} resolved
            </p>
          </CardContent>
        </Card>

        {/* Win Rate */}
        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs tracking-wider font-medium">Win Rate</CardDescription>
            <CardTitle className="stat-value text-3xl">
              {winRateDenominator > 0
                ? `${winRate.toFixed(1)}%`
                : "N/A"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {wins}W - {losses}L
              {allResolvedBets.filter((b) => b.status === "push").length > 0 &&
                ` - ${allResolvedBets.filter((b) => b.status === "push").length}P`}
            </p>
          </CardContent>
        </Card>

        {/* Total P&L */}
        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs tracking-wider font-medium">Total P&amp;L</CardDescription>
            <CardTitle className={`stat-value text-3xl ${plColor(totalPL)}`}>
              {totalPL > 0 ? "+" : ""}
              {formatCurrency(totalPL)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {allResolvedBets.length} bet
              {allResolvedBets.length !== 1 ? "s" : ""} resolved all time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild className="font-display uppercase tracking-wider">
          <Link href="/bets/new">New Bet</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/bets">View History</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/analytics">Analytics</Link>
        </Button>
      </div>

      {/* Live Scores */}
      {pendingCount > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide">
              Live Scores
            </h2>
            <Button asChild variant="link" size="sm">
              <Link href="/scores">View All</Link>
            </Button>
          </div>
          <LiveScoresFeed limit={4} compact showHeader={false} />
        </section>
      )}

      {/* Pending Bets & Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Pending Bets */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide">
              Pending Bets
            </h2>
            {pendingCount > 5 && (
              <Button asChild variant="link" size="sm">
                <Link href="/bets?status=pending">View All</Link>
              </Button>
            )}
          </div>
          {pendingBets.length > 0 ? (
            <div className="space-y-3">
              {(pendingBets as BetWithLegs[]).map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No pending bets. Ready to place one?
                </p>
                <Button asChild variant="link" size="sm" className="mt-2">
                  <Link href="/bets/new">Place a Bet</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Recent Activity */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl uppercase tracking-wide">
              Recent Activity
            </h2>
            {allResolvedBets.length > 5 && (
              <Button asChild variant="link" size="sm">
                <Link href="/bets">View All</Link>
              </Button>
            )}
          </div>
          {recentResolvedBets.length > 0 ? (
            <div className="space-y-3">
              {(recentResolvedBets as BetWithLegs[]).map((bet) => (
                <BetCard key={bet.id} bet={bet} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No resolved bets yet. Your results will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
