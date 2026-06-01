import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://shazamparking.ae";
const SUPABASE_URL = "https://eoknluyunximjlsnyceb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVva25sdXl1bnhpbWpsc255Y2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODE3MzAsImV4cCI6MjA2NzY1NzczMH0.4jSTWaHnman8fJECoz9pJzVp4sOylr-6Bief9fCeAZ8";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/find-parking", changefreq: "weekly", priority: "0.9" },
  { path: "/find-a-parking-space", changefreq: "weekly", priority: "0.8" },
  { path: "/about-us", changefreq: "monthly", priority: "0.7" },
  { path: "/faq", changefreq: "monthly", priority: "0.7" },
  { path: "/news", changefreq: "weekly", priority: "0.8" },
  { path: "/rent-out-your-space", changefreq: "weekly", priority: "0.9" },
  { path: "/calculator", changefreq: "monthly", priority: "0.6" },
  { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/cookies-notice", changefreq: "yearly", priority: "0.3" },
  { path: "/zones/dubai-marina", changefreq: "weekly", priority: "0.7" },
  { path: "/zones/downtown", changefreq: "weekly", priority: "0.7" },
  { path: "/zones/palm-jumeirah", changefreq: "weekly", priority: "0.7" },
  { path: "/zones/business-bay", changefreq: "weekly", priority: "0.7" },
  { path: "/zones/difc", changefreq: "weekly", priority: "0.7" },
  { path: "/zones/deira", changefreq: "weekly", priority: "0.7" },
  // Legacy zone routes for backward compatibility
  { path: "/dubai-marina", changefreq: "weekly", priority: "0.6" },
  { path: "/downtown", changefreq: "weekly", priority: "0.6" },
  { path: "/palm-jumeirah", changefreq: "weekly", priority: "0.6" },
  { path: "/business-bay", changefreq: "weekly", priority: "0.6" },
  { path: "/difc", changefreq: "weekly", priority: "0.6" },
  { path: "/deira", changefreq: "weekly", priority: "0.6" },
];

async function fetchDynamicEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };

  try {
    // Fetch published news articles
    const newsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/news?select=slug,updated_at&status=eq.published&order=publication_date.desc`,
      { headers }
    );
    if (newsRes.ok) {
      const news = await newsRes.json();
      for (const article of news) {
        if (article.slug) {
          entries.push({
            path: `/news/${article.slug}`,
            changefreq: "weekly",
            priority: "0.6",
            lastmod: article.updated_at ? article.updated_at.split("T")[0] : undefined,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch news articles for sitemap:", e);
  }

  try {
    // Fetch approved parking listings
    const listingsRes = await fetch(
      `${SUPABASE_URL}/rest/v1/parking_listings?select=id,updated_at&status=eq.approved&order=created_at.desc`,
      { headers }
    );
    if (listingsRes.ok) {
      const listings = await listingsRes.json();
      for (const listing of listings) {
        if (listing.id) {
          entries.push({
            path: `/parking/${listing.id}`,
            changefreq: "weekly",
            priority: "0.7",
            lastmod: listing.updated_at ? listing.updated_at.split("T")[0] : undefined,
          });
        }
      }
    }
  } catch (e) {
    console.warn("Could not fetch parking listings for sitemap:", e);
  }

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

async function main() {
  const dynamicEntries = await fetchDynamicEntries();
  const allEntries = [...staticEntries, ...dynamicEntries];

  writeFileSync(resolve("public/sitemap.xml"), generateSitemap(allEntries));
  console.log(
    `sitemap.xml written with ${allEntries.length} entries (${staticEntries.length} static + ${dynamicEntries.length} dynamic)`
  );
}

main().catch((err) => {
  console.error("Failed to generate sitemap:", err);
  process.exit(1);
});
