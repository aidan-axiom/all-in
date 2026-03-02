"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/odds";

interface BreakdownRow {
  category: string;
  bets: number;
  wins: number;
  losses: number;
  pushes: number;
  staked: number;
  pl: number;
}

interface BreakdownTableProps {
  bySport: BreakdownRow[];
  byBetType: BreakdownRow[];
  bySportsbook: BreakdownRow[];
}

function BreakdownRows({ rows }: { rows: BreakdownRow[] }) {
  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
          No data available.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {rows.map((row) => {
        const resolved = row.wins + row.losses + row.pushes;
        const winRate =
          resolved - row.pushes > 0
            ? ((row.wins / (resolved - row.pushes)) * 100).toFixed(1)
            : "0.0";
        const roi =
          row.staked > 0
            ? ((row.pl / row.staked) * 100).toFixed(1)
            : "0.0";

        return (
          <TableRow key={row.category}>
            <TableCell className="font-medium">{row.category}</TableCell>
            <TableCell>{row.bets}</TableCell>
            <TableCell>
              {row.wins}-{row.losses}-{row.pushes}
            </TableCell>
            <TableCell>{winRate}%</TableCell>
            <TableCell>{formatCurrency(row.staked)}</TableCell>
            <TableCell
              className={
                row.pl > 0
                  ? "text-primary"
                  : row.pl < 0
                    ? "text-destructive"
                    : ""
              }
            >
              {formatCurrency(row.pl)}
            </TableCell>
            <TableCell
              className={
                Number(roi) > 0
                  ? "text-primary"
                  : Number(roi) < 0
                    ? "text-destructive"
                    : ""
              }
            >
              {Number(roi) > 0 ? "+" : ""}
              {roi}%
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}

export function BreakdownTable({
  bySport,
  byBetType,
  bySportsbook,
}: BreakdownTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display uppercase tracking-wide">Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sport">
          <TabsList>
            <TabsTrigger value="sport" className="font-display uppercase tracking-wide text-xs">By Sport</TabsTrigger>
            <TabsTrigger value="betType" className="font-display uppercase tracking-wide text-xs">By Bet Type</TabsTrigger>
            <TabsTrigger value="sportsbook" className="font-display uppercase tracking-wide text-xs">By Sportsbook</TabsTrigger>
          </TabsList>

          <TabsContent value="sport" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sport</TableHead>
                  <TableHead>Bets</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Staked</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <BreakdownRows rows={bySport} />
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="betType" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bet Type</TableHead>
                  <TableHead>Bets</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Staked</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <BreakdownRows rows={byBetType} />
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="sportsbook" className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sportsbook</TableHead>
                  <TableHead>Bets</TableHead>
                  <TableHead>Record</TableHead>
                  <TableHead>Win Rate</TableHead>
                  <TableHead>Staked</TableHead>
                  <TableHead>P&L</TableHead>
                  <TableHead>ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <BreakdownRows rows={bySportsbook} />
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
