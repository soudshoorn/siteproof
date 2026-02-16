# SiteProof — Claude Code Build Prompt

> **Doel:** Bouw het volledige MVP van SiteProof, de Nederlandse #1 geautomatiseerde WCAG-accessibility audit SaaS. Dit wordt de standaard tool waarmee Nederlandse (en later Europese) bedrijven hun websites testen op toegankelijkheid en voldoen aan de European Accessibility Act (EAA).

---

## Context & Marktpositie

SiteProof is een SaaS-product van Webser (eigenaar: Senna Oudshoorn, 20 jaar, full-stack Drupal developer). De European Accessibility Act (EAA) is sinds 28 juni 2025 van kracht en verplicht alle niet-micro-ondernemingen hun digitale diensten toegankelijk te maken conform WCAG 2.1 AA (via EN 301 549). Boetes tot €900.000 via de ACM.

**Er bestaat geen Nederlandse SaaS-tool hiervoor.** De markt is verdeeld in:
- Overlay-tools (accessiBe, UserWay) → door FTC beboet, door blindengemeenschap afgewezen
- Enterprise-platforms (Siteimprove €28k/jaar, Deque €27k/jaar) → veel te duur voor MKB
- Gratis developer-tools (WAVE, Lighthouse, Pa11y) → te technisch voor ondernemers

SiteProof vult het gat: betaalbaar (€49-299/maand), Nederlandstalig, legitiem (axe-core, geen overlay), met begrijpelijke fix-suggesties.

**Domein:** siteproof.nl (+ .com, .eu, .io)
**Tagline:** "Bewijs dat je website toegankelijk is."

---

## Tech Stack (verplicht, niet wijzigen tenzij je een betere keuze onderbouwt)

| Laag | Technologie |
|------|-------------|
| Frontend | Next.js 15+ (App Router), TypeScript strict, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes (REST), Server Actions waar logisch |
| Database | PostgreSQL via Supabase (auth + database + storage) |
| ORM | Prisma |
| Scanner | axe-core via Puppeteer (headless Chromium) |
| Queue | BullMQ + Redis (via Upstash of Railway Redis) |
| Payments | Mollie (Nederlands, native iDEAL + SEPA + Bancontact + creditcard) |
| Email | Resend |
| Rich Text Editor | Novel (Notion-achtige editor, gebouwd op TipTap + shadcn/ui) |
| PDF | @react-pdf/renderer |
| Hosting | Vercel (frontend) + Railway (scanner workers) |
| Monitoring | Sentry |
| i18n | Alle UI-teksten in apart bestand (nl.ts), later en.ts toevoegen |

---

## Database Schema (Prisma)

Ontwerp en implementeer dit volledige schema:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  OWNER
  ADMIN
  MEMBER
}

enum PlanType {
  FREE
  STARTER
  PROFESSIONAL
  BUREAU
}

enum ScanStatus {
  QUEUED
  CRAWLING
  SCANNING
  ANALYZING
  COMPLETED
  FAILED
}

enum IssueSeverity {
  CRITICAL
  SERIOUS
  MODERATE
  MINOR
}

enum IssueImpact {
  CRITICAL
  SERIOUS
  MODERATE
  MINOR
}

enum ScheduleFrequency {
  DAILY
  WEEKLY
  MONTHLY
}

model User {
  id              String   @id @default(uuid())
  supabaseId      String   @unique
  email           String   @unique
  fullName        String?
  avatarUrl       String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  memberships     OrganizationMember[]
  scansStarted    Scan[]
}

model Organization {
  id              String   @id @default(uuid())
  name            String
  slug            String   @unique
  planType        PlanType @default(FREE)
  mollieCustomerId        String?   @unique
  mollieSubscriptionId    String?   @unique
  molliePlanId            String?
  mollieCurrentPeriodEnd  DateTime?
  maxWebsites     Int      @default(1)
  maxPagesPerScan Int      @default(5)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  members         OrganizationMember[]
  websites        Website[]
}

model OrganizationMember {
  id              String   @id @default(uuid())
  role            Role     @default(MEMBER)
  userId          String
  organizationId  String
  createdAt       DateTime @default(now())

  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
}

model Website {
  id              String   @id @default(uuid())
  url             String
  name            String
  organizationId  String
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  scans           Scan[]
  schedules       ScanSchedule[]

  @@unique([url, organizationId])
}

model Scan {
  id              String     @id @default(uuid())
  websiteId       String
  startedById     String?
  status          ScanStatus @default(QUEUED)
  score           Float?     // 0-100
  totalPages      Int        @default(0)
  scannedPages    Int        @default(0)
  totalIssues     Int        @default(0)
  criticalIssues  Int        @default(0)
  seriousIssues   Int        @default(0)
  moderateIssues  Int        @default(0)
  minorIssues     Int        @default(0)
  duration        Int?       // seconds
  errorMessage    String?
  metadata        Json?      // extra scan config/info
  createdAt       DateTime   @default(now())
  completedAt     DateTime?

  website         Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)
  startedBy       User?   @relation(fields: [startedById], references: [id])
  pages           PageResult[]
  issues          Issue[]
}

model PageResult {
  id              String   @id @default(uuid())
  scanId          String
  url             String
  title           String?
  score           Float?   // 0-100
  issueCount      Int      @default(0)
  screenshotUrl   String?
  loadTime        Int?     // ms
  createdAt       DateTime @default(now())

  scan            Scan    @relation(fields: [scanId], references: [id], onDelete: Cascade)
  issues          Issue[]

  @@index([scanId])
}

model Issue {
  id              String        @id @default(uuid())
  scanId          String
  pageResultId    String?
  axeRuleId       String        // axe-core rule identifier
  severity        IssueSeverity
  impact          IssueImpact
  wcagCriteria    String[]      // e.g. ["1.1.1", "4.1.2"]
  wcagLevel       String?       // "A", "AA", "AAA"
  description     String        // Dutch description
  helpText        String        // Dutch explanation of why it matters
  fixSuggestion   String        // Dutch fix suggestion (begrijpelijke taal!)
  htmlElement     String?       // the failing HTML snippet
  cssSelector     String?       // CSS selector to the element
  pageUrl         String
  createdAt       DateTime      @default(now())

  scan            Scan       @relation(fields: [scanId], references: [id], onDelete: Cascade)
  pageResult      PageResult? @relation(fields: [pageResultId], references: [id], onDelete: Cascade)

  @@index([scanId])
  @@index([axeRuleId])
}

