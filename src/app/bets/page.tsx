import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BetCard } from "@/components/bets/bet-card";
import { BetFilters } from "@/components/bets/bet-filters";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import type { BetWithLegs } from "@/lib/types";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

interface BetsPageProps {
  searchParams: Promise<{
    status?: string;
    betType?: string;
    sport?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BetsPage({ searchParams }: BetsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const { status, betType, sport, sort, page } = params;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  // Build where clause
  const where: Prisma.BetWhereInput = {
    userId: session.user.id,
  };

  if (status && status !== "all") {
    where.status = status;
  }

  if (betType && betType !== "all") {
    where.betType = betType;
  }

  if (sport && sport !== "all") {
    where.legs = {
      some: {
        sport: sport,
      },
    };
  }

  // Build orderBy
  let orderBy: Prisma.BetOrderByWithRelationInput;
  switch (sort) {
    case "oldest":
      orderBy = { placedAt: "asc" };
      break;
    case "highest_stake":
      orderBy = { stake: "desc" };
      break;
    case "lowest_stake":
      orderBy = { stake: "asc" };
      break;
    case "newest":
    default:
      orderBy = { placedAt: "desc" };
      break;
  }

  // Query bets and count in parallel
  const [bets, totalCount] = await Promise.all([
    prisma.bet.findMany({
      where,
      include: { legs: true },
      orderBy,
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
    }),
    prisma.bet.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Build pagination URLs
  function buildPageUrl(pageNum: number): string {
    const p = new URLSearchParams();
    if (status && status !== "all") p.set("status", status);
    if (betType && betType !== "all") p.set("betType", betType);
    if (sport && sport !== "all") p.set("sport", sport);
    if (sort && sort !== "newest") p.set("sort", sort);
    if (pageNum > 1) p.set("page", String(pageNum));
    const query = p.toString();
    return query ? `/bets?${query}` : "/bets";
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div>
        <h1 className="font-display text-4xl uppercase tracking-wide">Bet History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {totalCount} {totalCount === 1 ? "bet" : "bets"} total
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <BetFilters />
      </Suspense>

      {bets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-muted-foreground mb-4">
            No bets found. Place your first bet!
          </p>
          <Button asChild>
            <Link href="/bets/new">New Bet</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(bets as BetWithLegs[]).map((bet) => (
              <BetCard key={bet.id} bet={bet} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {currentPage > 1 ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPageUrl(currentPage - 1)}>Previous</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
              )}

              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>

              {currentPage < totalPages ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href={buildPageUrl(currentPage + 1)}>Next</Link>
                </Button>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
