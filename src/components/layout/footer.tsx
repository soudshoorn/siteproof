import Link from "next/link";
import { nl } from "@/lib/i18n/nl";
import { Shield } from "lucide-react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { href: "/wcag-checker", label: "WCAG Checker" },
      { href: "/eaa-compliance", label: "EAA Compliance" },
      { href: "/pricing", label: "Prijzen" },
      { href: "/toegankelijkheid-testen", label: "Toegankelijkheid testen" },
    ],
  },
  resources: {
    title: "Hulpbronnen",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/wcag-richtlijnen", label: "WCAG Richtlijnen" },
      { href: "/toegankelijkheidsverklaring", label: "Verklaring generator" },
      { href: "/api-docs", label: "API Documentatie" },
    ],
  },
  legal: {
    title: "Juridisch",
    links: [
      { href: "/privacy", label: nl.footer.privacy },
      { href: "/cookies", label: nl.footer.cookies },
      { href: "/voorwaarden", label: nl.footer.terms },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/30" aria-label="Footer">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold" aria-label="SiteProof">
              <Shield className="size-5 text-primary" />
              <span>{nl.common.appName}</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {nl.landing.footerTagline}
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>
                {nl.footer.madeBy}{" "}
                <a
                  href="https://webser.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-primary"
                >
                  Webser
                </a>
              </p>
              <p>{nl.footer.kvk}: 93875568</p>
              <p>{nl.footer.btw}: NL005048718B97</p>
            </div>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-3 text-sm font-semibold">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {nl.common.appName}. Alle rechten voorbehouden.
          </p>
        </div>
      </div>
    </footer>
  );
}
