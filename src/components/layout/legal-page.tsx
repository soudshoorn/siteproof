import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

interface LegalPageProps {
  title: string;
  content: string;
}

/**
 * Renders a legal page with Markdown-like content.
 * Converts basic Markdown to HTML for rendering.
 */
export function LegalPage({ title, content }: LegalPageProps) {
  const html = markdownToHtml(content);

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <article>
          <h1 className="sr-only">{title}</h1>
          <div
            className="prose prose-invert prose-sm sm:prose-base max-w-none
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-2xl prose-h1:sm:text-3xl prose-h1:mb-6
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-muted-foreground prose-p:leading-relaxed
              prose-li:text-muted-foreground
              prose-a:text-primary prose-a:underline prose-a:underline-offset-2
              prose-strong:text-foreground
              prose-em:text-muted-foreground
              prose-table:text-sm
              prose-th:text-left prose-th:text-foreground prose-th:font-semibold prose-th:p-2 prose-th:border-b prose-th:border-border/40
              prose-td:p-2 prose-td:text-muted-foreground prose-td:border-b prose-td:border-border/20
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            "
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
      </main>
      <Footer />
    </>
  );
}

/**
 * Minimal Markdown to HTML converter for legal content.
 * Handles headings, bold, italic, links, lists, tables, code, and paragraphs.
 */
function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const result: string[] = [];
  let inList = false;
  let inTable = false;
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      if (inParagraph) {
        result.push("</p>");
        inParagraph = false;
      }
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      if (inTable) {
        result.push("</tbody></table>");
        inTable = false;
      }
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      if (inParagraph) { result.push("</p>"); inParagraph = false; }
      if (inList) { result.push("</ul>"); inList = false; }
      const level = headingMatch[1].length;
      const id = headingMatch[2].toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      result.push(`<h${level} id="${id}">${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Table rows
    if (line.trim().startsWith("|")) {
      if (inParagraph) { result.push("</p>"); inParagraph = false; }

      // Skip separator row (|---|---|)
      if (line.match(/^\|[\s-:|]+\|$/)) continue;

      const cells = line.split("|").slice(1, -1).map((c) => c.trim());

      if (!inTable) {
        // First row is header
        result.push("<table><thead><tr>");
        cells.forEach((cell) => result.push(`<th>${inlineFormat(cell)}</th>`));
        result.push("</tr></thead><tbody>");
        inTable = true;
      } else {
        result.push("<tr>");
        cells.forEach((cell) => result.push(`<td>${inlineFormat(cell)}</td>`));
        result.push("</tr>");
      }
      continue;
    }

    // Unordered list items
    if (line.match(/^[-*]\s+/)) {
      if (inParagraph) { result.push("</p>"); inParagraph = false; }
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${inlineFormat(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }

    // Ordered list items
    if (line.match(/^\d+\.\s+/)) {
      if (inParagraph) { result.push("</p>"); inParagraph = false; }
      if (!inList) {
        result.push("<ol>");
        inList = true;
      }
      result.push(`<li>${inlineFormat(line.replace(/^\d+\.\s+/, ""))}</li>`);
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      if (inParagraph) { result.push("</p>"); inParagraph = false; }
      result.push("<hr />");
      continue;
    }

    // Regular paragraph
    if (!inParagraph) {
      result.push("<p>");
      inParagraph = true;
    } else {
      result.push("<br />");
    }
    result.push(inlineFormat(line));
  }

  // Close any open tags
  if (inParagraph) result.push("</p>");
  if (inList) result.push("</ul>");
  if (inTable) result.push("</tbody></table>");

  return result.join("\n");
}

/**
 * Handle inline Markdown: bold, italic, links, code
 */
function inlineFormat(text: string): string {
  return text
    // Links: [text](url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Bold: **text**
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    // Italic: *text*
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    // Inline code: `code`
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}
