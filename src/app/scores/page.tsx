import { LiveScoresFeed } from "@/components/scores/live-scores-feed";

export default function ScoresPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">
          Live Scores
        </h1>
        <p className="text-muted-foreground">
          Real-time scores for your active bets.
        </p>
      </div>
      <LiveScoresFeed />
    </div>
  );
}
