import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import type { IssueSeverity } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PdfScanData {
  scanId: string;
  score: number;
  totalPages: number;
  scannedPages: number;
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  duration: number;
  scanDate: string;
  websiteName: string;
  websiteUrl: string;
  organizationName: string;
  pages: PdfPageData[];
  issues: PdfIssueData[];
  eaaCompliance: {
    percentage: number;
    status: string;
    label: string;
    passedCount: number;
    failedCount: number;
    totalRequired: number;
  };
  branding?: {
    companyName: string;
    primaryColor: string;
  };
}

export interface PdfPageData {
  url: string;
  title: string | null;
  score: number | null;
  issueCount: number;
}

export interface PdfIssueData {
  severity: IssueSeverity;
  description: string;
  helpText: string;
  fixSuggestion: string;
  wcagCriteria: string[];
  wcagLevel: string | null;
  pageUrl: string;
  htmlElement: string | null;
  cssSelector: string | null;
}

// ---------------------------------------------------------------------------
// Fonts — use Helvetica (built-in) for reliability
// ---------------------------------------------------------------------------

// Hyphenation callback — disable hyphenation for Dutch text
Font.registerHyphenationCallback((word) => [word]);

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------

const COLORS = {
  primary: "#0D9488",
  background: "#ffffff",
  text: "#1a1a1a",
  textSecondary: "#6b7280",
  border: "#e5e7eb",
  borderLight: "#f3f4f6",
  scoreGood: "#22c55e",
  scoreModerate: "#eab308",
  scoreBad: "#ef4444",
  severityCritical: "#ef4444",
  severityCriticalBg: "#fef2f2",
  severitySerious: "#f97316",
  severitySeriousBg: "#fff7ed",
  severityModerate: "#eab308",
  severityModerateBg: "#fefce8",
  severityMinor: "#3b82f6",
  severityMinorBg: "#eff6ff",
};

function scoreColor(score: number): string {
  if (score >= 80) return COLORS.scoreGood;
  if (score >= 50) return COLORS.scoreModerate;
  return COLORS.scoreBad;
}

function severityColor(severity: IssueSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return COLORS.severityCritical;
    case "SERIOUS":
      return COLORS.severitySerious;
    case "MODERATE":
      return COLORS.severityModerate;
    case "MINOR":
      return COLORS.severityMinor;
  }
}

function severityBg(severity: IssueSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return COLORS.severityCriticalBg;
    case "SERIOUS":
      return COLORS.severitySeriousBg;
    case "MODERATE":
      return COLORS.severityModerateBg;
    case "MINOR":
      return COLORS.severityMinorBg;
  }
}

function severityLabel(severity: IssueSeverity): string {
  switch (severity) {
    case "CRITICAL":
      return "Kritiek";
    case "SERIOUS":
      return "Serieus";
    case "MODERATE":
      return "Matig";
    case "MINOR":
      return "Minor";
  }
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Goed";
  if (score >= 50) return "Matig";
  return "Onvoldoende";
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: COLORS.text,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 48,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  logo: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  headerDate: {
    fontSize: 8,
    color: COLORS.textSecondary,
  },
  // Title
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  // Score section
  scoreSection: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 16,
  },
  scoreCircleContainer: {
    width: 120,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 8,
    backgroundColor: COLORS.borderLight,
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: "Helvetica-Bold",
  },
  scoreMax: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  statsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statBox: {
    width: "48%",
    padding: 10,
    borderRadius: 6,
    backgroundColor: COLORS.borderLight,
  },
  statLabel: {
    fontSize: 8,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  // Severity summary
  severitySummary: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 24,
  },
  severityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    gap: 4,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityBadgeText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  // Section
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 24,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  // EAA section
  eaaBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  eaaStatus: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  eaaPercentage: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  eaaDetail: {
    fontSize: 8,
    color: COLORS.textSecondary,
    lineHeight: 1.5,
  },
  // Pages table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.borderLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderLight,
  },
  tableCell: {
    fontSize: 8,
  },
  tableCellHeader: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  colPage: { width: "50%" },
  colScore: { width: "20%", textAlign: "center" },
  colIssues: { width: "15%", textAlign: "center" },
  colTime: { width: "15%", textAlign: "right" },
  // Issue card
  issueCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: "hidden",
  },
  issueHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 6,
  },
  issueSeverityLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    color: "#ffffff",
  },
  issueDescription: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  issueBody: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  issueDetail: {
    fontSize: 8,
    color: COLORS.textSecondary,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  issueDetailLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 4,
    marginBottom: 2,
  },
  issueCode: {
    fontSize: 7,
    fontFamily: "Courier",
    backgroundColor: COLORS.borderLight,
    padding: 4,
    borderRadius: 3,
    color: COLORS.textSecondary,
  },
  issueMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  issueMetaText: {
    fontSize: 7,
    color: COLORS.textSecondary,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textSecondary,
  },
  footerPage: {
    fontSize: 7,
    color: COLORS.textSecondary,
  },
});

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function Header({ data }: { data: PdfScanData }) {
  const brandName = data.branding?.companyName || "SiteProof";
  const brandColor = data.branding?.primaryColor || COLORS.primary;

  return (
    <View style={styles.header} fixed>
      <Text style={[styles.logo, { color: brandColor }]}>{brandName}</Text>
      <View style={styles.headerRight}>
        <Text style={styles.headerDate}>Rapport gegenereerd op {data.scanDate}</Text>
        <Text style={styles.headerDate}>{data.websiteUrl}</Text>
      </View>
    </View>
  );
}

