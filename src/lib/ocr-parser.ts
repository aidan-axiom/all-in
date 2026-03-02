export interface ExtractedBetData {
  stake?: number;
  odds?: number;
  payout?: number;
  sportsbook?: string;
  betType?: string;
  legs?: Array<{
    sport?: string;
    eventName?: string;
    selection?: string;
    odds?: number;
    line?: number;
    marketType?: string;
  }>;
}
