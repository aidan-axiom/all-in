"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import type { CreateBetInput } from "@/lib/validators";
import type { BetType } from "@/lib/types";
import { LegForm } from "./leg-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusIcon, XIcon } from "lucide-react";

interface LegListProps {
  betType: BetType;
}

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

export function LegList({ betType }: LegListProps) {
  const { control } = useFormContext<CreateBetInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "legs",
  });

  const allowMultipleLegs = betType !== "straight";
  const canRemove = fields.length > 1;

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id}>
          {index > 0 && <Separator className="mb-4" />}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                Leg {index + 1}
              </h4>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => remove(index)}
                >
                  <XIcon className="size-3" />
                  <span className="sr-only">Remove leg {index + 1}</span>
                </Button>
              )}
            </div>
            <LegForm index={index} />
          </div>
        </div>
      ))}

      {allowMultipleLegs && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => append(defaultLeg)}
        >
          <PlusIcon className="size-4" />
          Add Leg
        </Button>
      )}
    </div>
  );
}
