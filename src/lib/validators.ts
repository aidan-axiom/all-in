import { z } from "zod";
import { BET_TYPES, BET_STATUSES, LEG_STATUSES } from "./types";

// American odds must be <= -100 or >= 100 (no values between -99 and +99)
const americanOdds = z.number().int().refine(
  (n) => n <= -100 || n >= 100,
  { message: "American odds must be +100 or higher, or -100 or lower" }
);

export const legSchema = z.object({
  sport: z.string().min(1, "Sport is required"),
  league: z.string().optional().nullable(),
  eventName: z.string().min(1, "Event is required"),
  eventDate: z.coerce.date().optional().nullable(),
  marketType: z.string().min(1, "Market type is required"),
  selection: z.string().min(1, "Selection is required"),
  odds: americanOdds,
  line: z.number().optional().nullable(),
  status: z.enum(LEG_STATUSES).default("pending"),
});

export const createBetSchema = z.object({
  betType: z.enum(BET_TYPES),
  stake: z.number().positive("Stake must be positive"),
  odds: americanOdds.optional().nullable(),
  teaserPoints: z.number().positive().optional().nullable(),
  sportsbook: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  imageUrl: z.string().nullable().optional(),
  placedAt: z.coerce.date().default(() => new Date()),
  legs: z.array(legSchema).min(1, "At least one leg is required"),
}).refine(
  (data) => {
    if (data.betType === "straight" && data.legs.length !== 1) {
      return false;
    }
    return true;
  },
  { message: "Straight bets must have exactly one leg", path: ["legs"] }
).refine(
  (data) => {
    if (["parlay", "teaser", "round_robin"].includes(data.betType) && data.legs.length < 2) {
      return false;
    }
    return true;
  },
  { message: "This bet type requires at least two legs", path: ["legs"] }
);

export const resolveBetSchema = z.object({
  status: z.enum(["won", "lost", "push", "cashout"]),
  payout: z.number().min(0).optional().nullable(),
  legResults: z.array(z.object({
    legId: z.string(),
    status: z.enum(LEG_STATUSES),
  })).optional(),
});

export type CreateBetInput = z.infer<typeof createBetSchema>;
export type LegInput = z.infer<typeof legSchema>;
export type ResolveBetInput = z.infer<typeof resolveBetSchema>;
