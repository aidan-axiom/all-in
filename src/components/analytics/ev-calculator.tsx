"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  americanToImpliedProbability,
  calculateEV,
  removeVig,
  probabilityToAmerican,
  formatCurrency,
  formatOdds,
} from "@/lib/odds";

interface EVCalculatorProps {
  defaultStake?: number;
}

export function EVCalculator({ defaultStake = 100 }: EVCalculatorProps) {
  const [yourOdds, setYourOdds] = useState("");
  const [fairOdds, setFairOdds] = useState("");
  const [side1Odds, setSide1Odds] = useState("");
  const [side2Odds, setSide2Odds] = useState("");
  const [stake, setStake] = useState(String(defaultStake));
  const [mode, setMode] = useState<"fair" | "market">("fair");

  function computeResult() {
    const stakeNum = parseFloat(stake);
    const yourOddsNum = parseInt(yourOdds);
    if (!stakeNum || !yourOddsNum || isNaN(stakeNum) || isNaN(yourOddsNum)) return null;
    if (yourOddsNum > -100 && yourOddsNum < 100) return null;

    let computedFairOdds: number;

    if (mode === "fair") {
      const fairOddsNum = parseInt(fairOdds);
      if (!fairOddsNum || isNaN(fairOddsNum)) return null;
      if (fairOddsNum > -100 && fairOddsNum < 100) return null;
      computedFairOdds = fairOddsNum;
    } else {
      const s1 = parseInt(side1Odds);
      const s2 = parseInt(side2Odds);
      if (!s1 || !s2 || isNaN(s1) || isNaN(s2)) return null;
      if ((s1 > -100 && s1 < 100) || (s2 > -100 && s2 < 100)) return null;
      const [fairProb] = removeVig(s1, s2);
      computedFairOdds = probabilityToAmerican(fairProb);
    }

    const ev = calculateEV(stakeNum, yourOddsNum, computedFairOdds);
    const evPercent = (ev / stakeNum) * 100;
    const impliedProb = americanToImpliedProbability(yourOddsNum) * 100;
    const fairProb = americanToImpliedProbability(computedFairOdds) * 100;
    const edge = fairProb - impliedProb;

    return { ev, evPercent, impliedProb, fairProb, edge, computedFairOdds };
  }

  const result = computeResult();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display uppercase tracking-wide">EV Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ev-your-odds">Your Odds</Label>
            <Input
              id="ev-your-odds"
              type="number"
              placeholder="-110"
              value={yourOdds}
              onChange={(e) => setYourOdds(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ev-stake">Stake ($)</Label>
            <Input
              id="ev-stake"
              type="number"
              min="1"
              placeholder="100"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "fair" | "market")}>
          <TabsList className="w-full">
            <TabsTrigger value="fair" className="flex-1 font-display uppercase tracking-wide text-xs">
              Fair Odds
            </TabsTrigger>
            <TabsTrigger value="market" className="flex-1 font-display uppercase tracking-wide text-xs">
              Both Sides
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fair" className="mt-3">
            <div className="space-y-2">
              <Label htmlFor="ev-fair-odds">No-Vig / Fair Odds</Label>
              <Input
                id="ev-fair-odds"
                type="number"
                placeholder="-105"
                value={fairOdds}
                onChange={(e) => setFairOdds(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="market" className="mt-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ev-side1">Side 1 (your side)</Label>
                <Input
                  id="ev-side1"
                  type="number"
                  placeholder="-110"
                  value={side1Odds}
                  onChange={(e) => setSide1Odds(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ev-side2">Side 2 (other side)</Label>
                <Input
                  id="ev-side2"
                  type="number"
                  placeholder="-110"
                  value={side2Odds}
                  onChange={(e) => setSide2Odds(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 md:grid-cols-4">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Expected Value
              </p>
              <p
                className={`stat-value text-2xl ${
                  result.ev > 0
                    ? "text-primary"
                    : result.ev < 0
                      ? "text-destructive"
                      : ""
                }`}
              >
                {formatCurrency(result.ev)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                EV %
              </p>
              <p
                className={`stat-value text-2xl ${
                  result.evPercent > 0
                    ? "text-primary"
                    : result.evPercent < 0
                      ? "text-destructive"
                      : ""
                }`}
              >
                {result.evPercent > 0 ? "+" : ""}
                {result.evPercent.toFixed(1)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Fair Odds
              </p>
              <p className="stat-value text-2xl">
                {formatOdds(result.computedFairOdds)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Edge
              </p>
              <p
                className={`stat-value text-2xl ${
                  result.edge > 0
                    ? "text-primary"
                    : result.edge < 0
                      ? "text-destructive"
                      : ""
                }`}
              >
                {result.edge > 0 ? "+" : ""}
                {result.edge.toFixed(1)}%
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
