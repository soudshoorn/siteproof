"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { nl } from "@/lib/i18n/nl";
import { cn } from "@/lib/utils";
import { Menu, X, Shield } from "lucide-react";

const navLinks = [
  { href: "/wcag-checker", label: "WCAG Checker" },
  { href: "/eaa-compliance", label: "EAA Compliance" },
  { href: "/pricing", label: "Prijzen" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
          aria-label="SiteProof — Naar homepage"
        >
          <Shield className="size-6 text-primary" />
          <span>{nl.common.appName}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Hoofdnavigatie">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">{nl.common.login}</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">{nl.common.register}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:text-foreground md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Menu sluiten" : "Menu openen"}
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="border-t border-border/40 bg-background px-4 py-4 md:hidden"
          aria-label="Mobiele navigatie"
        >
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className={cn("mt-4 flex flex-col gap-2 border-t border-border/40 pt-4")}>
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">{nl.common.login}</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/auth/register">{nl.common.register}</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
