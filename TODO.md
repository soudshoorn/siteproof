# SiteProof — TODO

## Bestanden klaar
- [x] `CLAUDE.md` — Complete bouwprompt (1.422 regels, 20 fases, 65 subsecties)
- [x] `axe-translations-nl.ts` — 100 axe-core regels vertaald, 27 WCAG-criteria, TypeScript-clean

---

## Stap 1: Domeinen registreren (10 min)
- [x] TransIP of Antagonist account
- [x] siteproof.nl registreren
- [ ] siteproof.com registreren
- [ ] siteproof.eu registreren
- [ ] siteproof.io registreren
- Kosten: ~€35-50 totaal

## Stap 2: Accounts aanmaken (20 min)
- [x] GitHub repo aanmaken (`siteproof`, private)
- [x] Supabase project aanmaken (gratis tier) → noteer URL + anon key + service role key
- [ ] Mollie account aanmaken → verificatie met KvK + bankrekening + ID → noteer API key
- [ ] Resend account aanmaken → domein verifiëren (siteproof.nl) → noteer API key
- [ ] Vercel account aanmaken → koppel GitHub repo
- [ ] Railway account aanmaken (voor scanner worker + Redis)
- [ ] Upstash account aanmaken (serverless Redis, gratis tier) → noteer URL + token

## Stap 3: Repo opzetten (5 min)
- [x] `git init` in lokale map
- [x] `CLAUDE-CODE-PROMPT.md` hernoemen naar `CLAUDE.md` en in root zetten
- [x] `axe-translations-nl.ts` in root zetten
- [x] `.gitignore` aanmaken (node_modules, .env, .next, etc.)
- [x] Push naar GitHub

## Stap 4: Claude Code installeren (5 min)
- [ ] `curl -fsSL https://claude.ai/install.sh | bash`
- [ ] `claude --version` checken
- [ ] Authenticeren met je Claude account
- [x] VS Code extensie installeren (optioneel)

## Stap 5: Bouwen met Claude Code (1-2 weken)
- [ ] `cd siteproof && claude`
- [x] Stap 1: Project setup (Next.js, TypeScript, Tailwind, Prisma, Supabase, shadcn/ui)
- [x] Stap 2: Database schema migreren
- [x] Stap 3: Middleware (auth, admin, rate limiting)
- [x] Stap 4: Scanner engine (Puppeteer + axe-core + vertalingen)
- [x] Stap 5: Quick scan API
- [x] Stap 6: Landing page met werkende scan widget
- [x] Stap 7: Auth flow (login, registratie, wachtwoord vergeten)
- [x] Stap 8: Dashboard (websites CRUD, scans, resultaten)
- [x] Stap 9: Scan resultaten UI + deelbare score pagina
- [x] Stap 10: Mollie integratie (checkout, webhooks, billing pagina)
- [x] Stap 11: Email notificaties
- [x] Stap 12: PDF rapporten
- [x] Stap 13: Scan scheduling (Vercel Cron + BullMQ)
- [x] Stap 14: SEO pagina's
- [x] Stap 15: Admin panel (KPI's, blog CMS, klantenbeheer, scan monitoring)
- [x] Stap 16: Juridische pagina's + cookie consent
- [x] Stap 17: EAA compliance mapping + verklaring generator
- [x] Stap 18: White-label + API (Bureau tier)
- [x] Stap 19: Deployment configs (Vercel, Railway, Docker)
- [x] Stap 20: Polish (error pages, loading states, mobile UX)

## Stap 6: Testen (3-5 dagen)
- [ ] Eigen websites scannen: webser.nl, knus, het rieten dak, datajobs, av sparta
- [ ] Volledige flow testen: registreren → website toevoegen → scannen → resultaten → PDF
- [ ] Mollie test-betaling met eigen bankrekening
- [ ] Email delivery testen (spam check)
- [ ] Mobile testen (iPhone + Android)
- [ ] Lighthouse score checken (doel: 95+ op alles)
- [ ] Nederlandse vertalingen nalopen (hardop voorlezen, snapt je moeder het?)

## Stap 7: Juridisch invullen (1 uur)
- [ ] KvK-nummer en BTW-id invullen in footer
- [ ] Privacyverklaring aanpassen (verwerkers, contactgegevens)
- [ ] Cookieverklaring invullen
- [ ] Algemene voorwaarden aanpassen
- [ ] Overweeg: jurist 30 min laten meekijken (~€100-150)

## Stap 8: DNS & Deployment (30 min)
- [ ] siteproof.nl DNS naar Vercel
- [ ] SPF + DKIM + DMARC records voor Resend (email deliverability)
- [ ] SSL check (Vercel doet dit automatisch)
- [ ] Railway scanner worker deployen
- [ ] Vercel environment variables instellen

## Stap 9: Launch prep (1 dag)
- [ ] Google Search Console instellen + sitemap submitten
- [ ] Eerste 2 blogposts schrijven via admin panel
- [ ] OG image testen (deel een scan op LinkedIn, check preview)
- [ ] Mollie producten aanmaken (6 price IDs: 3 maandelijks + 3 jaarlijks)
- [ ] Admin account instellen (isAdmin: true in database)
- [ ] Backup strategie: Supabase daily backups aanzetten

## Stap 10: Go live & marketing (week 1-4)
- [ ] LinkedIn post 1: "Ik ben 20 en bouw de tool die in NL nog niet bestaat"
- [ ] LinkedIn post 2: EAA uitgelegd in 200 woorden
- [ ] LinkedIn post 3: Screenshot van eerste scan met score
- [ ] 10 web-bureaus benaderen met gratis Bureau-toegang (3 maanden)
- [ ] Eigen klanten hun rapport sturen + Webser-uren aanbieden voor fixes
- [ ] Tool aanmelden bij: Emerce 100, Frankwatching, MKB Servicedesk, AlternativeTo
- [ ] Gastblog pitchen bij Frankwatching
- [ ] Open source axe-translations-nl op GitHub (backlinks + autoriteit)

---

## Accounts overzicht (bewaar dit)

| Dienst | URL | Waarvoor |
|--------|-----|----------|
| TransIP | transip.nl | Domeinen |
| GitHub | github.com | Code repository |
| Supabase | supabase.com | Database + Auth + Storage |
| Mollie | mollie.com | Betalingen (iDEAL, SEPA) |
| Resend | resend.com | Transactional email |
| Vercel | vercel.com | Frontend hosting + Cron |
| Railway | railway.app | Scanner worker + Redis |
| Upstash | upstash.com | Serverless Redis (rate limiting) |
| Sentry | sentry.io | Error monitoring |
| Google Search Console | search.google.com/search-console | SEO monitoring |

---

## Kosten bij launch

| Item | Kosten |
|------|--------|
| 4 domeinen | ~€35-50/jaar |
| Supabase | Gratis (tot 500MB) |
| Mollie | Geen vast bedrag, €0,29 per iDEAL transactie |
| Resend | Gratis (3.000 emails/maand) |
| Vercel | Gratis (hobby tier) |
| Railway | ~€5-10/maand (scanner worker) |
| Upstash | Gratis (10.000 requests/dag) |
| Claude Pro/Max | Heb je al |
| **Totaal** | **~€10-15/maand + €35-50 eenmalig** |
