import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BetDetail } from "@/components/bets/bet-detail";
import type { BetWithLegs } from "@/lib/types";

interface BetPageProps {
  params: Promise<{ id: string }>;
}

export default async function BetPage({ params }: BetPageProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const bet = await prisma.bet.findUnique({
    where: { id },
    include: { legs: true },
  });

  if (!bet || bet.userId !== session.user.id) {
    redirect("/bets");
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <BetDetail bet={bet as BetWithLegs} />
    </div>
  );
}
