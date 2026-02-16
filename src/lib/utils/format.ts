const nlDateFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const nlDateTimeFormatter = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const nlRelativeFormatter = new Intl.RelativeTimeFormat("nl-NL", {
  numeric: "auto",
});

export function formatDate(date: Date | string): string {
  return nlDateFormatter.format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return nlDateTimeFormatter.format(new Date(date));
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffSeconds = Math.round(diffMs / 1000);
  const diffMinutes = Math.round(diffSeconds / 60);
  const diffHours = Math.round(diffMinutes / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffSeconds) < 60) {
    return nlRelativeFormatter.format(diffSeconds, "second");
  }
  if (Math.abs(diffMinutes) < 60) {
    return nlRelativeFormatter.format(diffMinutes, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return nlRelativeFormatter.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 30) {
    return nlRelativeFormatter.format(diffDays, "day");
  }
  return formatDate(date);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("nl-NL").format(num);
}

export function formatScore(score: number): string {
  return Math.round(score).toString();
}

export function getScoreColor(score: number): "good" | "moderate" | "bad" {
  if (score >= 80) return "good";
  if (score >= 50) return "moderate";
  return "bad";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Goed";
  if (score >= 50) return "Matig";
  return "Slecht";
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