function Footer({ data }: { data: PdfScanData }) {
  const brandName = data.branding?.companyName || "SiteProof";

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>
        {brandName} Toegankelijkheidsrapport — {data.websiteName}
      </Text>
      <Text
        style={styles.footerPage}
        render={({ pageNumber, totalPages }) =>
          `Pagina ${pageNumber} van ${totalPages}`
        }
      />
    </View>
  );
}

function ScoreSection({ data }: { data: PdfScanData }) {
  return (
    <View style={styles.scoreSection}>
      <View style={styles.scoreCircleContainer}>
        <Text style={[styles.scoreValue, { color: scoreColor(data.score) }]}>
          {Math.round(data.score)}
        </Text>
        <Text style={styles.scoreMax}>/100</Text>
        <Text style={[styles.scoreLabel, { color: scoreColor(data.score) }]}>
          {scoreLabel(data.score)}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Pagina's gescand</Text>
          <Text style={styles.statValue}>{data.scannedPages}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Totaal issues</Text>
          <Text style={styles.statValue}>{data.totalIssues}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Scan duur</Text>
          <Text style={styles.statValue}>{data.duration}s</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>EAA Compliance</Text>
          <Text style={styles.statValue}>{data.eaaCompliance.percentage}%</Text>
        </View>
      </View>
    </View>
  );
}

function SeveritySummary({ data }: { data: PdfScanData }) {
  const items: { severity: IssueSeverity; count: number }[] = [
    { severity: "CRITICAL", count: data.criticalIssues },
    { severity: "SERIOUS", count: data.seriousIssues },
    { severity: "MODERATE", count: data.moderateIssues },
    { severity: "MINOR", count: data.minorIssues },
  ];

  return (
    <View style={styles.severitySummary}>
      {items
        .filter((item) => item.count > 0)
        .map((item) => (
          <View
            key={item.severity}
            style={[
              styles.severityBadge,
              { backgroundColor: severityBg(item.severity) },
            ]}
          >
            <View
              style={[
                styles.severityDot,
                { backgroundColor: severityColor(item.severity) },
              ]}
            />
            <Text
              style={[
                styles.severityBadgeText,
                { color: severityColor(item.severity) },
              ]}
            >
              {item.count} {severityLabel(item.severity)}
            </Text>
          </View>
        ))}
    </View>
  );
}

