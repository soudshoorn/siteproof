import Link from "next/link";
import { Shield } from "lucide-react";
import { nl } from "@/lib/i18n/nl";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-bold tracking-tight"
        aria-label="SiteProof — Naar homepage"
      >
        <Shield className="size-7 text-primary" />
        <span>{nl.common.appName}</span>
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Door je te registreren ga je akkoord met onze{" "}
        <Link href="/voorwaarden" className="underline hover:text-foreground">
          Algemene Voorwaarden
        </Link>{" "}
        en{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacyverklaring
        </Link>
        .
      </p>
    </div>
  );
}
