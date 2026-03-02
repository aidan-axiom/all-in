"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { createBetSchema, type CreateBetInput } from "@/lib/validators";
import { COMMON_SPORTSBOOKS } from "@/lib/types";
import type { BetType } from "@/lib/types";
import { calculatePayout, formatCurrency } from "@/lib/odds";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { BetTypeSelector } from "./bet-type-selector";
import { LegList } from "./leg-list";
import { ImageUpload } from "./image-upload";

const defaultLeg = {
  sport: "",
  eventName: "",
  marketType: "",
  selection: "",
  odds: "" as unknown as number,
  line: null,
  eventDate: null,
  league: null,
  status: "pending" as const,
};

export function BetForm() {
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<CreateBetInput>({
    resolver: zodResolver(createBetSchema) as any,
    defaultValues: {
      betType: "straight",
      stake: "" as unknown as number,
      odds: "" as unknown as number,
      teaserPoints: null,
      sportsbook: "",
      notes: "",
      imageUrl: null,
      placedAt: new Date(),
      legs: [{ ...defaultLeg }],
    },
  });

  const betType = form.watch("betType");
  const stake = form.watch("stake");
  const odds = form.watch("odds");

  // When betType changes, adjust legs array
  useEffect(() => {
    const currentLegs = form.getValues("legs");

    if (betType === "straight") {
      // Straight bets should have exactly 1 leg
      if (currentLegs.length > 1) {
        form.setValue("legs", [currentLegs[0]]);
      }
    } else if (
      ["parlay", "teaser", "round_robin"].includes(betType) &&
      currentLegs.length < 2
    ) {
      // Multi-leg types need at least 2 legs
      form.setValue("legs", [...currentLegs, { ...defaultLeg }]);
    }

    // Clear teaser points if not a teaser
    if (betType !== "teaser") {
      form.setValue("teaserPoints", null);
    }
  }, [betType, form]);

  // Calculate potential payout
  const potentialPayout = useMemo(() => {
    const stakeNum = typeof stake === "number" && stake > 0 ? stake : 0;
    const oddsNum = typeof odds === "number" ? odds : 0;

    if (stakeNum <= 0 || oddsNum === 0) return null;
    if (oddsNum > -100 && oddsNum < 100) return null;

    return calculatePayout(stakeNum, oddsNum);
  }, [stake, odds]);

  const showOverallOdds = betType !== "round_robin";
  const showTeaserPoints = betType === "teaser";

  async function onSubmit(data: CreateBetInput) {
    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || "Failed to create bet");
      }

      toast.success("Bet created successfully");
      router.push("/bets");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create bet"
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Bet Type */}
        <FormField
          control={form.control}
          name="betType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bet Type</FormLabel>
              <FormControl>
                <BetTypeSelector
                  value={field.value}
                  onChange={(value: BetType) => field.onChange(value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Stake */}
          <FormField
            control={form.control}
            name="stake"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stake ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? "" : Number(val));
                    }}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Overall Odds */}
          {showOverallOdds && (
            <FormField
              control={form.control}
              name="odds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odds</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., -110"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? null : Number(val));
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormDescription>American odds format</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Teaser Points */}
          {showTeaserPoints && (
            <FormField
              control={form.control}
              name="teaserPoints"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teaser Points</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.5"
                      placeholder="e.g., 6"
                      {...field}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? null : Number(val));
                      }}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Sportsbook */}
          <FormField
            control={form.control}
            name="sportsbook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sportsbook</FormLabel>
                <FormControl>
                  <div>
                    <Input
                      placeholder="e.g., DraftKings"
                      list="sportsbooks-list"
                      {...field}
                      value={field.value ?? ""}
                    />
                    <datalist id="sportsbooks-list">
                      {COMMON_SPORTSBOOKS.map((book) => (
                        <option key={book} value={book} />
                      ))}
                    </datalist>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Placed At */}
          <FormField
            control={form.control}
            name="placedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placed At</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.onChange(val === "" ? new Date() : new Date(val));
                    }}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().slice(0, 16)
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Potential Payout */}
        {potentialPayout !== null && (
          <div className="rounded-md border border-primary/20 bg-primary/10 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential Payout</span>
              <span className="font-semibold text-primary">
                {formatCurrency(potentialPayout)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential Profit</span>
              <span className="font-medium">
                {formatCurrency(potentialPayout - (typeof stake === "number" ? stake : 0))}
              </span>
            </div>
          </div>
        )}

        <Separator />

        {/* Legs */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {betType === "straight" ? "Selection" : "Legs"}
          </h3>
          <LegList betType={betType} />
        </div>

        <Separator />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes about this bet..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ticket Image */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ticket Image (optional)</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button
          type="submit"
          className="w-full font-display uppercase tracking-wider h-11 text-base"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Placing Bet..." : "Place Bet"}
        </Button>
      </form>
    </Form>
  );
}
