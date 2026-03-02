"use client";

import { useFormContext } from "react-hook-form";
import { COMMON_SPORTS, MARKET_TYPES, MARKET_TYPE_LABELS } from "@/lib/types";
import type { CreateBetInput } from "@/lib/validators";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface LegFormProps {
  index: number;
}

export function LegForm({ index }: LegFormProps) {
  const { control, watch } = useFormContext<CreateBetInput>();
  const marketType = watch(`legs.${index}.marketType`);
  const showLine = marketType === "spread" || marketType === "over_under";

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Sport */}
        <FormField
          control={control}
          name={`legs.${index}.sport`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sport</FormLabel>
              <FormControl>
                <div>
                  <Input
                    placeholder="e.g., NFL"
                    list={`sports-list-${index}`}
                    {...field}
                  />
                  <datalist id={`sports-list-${index}`}>
                    {COMMON_SPORTS.map((sport) => (
                      <option key={sport} value={sport} />
                    ))}
                  </datalist>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Event Name */}
        <FormField
          control={control}
          name={`legs.${index}.eventName`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chiefs vs Eagles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Market Type */}
        <FormField
          control={control}
          name={`legs.${index}.marketType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select market type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MARKET_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {MARKET_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Selection */}
        <FormField
          control={control}
          name={`legs.${index}.selection`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Selection</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Chiefs -3.5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Odds */}
        <FormField
          control={control}
          name={`legs.${index}.odds`}
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
                    field.onChange(val === "" ? "" : Number(val));
                  }}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Line (conditional) */}
        {showLine && (
          <FormField
            control={control}
            name={`legs.${index}.line`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g., -3.5"
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

        {/* Event Date */}
        <FormField
          control={control}
          name={`legs.${index}.eventDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === "" ? null : val);
                  }}
                  value={
                    field.value
                      ? typeof field.value === "string"
                        ? field.value
                        : new Date(field.value).toISOString().split("T")[0]
                      : ""
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
