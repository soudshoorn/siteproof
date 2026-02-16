"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageAnalysisError = void 0;
exports.analyzePage = analyzePage;
const nl_1 = require("./translations/nl");
const score_1 = require("./score");
const USER_AGENT = "SiteProof/1.0 (Accessibility Scanner)";
const PAGE_TIMEOUT = 30000;
/**
 * Analyze a single page for accessibility issues using axe-core.
 * Opens the page in Puppeteer, injects axe-core, runs the analysis,
 * and maps results to Dutch translations.
 */
async function analyzePage(browser, url) {
    let page = null;
    const startTime = Date.now();
    try {
        page = await browser.newPage();
        await page.setUserAgent(USER_AGENT);
        await page.setViewport({ width: 1280, height: 720 });
        // Block unnecessary resources to speed up loading
        await page.setRequestInterception(true);
        page.on("request", (request) => {
            const type = request.resourceType();
            if (["font", "media"].includes(type)) {
                request.abort();
            }
            else {
                request.continue();
            }
        });
        // Navigate to the page
        const response = await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: PAGE_TIMEOUT,
        });
        if (!response) {
            throw new Error(`Geen response ontvangen van ${url}`);
        }
        const statusCode = response.status();
        if (statusCode >= 400) {
            throw new Error(`HTTP ${statusCode} bij laden van ${url}`);
        }
        // Wait for DOM stability (important for SPAs)
        await waitForDomStability(page);
        const loadTime = Date.now() - startTime;
        // Get page title
        const title = await page.title();
        // Inject and run axe-core
        const axeResults = await runAxeCore(page);
        // Map violations to our issue format with Dutch translations
        const issues = mapViolationsToIssues(axeResults.violations, url);
        // Calculate score
        const score = (0, score_1.calculateScore)(issues);
        return {
            url,
            title: title || null,
            score,
            loadTime,
            issues,
        };
    }
    catch (error) {
        const loadTime = Date.now() - startTime;
        throw new PageAnalysisError(url, error instanceof Error ? error.message : String(error), loadTime);
    }
    finally {
        if (page) {
            try {
                await page.close();
            }
            catch {
                // Page might already be closed
            }
        }
    }
}
/**
 * Wait for the DOM to stabilize (no more mutations for 500ms).
 * Important for SPAs that render after initial load.
 */
async function waitForDomStability(page, timeout = 5000) {
    try {
        await page.evaluate((timeoutMs) => {
            return new Promise((resolve) => {
                let timer;
                const observer = new MutationObserver(() => {
                    clearTimeout(timer);
                    timer = setTimeout(() => {
                        observer.disconnect();
                        resolve();
                    }, 500);
                });
                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                    attributes: true,
                });
                // Start the initial timer
                timer = setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, 500);
                // Max timeout
                setTimeout(() => {
                    observer.disconnect();
                    resolve();
                }, timeoutMs);
            });
        }, timeout);
    }
    catch {
        // If the evaluation fails, the page is likely stable enough
    }
}
/**
 * Inject axe-core into the page and run the accessibility analysis.
 */
async function runAxeCore(page) {
    // Read axe-core source and inject it
    const axeCorePath = require.resolve("axe-core");
    const fs = await Promise.resolve().then(() => __importStar(require("fs")));
    const axeSource = fs.readFileSync(axeCorePath, "utf-8");
    await page.evaluate(axeSource);
    // Run axe-core with WCAG 2.1 AA + 2.2 AA tags
    const results = await page.evaluate(() => {
        return new Promise((resolve, reject) => {
            // @ts-expect-error axe is injected globally
            if (typeof axe === "undefined") {
                reject(new Error("axe-core failed to load"));
                return;
            }
            // @ts-expect-error axe is injected globally
            axe
                .run(document, {
                runOnly: {
                    type: "tag",
                    values: [
                        "wcag2a",
                        "wcag2aa",
                        "wcag21a",
                        "wcag21aa",
                        "wcag22aa",
                        "best-practice",
                    ],
                },
                resultTypes: ["violations"],
            })
                .then((r) => resolve(r))
                .catch((e) => reject(e));
        });
    });
    return results;
}
/**
 * Map axe-core violations to our issue format with Dutch translations.
 */
function mapViolationsToIssues(violations, pageUrl) {
    const issues = [];
    for (const violation of violations) {
        const translation = (0, nl_1.getTranslation)(violation.id);
        const severity = (0, score_1.mapAxeSeverity)(violation.impact);
        const wcagCriteria = extractWcagCriteria(violation.tags);
        // Create one issue per affected node (element on the page)
        for (const node of violation.nodes) {
            issues.push({
                axeRuleId: violation.id,
                severity,
                impact: severity,
                wcagCriteria: wcagCriteria.length > 0 ? wcagCriteria : translation.wcagCriteria,
                wcagLevel: translation.wcagLevel,
                description: translation.description,
                helpText: translation.helpText,
                fixSuggestion: translation.fixSuggestion,
                htmlElement: truncateHtml(node.html),
                cssSelector: node.target?.[0] ?? null,
                pageUrl,
            });
        }
    }
    return issues;
}
/**
 * Extract WCAG criteria numbers from axe-core tags.
 * Tags look like: ["wcag2a", "wcag111", "cat.text-alternatives"]
 * We want to extract "1.1.1" from "wcag111".
 */
function extractWcagCriteria(tags) {
    const criteria = [];
    const wcagPattern = /^wcag(\d)(\d)(\d+)$/;
    for (const tag of tags) {
        const match = tag.match(wcagPattern);
        if (match) {
            criteria.push(`${match[1]}.${match[2]}.${match[3]}`);
        }
    }
    return [...new Set(criteria)];
}
/**
 * Truncate HTML snippet to prevent storing huge DOM fragments.
 */
function truncateHtml(html, maxLength = 500) {
    if (html.length <= maxLength)
        return html;
    return html.slice(0, maxLength) + "...";
}
/**
 * Custom error for page analysis failures — preserves URL and load time.
 */
class PageAnalysisError extends Error {
    constructor(url, message, loadTime) {
        super(message);
        this.name = "PageAnalysisError";
        this.url = url;
        this.loadTime = loadTime;
    }
}
exports.PageAnalysisError = PageAnalysisError;
