"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { TimeRange } from "@/lib/time-filters";

const RANGES: { value: TimeRange; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "ytd", label: "YTD" },
  { value: "1y", label: "1Y" },
];

export function TimeFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = (searchParams.get("range") as TimeRange) ?? "all";

  function setRange(range: TimeRange) {
    const params = new URLSearchParams(searchParams.toString());
    if (range === "all") {
      params.delete("range");
    } else {
      params.set("range", range);
    }
    router.push(`/analytics?${params.toString()}`);
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {RANGES.map(({ value, label }) => (
        <Button
          key={value}
          variant={active === value ? "default" : "outline"}
          size="sm"
          onClick={() => setRange(value)}
          className="font-display uppercase tracking-wider text-xs h-8 px-3"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
