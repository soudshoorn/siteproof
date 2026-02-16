"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, RefreshCw, ArrowLeft } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-20">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <Shield className="size-8 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Oeps</h1>
        <p className="mt-2 text-lg font-medium">Er ging iets mis</p>
        <p className="mt-3 text-muted-foreground">
          We hebben een onverwachte fout aangetroffen. Ons team is op de hoogte
          gesteld en we werken aan een oplossing.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Foutcode: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="size-4" />
            Opnieuw proberen
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" />
              Naar homepage
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
