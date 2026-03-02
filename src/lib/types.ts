// Bet types
export const BET_TYPES = ["straight", "parlay", "teaser", "future", "round_robin"] as const;
export type BetType = (typeof BET_TYPES)[number];

export const BET_TYPE_LABELS: Record<BetType, string> = {
  straight: "Straight",
  parlay: "Parlay",
  teaser: "Teaser",
  future: "Future",
  round_robin: "Round Robin",
};

// Bet statuses
export const BET_STATUSES = ["pending", "won", "lost", "push", "cashout"] as const;
export type BetStatus = (typeof BET_STATUSES)[number];

export const BET_STATUS_LABELS: Record<BetStatus, string> = {
  pending: "Pending",
  won: "Won",
  lost: "Lost",
  push: "Push",
  cashout: "Cashed Out",
};

// Leg statuses
export const LEG_STATUSES = ["pending", "won", "lost", "push"] as const;
export type LegStatus = (typeof LEG_STATUSES)[number];

// Market types — suggestions, not constraints
export const MARKET_TYPES = ["moneyline", "spread", "over_under", "prop", "future"] as const;
export type MarketType = (typeof MARKET_TYPES)[number];

export const MARKET_TYPE_LABELS: Record<MarketType, string> = {
  moneyline: "Moneyline",
  spread: "Spread",
  over_under: "Over/Under",
  prop: "Prop",
  future: "Future",
};

// Common sports — suggestions for autocomplete
export const COMMON_SPORTS = [
  "NFL", "NBA", "MLB", "NHL", "NCAAF", "NCAAB", "Soccer", "UFC", "Tennis", "Golf",
] as const;

// Common sportsbooks — suggestions for autocomplete
export const COMMON_SPORTSBOOKS = [
  "DraftKings", "FanDuel", "BetMGM", "Caesars", "PointsBet", "Hard Rock", "BetRivers",
] as const;

// Types matching Prisma models with stricter typing
export interface BetWithLegs {
  id: string;
  userId: string;
  betType: string;
  status: string;
  stake: number;
  odds: number | null;
  payout: number | null;
  teaserPoints: number | null;
  sportsbook: string | null;
  notes: string | null;
  imageUrl: string | null;
  placedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  legs: LegData[];
}

export interface LegData {
  id: string;
  betId: string;
  sport: string;
  league: string | null;
  eventName: string;
  eventDate: Date | null;
  marketType: string;
  selection: string;
  odds: number;
  line: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
