"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  BET_STATUSES,
  BET_STATUS_LABELS,
  BET_TYPES,
  BET_TYPE_LABELS,
  COMMON_SPORTS,
  type BetStatus,
  type BetType,
} from "@/lib/types";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "highest_stake", label: "Highest Stake" },
  { value: "lowest_stake", label: "Lowest Stake" },
] as const;

export function BetFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentStatus = searchParams.get("status") ?? "all";
  const currentBetType = searchParams.get("betType") ?? "all";
  const currentSport = searchParams.get("sport") ?? "all";
  const currentSort = searchParams.get("sort") ?? "newest";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all" || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [searchParams, router, pathname]
  );

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border/50 bg-card/50 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={currentStatus} onValueChange={(v) => updateParam("status", v)}>
          <SelectTrigger className="w-[130px]" size="sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {BET_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {BET_STATUS_LABELS[status as BetStatus]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentBetType} onValueChange={(v) => updateParam("betType", v)}>
          <SelectTrigger className="w-[140px]" size="sm">
            <SelectValue placeholder="Bet Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {BET_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {BET_TYPE_LABELS[type as BetType]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSport} onValueChange={(v) => updateParam("sport", v)}>
          <SelectTrigger className="w-[130px]" size="sm">
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sports</SelectItem>
            {COMMON_SPORTS.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={currentSort} onValueChange={(v) => updateParam("sort", v)}>
          <SelectTrigger className="w-[150px]" size="sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button asChild size="sm" className="font-display uppercase tracking-wider">
        <Link href="/bets/new">New Bet</Link>
      </Button>
    </div>
  );
}
