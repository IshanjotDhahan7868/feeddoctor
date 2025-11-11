import { parse as parseUrl } from 'url';

/**
 * Fetch a URL and return HTML text. This helper respects a very basic robots.txt rule: if '/robots.txt' contains 'Disallow: /', we abort.
 */
export async function fetchHtml(url: string): Promise<string | null> {
  try {
    const { protocol, host } = parseUrl(url);
    const robotsUrl = `${protocol}//${host}/robots.txt`;
    try {
      const robotsRes = await fetch(robotsUrl);
      if (robotsRes.ok) {
        const robotsTxt = await robotsRes.text();
        if (/Disallow:\s*\//i.test(robotsTxt)) {
          // Entire site disallowed
          return null;
        }
      }
    } catch {
      // ignore robots fetch errors
    }
    const res = await fetch(url, { headers: { 'User-Agent': 'FeedDoctorBot/1.0' } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/**
 * Very naive HTML parser to extract product names and prices. Uses regex instead of cheerio to keep dependencies minimal.
 */
export function extractProducts(html: string): { title: string; price: string }[] {
  const titles = Array.from(html.matchAll(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi)).map((m) => m[1]);
  const prices = Array.from(html.matchAll(/\$(\d+[\.\d]*)/g)).map((m) => m[0]);
  const results: { title: string; price: string }[] = [];
  for (let i = 0; i < Math.min(titles.length, 5); i++) {
    results.push({ title: titles[i], price: prices[i] || '' });
  }
  return results;
}