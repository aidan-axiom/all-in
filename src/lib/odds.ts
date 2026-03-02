/**
 * Convert American odds to decimal odds.
 */
export function americanToDecimal(odds: number): number {
  if (odds > 0) {
    return odds / 100 + 1;
  }
  return 100 / Math.abs(odds) + 1;
}

/**
 * Convert American odds to implied probability (0-1).
 */
export function americanToImpliedProbability(odds: number): number {
  if (odds > 0) {
    return 100 / (odds + 100);
  }
  return Math.abs(odds) / (Math.abs(odds) + 100);
}

/**
 * Calculate potential payout (including stake) from American odds and stake.
 */
export function calculatePayout(stake: number, odds: number): number {
  return stake * americanToDecimal(odds);
}

/**
 * Calculate profit (payout minus stake).
 */
export function calculateProfit(stake: number, odds: number): number {
  return calculatePayout(stake, odds) - stake;
}

/**
 * Calculate combined parlay odds from an array of American odds per leg.
 */
export function calculateParlayOdds(legOdds: number[]): number {
  if (legOdds.length === 0) return 0;
  const combinedDecimal = legOdds.reduce((acc, odds) => acc * americanToDecimal(odds), 1);
  return decimalToAmerican(combinedDecimal);
}

/**
 * Convert decimal odds back to American odds.
 */
export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) {
    return Math.round((decimal - 1) * 100);
  }
  return Math.round(-100 / (decimal - 1));
}

/**
 * Format American odds: "+150" or "-110".
 */
export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

/**
 * Format a dollar amount: "$25.00", "-$10.50".
 */
export function formatCurrency(amount: number): string {
  const formatted = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-$${formatted}` : `$${formatted}`;
}

/**
 * Calculate P&L for a resolved bet.
 */
export function calculateBetPL(status: string, stake: number, payout: number | null): number {
  switch (status) {
    case "won":
    case "cashout":
      return (payout ?? 0) - stake;
    case "lost":
      return -stake;
    case "push":
      return 0;
    default:
      return 0;
  }
}
