"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BET_STATUS_LABELS, LEG_STATUSES, type LegData } from "@/lib/types";

interface ResolveDialogProps {
  betId: string;
  currentStatus: string;
  betOdds: number | null;
  legs: LegData[];
}

const RESOLVE_STATUSES = ["won", "lost", "push", "cashout"] as const;

const LEG_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  won: "Won",
  lost: "Lost",
  push: "Push",
};

export function ResolveDialog({
  betId,
  currentStatus,
  betOdds,
  legs,
}: ResolveDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string>(
    currentStatus === "pending" ? "" : currentStatus
  );
  const [payout, setPayout] = useState<string>("");
  const [closingOdds, setClosingOdds] = useState<string>("");
  const [legResults, setLegResults] = useState<
    Record<string, string>
  >(
    Object.fromEntries(legs.map((leg) => [leg.id, leg.status]))
  );

  const showPayout = status === "won" || status === "cashout";

  function updateLegStatus(legId: string, newStatus: string) {
    setLegResults((prev) => ({ ...prev, [legId]: newStatus }));
  }

  async function handleSubmit() {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    if (showPayout && !payout) {
      toast.error("Please enter a payout amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const closingOddsNum = closingOdds ? parseInt(closingOdds) : null;
      const body: Record<string, unknown> = {
        status,
        payout: showPayout ? parseFloat(payout) : null,
        closingOdds: closingOddsNum && (closingOddsNum <= -100 || closingOddsNum >= 100) ? closingOddsNum : null,
        legResults: Object.entries(legResults).map(([legId, legStatus]) => ({
          legId,
          status: legStatus,
        })),
      };

      const res = await fetch(`/api/bets/${betId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to resolve bet");
      }

      toast.success("Bet resolved successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to resolve bet"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Resolve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Resolve Bet</DialogTitle>
          <DialogDescription>
            Set the outcome of this bet and optionally update individual leg
            results.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Overall bet status */}
          <div className="grid gap-2">
            <Label htmlFor="bet-status">Bet Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select outcome" />
              </SelectTrigger>
              <SelectContent>
                {RESOLVE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {BET_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payout field (shown for won/cashout) */}
          {showPayout && (
            <div className="grid gap-2">
              <Label htmlFor="payout">Payout ($)</Label>
              <Input
                id="payout"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={payout}
                onChange={(e) => setPayout(e.target.value)}
              />
            </div>
          )}

          {/* Closing odds for CLV tracking (shown when bet has odds) */}
          {betOdds && (
            <div className="grid gap-2">
              <Label htmlFor="closing-odds">Closing Odds (optional)</Label>
              <Input
                id="closing-odds"
                type="number"
                placeholder="e.g. -115"
                value={closingOdds}
                onChange={(e) => setClosingOdds(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the closing line to track CLV.
              </p>
            </div>
          )}

          {/* Individual leg statuses */}
          {legs.length > 0 && (
            <div className="grid gap-3">
              <Label>Leg Results</Label>
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {legs.map((leg, index) => (
                  <div
                    key={leg.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-2 text-sm"
                  >
                    <span className="truncate flex-1">
                      {index + 1}. {leg.selection} ({leg.eventName})
                    </span>
                    <Select
                      value={legResults[leg.id] ?? "pending"}
                      onValueChange={(val) => updateLegStatus(leg.id, val)}
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LEG_STATUSES.map((ls) => (
                          <SelectItem key={ls} value={ls}>
                            {LEG_STATUS_LABELS[ls]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Result"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
