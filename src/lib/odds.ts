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

/**
 * Calculate Expected Value (EV) for a bet.
 * @param stake - Amount wagered
 * @param odds - American odds received
 * @param fairOdds - Fair/true American odds (no-vig line)
 * @returns EV in dollars
 */
export function calculateEV(stake: number, odds: number, fairOdds: number): number {
  const trueProbability = americanToImpliedProbability(fairOdds);
  const profit = calculateProfit(stake, odds);
  return (trueProbability * profit) - ((1 - trueProbability) * stake);
}

/**
 * Remove the vig from a two-sided market to get fair probabilities.
 * @returns [fairProb1, fairProb2] as decimals summing to 1
 */
export function removeVig(odds1: number, odds2: number): [number, number] {
  const implied1 = americanToImpliedProbability(odds1);
  const implied2 = americanToImpliedProbability(odds2);
  const total = implied1 + implied2;
  return [implied1 / total, implied2 / total];
}

/**
 * Convert a probability (0-1) to American odds.
 */
export function probabilityToAmerican(prob: number): number {
  if (prob <= 0 || prob >= 1) return 0;
  if (prob >= 0.5) {
    return Math.round(-100 * prob / (1 - prob));
  }
  return Math.round(100 * (1 - prob) / prob);
}

/**
 * Calculate Closing Line Value.
 * Positive = beat the closing line (got better odds than close).
 * Returns difference in implied probabilities as a percentage.
 */
export function calculateCLV(placedOdds: number, closingOdds: number): number {
  const impliedAtClose = americanToImpliedProbability(closingOdds);
  const impliedAtPlaced = americanToImpliedProbability(placedOdds);
  return (impliedAtClose - impliedAtPlaced) * 100;
}

/**
 * Format a dollar amount as units.
 */
export function formatUnits(amount: number, unitSize: number): string {
  if (unitSize <= 0) return "0.0u";
  const units = amount / unitSize;
  return `${units >= 0 ? "+" : ""}${units.toFixed(1)}u`;
}
