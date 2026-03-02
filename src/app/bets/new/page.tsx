import { BetForm } from "@/components/bets/bet-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function NewBetPage() {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl uppercase tracking-wide">New Bet</CardTitle>
        </CardHeader>
        <CardContent>
          <BetForm />
        </CardContent>
      </Card>
    </div>
  );
}
