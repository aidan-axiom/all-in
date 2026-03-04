// ESPN API response types (only fields we use)

export interface ESPNScoreboardResponse {
  events: ESPNEvent[];
}

export interface ESPNEvent {
  id: string;
  name: string; // "Dallas Mavericks at Charlotte Hornets"
  shortName: string; // "DAL @ CHA"
  date: string; // ISO 8601
  competitions: ESPNCompetition[];
}

export interface ESPNCompetition {
  competitors: ESPNCompetitor[];
  status: ESPNStatus;
}

export interface ESPNCompetitor {
  homeAway: "home" | "away";
  score: string;
  team: ESPNTeam;
}

export interface ESPNTeam {
  displayName: string; // "Charlotte Hornets"
  shortDisplayName: string; // "Hornets"
  abbreviation: string; // "CHA"
  name: string; // "Hornets"
  location: string; // "Charlotte"
  logo: string;
  color?: string;
}

export interface ESPNStatus {
  clock: number;
  displayClock: string; // "3:42"
  period: number;
  type: {
    name: string; // "STATUS_SCHEDULED" | "STATUS_IN_PROGRESS" | "STATUS_FINAL"
    state: string; // "pre" | "in" | "post"
    completed: boolean;
    description: string; // "Scheduled", "In Progress", "Final"
    detail: string; // "Tue, March 3rd at 7:00 PM EST"
    shortDetail: string; // "3/3 - 7:00 PM EST"
  };
}

// Our normalized types

export type GameStatus = "scheduled" | "live" | "final";
export type BetOutlook = "winning" | "losing" | "push" | "unknown";

export interface TeamScore {
  name: string;
  shortName: string;
  abbreviation: string;
  logo: string;
  score: number;
  color?: string;
}

export interface MatchedLeg {
  legId: string;
  betId: string;
  selection: string;
  marketType: string;
  odds: number;
  line: number | null;
  stake: number;
  betType: string;
}

export interface LiveGame {
  espnId: string;
  sport: string;
  eventName: string;
  date: string;
  status: GameStatus;
  statusDetail: string;
  period: number;
  clock: string;
  homeTeam: TeamScore;
  awayTeam: TeamScore;
  matchedLegs: MatchedLeg[];
}

export interface LiveScoresResponse {
  games: LiveGame[];
  lastUpdated: string;
  sportsQueried: string[];
}

// ESPN endpoint mapping

export const ESPN_ENDPOINTS: Record<string, string> = {
  NBA: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  NFL: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  MLB: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  NHL: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
  NCAAB: "https://site.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard",
  NCAAF: "https://site.api.espn.com/apis/site/v2/sports/football/college-football/scoreboard",
};

// Sport-specific period labels

export function getPeriodLabel(sport: string, period: number): string {
  switch (sport) {
    case "NBA":
    case "NCAAB":
      return period <= 4 ? `Q${period}` : `OT${period - 4}`;
    case "NFL":
    case "NCAAF":
      return period <= 4 ? `Q${period}` : "OT";
    case "NHL":
      return period <= 3 ? `P${period}` : period === 4 ? "OT" : "SO";
    case "MLB":
      return `${period}`;
    default:
      return `${period}`;
  }
}

// Match an ESPN event to a user's bet leg

export function matchEventToLeg(
  event: ESPNEvent,
  leg: { eventName: string; eventDate: Date | null; sport: string }
): boolean {
  const normalizedEventName = leg.eventName.toLowerCase();
  const comp = event.competitions[0];
  if (!comp) return false;

  let matchCount = 0;
  for (const competitor of comp.competitors) {
    const t = competitor.team;
    const teamTokens = [
      t.displayName,
      t.shortDisplayName,
      t.name,
      t.location,
      t.abbreviation,
    ].map((s) => s.toLowerCase());

    const hasMatch = teamTokens.some(
      (token) => token.length >= 3 && normalizedEventName.includes(token)
    );
    if (hasMatch) matchCount++;
  }

  const bothTeamsMatch = matchCount >= 2;
  const singleTeamMatch = matchCount >= 1 && normalizedEventName.length < 15;

  if (!bothTeamsMatch && !singleTeamMatch) return false;

  // Date proximity check
  if (leg.eventDate) {
    const legDate = new Date(leg.eventDate);
    const espnDate = new Date(event.date);
    const diffMs = Math.abs(legDate.getTime() - espnDate.getTime());
    if (diffMs > 36 * 60 * 60 * 1000) return false; // 36 hours
  }

  return true;
}

// Evaluate whether the user's bet is currently winning/losing

export function evaluateBetOutlook(
  game: LiveGame,
  leg: MatchedLeg
): BetOutlook {
  if (game.status === "scheduled") return "unknown";

  const selection = leg.selection.toLowerCase();
  const homeScore = game.homeTeam.score;
  const awayScore = game.awayTeam.score;

  const homeTokens = [
    game.homeTeam.name.toLowerCase(),
    game.homeTeam.shortName.toLowerCase(),
    game.homeTeam.abbreviation.toLowerCase(),
  ];
  const awayTokens = [
    game.awayTeam.name.toLowerCase(),
    game.awayTeam.shortName.toLowerCase(),
    game.awayTeam.abbreviation.toLowerCase(),
  ];

  const pickedHome = homeTokens.some((t) => selection.includes(t));
  const pickedAway = awayTokens.some((t) => selection.includes(t));

  if (leg.marketType === "moneyline") {
    if (pickedHome)
      return homeScore > awayScore
        ? "winning"
        : homeScore < awayScore
          ? "losing"
          : "push";
    if (pickedAway)
      return awayScore > homeScore
        ? "winning"
        : awayScore < homeScore
          ? "losing"
          : "push";
    return "unknown";
  }

  if (leg.marketType === "spread" && leg.line !== null) {
    if (pickedHome) {
      const adjusted = homeScore + leg.line;
      return adjusted > awayScore
        ? "winning"
        : adjusted < awayScore
          ? "losing"
          : "push";
    }
    if (pickedAway) {
      const adjusted = awayScore + leg.line;
      return adjusted > homeScore
        ? "winning"
        : adjusted < homeScore
          ? "losing"
          : "push";
    }
    return "unknown";
  }

  if (leg.marketType === "over_under" && leg.line !== null) {
    const total = homeScore + awayScore;
    const isOver = selection.includes("over");
    const isUnder = selection.includes("under");
    if (isOver)
      return total > leg.line
        ? "winning"
        : total < leg.line
          ? "losing"
          : "push";
    if (isUnder)
      return total < leg.line
        ? "winning"
        : total > leg.line
          ? "losing"
          : "push";
    return "unknown";
  }

  // Props, futures — can't determine from scoreboard
  return "unknown";
}
