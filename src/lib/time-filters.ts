export type TimeRange = "all" | "7d" | "30d" | "90d" | "ytd" | "1y";

/**
 * Resolve a time range preset to a start date. Returns null for "all".
 */
export function resolveTimeRange(range: TimeRange): Date | null {
  const now = new Date();
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "ytd":
      return new Date(now.getFullYear(), 0, 1);
    case "1y":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "all":
    default:
      return null;
  }
}

/**
 * Filter bets by time range based on placedAt.
 */
export function filterBetsByTime<T extends { placedAt: Date }>(
  bets: T[],
  range: TimeRange
): T[] {
  const start = resolveTimeRange(range);
  if (!start) return bets;
  return bets.filter((b) => new Date(b.placedAt).getTime() >= start.getTime());
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export interface DayOfWeekStats {
  day: string;
  dayIndex: number;
  bets: number;
  wins: number;
  losses: number;
  pl: number;
}

/**
 * Group resolved bets by day of week and compute stats.
 */
export function computeDayOfWeekStats(
  bets: { placedAt: Date; status: string; stake: number; payout: number | null }[],
  calculatePL: (status: string, stake: number, payout: number | null) => number
): DayOfWeekStats[] {
  const stats: DayOfWeekStats[] = DAY_LABELS.map((day, i) => ({
    day,
    dayIndex: i,
    bets: 0,
    wins: 0,
    losses: 0,
    pl: 0,
  }));

  for (const bet of bets) {
    const dayIndex = new Date(bet.placedAt).getDay();
    stats[dayIndex].bets++;
    stats[dayIndex].pl += calculatePL(bet.status, bet.stake, bet.payout);
    if (bet.status === "won" || bet.status === "cashout") stats[dayIndex].wins++;
    else if (bet.status === "lost") stats[dayIndex].losses++;
  }

  // Reorder so Monday is first
  return [...stats.slice(1), stats[0]];
}