model ScanSchedule {
  id              String            @id @default(uuid())
  websiteId       String
  frequency       ScheduleFrequency @default(WEEKLY)
  isActive        Boolean           @default(true)
  lastRunAt       DateTime?
  nextRunAt       DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  website         Website @relation(fields: [websiteId], references: [id], onDelete: Cascade)

  @@unique([websiteId])
}
```

---

## Fase 1: Core Scanner (BOUW DIT EERST)

Dit is het hart van het product. Zonder een goede scanner is er geen product.

### 1.1 Scanner Service (`/workers/scanner.ts`)

Bouw een standalone scanner worker die:

1. **URL accepteert** via BullMQ job queue
2. **Crawlt** met Puppeteer (headless Chromium):
   - Start bij de ingevoerde URL
   - Parse sitemap.xml als die bestaat
   - Crawl interne links (breadth-first)
   - Respecteer robots.txt
   - Wacht op network idle + DOM stability voor SPA-support
   - Max pagina's respecteren per plan (5/50/500)
   - Timeout per pagina: 30 seconden
   - User-Agent: "SiteProof/1.0 (Accessibility Scanner)"
3. **Scant elke pagina met axe-core:**
   - Injecteer axe-core in de pagina context
   - Run met configuratie: WCAG 2.1 AA + WCAG 2.2 AA tags
   - Verzamel violations, incomplete, passes
4. **Parst resultaten** naar ons datamodel:
   - Map axe-core violations naar Issue records
   - Bereken score per pagina en overall (gewogen op severity)
   - Vertaal alle descriptions naar Nederlands (KILLER FEATURE)
5. **Slaat op** in database via Prisma
6. **Stuurt notificatie** via Resend als scan klaar is

### 1.2 Score-berekening

```
Score = 100 - (kritiekPunten * 10 + serieusPunten * 5 + matigPunten * 2 + minorPunten * 0.5)
Minimum: 0, Maximum: 100
Per pagina EN overall (gewogen gemiddelde op basis van issues per pagina)
```

### 1.3 Nederlandse Vertalingen (KILLER FEATURE)

**DIT IS WAT ONS ONDERSCHEIDT.** Het complete vertalingsbestand staat in `/axe-translations-nl.ts` in deze repo. Kopieer dit bestand naar `/src/lib/scanner/translations/nl.ts`.

Dit bestand bevat:
- **93 axe-core regels** volledig vertaald naar begrijpelijk Nederlands
- Per regel: beschrijving, uitleg waarom het belangrijk is, en een concrete fix-suggestie
- **Alle teksten geschreven voor ondernemers, niet voor developers** — geen jargon
- `getTranslation()` helper met fallback voor onbekende regels
- `severityLabelsNL` en `severityDescriptionsNL` voor Nederlandse severity labels
- `wcagCriteriaNL` — alle relevante WCAG-criteria beschreven in het Nederlands

De scanner moet bij elke gevonden issue de Nederlandse vertaling opzoeken en opslaan in de database. Als er geen vertaling is, wordt de fallback gebruikt.

### 1.4 EAA Compliance Mapping

Maak een mapping bestand `/src/lib/scanner/eaa-mapping.ts` dat:
- Elke WCAG 2.1 AA criterium mapped naar de relevante EAA-vereiste
- Een compliance-percentage berekent
- Automatisch een concept-toegankelijkheidsverklaring genereert in het Nederlands
- Duidelijk uitlegt wat de EAA betekent voor de gebruiker

---

## Fase 2: Web Applicatie

### 2.1 Landing Page (`/src/app/page.tsx`)

**Design: Clean, modern, professioneel. Denk Linear/Vercel/PostHog. NIET generic. WCAG AAA compliant (wij moeten het voorbeeld geven).**

- Primaire kleur: donker blauw/teal spectrum (#0F766E of #0D9488 als accent, donkere basis)
- Dark mode default, light mode support
- Mobile-first responsive
- Alle teksten in het Nederlands (maar code in Engels)

Secties:
1. **Hero:** "Bewijs dat je website toegankelijk is." + gratis scan CTA (URL input veld + knop)
2. **Urgentie:** "De EAA is van kracht. Voldoet jouw website?" met countdown/stats
3. **Gratis Quick Scan Widget:** Voer URL in → instant resultaat van 1 pagina (score + top 5 issues)
4. **Features:** Dashboard, monitoring, rapportage, EAA compliance check
5. **Pricing:** 4 tiers (Gratis/Starter/Professional/Bureau) — zie onder
6. **Social proof:** "Gebouwd door Webser, gespecialiseerd in WCAG-compliance sinds [jaar]"
7. **FAQ:** Over EAA, WCAG, hoe de tool werkt, verschil met overlays
8. **Footer:** Links, KvK-nummer, contact, juridische pagina's

### 2.2 Gratis Quick Scan (GROWTH ENGINE)

Route: `/scan` of homepage widget

- Gebruiker voert URL in (geen account nodig)
- Server-side scan van 1 pagina via axe-core
- Resultaat toont: score (0-100), top 5 issues met Nederlandse uitleg, EAA-status
- CTA: "Wil je je hele website scannen? Maak een gratis account aan."
- Rate limit: max 3 scans per IP per dag (om misbruik te voorkomen)
- Resultaat is shareable via URL (voor social media sharing)

### 2.3 Auth Flow (Supabase Auth)

- Registratie (email + wachtwoord)
- Login
- Wachtwoord vergeten
- OAuth: Google + GitHub (optioneel, nice-to-have)
- Na registratie: automatisch een Organization aanmaken (FREE plan)
- Middleware die auth checkt op /dashboard routes

### 2.4 Dashboard (`/dashboard`)

**Overzicht pagina:**
- Welkomstbericht met naam
- Websites lijst met laatste scan-score per website
- Knop: "Website toevoegen" / "Scan starten"
- Overall stats: totaal issues, trend (omhoog/omlaag), compliance percentage
- Recente activiteit feed

**Website detail pagina (`/dashboard/websites/[id]`):**
- Huidige score (groot, visueel)
- Score trendlijn over tijd (chart)
- Laatste scan resultaten
- Issues lijst met filtering op: severity, WCAG criterium, pagina
- Knop: "Nieuwe scan starten"
- Instellingen: scan schedule, notificatie preferences

**Scan resultaten pagina (`/dashboard/scans/[id]`):**
- Overall score
- Per-pagina scores (lijst/grid)
- Issues lijst:
  - Elke issue toont: icoon (severity), Nederlandse beschrijving, welk WCAG criterium, waar op de pagina (CSS selector), HTML snippet van het falende element
  - Expandable detail: waarom het belangrijk is + hoe te fixen (in begrijpelijk Nederlands!)
  - Filtering: severity, type, WCAG criterium, pagina
- Export als PDF knop
- EAA compliance status

**Website instellingen pagina:**
- Scan schedule: dagelijks/wekelijks/maandelijks
- Notificaties: email bij score-daling, bij nieuwe critical issues
- Website verwijderen

### 2.5 Pricing Pagina (`/pricing`)

| | Gratis | Starter (€49/mo) | Professional (€149/mo) | Bureau (€299/mo) |
|---|---|---|---|---|
| Websites | 1 | 3 | 10 | 50 |
| Pagina's per scan | 5 | 100 | 500 | 500 |
| Scan frequentie | Maandelijks | Wekelijks | Dagelijks | Dagelijks |
| Rapportage | Basis | PDF export | PDF + white-label | PDF + white-label + API |
| E-mail alerts | ❌ | ✅ | ✅ | ✅ |
| EAA verklaring | ❌ | ✅ | ✅ | ✅ |
| Trendanalyse | ❌ | ✅ | ✅ | ✅ |
| Priority support | ❌ | ❌ | ✅ | ✅ |
| API toegang | ❌ | ❌ | ❌ | ✅ |
| White-label | ❌ | ❌ | ✅ | ✅ |
| Team members | 1 | 2 | 5 | Onbeperkt |

Jaarlijks: 2 maanden gratis (= ~17% korting).

---

## Fase 3: Business Logic

### 3.1 Mollie Integratie (COMPLETE IMPLEMENTATIE)

Mollie is de betalingsprovider. De gebruiker voert alleen een `MOLLIE_API_KEY` in en alles werkt.

**Dependency:** `@mollie/api-client`

**Stap 1: Plans definities (`/src/lib/mollie/plans.ts`)**

```typescript
export const PLANS = {
  FREE: {
    name: "Gratis",
    price: 0,
    maxWebsites: 1,
    maxPagesPerScan: 5,
    scanFrequency: "MONTHLY" as const,
    features: {
      emailAlerts: false,
      pdfExport: false,
      eaaStatement: false,
      trendAnalysis: false,
      prioritySupport: false,
      apiAccess: false,
      whiteLabel: false,
      maxTeamMembers: 1,
    },
  },
  STARTER: {
    name: "Starter",
    monthlyPrice: 4900, // cents
    yearlyPrice: 40800, // cents (= 10 maanden, 2 gratis)
    mollieMonthlyId: process.env.MOLLIE_STARTER_MONTHLY_ID!,
    mollieYearlyId: process.env.MOLLIE_STARTER_YEARLY_ID!,
    maxWebsites: 3,
    maxPagesPerScan: 100,
    scanFrequency: "WEEKLY" as const,
    features: {
      emailAlerts: true,
      pdfExport: true,
      eaaStatement: true,
      trendAnalysis: true,
      prioritySupport: false,
      apiAccess: false,
      whiteLabel: false,
      maxTeamMembers: 2,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    monthlyPrice: 14900,
    yearlyPrice: 124200,
    mollieMonthlyId: process.env.MOLLIE_PROFESSIONAL_MONTHLY_ID!,
    mollieYearlyId: process.env.MOLLIE_PROFESSIONAL_YEARLY_ID!,
    maxWebsites: 10,
    maxPagesPerScan: 500,
    scanFrequency: "DAILY" as const,
    features: {
      emailAlerts: true,
      pdfExport: true,
      eaaStatement: true,
      trendAnalysis: true,
      prioritySupport: true,
      apiAccess: false,
      whiteLabel: true,
      maxTeamMembers: 5,
    },
  },
  BUREAU: {
    name: "Bureau",
    monthlyPrice: 29900,
    yearlyPrice: 249200,
    mollieMonthlyId: process.env.MOLLIE_BUREAU_MONTHLY_ID!,
    mollieYearlyId: process.env.MOLLIE_BUREAU_YEARLY_ID!,
    maxWebsites: 50,
    maxPagesPerScan: 500,
    scanFrequency: "DAILY" as const,
    features: {
      emailAlerts: true,
      pdfExport: true,
      eaaStatement: true,
      trendAnalysis: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true,
      maxTeamMembers: 999, // onbeperkt
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export function getPlanLimits(planType: PlanType) {
  return PLANS[planType];
}

export function canStartScan(planType: PlanType, currentWebsiteCount: number): boolean {
  return currentWebsiteCount <= PLANS[planType].maxWebsites;
}
```

**Stap 2: Mollie Client (`/src/lib/mollie/client.ts`)**

```typescript
import createMollieClient from "@mollie/api-client";

export const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY!,
});
```

**Stap 3: Checkout Flow (upgrade van FREE naar betaald)**

Route: `POST /api/mollie/checkout`

Flow:
1. User klikt "Upgrade naar Starter" op pricing pagina
2. API maakt een Mollie customer aan (of hergebruikt bestaande)
3. API maakt een eerste betaling aan via `mollieClient.payments.create()` met:
   - `amount`: eerste maand/jaar bedrag
   - `method`: ["ideal", "creditcard", "bancontact"] (user kiest in Mollie checkout)
   - `redirectUrl`: `https://siteproof.nl/dashboard/settings/billing?status=success`
   - `webhookUrl`: `https://siteproof.nl/api/webhooks/mollie`
   - `metadata`: `{ organizationId, planType, interval: "monthly" | "yearly" }`
   - `sequenceType`: "first" (dit maakt een SEPA mandaat aan voor toekomstige incasso's)
4. User wordt geredirect naar Mollie checkout (iDEAL, creditcard, etc.)
5. Na betaling: redirect terug naar SiteProof
6. Webhook ontvangt bevestiging → maak subscription aan

**Stap 4: Subscription aanmaken na eerste betaling**

In de webhook handler, als de eerste betaling succesvol is:
```typescript
// Na succesvolle "first" betaling:
const subscription = await mollieClient.customerSubscriptions.create({
  customerId: customer.id,
  amount: { currency: "EUR", value: "49.00" },
  interval: "1 month", // of "1 year"
  description: `SiteProof ${planName} abonnement`,
  webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
  metadata: { organizationId, planType },
});

// Update database:
await prisma.organization.update({
  where: { id: organizationId },
  data: {
    planType: "STARTER",
    mollieCustomerId: customer.id,
    mollieSubscriptionId: subscription.id,
    mollieCurrentPeriodEnd: calculatePeriodEnd(interval),
  },
});
```

**Stap 5: Webhook Handler (`/api/webhooks/mollie/route.ts`)**

Mollie stuurt een POST met `id` (payment ID). Je moet de payment ophalen en checken:

```typescript
export async function POST(request: Request) {
  const body = await request.formData();
  const paymentId = body.get("id") as string;

  const payment = await mollieClient.payments.get(paymentId);

  switch (payment.status) {
    case "paid":
      if (payment.sequenceType === "first") {
        // Eerste betaling succesvol → subscription aanmaken (zie stap 4)
        await createSubscription(payment);
      } else {
        // Recurring betaling succesvol → period verlengen
        await extendSubscriptionPeriod(payment);
      }
      break;

    case "failed":
    case "expired":
      // Betaling mislukt → stuur email, plan NIET direct downgraden
      // Geef 3 dagen grace period
      await handleFailedPayment(payment);
      break;

    case "canceled":
      // Subscription geannuleerd → downgrade naar FREE na huidige periode
      await handleCancellation(payment);
      break;
  }

  return new Response("OK", { status: 200 });
}
```

BELANGRIJK: Mollie webhooks bevatten ALLEEN het payment ID. Je moet ALTIJD de payment ophalen via de API om de status te verifiëren. Vertrouw NOOIT op de webhook body alleen.

**Stap 6: Billing Pagina (`/dashboard/settings/billing`)**

Dit is de eigen customer portal die we bouwen omdat Mollie er geen heeft:

De pagina toont:
- Huidig plan (naam + prijs)
- Volgende factuurdatum
- Betaalmethode (iDEAL / SEPA / creditcard — opgehaald via Mollie API)
- Factuurgeschiedenis (lijst van payments via `mollieClient.customerPayments.list()`)
- Knoppen:
  - "Upgrade" → naar pricing pagina met huidige plan highlighted
  - "Downgrade" → bevestigingsdialoog ("Je plan wordt gewijzigd aan het einde van je huidige periode")
  - "Abonnement opzeggen" → bevestigingsdialoog met reden-selectie → `mollieClient.customerSubscriptions.cancel()`
  - "Betaalmethode wijzigen" → start een nieuwe "first" betaling van €0,01 (Mollie minimum) om nieuw mandaat aan te maken

Downgrade/opzegging logica:
- Bij opzegging: plan blijft actief tot einde van de betaalde periode (`mollieCurrentPeriodEnd`)
- Daarna automatisch naar FREE plan (cron job checkt dit)
- Bij downgrade: zelfde — wijziging gaat in bij volgende factuurdatum
- Grace period: bij mislukte betaling 7 dagen wachten, 3 reminder emails, dan pas downgrade

**Stap 7: Plan Enforcement**

Bij elke actie die plan-gelimiteerd is, check:
```typescript
async function enforcePlanLimits(organizationId: string, action: "addWebsite" | "startScan" | "addMember") {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { websites: true, members: true },
  });

  const limits = getPlanLimits(org.planType);

  switch (action) {
    case "addWebsite":
      if (org.websites.length >= limits.maxWebsites) {
        throw new Error(`Je huidige plan (${limits.name}) staat maximaal ${limits.maxWebsites} websites toe. Upgrade je plan om meer websites toe te voegen.`);
      }
      break;
    case "startScan":
      // Check pages limit
      break;
    case "addMember":
      if (org.members.length >= limits.features.maxTeamMembers) {
        throw new Error(`Je huidige plan staat maximaal ${limits.features.maxTeamMembers} teamleden toe.`);
      }
      break;
  }
}
```

**Mollie Dashboard setup (handmatig door Senna):**
1. Maak een Mollie account aan op mollie.com
2. Doorloop de verificatie (KvK-nummer, bankrekening, ID)
3. In het dashboard: schakel iDEAL, creditcard, SEPA in
4. Noteer je Live API key → `MOLLIE_API_KEY`
5. De subscription plan IDs worden aangemaakt door de code bij de eerste checkout

Dat is het. Key invoeren, klaar.

### 3.2 Scan Scheduling

- Cron job (via Vercel Cron of aparte worker) die ScanSchedule tabel checkt
- Maakt automatisch nieuwe scan jobs aan in BullMQ
- Respecteert plan limits

### 3.3 Email Notificaties (Resend)

Templates (HTML, in het Nederlands):
- Welkomstmail na registratie
- Scan voltooid (met score en link naar resultaten)
- Score gedaald alert
- Nieuwe critical issues alert
- Wekelijks rapport (samenvatting alle websites)
- Subscription bevestiging/wijziging

### 3.4 PDF Rapport Generatie

Met @react-pdf/renderer:
- SiteProof branding (of white-label voor Bureau plan)
- Samenvatting: score, compliance status, aantal issues per severity
- Per pagina: score + issues
- Per issue: beschrijving, locatie, fix-suggestie
- EAA compliance checklist
- Gegenereerde toegankelijkheidsverklaring

---

## Fase 4: SEO & Growth Pages

### 4.1 SEO Landingspagina's (statisch, SSG)

Maak deze pagina's met goede Nederlandse content (placeholder tekst is ok, ik schrijf later definitieve content):

- `/wcag-checker` — "Gratis WCAG Checker — Test je website"
- `/eaa-compliance` — "European Accessibility Act — Voldoet jouw bedrijf?"
- `/toegankelijkheid-testen` — "Website Toegankelijkheid Testen"
- `/toegankelijkheidsverklaring` — "Toegankelijkheidsverklaring Generator"
- `/wcag-richtlijnen` — "WCAG 2.1 Richtlijnen Uitgelegd"
- `/prijzen` — Redirect naar /pricing
- `/blog` — Blog overzicht + individuele post pagina's (content via admin CMS)

Meta titles en descriptions per pagina (geoptimaliseerd voor Nederlandse zoektermen).

### 4.2 Structured Data

- Organization schema op homepage
- SoftwareApplication schema
- FAQ schema op relevante pagina's
- BreadcrumbList op alle pagina's

---

## Fase 5: Admin Panel (voor Senna om alles te beheren)

Ik (Senna) moet ALLES kunnen beheren vanuit een admin panel op `/admin`. Geen code aanpassen voor een blogpost, geen database queries voor klantoverzicht. Eén plek voor het hele bedrijf.

### 5.1 Admin Auth & Beveiliging

- Alleen toegankelijk voor users met `isAdmin: true` (apart veld op User model)
- Middleware check op alle `/admin` routes
- Geen link naar admin vanuit de publieke site of het klant-dashboard
- Toegang via directe URL: `siteproof.nl/admin`

### 5.2 Admin Dashboard (`/admin`)

Overzichtspagina met:
- **KPI's bovenaan:** MRR (berekend uit actieve subscriptions), totaal klanten, actieve scans vandaag, nieuwe signups deze week
- **Grafiek:** MRR trend over tijd (lijn), nieuwe klanten per week (bar)
- **Recente activiteit:** Laatste signups, laatste scans, laatste betalingen
- **Quick actions:** Blogpost schrijven, klant bekijken, handmatige scan starten

### 5.3 Blog CMS (`/admin/blog`)

Volledig blog-beheersysteem zodat ik content kan publiceren zonder code aan te raken:

**Blog overzicht:**
- Lijst van alle posts: titel, status (draft/published), publicatiedatum, views
- Zoeken en filteren
- Knoppen: "Nieuwe post", "Bewerk", "Verwijder"

**Blog editor (`/admin/blog/new` en `/admin/blog/[id]/edit`):**
- Titel veld
- Slug veld (auto-generated van titel, handmatig aanpasbaar)
- Rich text editor met Markdown support (gebruik TipTap of Novel editor)
  - Headings, bold, italic, links, afbeeldingen, code blocks, quotes
  - Afbeelding upload naar Supabase Storage
- Meta description veld (voor SEO)
- Featured image upload
- Categorie selectie (maak categorieën aan: "WCAG", "EAA", "Tutorials", "Nieuws")
- Tags (vrij invoerbaar)
- Status toggle: Draft / Published
- Publicatiedatum picker (voor scheduled publishing)
- Preview knop (opent post in nieuw tabblad zoals bezoekers het zien)
- "Publiceer" / "Opslaan als concept" knoppen
- CTA-blok optie: voeg automatisch de gratis scan widget toe onderaan elke post

**Blog frontend (`/blog` en `/blog/[slug]`):**
- Blog overzicht met cards (featured image, titel, excerpt, datum)
- Categoriefilter
- Individuele post pagina met:
  - Nette typografie (prose styling)
  - Leestijd indicator
  - Inhoudsopgave (auto-generated van headings)
  - Gratis scan CTA widget onderaan
  - Gerelateerde posts
  - Structured data (Article schema)
  - Open Graph tags met featured image

### 5.4 Klantenbeheer (`/admin/customers`)

- Lijst van alle organisaties: naam, plan, MRR, aantal websites, signup datum, laatste activiteit
- Zoeken en filteren op plan type
- Klik door naar detail:
  - Organisatie info + leden
  - Alle websites + laatste scan scores
  - Betaalgeschiedenis (Mollie data)
  - Plan handmatig wijzigen (voor speciale deals)
  - Notities veld (voor mijn eigen aantekeningen over de klant)
- Export naar CSV

### 5.5 Scan Monitoring (`/admin/scans`)

- Live overzicht van draaiende scans
- Queue status (BullMQ jobs: waiting, active, completed, failed)
- Failed scans met error logs
- Mogelijkheid om een scan te herstarten
- Handmatig een scan starten voor elke URL (zonder account/limits)

### 5.6 Analytics (`/admin/analytics`)

- Gratis scans per dag (hoeveel leads komen er binnen)
- Conversie: gratis scan → registratie → betaald (funnel)
- Populairste blogposts (page views, via simpele view counter)
- Top zoektermen die naar de site leiden (als je later Search Console koppelt)
- Churn: welke klanten hebben opgezegd en wanneer

### 5.7 SEO Pagina's Beheer (`/admin/pages`)

- Lijst van alle statische SEO-pagina's (wcag-checker, eaa-compliance, etc.)
- Per pagina: titel, meta description, en content aanpasbaar via dezelfde rich text editor als blog
- Zo kan ik SEO-pagina's optimaliseren zonder code te pushen

### 5.8 Instellingen (`/admin/settings`)

- Algemene site-instellingen: bedrijfsnaam, contactemail, KvK-nummer
- Email templates bekijken/testen (stuur test-email naar mezelf)
- Mollie connectie status
- Feature flags: onderhoudsmodus, registratie open/dicht

### Database uitbreiding voor admin/blog

Voeg toe aan het Prisma schema:

```prisma
model BlogPost {
  id              String    @id @default(uuid())
  title           String
  slug            String    @unique
  excerpt         String?
  content         String    // Markdown/HTML content
  featuredImage   String?   // URL naar Supabase Storage
  metaDescription String?
  category        String?
  tags            String[]
  status          PostStatus @default(DRAFT)
  publishedAt     DateTime?
  viewCount       Int       @default(0)
  authorId        String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  author          User     @relation(fields: [authorId], references: [id])

  @@index([slug])
  @@index([status, publishedAt])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
}

model SeoPage {
  id              String   @id @default(uuid())
  slug            String   @unique
  title           String
  metaDescription String?
  content         String   // Markdown/HTML
  updatedAt       DateTime @updatedAt
}

model CustomerNote {
  id              String   @id @default(uuid())
  organizationId  String
  content         String
  createdAt       DateTime @default(now())

  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

En voeg aan het User model toe:
```prisma
  isAdmin         Boolean  @default(false)
  blogPosts       BlogPost[]
```

En aan Organization:
```prisma
  notes           CustomerNote[]
```

---

## Design & UX Specificaties

### Verplichte toegankelijkheid (WCAG 2.1 AAA — wij moeten het voorbeeld geven!)

- Focus indicators op ALLE interactieve elementen
- Skip-to-content link
- Alle afbeeldingen met alt-teksten
- ARIA labels waar nodig
- Kleurcontrast minimaal 7:1 (AAA)
- Keyboard navigatie overal
- Reduced motion support (@prefers-reduced-motion)
- Screen reader tested (structurele HTML)
- Lang attribuut: `<html lang="nl">`
- Logische heading-hiërarchie

### Visueel

- **Font:** Gebruik iets met karakter — geen Inter/Roboto/Arial. Denk aan: General Sans, Satoshi, Cabinet Grotesk, Outfit, of Plus Jakarta Sans via Google Fonts.
- **Kleurenpalet:** Dark-first. Donkere basis (#0a0a0a / #121212), teal/cyan accent (#0D9488 / #14B8A6), wit voor tekst. Rode accent voor critical issues, oranje voor serious, geel voor moderate, blauw voor minor.
- **Componenten:** shadcn/ui als basis, maar customized naar het SiteProof design system.
- **Score weergave:** Circulaire progress indicator (denk aan Lighthouse score). Groen (80-100), geel (50-79), rood (0-49).
- **Animaties:** Subtiel. Score telt op bij laden. Issues faden in. Geen overkill.
- **Dark mode:** Default. Light mode als toggle.

---

## i18n Structuur

Alle UI-teksten in `/src/lib/i18n/nl.ts`:

```typescript
export const nl = {
  common: {
    appName: "SiteProof",
    tagline: "Bewijs dat je website toegankelijk is.",
    scanButton: "Scan je website",
    // ...
  },
  landing: {
    heroTitle: "Bewijs dat je website toegankelijk is.",
    heroSubtitle: "De EAA is van kracht. Scan je website op WCAG 2.1 AA en ontvang een helder rapport met concrete verbeterpunten — in begrijpelijk Nederlands.",
    ctaPlaceholder: "https://jouwwebsite.nl",
    ctaButton: "Gratis scannen",
    // ...
  },
  dashboard: { /* ... */ },
  scan: { /* ... */ },
  pricing: { /* ... */ },
  // etc.
};
```

---

## Environment Variables (.env.example)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Database
DATABASE_URL=
DIRECT_URL=

# Redis (voor BullMQ + rate limiting)
REDIS_URL=
# Of Upstash (serverless Redis, werkt met Vercel)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Mollie
MOLLIE_API_KEY=
MOLLIE_WEBHOOK_SECRET=
MOLLIE_STARTER_MONTHLY_ID=
MOLLIE_STARTER_YEARLY_ID=
MOLLIE_PROFESSIONAL_MONTHLY_ID=
MOLLIE_PROFESSIONAL_YEARLY_ID=
MOLLIE_BUREAU_MONTHLY_ID=
MOLLIE_BUREAU_YEARLY_ID=

# Resend
RESEND_API_KEY=
EMAIL_FROM=noreply@siteproof.nl

# App
NEXT_PUBLIC_APP_URL=https://siteproof.nl
NEXT_PUBLIC_APP_NAME=SiteProof
ADMIN_EMAIL=senna@webser.nl

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Cron secret (Vercel cron authentication)
CRON_SECRET=
```

---

## Projectstructuur

```
siteproof/
├── prisma/
│   └── schema.prisma
├── public/
│   ├── favicon.ico
│   ├── og-image.png
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout (fonts, metadata, providers)
│   │   ├── page.tsx                  # Landing page
│   │   ├── pricing/page.tsx
│   │   ├── wcag-checker/page.tsx     # SEO landing
│   │   ├── eaa-compliance/page.tsx   # SEO landing
│   │   ├── toegankelijkheid-testen/page.tsx
│   │   ├── blog/
│   │   │   ├── page.tsx              # Blog overzicht
│   │   │   └── [slug]/page.tsx       # Individuele blog post
│   │   ├── admin/
│   │   │   ├── layout.tsx            # Admin shell (sidebar, auth check)
│   │   │   ├── page.tsx              # Admin dashboard (KPIs, MRR, activiteit)
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx          # Blog posts overzicht
│   │   │   │   ├── new/page.tsx      # Nieuwe post editor
│   │   │   │   └── [id]/edit/page.tsx # Post bewerken
│   │   │   ├── customers/
│   │   │   │   ├── page.tsx          # Klanten lijst
│   │   │   │   └── [id]/page.tsx     # Klant detail
│   │   │   ├── scans/page.tsx        # Scan monitoring + queue status
│   │   │   ├── analytics/page.tsx    # Funnel, views, churn
│   │   │   ├── pages/
│   │   │   │   ├── page.tsx          # SEO pagina's lijst
│   │   │   │   └── [id]/edit/page.tsx # SEO pagina bewerken
│   │   │   └── settings/page.tsx     # Site instellingen
│   │   ├── privacy/page.tsx          # Privacyverklaring
│   │   ├── cookies/page.tsx          # Cookieverklaring
│   │   ├── voorwaarden/page.tsx      # Algemene Voorwaarden
│   │   ├── api-docs/page.tsx         # API documentatie (Bureau tier)
│   │   ├── scan/
│   │   │   ├── page.tsx              # Free quick scan page
│   │   │   └── resultaat/[id]/page.tsx # Deelbaar scan resultaat (public)
│   │   ├── not-found.tsx             # Custom 404
│   │   ├── error.tsx                 # Custom 500
│   │   ├── sitemap.ts                # Dynamic sitemap generation
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── callback/route.ts
│   │   ├── dashboard/
│   │   │   ├── layout.tsx            # Dashboard shell (sidebar, nav)
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── websites/
│   │   │   │   ├── page.tsx          # Websites list
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Website detail + scan history
│   │   │   │       └── settings/page.tsx
│   │   │   ├── scans/
│   │   │   │   └── [id]/page.tsx     # Scan results detail
│   │   │   ├── reports/page.tsx      # PDF reports overview
│   │   │   └── settings/
│   │   │       ├── page.tsx          # Org settings
│   │   │       └── billing/page.tsx  # Subscription management
│   │   └── api/
│   │       ├── scan/
│   │       │   ├── quick/route.ts    # Free quick scan (no auth)
│   │       │   └── start/route.ts    # Start full scan (auth required)
│   │       ├── og/
│   │       │   └── scan/[id]/route.ts # Dynamic OG image generation
│   │       ├── v1/                   # Public API (Bureau tier)
│   │       │   ├── scan/route.ts
│   │       │   ├── scan/[id]/route.ts
│   │       │   ├── websites/route.ts
│   │       │   └── websites/[id]/route.ts
│   │       ├── webhooks/
│   │       │   └── mollie/route.ts
│   │       └── cron/
│   │           └── schedule/route.ts  # Vercel cron for scheduled scans
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── landing/                  # Landing page components
│   │   ├── dashboard/                # Dashboard components
│   │   ├── scan/                     # Scan result components
│   │   ├── admin/                    # Admin panel components
│   │   ├── cookie-consent.tsx        # Cookie consent banner (Telecommunicatiewet)
│   │   ├── scan-widget.tsx           # Herbruikbare gratis scan widget (landing + blog + SEO pages)
│   │   └── layout/                   # Shared layout components (header, footer, sidebar)
│   ├── lib/
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser client
│   │   │   ├── server.ts             # Server client
│   │   │   └── middleware.ts
│   │   ├── mollie/
│   │   │   ├── client.ts
│   │   │   ├── plans.ts              # Plan definitions + limits
│   │   │   └── webhooks.ts
│   │   ├── scanner/
│   │   │   ├── crawler.ts            # URL discovery + crawling
│   │   │   ├── analyzer.ts           # axe-core injection + analysis
│   │   │   ├── score.ts              # Score calculation
│   │   │   ├── queue.ts              # BullMQ job definitions
│   │   │   └── translations/
│   │   │       └── nl.ts             # ALLE axe-core vertalingen Nederlands
│   │   ├── email/
│   │   │   ├── client.ts
│   │   │   └── templates/            # Email templates
│   │   ├── pdf/
│   │   │   └── report.tsx            # PDF report template
│   │   ├── eaa/
│   │   │   ├── mapping.ts            # WCAG → EAA mapping
│   │   │   └── statement.ts          # Toegankelijkheidsverklaring generator
│   │   ├── i18n/
│   │   │   └── nl.ts                 # Alle Nederlandse UI teksten
│   │   ├── rate-limit/
│   │   │   └── index.ts              # Rate limiting via Redis/Upstash
│   │   └── utils/
│   │       ├── cn.ts                 # className utility
│   │       ├── format.ts             # Date/number formatting
│   │       └── og.ts                 # OG image generation helpers
│   └── types/
│       └── index.ts                  # Shared TypeScript types
├── workers/
│   └── scanner.ts                    # Standalone BullMQ worker process
├── middleware.ts                      # Next.js root middleware (auth, admin check, rate limit)
├── .env.example
├── Dockerfile                        # Voor Railway scanner worker
├── vercel.json                       # Cron jobs + security headers
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Bouwvolgorde (volg dit exact)

1. **Project setup:** Next.js, TypeScript, Tailwind, Prisma, Supabase auth, shadcn/ui init
2. **Database:** Prisma schema migreren (alle modellen inclusief BlogPost, SeoPage, etc.)
3. **Middleware:** Supabase auth middleware, admin route protection, rate limiting
4. **Scanner engine:** Puppeteer + axe-core + Nederlandse vertalingen + score berekening
5. **Quick scan API:** `/api/scan/quick` — scan 1 pagina, return resultaten
6. **Landing page:** Met werkende gratis scan widget + OG image
7. **Auth:** Supabase login/registratie + onboarding flow
8. **Dashboard:** Websites CRUD, scan starten, resultaten bekijken
9. **Scan resultaten UI:** Issues lijst, filtering, detail views + deelbare score pagina
10. **Mollie:** Checkout, webhooks, subscription management, eigen billing pagina
11. **Email:** Scan-klaar notificaties, alerts, wekelijks rapport
12. **PDF rapporten:** Generatie + download
13. **Scan scheduling:** Vercel Cron + BullMQ
14. **SEO pagina's:** Statische content pagina's
15. **Admin panel:** Dashboard met KPI's, blog CMS, klantenbeheer, scan monitoring
16. **Juridische pagina's:** Privacy, cookies, voorwaarden + cookie consent banner
17. **EAA compliance:** Mapping + verklaring generator
18. **White-label & API:** Bureau-tier features
19. **Deployment configs:** Vercel, Railway, Docker
20. **Polish:** Error pages, security headers, loading states, edge cases, mobile UX

---

## Fase 6: Juridisch & AVG-compliance

Dit is VERPLICHT voor een Nederlands SaaS-product. Zonder dit kunnen we niet live.

### 6.1 Cookie Consent Banner

- Implementeer een cookie banner onderaan de pagina (NIET een cookie wall — die zijn verboden door de AP)
- Drie niveaus: Noodzakelijk (altijd aan), Analytisch (opt-in), Marketing (opt-in)
- Keuze opslaan in een cookie zelf (geen tracking vóór consent)
- Moet voldoen aan Telecommunicatiewet Art. 11.7a
- Design: subtiel maar zichtbaar, past bij SiteProof design system
- Link naar Cookieverklaring
- "Alles accepteren" en "Alleen noodzakelijk" knoppen + "Voorkeuren aanpassen" link

### 6.2 Juridische Pagina's

Maak deze pagina's aan met bewerkbare content via het admin panel (SeoPage model):

**Privacyverklaring (`/privacy`):**
- Wie we zijn (Webser / SiteProof, KvK-nummer, adres)
- Welke gegevens we verwerken (email, naam, website URLs, scan resultaten)
- Grondslag (uitvoering overeenkomst + gerechtvaardigd belang)
- Bewaartermijnen
- Rechten van betrokkene (inzage, correctie, verwijdering, dataportabiliteit)
- Contact voor privacyvragen
- Verwerkers (Supabase, Mollie, Resend, Vercel, Railway)
- Placeholder tekst die ik kan aanpassen, maar structureel compleet

**Cookieverklaring (`/cookies`):**
- Welke cookies we plaatsen (per categorie)
- Doel per cookie
- Bewaartermijn per cookie
- Hoe cookies uit te schakelen

**Algemene Voorwaarden (`/voorwaarden`):**
- Gebruik Nederland ICT Voorwaarden als basis/structuur
- SaaS-specifieke bepalingen: uptime, aansprakelijkheid, opzegtermijn
- Placeholder content die juridisch gestructureerd is

### 6.3 AVG Rechten

- Account verwijderen knop in `/dashboard/settings` (recht op vergetelheid)
- Data export knop: download al je scan data als JSON/CSV (recht op dataportabiliteit)
- Na account verwijdering: alle persoonlijke data wissen, scan data anonimiseren of verwijderen
- Bevestigingsflow met wachtwoord check voordat account echt verwijderd wordt

### 6.4 Website Footer Vereisten

Elke pagina moet in de footer tonen:
- Webser / SiteProof handelsnaam
- KvK-nummer (placeholder: `[KVK_NUMMER]`)
- BTW-id (placeholder: `[BTW_ID]`)
- Links naar: Privacyverklaring, Cookieverklaring, Algemene Voorwaarden
- Contactgegevens

---

## Fase 7: Growth Features

### 7.1 Deelbare Scan Score (VIRALE LOOP)

Dit is cruciaal voor organische groei:

- Na elke gratis scan: genereer een unieke URL `/scan/resultaat/[id]`
- Deze pagina is publiek toegankelijk (geen auth nodig)
- Toont: score in grote cirkel, top 5 issues, EAA-status
- **Dynamic OG Image:** Genereer via `/api/og/scan/[id]` (Next.js ImageResponse API / @vercel/og):
  - SiteProof logo
  - "siteproof.nl scoort 73/100 op toegankelijkheid"
  - Kleur van de score cirkel (groen/geel/rood)
  - Formaat: 1200x630 (LinkedIn/Twitter optimaal)
- "Deel je score" knoppen: LinkedIn, Twitter/X, kopieer link
- Onder de score: CTA "Wil je je hele website scannen? Maak een gratis account."
- Rate limit: 3 gratis scans per IP per dag

### 7.2 Onboarding Flow

Na registratie, guided setup:

1. **Stap 1:** "Welkom bij SiteProof! Hoe heet je organisatie?" → Organization aanmaken
2. **Stap 2:** "Welke website wil je scannen?" → URL invoeren, Website aanmaken
3. **Stap 3:** "We starten je eerste scan!" → Scan wordt gestart, gebruiker gaat naar dashboard
4. **Stap 4:** Scan draait, dashboard toont progress (live updates via polling of server-sent events)

Geen stappen overslaan. Elke nieuwe gebruiker moet binnen 60 seconden na registratie een scan zien draaien.

### 7.3 White-Label (Bureau Tier)

Voor web-bureaus die SiteProof inzetten voor hun klanten:

- Custom logo upload (vervangt SiteProof logo in dashboard + PDF rapporten)
- Custom primaire kleur
- Custom domein (CNAME setup): `accessibility.hunbureau.nl` → SiteProof
- PDF rapporten met hun branding
- Klanten van het bureau zien het bureau's merk, niet SiteProof
- Instellen via `/dashboard/settings/white-label` (alleen zichtbaar op Bureau plan)

### 7.4 API (Bureau Tier)

REST API voor programmatic access:

- `POST /api/v1/scan` — Start een scan
- `GET /api/v1/scan/:id` — Scan status + resultaten
- `GET /api/v1/websites` — Lijst websites
- `GET /api/v1/websites/:id/scans` — Scan geschiedenis
- `GET /api/v1/websites/:id/issues` — Huidige issues

Auth: API key per organisatie, aanmaken via `/dashboard/settings/api`.
Rate limit: 100 requests per minuut.
Response format: JSON.
Documentatie pagina: `/api-docs` (statische pagina met voorbeelden per endpoint).

---

## Fase 8: Deployment & Infrastructuur

### 8.1 Vercel Configuratie

`vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/schedule",
      "schedule": "0 */6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]
    }
  ]
}
```

### 8.2 Railway Scanner Worker

`Dockerfile` voor de scanner worker:
```dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
CMD ["node", "dist/workers/scanner.js"]
```

De scanner worker draait APART van de Next.js app:
- Vercel: Next.js frontend + API routes
- Railway: Scanner worker (BullMQ consumer) + Redis

### 8.3 Supabase Setup

Buckets aanmaken in Supabase Storage:
- `blog-images` — Featured images en inline afbeeldingen voor blog posts (public)
- `scan-screenshots` — Screenshots van gescande pagina's (private, authenticated)
- `reports` — Gegenereerde PDF rapporten (private, authenticated)
- `white-label` — Custom logo uploads voor Bureau tier (private, authenticated)

### 8.4 Domein & DNS

- siteproof.nl → Vercel (A record / CNAME)
- app.siteproof.nl → Optioneel, of alles op siteproof.nl met `/dashboard` routes
- Vercel SSL automatisch
- Email DNS: SPF + DKIM + DMARC records voor Resend (zodat emails niet in spam belanden)

---

## Fase 9: Error Handling & Edge Cases

### 9.1 Custom Error Pages

- `/not-found.tsx` — 404 pagina: "Deze pagina bestaat niet. Misschien wil je je website scannen?" + scan CTA
- `/error.tsx` — 500 pagina: "Er ging iets mis. We zijn ermee bezig." + link naar homepage
- Beide in SiteProof design, Nederlands

### 9.2 Scanner Edge Cases

De scanner MOET deze situaties afhandelen:
- Website achter HTTP Basic Auth → "Deze website vereist inloggegevens. Voeg deze toe in je website-instellingen."
- Website blokkeert onze User-Agent → retry met standaard Chrome UA
- Website met alleen JavaScript rendering (SPA) → wacht op networkidle0
- SSL-certificaat verlopen → scan toch maar meld het als opmerking
- Website is offline/onbereikbaar → duidelijke foutmelding, geen crash
- Oneindige redirect loops → max 5 redirects, dan stoppen
- Extreem grote pagina's (>10MB) → timeout na 30 seconden per pagina
- Pagina's achter login → overslaan, markeren als "niet gescand (login vereist)"
- iFrames → scan de hoofdpagina, vermeld dat iFrame-content niet gescand is
- PDF/afbeelding URLs in sitemap → overslaan (alleen HTML scannen)

### 9.3 Rate Limiting

Implementeer rate limiting met Upstash Ratelimit of een simpele Redis-based oplossing:
- Quick scan API: 3 requests per IP per dag
- Auth API (login/register): 10 requests per IP per minuut
- Scan start API: per plan limiet (FREE: 1 concurrent, STARTER: 2, PRO: 5, BUREAU: 10)
- Admin API: 60 requests per minuut
- Public API (Bureau): 100 requests per minuut per API key

### 9.4 Notification Preferences

In `/dashboard/settings`:
- Email bij scan voltooid: aan/uit
- Email bij score daling (>10 punten): aan/uit
- Email bij nieuwe critical issues: aan/uit
- Wekelijks samenvattingsrapport: aan/uit
- Alle emails: uit (opt-out everything)

Voeg toe aan Prisma schema:
```prisma
model NotificationPreference {
  id                    String  @id @default(uuid())
  organizationId        String  @unique
  scanCompleted         Boolean @default(true)
  scoreDropAlert        Boolean @default(true)
  criticalIssueAlert    Boolean @default(true)
  weeklyReport          Boolean @default(true)

  organization          Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

En voeg aan Organization toe:
```prisma
  notificationPrefs     NotificationPreference?
```

---

## Dynamische Sitemap

Genereer een dynamische sitemap via `/app/sitemap.ts` (Next.js built-in):
- Alle statische pagina's (homepage, pricing, scan, SEO pagina's)
- Alle gepubliceerde blog posts (uit database)
- Alle publieke scan resultaat pagina's
- Update frequency: dagelijks voor blog, wekelijks voor statische pagina's
- Submit aan Google Search Console na launch

