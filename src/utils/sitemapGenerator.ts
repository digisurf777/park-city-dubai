import { supabase } from "@/integrations/supabase/client";

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateDynamicSitemap = async (): Promise<string> => {
  const currentDate = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  // Static pages
  const staticPages: SitemapUrl[] = [
    { loc: 'https://shazamparking.ae/', lastmod: currentDate, changefreq: 'daily', priority: 1.0 },
    { loc: 'https://shazamparking.ae/find-parking', lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { loc: 'https://shazamparking.ae/rent-out-your-space', lastmod: currentDate, changefreq: 'weekly', priority: 0.9 },
    { loc: 'https://shazamparking.ae/about-us', lastmod: currentDate, changefreq: 'monthly', priority: 0.7 },
    { loc: 'https://shazamparking.ae/faq', lastmod: currentDate, changefreq: 'monthly', priority: 0.6 },
    { loc: 'https://shazamparking.ae/calculator', lastmod: currentDate, changefreq: 'monthly', priority: 0.6 },
    { loc: 'https://shazamparking.ae/news', lastmod: currentDate, changefreq: 'weekly', priority: 0.7 },
    // Zone pages
    { loc: 'https://shazamparking.ae/zones/downtown', lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://shazamparking.ae/zones/dubai-marina', lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://shazamparking.ae/zones/business-bay', lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://shazamparking.ae/zones/difc', lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://shazamparking.ae/zones/deira', lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    { loc: 'https://shazamparking.ae/zones/palm-jumeirah', lastmod: currentDate, changefreq: 'monthly', priority: 0.8 },
    // Legal pages
    { loc: 'https://shazamparking.ae/privacy-policy', lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { loc: 'https://shazamparking.ae/terms-and-conditions', lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
    { loc: 'https://shazamparking.ae/cookies-notice', lastmod: currentDate, changefreq: 'yearly', priority: 0.3 },
  ];

  urls.push(...staticPages);

  try {
    // Fetch published news articles
    const { data: newsArticles } = await supabase
      .from('news')
      .select('id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    if (newsArticles) {
      newsArticles.forEach(article => {
        urls.push({
          loc: `https://shazamparking.ae/news/${article.id}`,
          lastmod: new Date(article.updated_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    }

    // Fetch approved parking listings
    const { data: parkingListings } = await supabase
      .from('parking_listings')
      .select('id, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (parkingListings) {
      parkingListings.forEach(listing => {
        urls.push({
          loc: `https://shazamparking.ae/parking/${listing.id}`,
          lastmod: new Date(listing.updated_at).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: 0.5
        });
      });
    }

  } catch (error) {
    console.error('Error fetching dynamic content for sitemap:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

export const updateSitemapFile = async () => {
  try {
    const sitemapXml = await generateDynamicSitemap();
    
    // In a real implementation, you would save this to your static sitemap file
    // For now, we'll log it and return it for manual updates
    console.log('Generated sitemap:', sitemapXml);
    
    return sitemapXml;
  } catch (error) {
    console.error('Error updating sitemap:', error);
    throw error;
  }
};