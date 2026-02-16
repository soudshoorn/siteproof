import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "API Documentatie — SiteProof",
  description:
    "Documentatie voor de SiteProof REST API. Start scans, haal resultaten op en beheer websites via de API.",
};

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/websites",
    description: "Lijst van alle websites in je organisatie.",
    response: `{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "url": "https://example.nl",
      "name": "Example",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00Z",
      "lastScan": {
        "id": "uuid",
        "score": 85,
        "status": "COMPLETED",
        "totalIssues": 12,
        "createdAt": "2025-01-15T10:00:00Z",
        "completedAt": "2025-01-15T10:02:30Z"
      }
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/websites/:id",
    description: "Details van een specifieke website, inclusief recente scans en scan planning.",
    response: `{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://example.nl",
    "name": "Example",
    "isActive": true,
    "schedule": {
      "frequency": "WEEKLY",
      "isActive": true,
      "nextRunAt": "2025-01-22T06:00:00Z"
    },
    "recentScans": [...]
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/websites/:id/scans",
    description: "Scan geschiedenis van een website. Ondersteunt paginering.",
    params: [
      { name: "page", type: "number", description: "Paginanummer (standaard: 1)" },
      { name: "limit", type: "number", description: "Resultaten per pagina (standaard: 25, max: 50)" },
    ],
    response: `{
  "success": true,
  "data": {
    "scans": [...],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 42,
      "totalPages": 2
    }
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/websites/:id/issues",
    description: "Huidige issues van een website (uit de laatste voltooide scan).",
    params: [
      { name: "severity", type: "string", description: "Filter op ernst: CRITICAL, SERIOUS, MODERATE, MINOR" },
      { name: "page", type: "number", description: "Paginanummer (standaard: 1)" },
      { name: "limit", type: "number", description: "Resultaten per pagina (standaard: 25, max: 100)" },
    ],
    response: `{
  "success": true,
  "data": {
    "scanId": "uuid",
    "score": 85,
    "scanDate": "2025-01-15T10:02:30Z",
    "issues": [
      {
        "id": "uuid",
        "axeRuleId": "image-alt",
        "severity": "CRITICAL",
        "wcagCriteria": ["1.1.1"],
        "description": "Afbeeldingen missen alternatieve tekst",
        "fixSuggestion": "Voeg een alt-attribuut toe...",
        "pageUrl": "https://example.nl/about"
      }
    ],
    "pagination": {...}
  }
}`,
  },
  {
    method: "POST",
    path: "/api/v1/scan",
    description: "Start een nieuwe scan voor een website.",
    body: `{
  "websiteId": "uuid"
}`,
    response: `{
  "success": true,
  "data": {
    "id": "uuid",
    "websiteId": "uuid",
    "status": "QUEUED",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/v1/scan/:id",
    description: "Status en resultaten van een scan. Poll dit endpoint totdat status COMPLETED of FAILED is.",
    response: `{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "score": 85,
    "totalPages": 10,
    "scannedPages": 10,
    "totalIssues": 12,
    "criticalIssues": 2,
    "seriousIssues": 5,
    "moderateIssues": 3,
    "minorIssues": 2,
    "duration": 45,
    "pages": [...],
    "issues": [...]
  }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  POST: "bg-green-500/10 text-green-500 border-green-500/20",
  PUT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ApiDocsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              API Documentatie
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              De SiteProof REST API geeft je programmatic toegang tot je websites, scans en issues.
              Beschikbaar op het Bureau plan.
            </p>
          </div>

          {/* Authentication */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold">Authenticatie</h2>
            <p className="text-muted-foreground">
              Alle API requests vereisen een Bearer token in de <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Authorization</code> header.
              Je kunt API keys aanmaken in je{" "}
              <a href="/dashboard/settings/api" className="text-primary hover:underline">
                dashboard instellingen
              </a>.
            </p>
            <pre className="overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-4 font-mono text-sm">
{`curl -H "Authorization: Bearer sp_live_abc123..." \\
  https://siteproof.nl/api/v1/websites`}
            </pre>
          </section>

          {/* Rate limiting */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold">Rate Limiting</h2>
            <p className="text-muted-foreground">
              De API is gelimiteerd tot <strong>100 requests per minuut</strong> per API key.
              Bij overschrijding ontvang je een <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">429</code> status
              met een <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">Retry-After</code> header.
            </p>
          </section>

          {/* Response format */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold">Response Format</h2>
            <p className="text-muted-foreground">
              Alle responses zijn JSON. Succesvolle responses bevatten <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{`"success": true`}</code> met een <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">data</code> veld.
              Foutresponses bevatten <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{`"success": false`}</code> met een <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">error</code> bericht in het Nederlands.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-medium">Succes</p>
                <pre className="overflow-x-auto rounded-lg border border-score-good/20 bg-score-good/5 p-3 font-mono text-sm">
{`{
  "success": true,
  "data": { ... }
}`}
                </pre>
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Fout</p>
                <pre className="overflow-x-auto rounded-lg border border-destructive/20 bg-destructive/5 p-3 font-mono text-sm">
{`{
  "success": false,
  "error": "Beschrijving van de fout."
}`}
                </pre>
              </div>
            </div>
          </section>

          {/* Status codes */}
          <section className="mb-12 space-y-4">
            <h2 className="text-2xl font-bold">Status Codes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-left">
                    <th className="pb-2 font-medium">Code</th>
                    <th className="pb-2 font-medium">Betekenis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    ["200", "Succesvol"],
                    ["201", "Aangemaakt"],
                    ["400", "Ongeldige request"],
                    ["401", "Niet geauthenticeerd (ongeldige API key)"],
                    ["403", "Geen toegang (plan ondersteunt geen API)"],
                    ["404", "Niet gevonden"],
                    ["429", "Rate limit overschreden"],
                    ["500", "Server fout"],
                    ["503", "Scanner niet beschikbaar"],
                  ].map(([code, desc]) => (
                    <tr key={code}>
                      <td className="py-2">
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{code}</code>
                      </td>
                      <td className="py-2 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-8">
            <h2 className="text-2xl font-bold">Endpoints</h2>
            {endpoints.map((ep) => (
              <div
                key={`${ep.method}-${ep.path}`}
                className="space-y-4 rounded-xl border border-border/50 p-6"
                id={ep.path.replace(/[/:]/g, "-").replace(/^-/, "")}
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={methodColors[ep.method]}
                  >
                    {ep.method}
                  </Badge>
                  <code className="font-mono text-sm font-semibold">{ep.path}</code>
                </div>
                <p className="text-sm text-muted-foreground">{ep.description}</p>

                {/* Query parameters */}
                {"params" in ep && ep.params && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Query Parameters
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border/40 text-left">
                            <th className="pb-2 font-medium">Parameter</th>
                            <th className="pb-2 font-medium">Type</th>
                            <th className="pb-2 font-medium">Beschrijving</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {ep.params.map((p) => (
                            <tr key={p.name}>
                              <td className="py-2">
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{p.name}</code>
                              </td>
                              <td className="py-2 text-muted-foreground">{p.type}</td>
                              <td className="py-2 text-muted-foreground">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Request body */}
                {"body" in ep && ep.body && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Request Body
                    </p>
                    <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 font-mono text-sm">
                      {ep.body}
                    </pre>
                  </div>
                )}

                {/* Response */}
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Response
                  </p>
                  <pre className="overflow-x-auto rounded-lg bg-muted/30 p-3 font-mono text-sm">
                    {ep.response}
                  </pre>
                </div>
              </div>
            ))}
          </section>

          {/* Scan workflow */}
          <section className="mt-12 space-y-4">
            <h2 className="text-2xl font-bold">Scan Workflow</h2>
            <p className="text-muted-foreground">
              Een typische scan-workflow via de API:
            </p>
            <ol className="list-decimal space-y-2 pl-6 text-sm text-muted-foreground">
              <li>
                Haal je websites op via <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /api/v1/websites</code>
              </li>
              <li>
                Start een scan via <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">POST /api/v1/scan</code> met het website ID
              </li>
              <li>
                Poll de scan status via <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">GET /api/v1/scan/:id</code> (elke 5 seconden)
              </li>
              <li>
                Wanneer de status <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">COMPLETED</code> is, bevat de response alle resultaten
              </li>
            </ol>
            <pre className="overflow-x-auto rounded-lg border border-border/50 bg-muted/30 p-4 font-mono text-sm">
{`# 1. Lijst websites
curl -H "Authorization: Bearer sp_live_..." \\
  https://siteproof.nl/api/v1/websites

# 2. Start scan
curl -X POST \\
  -H "Authorization: Bearer sp_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{"websiteId": "uuid"}' \\
  https://siteproof.nl/api/v1/scan

# 3. Poll resultaten
curl -H "Authorization: Bearer sp_live_..." \\
  https://siteproof.nl/api/v1/scan/scan-uuid

# 4. Bekijk issues
curl -H "Authorization: Bearer sp_live_..." \\
  "https://siteproof.nl/api/v1/websites/uuid/issues?severity=CRITICAL"`}
            </pre>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
