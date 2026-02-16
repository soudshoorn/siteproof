import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Klaar om je website te scannen?
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
          Start met een gratis scan en ontdek hoe toegankelijk je website is. Geen creditcard nodig.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="#main-content">
              Gratis scannen
              <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/pricing">Bekijk prijzen</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
