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
import { formatCurrency, formatUnits } from "@/lib/odds";

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
  unitSize?: number | null;
}

function BreakdownRows({ rows, unitSize }: { rows: BreakdownRow[]; unitSize?: number | null }) {
  const colSpan = unitSize ? 8 : 7;

  if (rows.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} className="text-center text-muted-foreground py-8">
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
            {unitSize ? (
              <TableCell
                className={
                  row.pl > 0
                    ? "text-primary"
                    : row.pl < 0
                      ? "text-destructive"
                      : ""
                }
              >
                {formatUnits(row.pl, unitSize)}
              </TableCell>
            ) : null}
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

function TableHeaders({ label, unitSize }: { label: string; unitSize?: number | null }) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>{label}</TableHead>
        <TableHead>Bets</TableHead>
        <TableHead>Record</TableHead>
        <TableHead>Win Rate</TableHead>
        <TableHead>Staked</TableHead>
        <TableHead>P&L</TableHead>
        {unitSize ? <TableHead>P&L (u)</TableHead> : null}
        <TableHead>ROI</TableHead>
      </TableRow>
    </TableHeader>
  );
}

export function BreakdownTable({
  bySport,
  byBetType,
  bySportsbook,
  unitSize,
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
              <TableHeaders label="Sport" unitSize={unitSize} />
              <TableBody>
                <BreakdownRows rows={bySport} unitSize={unitSize} />
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="betType" className="mt-4">
            <Table>
              <TableHeaders label="Bet Type" unitSize={unitSize} />
              <TableBody>
                <BreakdownRows rows={byBetType} unitSize={unitSize} />
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="sportsbook" className="mt-4">
            <Table>
              <TableHeaders label="Sportsbook" unitSize={unitSize} />
              <TableBody>
                <BreakdownRows rows={bySportsbook} unitSize={unitSize} />
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
