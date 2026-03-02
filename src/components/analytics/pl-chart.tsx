"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/odds";

interface PLChartProps {
  data: { date: string; pl: number; cumulativePL: number }[];
}

export function PLChart({ data }: PLChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide">P&L Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No resolved bets yet to chart.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display uppercase tracking-wide">P&L Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="plGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3BBF5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3BBF5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => {
                  const d = new Date(value);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value: number) => formatCurrency(value)}
                className="text-muted-foreground"
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [
                  formatCurrency(Number(value)),
                  "Cumulative P&L",
                ]}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                labelFormatter={(label: any) => {
                  const d = new Date(String(label));
                  return d.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  });
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="cumulativePL"
                stroke="#3BBF5E"
                strokeWidth={2}
                fill="url(#plGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
