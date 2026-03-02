import { Badge } from "@/components/ui/badge";
import { BET_STATUS_LABELS, type BetStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  won: "bg-primary/20 text-primary border-primary/30",
  lost: "bg-destructive/20 text-destructive border-destructive/30",
  push: "bg-muted text-muted-foreground border-border",
  cashout: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

interface BetStatusBadgeProps {
  status: string;
  className?: string;
}

export function BetStatusBadge({ status, className }: BetStatusBadgeProps) {
  const label = BET_STATUS_LABELS[status as BetStatus] ?? status;
  const style = statusStyles[status] ?? "";

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-display tracking-wider text-[10px] uppercase",
        style,
        className
      )}
    >
      {label}
    </Badge>
  );
}
