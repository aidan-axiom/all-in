"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/odds";
import type { DayOfWeekStats } from "@/lib/time-filters";

interface DayOfWeekChartProps {
  data: DayOfWeekStats[];
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const hasBets = data.some((d) => d.bets > 0);

  if (!hasBets) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide">
            Performance by Day
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No resolved bets yet to chart.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display uppercase tracking-wide">
          Performance by Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => formatCurrency(value)}
                className="text-muted-foreground"
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
                position={{ y: 0 }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [
                  formatCurrency(Number(value)),
                  "P&L",
                ]}
                labelFormatter={(label: string) => label}
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#e0e0e0",
                }}
                labelStyle={{ color: "#ffffff" }}
                itemStyle={{ color: "#e0e0e0" }}
              />
              <Bar dataKey="pl" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.pl >= 0 ? "#3BBF5E" : "#E04545"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
