import { Link } from "react-router";
import { Button } from "@/components/ui/button";

/** Onboarding (KONZEPT S0) runs full screen, outside the app shell; its four steps follow in P4-06. */
export function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-4 py-8">
      <h1 className="text-page-title">Onboarding</h1>
      <Button variant="link" asChild className="px-0">
        <Link to="/">Demo ohne Einrichtung starten</Link>
      </Button>
    </main>
  );
}
