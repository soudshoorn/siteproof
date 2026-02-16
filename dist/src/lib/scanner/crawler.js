"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlWebsite = crawlWebsite;
const USER_AGENT = "SiteProof/1.0 (Accessibility Scanner)";
const PAGE_TIMEOUT = 30000;
const MAX_REDIRECTS = 5;
/**
 * Crawl a website starting from the given URL.
 * Discovers pages via sitemap.xml and internal links (BFS).
 * Respects robots.txt and maxPages limit.
 */
async function crawlWebsite(browser, startUrl, maxPages, onProgress) {
    const baseUrl = new URL(startUrl);
    const origin = baseUrl.origin;
    const discovered = new Set();
    const queue = [];
    const errors = [];
    // Normalize and add the start URL
    const normalizedStart = normalizeUrl(startUrl);
    discovered.add(normalizedStart);
    queue.push(normalizedStart);
    // Parse robots.txt
    const robotsRules = await fetchRobotsTxt(browser, origin);
    // Discover URLs from sitemap.xml
    const sitemapUrls = await discoverFromSitemap(browser, origin, robotsRules.sitemapUrls);
    for (const url of sitemapUrls) {
        const normalized = normalizeUrl(url);
        if (!discovered.has(normalized) &&
            isInternalHtmlUrl(normalized, origin) &&
            !isDisallowedByRobots(normalized, origin, robotsRules)) {
            discovered.add(normalized);
            queue.push(normalized);
        }
    }
    // BFS crawl for internal links
    const result = [];
    let index = 0;
    while (index < queue.length && result.length < maxPages) {
        const url = queue[index++];
        result.push(url);
        onProgress?.(result.length, queue.length);
        // Don't crawl for more links if we already have enough URLs queued
        if (queue.length >= maxPages * 2)
            continue;
        try {
            const links = await extractLinks(browser, url, origin);
            for (const link of links) {
                const normalized = normalizeUrl(link);
                if (!discovered.has(normalized) &&
                    isInternalHtmlUrl(normalized, origin) &&
                    !isDisallowedByRobots(normalized, origin, robotsRules)) {
                    discovered.add(normalized);
                    queue.push(normalized);
                }
            }
        }
        catch (error) {
            errors.push({
                url,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return { urls: result.slice(0, maxPages), errors };
}
/**
 * Fetch and parse robots.txt for disallowed paths and sitemap URLs.
 */
async function fetchRobotsTxt(browser, origin) {
    const rules = { disallowed: [], sitemapUrls: [] };
    let page = null;
    try {
        page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        const response = await page.goto(`${origin}/robots.txt`, {
            waitUntil: "networkidle2",
            timeout: 10000,
        });
        if (!response || response.status() !== 200)
            return rules;
        const text = await response.text();
        let isRelevantAgent = false;
        for (const line of text.split("\n")) {
            const trimmed = line.trim();
            if (trimmed.startsWith("#") || trimmed === "")
                continue;
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
                    if (value)
                        rules.sitemapUrls.push(value);
                    break;
            }
        }
    }
    catch {
        // robots.txt not available — allow everything
    }
    finally {
        if (page)
            await page.close();
    }
    return rules;
}
/**
 * Discover URLs from sitemap.xml (supports sitemap index files).
 */
async function discoverFromSitemap(browser, origin, knownSitemapUrls) {
    const sitemapUrls = knownSitemapUrls.length > 0
        ? knownSitemapUrls
        : [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
    const urls = [];
    const processed = new Set();
    for (const sitemapUrl of sitemapUrls) {
        await parseSitemap(browser, sitemapUrl, urls, processed);
    }
    return urls;
}
async function parseSitemap(browser, sitemapUrl, urls, processed, depth = 0) {
    if (depth > 3 || processed.has(sitemapUrl))
        return;
    processed.add(sitemapUrl);
    let page = null;
    try {
        page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        const response = await page.goto(sitemapUrl, {
            waitUntil: "networkidle2",
            timeout: 10000,
        });
        if (!response || response.status() !== 200)
            return;
        const contentType = response.headers()["content-type"] ?? "";
        if (!contentType.includes("xml") &&
            !contentType.includes("text/plain") &&
            !sitemapUrl.endsWith(".xml")) {
            return;
        }
        const text = await response.text();
        // Check for sitemap index (contains <sitemap> tags)
        const sitemapIndexMatches = text.match(/<sitemap>\s*<loc>([^<]+)<\/loc>/gi);
        if (sitemapIndexMatches) {
            for (const match of sitemapIndexMatches) {
                const locMatch = match.match(/<loc>([^<]+)<\/loc>/i);
                if (locMatch?.[1]) {
                    await parseSitemap(browser, locMatch[1].trim(), urls, processed, depth + 1);
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
    }
    catch {
        // Sitemap not available or malformed
    }
    finally {
        if (page)
            await page.close();
    }
}
/**
 * Extract internal links from a page using Puppeteer.
 */
async function extractLinks(browser, url, origin) {
    let page = null;
    try {
        page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        await page.setViewport({ width: 1280, height: 720 });
        let redirectCount = 0;
        page.on("response", (response) => {
            const status = response.status();
            if (status >= 300 && status < 400) {
                redirectCount++;
            }
        });
        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: PAGE_TIMEOUT,
        });
        if (redirectCount > MAX_REDIRECTS) {
            throw new Error(`Te veel redirects (${redirectCount}) bij het laden van ${url}`);
        }
        // Extract all anchor hrefs
        const links = await page.evaluate((pageOrigin) => {
            const anchors = Array.from(document.querySelectorAll("a[href]"));
            return anchors
                .map((a) => {
                try {
                    const href = a.href;
                    // Return only absolute URLs from the same origin
                    if (href.startsWith(pageOrigin))
                        return href;
                    return null;
                }
                catch {
                    return null;
                }
            })
                .filter((href) => href !== null);
        }, origin);
        return links;
    }
    catch (error) {
        throw new Error(`Link-extractie mislukt voor ${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
    finally {
        if (page)
            await page.close();
    }
}
/**
 * Normalize a URL by removing hash, trailing slash, and sorting query params.
 */
function normalizeUrl(url) {
    try {
        const parsed = new URL(url);
        // Remove hash
        parsed.hash = "";
        // Sort query params for consistency
        parsed.searchParams.sort();
        // Remove trailing slash (except for root)
        let pathname = parsed.pathname;
        if (pathname.length > 1 && pathname.endsWith("/")) {
            pathname = pathname.slice(0, -1);
        }
        parsed.pathname = pathname;
        return parsed.toString();
    }
    catch {
        return url;
    }
}
/**
 * Check if a URL is an internal HTML page (not a file download, image, etc.)
 */
function isInternalHtmlUrl(url, origin) {
    try {
        const parsed = new URL(url);
        if (!url.startsWith(origin))
            return false;
        // Skip non-HTML resources
        const skipExtensions = [
            ".pdf", ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".ico",
            ".mp3", ".mp4", ".avi", ".mov", ".wmv", ".flv", ".webm",
            ".zip", ".rar", ".tar", ".gz", ".7z",
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
            ".css", ".js", ".json", ".xml", ".rss", ".atom",
            ".woff", ".woff2", ".ttf", ".eot",
        ];
        const pathname = parsed.pathname.toLowerCase();
        return !skipExtensions.some((ext) => pathname.endsWith(ext));
    }
    catch {
        return false;
    }
}
/**
 * Check if a URL is disallowed by robots.txt rules.
 */
function isDisallowedByRobots(url, origin, rules) {
    try {
        const path = new URL(url).pathname;
        return rules.disallowed.some((disallowed) => {
            if (disallowed.endsWith("*")) {
                return path.startsWith(disallowed.slice(0, -1));
            }
            return path.startsWith(disallowed);
        });
    }
    catch {
        return false;
    }
}
