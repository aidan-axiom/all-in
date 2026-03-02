"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Ticket, BarChart3, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "My Bets", href: "/bets", icon: Ticket },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn("flex h-full w-64 flex-col border-r bg-card", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="font-display text-xl uppercase tracking-wide text-primary">
          BetTracker
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                isActive
                  ? "w-full justify-start gap-2 border-l-2 border-primary bg-sidebar-accent text-sidebar-primary-foreground"
                  : "w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon size={18} />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