function EaaSection({ data }: { data: PdfScanData }) {
  const { eaaCompliance } = data;
  const statusColor =
    eaaCompliance.percentage === 100
      ? COLORS.scoreGood
      : eaaCompliance.percentage >= 75
        ? COLORS.scoreModerate
        : COLORS.scoreBad;

  return (
    <View>
      <Text style={styles.sectionTitle}>EAA Compliance</Text>
      <View style={[styles.eaaBox, { borderColor: statusColor }]}>
        <Text style={[styles.eaaStatus, { color: statusColor }]}>
          {eaaCompliance.label} — {eaaCompliance.percentage}%
        </Text>
        <Text style={styles.eaaPercentage}>
          {eaaCompliance.passedCount} van {eaaCompliance.totalRequired} verplichte
          WCAG-criteria voldaan
        </Text>
        <Text style={styles.eaaDetail}>{eaaCompliance.status}</Text>
      </View>
    </View>
  );
}

function PagesTable({ data }: { data: PdfScanData }) {
  if (data.pages.length === 0) return null;

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Pagina resultaten ({data.pages.length})
      </Text>

      <View style={styles.tableHeader}>
        <Text style={[styles.tableCellHeader, styles.colPage]}>Pagina</Text>
        <Text style={[styles.tableCellHeader, styles.colScore]}>Score</Text>
        <Text style={[styles.tableCellHeader, styles.colIssues]}>Issues</Text>
        <Text style={[styles.tableCellHeader, styles.colTime]}>Laadtijd</Text>
      </View>

      {data.pages.map((page, idx) => (
        <View
          key={idx}
          style={styles.tableRow}
          wrap={false}
        >
          <View style={styles.colPage}>
            <Text style={[styles.tableCell, { fontFamily: "Helvetica-Bold" }]}>
              {page.title || "Zonder titel"}
            </Text>
            <Text style={[styles.tableCell, { color: COLORS.textSecondary, fontSize: 7 }]}>
              {truncateUrl(page.url, 60)}
            </Text>
          </View>
          <Text
            style={[
              styles.tableCell,
              styles.colScore,
              {
                fontFamily: "Helvetica-Bold",
                color: page.score != null ? scoreColor(page.score) : COLORS.textSecondary,
              },
            ]}
          >
            {page.score != null ? Math.round(page.score) : "—"}
          </Text>
          <Text style={[styles.tableCell, styles.colIssues]}>
            {page.issueCount}
          </Text>
          <Text style={[styles.tableCell, styles.colTime, { color: COLORS.textSecondary }]}>
            {/* loadTime is not in PdfPageData, keep consistent */}
            —
          </Text>
        </View>
      ))}
    </View>
  );
}

