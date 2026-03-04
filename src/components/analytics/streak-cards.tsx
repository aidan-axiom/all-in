"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StreakResult, StreakBySport } from "@/lib/streaks";

interface StreakCardsProps {
  streaks: StreakResult;
  streaksBySport: StreakBySport[];
}

function formatStreak(type: "win" | "loss" | "none", count: number): string {
  if (type === "none" || count === 0) return "--";
  return `${type === "win" ? "W" : "L"}${count}`;
}

export function StreakCards({ streaks, streaksBySport }: StreakCardsProps) {
  const [showBySport, setShowBySport] = useState(false);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`stat-value text-3xl ${
                streaks.currentStreak.type === "win"
                  ? "text-primary"
                  : streaks.currentStreak.type === "loss"
                    ? "text-destructive"
                    : ""
              }`}
            >
              {formatStreak(streaks.currentStreak.type, streaks.currentStreak.count)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Best Win Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="stat-value text-3xl text-primary">
              {streaks.longestWinStreak > 0 ? `W${streaks.longestWinStreak}` : "--"}
            </p>
          </CardContent>
        </Card>

        <Card className="card-scoreboard">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Worst Loss Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="stat-value text-3xl text-destructive">
              {streaks.longestLossStreak > 0 ? `L${streaks.longestLossStreak}` : "--"}
            </p>
          </CardContent>
        </Card>
      </div>

      {streaksBySport.length > 0 && (
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBySport(!showBySport)}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            {showBySport ? "Hide" : "Show"} Streaks by Sport
          </Button>
          {showBySport && (
            <Card className="mt-2">
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sport</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Best Win</TableHead>
                      <TableHead>Worst Loss</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {streaksBySport.map((s) => (
                      <TableRow key={s.sport}>
                        <TableCell className="font-medium">{s.sport}</TableCell>
                        <TableCell
                          className={
                            s.currentStreak.type === "win"
                              ? "text-primary"
                              : s.currentStreak.type === "loss"
                                ? "text-destructive"
                                : ""
                          }
                        >
                          {formatStreak(s.currentStreak.type, s.currentStreak.count)}
                        </TableCell>
                        <TableCell className="text-primary">
                          {s.longestWinStreak > 0 ? `W${s.longestWinStreak}` : "--"}
                        </TableCell>
                        <TableCell className="text-destructive">
                          {s.longestLossStreak > 0 ? `L${s.longestLossStreak}` : "--"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
