export interface StreakResult {
  currentStreak: { type: "win" | "loss" | "none"; count: number };
  longestWinStreak: number;
  longestLossStreak: number;
}

export interface StreakBySport extends StreakResult {
  sport: string;
}

/**
 * Compute streak data from resolved bets sorted by resolvedAt ascending.
 * Pushes and cashouts are ignored for streak calculation.
 */
export function computeStreaks(
  bets: { status: string; resolvedAt: Date | null }[]
): StreakResult {
  let currentType: "win" | "loss" | "none" = "none";
  let currentCount = 0;
  let longestWin = 0;
  let longestLoss = 0;
  let runType: "win" | "loss" | "none" = "none";
  let runCount = 0;

  for (const bet of bets) {
    if (bet.status === "won") {
      if (runType === "win") {
        runCount++;
      } else {
        runType = "win";
        runCount = 1;
      }
      longestWin = Math.max(longestWin, runCount);
    } else if (bet.status === "lost") {
      if (runType === "loss") {
        runCount++;
      } else {
        runType = "loss";
        runCount = 1;
      }
      longestLoss = Math.max(longestLoss, runCount);
    }
    // pushes and cashouts don't break or extend streaks
  }

  currentType = runType;
  currentCount = runCount;

  return {
    currentStreak: { type: currentType, count: currentCount },
    longestWinStreak: longestWin,
    longestLossStreak: longestLoss,
  };
}

/**
 * Compute streaks grouped by primary sport (first leg's sport).
 */
export function computeStreaksBySport(
  bets: { status: string; resolvedAt: Date | null; legs: { sport: string }[] }[]
): StreakBySport[] {
  const grouped = new Map<string, { status: string; resolvedAt: Date | null }[]>();

  for (const bet of bets) {
    const sport = bet.legs[0]?.sport ?? "Unknown";
    const existing = grouped.get(sport) ?? [];
    existing.push(bet);
    grouped.set(sport, existing);
  }

  const results: StreakBySport[] = [];
  for (const [sport, sportBets] of grouped) {
    const streaks = computeStreaks(sportBets);
    results.push({ sport, ...streaks });
  }

  return results.sort((a, b) => a.sport.localeCompare(b.sport));
}