function IssuesSection({ data }: { data: PdfScanData }) {
  if (data.issues.length === 0) return null;

  // Group by severity for organized display
  const severityOrder: IssueSeverity[] = [
    "CRITICAL",
    "SERIOUS",
    "MODERATE",
    "MINOR",
  ];

  return (
    <View>
      <Text style={styles.sectionTitle}>
        Gevonden issues ({data.totalIssues})
      </Text>

      {severityOrder.map((sev) => {
        const issues = data.issues.filter((i) => i.severity === sev);
        if (issues.length === 0) return null;

        return (
          <View key={sev}>
            <Text
              style={{
                fontSize: 11,
                fontFamily: "Helvetica-Bold",
                color: severityColor(sev),
                marginTop: 12,
                marginBottom: 8,
              }}
            >
              {severityLabel(sev)} ({issues.length})
            </Text>

            {issues.map((issue, idx) => (
              <View key={idx} style={styles.issueCard} wrap={false}>
                <View
                  style={[
                    styles.issueHeader,
                    { backgroundColor: severityBg(sev) },
                  ]}
                >
                  <Text
                    style={[
                      styles.issueSeverityLabel,
                      { backgroundColor: severityColor(sev) },
                    ]}
                  >
                    {severityLabel(sev)}
                  </Text>
                  <Text style={styles.issueDescription}>
                    {issue.description}
                  </Text>
                </View>

                <View style={styles.issueBody}>
                  <Text style={styles.issueDetailLabel}>
                    Waarom is dit belangrijk?
                  </Text>
                  <Text style={styles.issueDetail}>{issue.helpText}</Text>

                  <Text style={styles.issueDetailLabel}>Hoe op te lossen</Text>
                  <Text style={styles.issueDetail}>{issue.fixSuggestion}</Text>

                  {issue.htmlElement && (
                    <View>
                      <Text style={styles.issueDetailLabel}>HTML Element</Text>
                      <Text style={styles.issueCode}>
                        {truncateText(issue.htmlElement, 200)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.issueMeta}>
                    {issue.wcagCriteria.length > 0 && (
                      <Text style={styles.issueMetaText}>
                        WCAG: {issue.wcagCriteria.join(", ")}
                        {issue.wcagLevel ? ` (${issue.wcagLevel})` : ""}
                      </Text>
                    )}
                    <Text style={styles.issueMetaText}>
                      Pagina: {truncateUrl(issue.pageUrl, 40)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Main Document
// ---------------------------------------------------------------------------

export function ScanReport({ data }: { data: PdfScanData }) {
  return (
    <Document
      title={`Toegankelijkheidsrapport — ${data.websiteName}`}
      author={data.branding?.companyName || "SiteProof"}
      subject={`WCAG 2.1 AA scan resultaten voor ${data.websiteUrl}`}
      language="nl"
    >
      {/* Page 1: Summary */}
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <Footer data={data} />

        <Text style={styles.title}>Toegankelijkheidsrapport</Text>
        <Text style={styles.subtitle}>
          {data.websiteName} — {data.websiteUrl}
        </Text>

        <ScoreSection data={data} />
        <SeveritySummary data={data} />
        <EaaSection data={data} />
        <PagesTable data={data} />
      </Page>

      {/* Page 2+: Issues */}
      {data.issues.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Header data={data} />
          <Footer data={data} />
          <IssuesSection data={data} />
        </Page>
      )}

      {/* Final page: Accessibility statement */}
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <Footer data={data} />

        <Text style={styles.sectionTitle}>Toegankelijkheidsverklaring</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 8 }}>
            {data.organizationName}
          </Text>
          <Text style={styles.issueDetail}>
            Website: {data.websiteUrl}
          </Text>
          <Text style={styles.issueDetail}>
            Datum: {data.scanDate}
          </Text>
          <Text style={styles.issueDetail}>
            Status: {data.eaaCompliance.label} — {data.eaaCompliance.percentage}% compliance
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.issueDetailLabel}>Over deze verklaring</Text>
          <Text style={styles.issueDetail}>
            {data.organizationName} streeft ernaar om de website {data.websiteName} toegankelijk
            te maken voor iedereen, in overeenstemming met de European Accessibility Act (EAA /
            Richtlijn (EU) 2019/882) en de Nederlandse implementatie daarvan.
          </Text>
          <Text style={[styles.issueDetail, { marginTop: 4 }]}>
            Deze verklaring is opgesteld op basis van een geautomatiseerde scan uitgevoerd door{" "}
            {data.branding?.companyName || "SiteProof"} op {data.scanDate}.
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.issueDetailLabel}>Nalevingsstatus</Text>
          <Text style={styles.issueDetail}>
            Compliance-percentage: {data.eaaCompliance.percentage}% ·
            Score: {Math.round(data.score)}/100 ·
            Voldoende criteria: {data.eaaCompliance.passedCount} van {data.eaaCompliance.totalRequired} ·
            Niet-voldoende criteria: {data.eaaCompliance.failedCount} van {data.eaaCompliance.totalRequired}
          </Text>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={styles.issueDetailLabel}>Handhaving</Text>
          <Text style={styles.issueDetail}>
            Bij klachten over de toegankelijkheid van deze website kunt u contact opnemen met de
            Autoriteit Consument & Markt (ACM) via{" "}
            <Link src="https://www.acm.nl">www.acm.nl</Link> of telefonisch via 070 722 2000.
          </Text>
        </View>

        <View style={{ marginTop: 24, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: COLORS.border }}>
          <Text style={[styles.footerText, { textAlign: "center" }]}>
            Dit rapport is gegenereerd door {data.branding?.companyName || "SiteProof"} — siteproof.nl
          </Text>
        </View>
      </Page>
    </Document>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + "...";
}

function truncateText(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}
