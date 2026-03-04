"use client";

import { Card, CardContent } from "@/components/ui/card";
import { GameStatusBadge } from "./game-status-badge";
import { evaluateBetOutlook, type LiveGame, type BetOutlook } from "@/lib/scores";
import { formatOdds } from "@/lib/odds";
import { cn } from "@/lib/utils";

const outlookStyles: Record<BetOutlook, string> = {
  winning: "text-primary",
  losing: "text-destructive",
  push: "text-muted-foreground",
  unknown: "text-muted-foreground",
};

const outlookLabels: Record<BetOutlook, string> = {
  winning: "Winning",
  losing: "Losing",
  push: "Push",
  unknown: "In Play",
};

interface ScoreCardProps {
  game: LiveGame;
  compact?: boolean;
}

export function ScoreCard({ game, compact }: ScoreCardProps) {
  const { homeTeam, awayTeam, status, statusDetail, matchedLegs } = game;

  return (
    <Card
      className={cn(
        status === "live" && "card-live",
        status === "final" && "card-scoreboard",
        status === "scheduled" && "card-scoreboard"
      )}
    >
      <CardContent className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        {/* Header: sport + status */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-display uppercase tracking-wider text-muted-foreground">
            {game.sport}
          </span>
          <GameStatusBadge status={status} />
        </div>

        {/* Scoreboard */}
        <div className="space-y-1.5">
          {/* Away team */}
          <TeamRow
            logo={awayTeam.logo}
            name={compact ? awayTeam.abbreviation : awayTeam.name}
            score={awayTeam.score}
            showScore={status !== "scheduled"}
            isLeading={status !== "scheduled" && awayTeam.score > homeTeam.score}
          />
          {/* Home team */}
          <TeamRow
            logo={homeTeam.logo}
            name={compact ? homeTeam.abbreviation : homeTeam.name}
            score={homeTeam.score}
            showScore={status !== "scheduled"}
            isLeading={status !== "scheduled" && homeTeam.score > awayTeam.score}
          />
        </div>

        {/* Status detail */}
        <p className="text-[11px] text-muted-foreground">{statusDetail}</p>

        {/* User's bets on this game */}
        {matchedLegs.length > 0 && (
          <div className="border-t border-border pt-2 space-y-1.5">
            {matchedLegs.map((leg) => {
              const outlook = evaluateBetOutlook(game, leg);
              return (
                <div
                  key={leg.legId}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate font-medium">
                      {leg.selection}
                    </span>
                    <span className="text-muted-foreground shrink-0">
                      {formatOdds(leg.odds)}
                    </span>
                  </div>
                  {status !== "scheduled" && (
                    <span
                      className={cn(
                        "font-display uppercase tracking-wider text-[10px] shrink-0",
                        outlookStyles[outlook]
                      )}
                    >
                      {outlookLabels[outlook]}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TeamRow({
  logo,
  name,
  score,
  showScore,
  isLeading,
}: {
  logo: string;
  name: string;
  score: number;
  showScore: boolean;
  isLeading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          alt=""
          width={20}
          height={20}
          className="shrink-0 rounded-sm"
        />
        <span
          className={cn(
            "text-sm truncate",
            isLeading && "font-semibold"
          )}
        >
          {name}
        </span>
      </div>
      {showScore && (
        <span
          className={cn(
            "score-value text-lg tabular-nums",
            isLeading && "text-foreground",
            !isLeading && "text-muted-foreground"
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}
