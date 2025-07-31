import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsArticle {
  id: string
  title: string
  updated_at: string
}

interface ParkingListing {
  id: string
  title: string
  zone: string
  updated_at: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Fetch published news articles
    const { data: newsArticles } = await supabaseClient
      .from('news')
      .select('id, title, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })

    // Fetch approved parking listings
    const { data: parkingListings } = await supabaseClient
      .from('parking_listings')
      .select('id, title, zone, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })

    // Generate current date for static pages
    const currentDate = new Date().toISOString().split('T')[0]

    // Build sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  <!-- Homepage -->
  <url>
    <loc>https://shazamparking.ae/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Main Pages -->
  <url>
    <loc>https://shazamparking.ae/find-parking</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/rent-out-your-space</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/about-us</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/faq</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/calculator</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/news</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Zone Pages -->
  <url>
    <loc>https://shazamparking.ae/zones/downtown</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/zones/dubai-marina</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/zones/business-bay</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/zones/difc</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/zones/deira</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/zones/palm-jumeirah</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Auth Pages -->
  <url>
    <loc>https://shazamparking.ae/auth</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.4</priority>
  </url>

  <!-- Legal Pages -->
  <url>
    <loc>https://shazamparking.ae/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/terms-and-conditions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>https://shazamparking.ae/cookies-notice</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
`

    // Add news articles
    if (newsArticles && newsArticles.length > 0) {
      sitemap += '\n  <!-- News Articles -->\n'
      for (const article of newsArticles) {
        const lastmod = new Date(article.updated_at).toISOString().split('T')[0]
        sitemap += `  <url>
    <loc>https://shazamparking.ae/news/${article.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
`
      }
    }

    // Add parking listings
    if (parkingListings && parkingListings.length > 0) {
      sitemap += '\n  <!-- Parking Listings -->\n'
      for (const listing of parkingListings) {
        const lastmod = new Date(listing.updated_at).toISOString().split('T')[0]
        sitemap += `  <url>
    <loc>https://shazamparking.ae/parking/${listing.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`
      }
    }

    sitemap += '\n</urlset>'

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    })

  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})