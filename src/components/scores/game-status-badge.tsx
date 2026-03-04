import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { GameStatus } from "@/lib/scores";

const statusStyles: Record<GameStatus, string> = {
  live: "bg-destructive/20 text-destructive border-destructive/30",
  scheduled: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  final: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<GameStatus, string> = {
  live: "Live",
  scheduled: "Scheduled",
  final: "Final",
};

interface GameStatusBadgeProps {
  status: GameStatus;
  className?: string;
}

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-display tracking-wider text-[10px] uppercase",
        statusStyles[status],
        className
      )}
    >
      {status === "live" && (
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />
      )}
      {statusLabels[status]}
    </Badge>
  );
}
