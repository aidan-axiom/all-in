"use client";

import { useScores } from "@/hooks/use-scores";
import { ScoreCard } from "./score-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveScoresFeedProps {
  limit?: number;
  compact?: boolean;
  showHeader?: boolean;
}

export function LiveScoresFeed({
  limit,
  compact,
  showHeader = true,
}: LiveScoresFeedProps) {
  const { data, isLoading, error, refetch } = useScores({ limit });

  if (isLoading) {
    return (
      <div className={cn("grid gap-4", compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
        {Array.from({ length: limit ?? 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load scores.
          </p>
          <Button
            variant="link"
            size="sm"
            className="mt-2"
            onClick={() => refetch()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.games.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No active games to track. Place a bet to start following scores.
          </p>
        </CardContent>
      </Card>
    );
  }

  const lastUpdated = new Date(data.lastUpdated);
  const timeAgo = Math.round((Date.now() - lastUpdated.getTime()) / 1000);

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Updated {timeAgo < 10 ? "just now" : `${timeAgo}s ago`}
          </p>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => refetch()}
            className="gap-1.5 text-xs text-muted-foreground"
          >
            <RefreshCw size={12} />
            Refresh
          </Button>
        </div>
      )}
      <div className={cn("grid gap-4", compact ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
        {data.games.map((game) => (
          <ScoreCard key={game.espnId} game={game} compact={compact} />
        ))}
      </div>
    </div>
  );
}
