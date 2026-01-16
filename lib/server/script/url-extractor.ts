/**
 * URL Content Extractor
 * Fetches and extracts readable text content from URLs
 */

import * as cheerio from "cheerio";

export interface ExtractedContent {
  title: string;
  content: string;
  url: string;
}

export async function extractContentFromUrl(url: string): Promise<ExtractedContent> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MotionBlocks/1.0; +https://motionblocks.app)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove unwanted elements
  $("script, style, nav, header, footer, aside, iframe, noscript, svg, form, button").remove();
  $("[role='navigation'], [role='banner'], [role='contentinfo']").remove();
  $(".nav, .navbar, .header, .footer, .sidebar, .menu, .ad, .advertisement, .social-share").remove();

  // Get title
  const title =
    $("meta[property='og:title']").attr("content") ||
    $("meta[name='title']").attr("content") ||
    $("title").text() ||
    "";

  // Try to find main content
  let content = "";

  // Priority: article > main > specific content divs
  const contentSelectors = [
    "article",
    "main",
    "[role='main']",
    ".post-content",
    ".article-content",
    ".entry-content",
    ".content",
    ".post",
    "#content",
    "#main",
  ];

  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      content = element.text();
      break;
    }
  }

  // Fallback to body if no specific content found
  if (!content) {
    content = $("body").text();
  }

  // Clean up the content
  content = content
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/\n\s*\n/g, "\n\n") // Normalize line breaks
    .trim();

  // Limit content length to avoid token limits
  const maxLength = 15000;
  if (content.length > maxLength) {
    content = content.substring(0, maxLength) + "...";
  }

  return {
    title: title.trim(),
    content,
    url,
  };
}

export async function extractContentFromUrls(urls: string[]): Promise<ExtractedContent[]> {
  const results: ExtractedContent[] = [];

  for (const url of urls) {
    try {
      const content = await extractContentFromUrl(url);
      results.push(content);
    } catch (error) {
      console.error(`Failed to extract content from ${url}:`, error);
      results.push({
        title: "Failed to extract",
        content: `Error extracting content from ${url}`,
        url,
      });
    }
  }

  return results;
}
