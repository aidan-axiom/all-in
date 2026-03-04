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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatOdds } from "@/lib/odds";

interface CLVDataPoint {
  date: string;
  clv: number;
  odds: number;
  closingOdds: number;
}

interface CLVSectionProps {
  averageCLV: number;
  beatClosePercent: number;
  totalWithCLV: number;
  clvData: CLVDataPoint[];
}

export function CLVSection({
  averageCLV,
  beatClosePercent,
  totalWithCLV,
  clvData,
}: CLVSectionProps) {
  if (totalWithCLV === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-display uppercase tracking-wide">
            Closing Line Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground text-center">
            <div>
              <p>No CLV data yet.</p>
              <p className="text-xs mt-1">
                Enter closing odds when resolving bets to track CLV.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display uppercase tracking-wide">
          Closing Line Value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Avg CLV
            </p>
            <p
              className={`stat-value text-2xl ${
                averageCLV > 0
                  ? "text-primary"
                  : averageCLV < 0
                    ? "text-destructive"
                    : ""
              }`}
            >
              {averageCLV > 0 ? "+" : ""}
              {averageCLV.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Beat Close
            </p>
            <p
              className={`stat-value text-2xl ${
                beatClosePercent >= 50 ? "text-primary" : "text-destructive"
              }`}
            >
              {beatClosePercent.toFixed(0)}%
            </p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Bets Tracked
            </p>
            <p className="stat-value text-2xl">{totalWithCLV}</p>
          </div>
        </div>

        {clvData.length > 0 && (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clvData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
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
                  tickFormatter={(value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
                  className="text-muted-foreground"
                />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any, _name: any, props: any) => {
                    const item = props.payload as CLVDataPoint;
                    return [
                      `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}% (${formatOdds(item.odds)} → ${formatOdds(item.closingOdds)})`,
                      "CLV",
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="clv" radius={[4, 4, 0, 0]}>
                  {clvData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.clv >= 0 ? "#3BBF5E" : "#E04545"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
