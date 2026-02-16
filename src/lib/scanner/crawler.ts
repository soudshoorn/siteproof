import type { Browser, Page } from "puppeteer";

const USER_AGENT = "SiteProof/1.0 (Accessibility Scanner)";
const PAGE_TIMEOUT = 15_000; // 15s for crawling (just link discovery)
const MAX_REDIRECTS = 5;

export interface CrawlResult {
  urls: string[];
  errors: CrawlError[];
}

export interface CrawlError {
  url: string;
  message: string;
}

interface RobotsTxtRules {
  disallowed: string[];
  sitemapUrls: string[];
}

/**
 * Crawl a website starting from the given URL.
 * Discovers pages via sitemap.xml (fast, via fetch) and internal links (BFS with Puppeteer).
 * Respects robots.txt and maxPages limit.
 */
export async function crawlWebsite(
  browser: Browser,
  startUrl: string,
  maxPages: number,
  onProgress?: (scannedPages: number, totalFound: number) => void
): Promise<CrawlResult> {
  const baseUrl = new URL(startUrl);
  const origin = baseUrl.origin;
  const discovered = new Set<string>();
  const queue: string[] = [];
  const errors: CrawlError[] = [];

  // Normalize and add the start URL
  const normalizedStart = normalizeUrl(startUrl);
  discovered.add(normalizedStart);
  queue.push(normalizedStart);

  // Parse robots.txt (fast, via fetch)
  const robotsRules = await fetchRobotsTxt(origin);

  // Discover URLs from sitemap.xml (fast, via fetch — no Puppeteer needed)
  const sitemapUrls = await discoverFromSitemap(origin, robotsRules.sitemapUrls);
  for (const url of sitemapUrls) {
    const normalized = normalizeUrl(url);
    if (
      !discovered.has(normalized) &&
      isInternalHtmlUrl(normalized, origin) &&
      !isDisallowedByRobots(normalized, origin, robotsRules)
    ) {
      discovered.add(normalized);
      queue.push(normalized);
    }
  }

  onProgress?.(0, queue.length);

  // If sitemap gave us enough URLs, skip BFS crawling entirely
  if (queue.length >= maxPages) {
    return { urls: queue.slice(0, maxPages), errors };
  }

  // BFS crawl for internal links (only needed if sitemap didn't have enough)
  const result: string[] = [];
  let index = 0;
  // Limit BFS crawling to avoid spending minutes on link discovery
  const maxBfsCrawls = Math.min(maxPages, 20);
  let bfsCrawlCount = 0;

  while (index < queue.length && result.length < maxPages) {
    const url = queue[index++];
    result.push(url);

    onProgress?.(result.length, Math.max(queue.length, result.length));

    // Don't crawl for more links if we already have enough or hit BFS limit
    if (queue.length >= maxPages * 2 || bfsCrawlCount >= maxBfsCrawls) continue;

    try {
      bfsCrawlCount++;
      const links = await extractLinks(browser, url, origin);

      for (const link of links) {
        const normalized = normalizeUrl(link);
        if (
          !discovered.has(normalized) &&
          isInternalHtmlUrl(normalized, origin) &&
          !isDisallowedByRobots(normalized, origin, robotsRules)
        ) {
          discovered.add(normalized);
          queue.push(normalized);
        }
      }
    } catch (error) {
      errors.push({
        url,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { urls: result.slice(0, maxPages), errors };
}

/**
 * Fetch and parse robots.txt using native fetch (fast, no Puppeteer).
 */
async function fetchRobotsTxt(origin: string): Promise<RobotsTxtRules> {
  const rules: RobotsTxtRules = { disallowed: [], sitemapUrls: [] };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);

    const response = await fetch(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return rules;

    const text = await response.text();
    let isRelevantAgent = false;

    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("#") || trimmed === "") continue;

      const [directive, ...valueParts] = trimmed.split(":");
      const value = valueParts.join(":").trim();

      switch (directive.toLowerCase()) {
        case "user-agent":
          isRelevantAgent = value === "*" || value.toLowerCase().includes("siteproof");
          break;
        case "disallow":
          if (isRelevantAgent && value) {
            rules.disallowed.push(value);
          }
          break;
        case "sitemap":
          if (value) rules.sitemapUrls.push(value);
          break;
      }
    }
  } catch {
    // robots.txt not available — allow everything
  }

  return rules;
}

/**
 * Discover URLs from sitemap.xml using native fetch (much faster than Puppeteer).
 */
async function discoverFromSitemap(
  origin: string,
  knownSitemapUrls: string[]
): Promise<string[]> {
  const sitemapUrls =
    knownSitemapUrls.length > 0
      ? knownSitemapUrls
      : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];

  const urls: string[] = [];
  const processed = new Set<string>();

  for (const sitemapUrl of sitemapUrls) {
    await parseSitemap(sitemapUrl, urls, processed);
  }

  return urls;
}

