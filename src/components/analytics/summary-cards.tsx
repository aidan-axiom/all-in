"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/odds";

interface SummaryCardsProps {
  totalBets: number;
  wins: number;
  losses: number;
  pushes: number;
  totalStaked: number;
  totalPL: number;
}

export function SummaryCards({
  totalBets,
  wins,
  losses,
  pushes,
  totalStaked,
  totalPL,
}: SummaryCardsProps) {
  const resolved = wins + losses + pushes;
  const winRate =
    resolved - pushes > 0
      ? ((wins / (resolved - pushes)) * 100).toFixed(1)
      : "0.0";
  const roi =
    totalStaked > 0 ? ((totalPL / totalStaked) * 100).toFixed(1) : "0.0";

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <Card className="card-scoreboard">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Bets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="stat-value text-3xl">{totalBets}</p>
        </CardContent>
      </Card>

      <Card className="card-scoreboard">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="stat-value text-3xl">
            {wins}-{losses}-{pushes}
          </p>
        </CardContent>
      </Card>

      <Card className="card-scoreboard">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="stat-value text-3xl">{winRate}%</p>
        </CardContent>
      </Card>

      <Card className="card-scoreboard">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total Staked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="stat-value text-3xl">{formatCurrency(totalStaked)}</p>
        </CardContent>
      </Card>

      <Card className="card-scoreboard">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total P&L
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`stat-value text-3xl ${
              totalPL > 0
                ? "text-primary"
                : totalPL < 0
                  ? "text-destructive"
                  : ""
            }`}
          >
            {formatCurrency(totalPL)}
          </p>
        </CardContent>
      </Card>

      <Card className="card-scoreboard">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            ROI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`stat-value text-3xl ${
              Number(roi) > 0
                ? "text-primary"
                : Number(roi) < 0
                  ? "text-destructive"
                  : ""
            }`}
          >
            {Number(roi) > 0 ? "+" : ""}
            {roi}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
