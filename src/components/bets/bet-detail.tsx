import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BetStatusBadge } from "@/components/bets/bet-status-badge";
import { ResolveDialog } from "@/components/bets/resolve-dialog";
import { DeleteDialog } from "@/components/bets/delete-dialog";
import {
  BET_TYPE_LABELS,
  MARKET_TYPE_LABELS,
  type BetWithLegs,
  type BetType,
  type MarketType,
} from "@/lib/types";
import {
  formatOdds,
  formatCurrency,
  calculatePayout,
  calculateBetPL,
} from "@/lib/odds";

interface BetDetailProps {
  bet: BetWithLegs;
}

export function BetDetail({ bet }: BetDetailProps) {
  const betTypeLabel =
    BET_TYPE_LABELS[bet.betType as BetType] ?? bet.betType;
  const isResolved = bet.status !== "pending";

  // Calculate potential payout from odds if available
  const potentialPayout =
    bet.odds != null ? calculatePayout(bet.stake, bet.odds) : null;

  // Calculate P&L for resolved bets
  const pl = isResolved ? calculateBetPL(bet.status, bet.stake, bet.payout) : null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="font-display text-xl uppercase tracking-wide">{betTypeLabel}</CardTitle>
              <BetStatusBadge status={bet.status} />
            </div>
            <div className="flex items-center gap-2">
              {!isResolved && (
                <ResolveDialog
                  betId={bet.id}
                  currentStatus={bet.status}
                  betOdds={bet.odds}
                  legs={bet.legs}
                />
              )}
              <Button variant="outline" size="sm" asChild>
                <Link href={`/bets/${bet.id}/edit`}>Edit</Link>
              </Button>
              <DeleteDialog betId={bet.id} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 md:grid-cols-4">
            {/* Sportsbook */}
            {bet.sportsbook && (
              <div>
                <p className="text-muted-foreground text-sm">Sportsbook</p>
                <p className="font-medium">{bet.sportsbook}</p>
              </div>
            )}

            {/* Stake */}
            <div>
              <p className="text-muted-foreground text-sm">Stake</p>
              <p className="font-medium">{formatCurrency(bet.stake)}</p>
            </div>

            {/* Odds */}
            {bet.odds != null && (
              <div>
                <p className="text-muted-foreground text-sm">Odds</p>
                <p className="font-medium">{formatOdds(bet.odds)}</p>
              </div>
            )}

            {/* Potential Payout */}
            {potentialPayout != null && (
              <div>
                <p className="text-muted-foreground text-sm">
                  Potential Payout
                </p>
                <p className="font-medium">
                  {formatCurrency(potentialPayout)}
                </p>
              </div>
            )}

            {/* Actual Payout (if resolved with payout) */}
            {bet.payout != null && (
              <div>
                <p className="text-muted-foreground text-sm">Actual Payout</p>
                <p className="font-medium">{formatCurrency(bet.payout)}</p>
              </div>
            )}

            {/* P&L */}
            {pl != null && (
              <div>
                <p className="text-muted-foreground text-sm">P&L</p>
                <p
                  className={
                    pl > 0
                      ? "font-medium text-primary"
                      : pl < 0
                        ? "font-medium text-destructive"
                        : "font-medium"
                  }
                >
                  {formatCurrency(pl)}
                </p>
              </div>
            )}

            {/* Placed date */}
            <div>
              <p className="text-muted-foreground text-sm">Placed</p>
              <p className="font-medium">
                {new Date(bet.placedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Resolved date */}
            {bet.resolvedAt && (
              <div>
                <p className="text-muted-foreground text-sm">Resolved</p>
                <p className="font-medium">
                  {new Date(bet.resolvedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {/* Teaser points */}
            {bet.teaserPoints != null && (
              <div>
                <p className="text-muted-foreground text-sm">Teaser Points</p>
                <p className="font-medium">{bet.teaserPoints}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {bet.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-muted-foreground mb-1 text-sm">Notes</p>
                <p className="text-sm whitespace-pre-wrap">{bet.notes}</p>
              </div>
            </>
          )}

          {/* Ticket image */}
          {bet.imageUrl && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-muted-foreground mb-2 text-sm">
                  Ticket Image
                </p>
                <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
                  <Image
                    src={bet.imageUrl}
                    alt="Bet ticket"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 448px"
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Legs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide">
            Legs ({bet.legs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Sport</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Selection</TableHead>
                <TableHead>Odds</TableHead>
                <TableHead>Line</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bet.legs.map((leg, index) => {
                const marketLabel =
                  MARKET_TYPE_LABELS[leg.marketType as MarketType] ??
                  leg.marketType;

                return (
                  <TableRow key={leg.id}>
                    <TableCell className="text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>{leg.sport}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {leg.eventName}
                    </TableCell>
                    <TableCell>{marketLabel}</TableCell>
                    <TableCell className="font-medium">
                      {leg.selection}
                    </TableCell>
                    <TableCell>{formatOdds(leg.odds)}</TableCell>
                    <TableCell>
                      {leg.line != null ? leg.line : "\u2014"}
                    </TableCell>
                    <TableCell>
                      <BetStatusBadge status={leg.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
