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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UnitSettingsProps {
  unitSize: number | null;
}

export function UnitSettings({ unitSize }: UnitSettingsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(unitSize ? String(unitSize) : "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const num = parseFloat(value);
    if (!num || num <= 0) {
      toast.error("Unit size must be a positive number");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitSize: num }),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast.success("Unit size updated");
      setOpen(false);
      router.refresh();
    } catch {
      toast.error("Failed to save unit size");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="font-display uppercase tracking-wider text-xs h-8">
          {unitSize ? `1u = $${unitSize}` : "Set Unit Size"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Unit Size</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <Label htmlFor="unit-size">1 Unit = $ ___</Label>
          <Input
            id="unit-size"
            type="number"
            min="1"
            step="any"
            placeholder="25"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Set your standard bet size to track P&L in units.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
