import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/cookie-consent";
import "./globals.css";

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SiteProof — Bewijs dat je website toegankelijk is",
    template: "%s | SiteProof",
  },
  description:
    "Scan je website op WCAG 2.1 AA en ontvang een helder rapport met concrete verbeterpunten in begrijpelijk Nederlands. Voldoe aan de European Accessibility Act.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://siteproof.nl"
  ),
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "SiteProof",
    title: "SiteProof — Bewijs dat je website toegankelijk is",
    description:
      "De Nederlandse #1 geautomatiseerde WCAG-accessibility audit tool. Scan je website en voldoe aan de EAA.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteProof — Bewijs dat je website toegankelijk is",
    description:
      "Scan je website op WCAG 2.1 AA compliance. Resultaten in begrijpelijk Nederlands.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <a href="#main-content" className="skip-to-content">
            Ga naar hoofdinhoud
          </a>
          {children}
          <CookieConsent />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
