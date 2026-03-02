"use client";

import { BET_TYPES, BET_TYPE_LABELS, type BetType } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface BetTypeSelectorProps {
  value: BetType;
  onChange: (value: BetType) => void;
}

export function BetTypeSelector({ value, onChange }: BetTypeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {BET_TYPES.map((betType) => (
        <Button
          key={betType}
          type="button"
          variant={value === betType ? "default" : "outline"}
          size="sm"
          className="font-display uppercase tracking-wider text-xs"
          onClick={() => onChange(betType)}
        >
          {BET_TYPE_LABELS[betType]}
        </Button>
      ))}
    </div>
  );
}
