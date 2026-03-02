"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BetStatusBadge } from "@/components/bets/bet-status-badge";
import { BET_TYPE_LABELS, type BetType, type BetWithLegs } from "@/lib/types";
import { formatOdds, formatCurrency, calculateBetPL } from "@/lib/odds";
import { cn } from "@/lib/utils";

interface BetCardProps {
  bet: BetWithLegs;
}

export function BetCard({ bet }: BetCardProps) {
  const betTypeLabel = BET_TYPE_LABELS[bet.betType as BetType] ?? bet.betType;
  const legCount = bet.legs.length;
  const firstLeg = bet.legs[0];
  const isResolved = bet.status !== "pending";
  const pl = isResolved ? calculateBetPL(bet.status, bet.stake, bet.payout) : null;

  const placedDate = new Date(bet.placedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link href={`/bets/${bet.id}`} className="block group">
      <Card className={cn(
        "py-4 transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-md",
        bet.status === "won" && "glow-win",
        bet.status === "lost" && "card-loss-accent"
      )}>
        <CardHeader className="pb-0 gap-1.5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-display uppercase tracking-wide">{betTypeLabel}</CardTitle>
            <BetStatusBadge status={bet.status} />
          </div>
          {firstLeg && (
            <p className="text-sm text-muted-foreground truncate">
              {firstLeg.sport} &middot; {firstLeg.eventName}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stake</span>
            <span className="font-medium">{formatCurrency(bet.stake)}</span>
          </div>

          {bet.odds !== null && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Odds</span>
              <span className="font-medium">{formatOdds(bet.odds)}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {isResolved ? "P/L" : "Payout"}
            </span>
            {isResolved && pl !== null ? (
              <span
                className={
                  pl > 0
                    ? "font-medium text-primary"
                    : pl < 0
                    ? "font-medium text-destructive"
                    : "font-medium text-muted-foreground"
                }
              >
                {pl > 0 ? "+" : ""}
                {formatCurrency(pl)}
              </span>
            ) : (
              <span className="font-medium text-muted-foreground">Pending</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {legCount > 1 && (
                <span>
                  {legCount} legs
                </span>
              )}
              {bet.sportsbook && (
                <span>{bet.sportsbook}</span>
              )}
            </div>
            <span>{placedDate}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