async function parseSitemap(
  sitemapUrl: string,
  urls: string[],
  processed: Set<string>,
  depth = 0
): Promise<void> {
  if (depth > 3 || processed.has(sitemapUrl)) return;
  processed.add(sitemapUrl);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(sitemapUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) return;

    const contentType = response.headers.get("content-type") ?? "";
    if (
      !contentType.includes("xml") &&
      !contentType.includes("text/plain") &&
      !sitemapUrl.endsWith(".xml")
    ) {
      return;
    }

    const text = await response.text();

    // Check for sitemap index (contains <sitemap> tags)
    const sitemapIndexMatches = text.match(/<sitemap>\s*<loc>([^<]+)<\/loc>/gi);
    if (sitemapIndexMatches) {
      for (const match of sitemapIndexMatches) {
        const locMatch = match.match(/<loc>([^<]+)<\/loc>/i);
        if (locMatch?.[1]) {
          await parseSitemap(locMatch[1].trim(), urls, processed, depth + 1);
        }
      }
    }

    // Extract regular URLs from <url><loc> tags
    const urlMatches = text.match(/<url>\s*<loc>([^<]+)<\/loc>/gi);
    if (urlMatches) {
      for (const match of urlMatches) {
        const locMatch = match.match(/<loc>([^<]+)<\/loc>/i);
        if (locMatch?.[1]) {
          urls.push(locMatch[1].trim());
        }
      }
    }
  } catch {
    // Sitemap not available or malformed
  }
}

/**
 * Extract internal links from a page using Puppeteer.
 */
async function extractLinks(
  browser: Browser,
  url: string,
  origin: string
): Promise<string[]> {
  let page: Page | null = null;
  try {
    page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.setViewport({ width: 1280, height: 720 });

    // Block heavy resources during link discovery
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const type = request.resourceType();
      if (["image", "font", "media", "stylesheet"].includes(type)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    let redirectCount = 0;
    page.on("response", (response) => {
      const status = response.status();
      if (status >= 300 && status < 400) {
        redirectCount++;
      }
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded", // Faster than networkidle2 for link discovery
      timeout: PAGE_TIMEOUT,
    });

    if (redirectCount > MAX_REDIRECTS) {
      throw new Error(`Te veel redirects (${redirectCount}) bij het laden van ${url}`);
    }

    // Extract all anchor hrefs
    const links = await page.evaluate((pageOrigin: string) => {
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      return anchors
        .map((a) => {
          try {
            const href = (a as HTMLAnchorElement).href;
            if (href.startsWith(pageOrigin)) return href;
            return null;
          } catch {
            return null;
          }
        })
        .filter((href): href is string => href !== null);
    }, origin);

    return links;
  } catch (error) {
    throw new Error(
      `Link-extractie mislukt voor ${url}: ${error instanceof Error ? error.message : String(error)}`
    );
  } finally {
    if (page) await page.close();
  }
}

/**
 * Normalize a URL by removing hash, trailing slash, and sorting query params.
 */
function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.searchParams.sort();
    let pathname = parsed.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }
    parsed.pathname = pathname;
    return parsed.toString();
  } catch {
    return url;
  }
}

/**
 * Check if a URL is an internal HTML page (not a file download, image, etc.)
 */
function isInternalHtmlUrl(url: string, origin: string): boolean {
  try {
    if (!url.startsWith(origin)) return false;

    const skipExtensions = [
      ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
      ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm",
      ".zip", ".rar", ".tar", ".gz", ".7z",
      ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
      ".css", ".js", ".json", ".xml", ".rss", ".atom",
      ".woff", ".woff2", ".ttf", ".eot",
    ];

    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    return !skipExtensions.some((ext) => pathname.endsWith(ext));
  } catch {
    return false;
  }
}

/**
 * Check if a URL is disallowed by robots.txt rules.
 */
function isDisallowedByRobots(
  url: string,
  _origin: string,
  rules: RobotsTxtRules
): boolean {
  try {
    const path = new URL(url).pathname;
    return rules.disallowed.some((disallowed) => {
      if (disallowed.endsWith("*")) {
        return path.startsWith(disallowed.slice(0, -1));
      }
      return path.startsWith(disallowed);
    });
  } catch {
    return false;
  }
}