---

## Kwaliteitseisen

- TypeScript strict mode (geen `any`, geen `// @ts-ignore`)
- Alle API endpoints met Zod input validatie
- Proper error handling overal (geen crashes, graceful degradation)
- Loading states en skeleton screens op elke pagina die data fetcht
- Optimistic UI updates waar logisch
- Rate limiting op alle publieke endpoints (zie Fase 9.3)
- Input sanitization op alle user input
- CSRF protection op mutatie-endpoints
- Proper HTTP status codes (200, 201, 400, 401, 403, 404, 429, 500)
- Console logs alleen in development (gebruik Sentry voor production)
- Responsive op alle schermformaten (mobile-first)
- Performance: Landing page < 3s load time (LCP)
- Lighthouse score: 95+ op alle categorieën (Performance, Accessibility, Best Practices, SEO)
- Security headers in vercel.json (zie Fase 8.1)
- Cookie consent VOOR enige tracking/analytics plaatsvinden
- Alle forms met proper validation + error messages in het Nederlands
- Alle knoppen met loading state tijdens async acties
- Debounce op zoek- en filtervelden
- Pagination op alle lijsten (max 25 items per pagina)
- Prisma queries met proper `select` / `include` (geen over-fetching)
- Supabase RLS (Row Level Security) policies op alle tabellen
- API key hashing voor Bureau-tier API keys (nooit plaintext opslaan)

---

## BELANGRIJK

- Denk als een senior developer die een startup lanceert, niet als een tutorial-schrijver
- Maak keuzes en onderbouw ze kort — vraag niet om input
- ALLE code moet production-ready zijn, niet "hier is een voorbeeld"
- Nederlandse markt is prioriteit #1, internationaal komt later
- De scanner is de kern — als die goed werkt hebben we een product
- Wij moeten zelf 100% WCAG AAA compliant zijn (wij zijn het voorbeeld)
- Alle error messages, UI teksten, en tooltips in het Nederlands
- Code comments en variabelen in het Engels

Bouw het.
