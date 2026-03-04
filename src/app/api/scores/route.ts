import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ESPN_ENDPOINTS,
  matchEventToLeg,
  getPeriodLabel,
  type ESPNScoreboardResponse,
  type LiveGame,
  type LiveScoresResponse,
  type MatchedLeg,
  type GameStatus,
} from "@/lib/scores";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all pending bets with their legs
    const pendingBets = await prisma.bet.findMany({
      where: { userId: session.user.id, status: "pending" },
      include: { legs: true },
    });

    // Collect pending legs with parent bet info
    const pendingLegs = pendingBets.flatMap((bet) =>
      bet.legs
        .filter((leg) => leg.status === "pending")
        .map((leg) => ({
          ...leg,
          betStake: bet.stake,
          betType: bet.betType,
        }))
    );

    if (pendingLegs.length === 0) {
      return NextResponse.json({
        games: [],
        lastUpdated: new Date().toISOString(),
        sportsQueried: [],
      } satisfies LiveScoresResponse);
    }

    // Determine unique sports to query
    const sportsToQuery = [
      ...new Set(
        pendingLegs
          .map((leg) => leg.sport.toUpperCase())
          .filter((s) => s in ESPN_ENDPOINTS)
      ),
    ];

    // Fetch all scoreboards in parallel
    const scoreboardResults = await Promise.all(
      sportsToQuery.map(async (sport) => {
        const url = ESPN_ENDPOINTS[sport];
        try {
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) return { sport, events: [] };
          const data: ESPNScoreboardResponse = await res.json();
          return { sport, events: data.events ?? [] };
        } catch {
          return { sport, events: [] };
        }
      })
    );

    // Match events to legs
    const games: LiveGame[] = [];

    for (const { sport, events } of scoreboardResults) {
      for (const event of events) {
        const matchedLegs: MatchedLeg[] = [];

        for (const leg of pendingLegs) {
          if (leg.sport.toUpperCase() !== sport) continue;
          if (matchEventToLeg(event, leg)) {
            matchedLegs.push({
              legId: leg.id,
              betId: leg.betId,
              selection: leg.selection,
              marketType: leg.marketType,
              odds: leg.odds,
              line: leg.line,
              stake: leg.betStake,
              betType: leg.betType,
            });
          }
        }

        if (matchedLegs.length === 0) continue;

        const comp = event.competitions[0];
        if (!comp) continue;

        const state = comp.status.type.state;
        let gameStatus: GameStatus;
        let statusDetail: string;

        if (state === "in") {
          gameStatus = "live";
          const periodLabel = getPeriodLabel(sport, comp.status.period);
          statusDetail = `${periodLabel} ${comp.status.displayClock}`;
        } else if (state === "post") {
          gameStatus = "final";
          statusDetail = comp.status.type.description;
        } else {
          gameStatus = "scheduled";
          statusDetail = comp.status.type.shortDetail;
        }

        const home = comp.competitors.find((c) => c.homeAway === "home");
        const away = comp.competitors.find((c) => c.homeAway === "away");
        if (!home || !away) continue;

        games.push({
          espnId: event.id,
          sport,
          eventName: event.name,
          date: event.date,
          status: gameStatus,
          statusDetail,
          period: comp.status.period,
          clock: comp.status.displayClock,
          homeTeam: {
            name: home.team.displayName,
            shortName: home.team.shortDisplayName,
            abbreviation: home.team.abbreviation,
            logo: home.team.logo,
            score: parseInt(home.score, 10) || 0,
            color: home.team.color,
          },
          awayTeam: {
            name: away.team.displayName,
            shortName: away.team.shortDisplayName,
            abbreviation: away.team.abbreviation,
            logo: away.team.logo,
            score: parseInt(away.score, 10) || 0,
            color: away.team.color,
          },
          matchedLegs,
        });
      }
    }

    // Sort: live first, then scheduled, then final
    const statusOrder: Record<string, number> = {
      live: 0,
      scheduled: 1,
      final: 2,
    };
    games.sort(
      (a, b) => (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1)
    );

    return NextResponse.json({
      games,
      lastUpdated: new Date().toISOString(),
      sportsQueried: sportsToQuery,
    } satisfies LiveScoresResponse);
  } catch (error) {
    console.error("Failed to fetch scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch scores" },
      { status: 500 }
    );
  }
}
