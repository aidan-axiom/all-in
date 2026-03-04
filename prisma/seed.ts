import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create user "baedan"
  const hashedPassword = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { username: "baedan" },
    update: {},
    create: {
      username: "baedan",
      displayName: "Baedan",
      hashedPassword,
    },
  });

  console.log(`Created user: ${user.username} (${user.id})`);

  // Delete existing bets for clean seed
  await prisma.leg.deleteMany({ where: { bet: { userId: user.id } } });
  await prisma.bet.deleteMany({ where: { userId: user.id } });

  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  const bets = [
    // === WON BETS ===
    {
      betType: "straight",
      status: "won",
      stake: 50,
      odds: -110,
      payout: 95.45,
      sportsbook: "DraftKings",
      placedAt: daysAgo(28),
      resolvedAt: daysAgo(27),
      legs: [{ sport: "NFL", eventName: "Chiefs vs Ravens", marketType: "spread", selection: "Chiefs -3.5", odds: -110, line: -3.5, status: "won" }],
    },
    {
      betType: "straight",
      status: "won",
      stake: 25,
      odds: 150,
      payout: 62.5,
      sportsbook: "FanDuel",
      placedAt: daysAgo(25),
      resolvedAt: daysAgo(24),
      legs: [{ sport: "NBA", eventName: "Lakers vs Celtics", marketType: "moneyline", selection: "Lakers ML", odds: 150, status: "won" }],
    },
    {
      betType: "straight",
      status: "won",
      stake: 100,
      odds: -120,
      payout: 183.33,
      sportsbook: "BetMGM",
      placedAt: daysAgo(20),
      resolvedAt: daysAgo(19),
      legs: [{ sport: "NFL", eventName: "Eagles vs Cowboys", marketType: "over_under", selection: "Over 45.5", odds: -120, line: 45.5, status: "won" }],
    },
    {
      betType: "parlay",
      status: "won",
      stake: 20,
      odds: 600,
      payout: 140,
      sportsbook: "DraftKings",
      placedAt: daysAgo(15),
      resolvedAt: daysAgo(14),
      legs: [
        { sport: "NBA", eventName: "Bucks vs Heat", marketType: "moneyline", selection: "Bucks ML", odds: -150, status: "won" },
        { sport: "NBA", eventName: "Warriors vs Suns", marketType: "spread", selection: "Warriors -4.5", odds: -110, line: -4.5, status: "won" },
        { sport: "NBA", eventName: "Nuggets vs Timberwolves", marketType: "moneyline", selection: "Nuggets ML", odds: -130, status: "won" },
      ],
    },
    {
      betType: "straight",
      status: "won",
      stake: 75,
      odds: -105,
      payout: 146.43,
      sportsbook: "Caesars",
      placedAt: daysAgo(7),
      resolvedAt: daysAgo(6),
      legs: [{ sport: "NHL", eventName: "Rangers vs Bruins", marketType: "moneyline", selection: "Rangers ML", odds: -105, status: "won" }],
    },
    {
      betType: "straight",
      status: "won",
      stake: 40,
      odds: 130,
      payout: 92,
      sportsbook: "FanDuel",
      placedAt: daysAgo(3),
      resolvedAt: daysAgo(2),
      legs: [{ sport: "MLB", eventName: "Yankees vs Red Sox", marketType: "moneyline", selection: "Yankees ML", odds: 130, status: "won" }],
    },

    // === LOST BETS ===
    {
      betType: "straight",
      status: "lost",
      stake: 50,
      odds: -110,
      payout: null,
      sportsbook: "DraftKings",
      placedAt: daysAgo(26),
      resolvedAt: daysAgo(25),
      legs: [{ sport: "NFL", eventName: "49ers vs Seahawks", marketType: "spread", selection: "49ers -7", odds: -110, line: -7, status: "lost" }],
    },
    {
      betType: "straight",
      status: "lost",
      stake: 30,
      odds: -115,
      payout: null,
      sportsbook: "BetMGM",
      placedAt: daysAgo(22),
      resolvedAt: daysAgo(21),
      legs: [{ sport: "NBA", eventName: "Nets vs Knicks", marketType: "over_under", selection: "Under 210.5", odds: -115, line: 210.5, status: "lost" }],
    },
    {
      betType: "parlay",
      status: "lost",
      stake: 25,
      odds: 450,
      payout: null,
      sportsbook: "FanDuel",
      placedAt: daysAgo(18),
      resolvedAt: daysAgo(17),
      legs: [
        { sport: "NFL", eventName: "Bills vs Dolphins", marketType: "moneyline", selection: "Bills ML", odds: -200, status: "won" },
        { sport: "NFL", eventName: "Packers vs Bears", marketType: "spread", selection: "Packers -6.5", odds: -110, line: -6.5, status: "lost" },
      ],
    },
    {
      betType: "straight",
      status: "lost",
      stake: 60,
      odds: 110,
      payout: null,
      sportsbook: "Hard Rock",
      placedAt: daysAgo(12),
      resolvedAt: daysAgo(11),
      legs: [{ sport: "UFC", eventName: "UFC 310: Jones vs Aspinall", marketType: "moneyline", selection: "Aspinall ML", odds: 110, status: "lost" }],
    },
    {
      betType: "straight",
      status: "lost",
      stake: 40,
      odds: -110,
      payout: null,
      sportsbook: "DraftKings",
      placedAt: daysAgo(5),
      resolvedAt: daysAgo(4),
      legs: [{ sport: "NCAAB", eventName: "Duke vs UNC", marketType: "spread", selection: "Duke -2.5", odds: -110, line: -2.5, status: "lost" }],
    },

    // === PUSH ===
    {
      betType: "straight",
      status: "push",
      stake: 50,
      odds: -110,
      payout: 50,
      sportsbook: "Caesars",
      placedAt: daysAgo(10),
      resolvedAt: daysAgo(9),
      legs: [{ sport: "NFL", eventName: "Lions vs Vikings", marketType: "spread", selection: "Lions -3", odds: -110, line: -3, status: "push" }],
    },

    // === CASHOUT ===
    {
      betType: "parlay",
      status: "cashout",
      stake: 15,
      odds: 1200,
      payout: 85,
      sportsbook: "DraftKings",
      notes: "Cashed out early, 3 of 4 legs hit",
      placedAt: daysAgo(8),
      resolvedAt: daysAgo(7),
      legs: [
        { sport: "NBA", eventName: "76ers vs Celtics", marketType: "moneyline", selection: "Celtics ML", odds: -180, status: "won" },
        { sport: "NBA", eventName: "Cavs vs Magic", marketType: "spread", selection: "Cavs -5.5", odds: -110, line: -5.5, status: "won" },
        { sport: "NBA", eventName: "Thunder vs Mavs", marketType: "moneyline", selection: "Thunder ML", odds: -140, status: "won" },
        { sport: "NBA", eventName: "Clippers vs Kings", marketType: "moneyline", selection: "Clippers ML", odds: 105, status: "pending" },
      ],
    },

    // === PENDING BETS ===
    {
      betType: "straight",
      status: "pending",
      stake: 50,
      odds: -110,
      sportsbook: "FanDuel",
      placedAt: daysAgo(1),
      legs: [{ sport: "NFL", eventName: "Steelers vs Browns", marketType: "spread", selection: "Steelers -2.5", odds: -110, line: -2.5, status: "pending" }],
    },
    {
      betType: "parlay",
      status: "pending",
      stake: 10,
      odds: 950,
      sportsbook: "DraftKings",
      notes: "Long shot parlay, feeling lucky",
      placedAt: daysAgo(0),
      legs: [
        { sport: "NBA", eventName: "Rockets vs Spurs", marketType: "moneyline", selection: "Spurs ML", odds: 180, status: "pending" },
        { sport: "NBA", eventName: "Pelicans vs Hawks", marketType: "over_under", selection: "Over 228.5", odds: -105, line: 228.5, status: "pending" },
        { sport: "NHL", eventName: "Penguins vs Capitals", marketType: "moneyline", selection: "Penguins ML", odds: 140, status: "pending" },
      ],
    },
    {
      betType: "straight",
      status: "pending",
      stake: 100,
      odds: -130,
      sportsbook: "BetMGM",
      placedAt: daysAgo(0),
      legs: [{ sport: "MLB", eventName: "Dodgers vs Padres", marketType: "moneyline", selection: "Dodgers ML", odds: -130, status: "pending" }],
    },
    {
      betType: "teaser",
      status: "pending",
      stake: 50,
      odds: -120,
      teaserPoints: 6,
      sportsbook: "Caesars",
      placedAt: daysAgo(0),
      legs: [
        { sport: "NFL", eventName: "Jaguars vs Titans", marketType: "spread", selection: "Jaguars +9.5", odds: -110, line: 9.5, status: "pending" },
        { sport: "NFL", eventName: "Cardinals vs Rams", marketType: "spread", selection: "Rams -0.5", odds: -110, line: -0.5, status: "pending" },
      ],
    },
    {
      betType: "future",
      status: "pending",
      stake: 25,
      odds: 800,
      sportsbook: "DraftKings",
      notes: "Super Bowl futures bet",
      placedAt: daysAgo(30),
      legs: [{ sport: "NFL", eventName: "Super Bowl LX Champion", marketType: "future", selection: "Detroit Lions", odds: 800, status: "pending" }],
    },
  ];

  for (const bet of bets) {
    await prisma.bet.create({
      data: {
        userId: user.id,
        betType: bet.betType,
        status: bet.status,
        stake: bet.stake,
        odds: bet.odds ?? null,
        payout: bet.payout ?? null,
        teaserPoints: bet.teaserPoints ?? null,
        sportsbook: bet.sportsbook ?? null,
        notes: bet.notes ?? null,
        placedAt: bet.placedAt,
        resolvedAt: bet.resolvedAt ?? null,
        legs: {
          create: bet.legs.map((leg) => ({
            sport: leg.sport,
            eventName: leg.eventName,
            marketType: leg.marketType,
            selection: leg.selection,
            odds: leg.odds,
            line: "line" in leg ? (leg.line ?? null) : null,
            status: leg.status,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${bets.length} bets for user baedan`);
  console.log(`  - Won: ${bets.filter(b => b.status === "won").length}`);
  console.log(`  - Lost: ${bets.filter(b => b.status === "lost").length}`);
  console.log(`  - Push: ${bets.filter(b => b.status === "push").length}`);
  console.log(`  - Cashout: ${bets.filter(b => b.status === "cashout").length}`);
  console.log(`  - Pending: ${bets.filter(b => b.status === "pending").length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
