import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ScanWidget } from "@/components/scan/scan-widget";
import { Shield, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Pagina niet gevonden",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex flex-1 flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Shield className="size-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">404</h1>
          <p className="mt-2 text-lg font-medium">Pagina niet gevonden</p>
          <p className="mt-3 text-muted-foreground">
            De pagina die je zoekt bestaat niet of is verplaatst. Misschien wil je
            in plaats daarvan je website scannen op toegankelijkheid?
          </p>
          <div className="mt-8">
            <ScanWidget variant="compact" />
          </div>
          <div className="mt-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
                Terug naar homepage
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
