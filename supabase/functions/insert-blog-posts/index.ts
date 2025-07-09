import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  author: string;
  published_date: string;
  category: string;
  meta_title?: string;
  meta_description?: string;
}

interface ArticleLink {
  url: string;
  title: string;
  date: string;
  author: string;
  category: string;
  excerpt: string;
  featuredImageUrl: string;
}

async function fetchArticleLinks(): Promise<ArticleLink[]> {
  console.log('Fetching main news page...')
  const response = await fetch('https://shazamparking.ae/news/')
  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  
  const articles: ArticleLink[] = []
  
  // Find all article elements
  const articleElements = doc.querySelectorAll('article, .post-preview, .blog-post')
  
  if (articleElements.length === 0) {
    // Fallback - look for any links containing common article patterns
    const allLinks = doc.querySelectorAll('a[href*="shazamparking.ae"]')
    
    for (const link of allLinks) {
      const href = link.getAttribute('href')
      if (href && 
          !href.includes('/news/') && 
          !href.includes('/category/') && 
          !href.includes('/author/') &&
          href.includes('shazamparking.ae') &&
          href.match(/[a-z-]+/)) {
        
        const title = link.textContent?.trim() || 'Untitled'
        
        // Skip if it's not a real article link
        if (title.length < 10 || title.includes('Continue Reading')) continue
        
        articles.push({
          url: href,
          title: title,
          date: new Date().toISOString().split('T')[0], // Default to today
          author: 'admin',
          category: 'ShazamParking',
          excerpt: '',
          featuredImageUrl: ''
        })
      }
    }
  } else {
    // Parse structured article elements
    for (const article of articleElements) {
      const titleEl = article.querySelector('h1, h2, h3, .entry-title, .post-title')
      const linkEl = article.querySelector('a[href*="shazamparking.ae"]')
      const dateEl = article.querySelector('.post-date, .entry-date, time')
      const authorEl = article.querySelector('.author, .post-author')
      const excerptEl = article.querySelector('.excerpt, .post-excerpt, p')
      const imageEl = article.querySelector('img')
      
      if (titleEl && linkEl) {
        const href = linkEl.getAttribute('href')
        if (href) {
          articles.push({
            url: href,
            title: titleEl.textContent?.trim() || 'Untitled',
            date: dateEl?.textContent?.trim() || new Date().toISOString().split('T')[0],
            author: authorEl?.textContent?.trim() || 'admin',
            category: 'ShazamParking',
            excerpt: excerptEl?.textContent?.trim() || '',
            featuredImageUrl: imageEl?.getAttribute('src') || ''
          })
        }
      }
    }
  }
  
  // Manual fallback with known articles from the original site
  if (articles.length === 0) {
    console.log('No articles found via parsing, using manual list...')
    const knownArticles = [
      'https://shazamparking.ae/navigating-parking-near-dubais-newest-megaprojects-a-guide-for-residents-and-visitors/',
      'https://shazamparking.ae/top-5-smart-ways-to-commute-around-dubai-in-2025/',
      'https://shazamparking.ae/top-10-ways-to-meet-new-people-in-dubai/',
      'https://shazamparking.ae/how-to-turn-your-empty-parking-bay-into-monthlypassive-income-with-shazamparking/',
      'https://shazamparking.ae/how-ai-tools-like-chatgpt-are-empowering-uae-consumers-10-real-world-examples/',
      'https://shazamparking.ae/how-to-find-an-apartment-in-dubai-a-practical-guide-for-newcomers-to-the-uae/'
    ]
    
    for (const url of knownArticles) {
      const slug = url.split('/').filter(Boolean).pop() || ''
      const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      
      articles.push({
        url: url,
        title: title,
        date: new Date().toISOString().split('T')[0],
        author: 'admin',
        category: 'ShazamParking',
        excerpt: '',
        featuredImageUrl: ''
      })
    }
  }
  
  console.log(`Found ${articles.length} articles`)
  return articles
}

async function fetchArticleContent(url: string): Promise<Partial<BlogPost> | null> {
  try {
    console.log(`Fetching article: ${url}`)
    const response = await fetch(url)
    const html = await response.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    
    // Extract title
    const titleEl = doc.querySelector('h1.entry-title, h1.post-title, h1, .entry-title, .post-title')
    const title = titleEl?.textContent?.trim() || 'Untitled'
    
    // Extract content
    const contentEl = doc.querySelector('.entry-content, .post-content, .content, article .entry-content, main .entry-content')
    let content = ''
    
    if (contentEl) {
      // Clean up the content - remove script tags, style tags, etc.
      const scripts = contentEl.querySelectorAll('script, style, noscript')
      scripts.forEach(el => el.remove())
      
      content = contentEl.innerHTML || contentEl.textContent || ''
      
      // Convert relative URLs to absolute
      content = content.replace(/src="\/wp-content/g, 'src="https://shazamparking.ae/wp-content')
      content = content.replace(/href="\/(?!http)/g, 'href="https://shazamparking.ae/')
    }
    
    // Extract featured image
    let featuredImage = ''
    const imageEl = doc.querySelector('.wp-post-image, .featured-image img, .post-thumbnail img, .entry-image img, meta[property="og:image"]')
    if (imageEl) {
      featuredImage = imageEl.getAttribute('src') || imageEl.getAttribute('content') || ''
      if (featuredImage && !featuredImage.startsWith('http')) {
        featuredImage = 'https://shazamparking.ae' + featuredImage
      }
    }
    
    // Extract date
    const dateEl = doc.querySelector('time, .post-date, .entry-date, .published')
    let publishedDate = dateEl?.getAttribute('datetime') || dateEl?.textContent || ''
    
    // Parse and format date
    if (publishedDate) {
      try {
        const date = new Date(publishedDate)
        publishedDate = date.toISOString()
      } catch {
        publishedDate = new Date().toISOString()
      }
    } else {
      publishedDate = new Date().toISOString()
    }
    
    // Extract excerpt from meta description or first paragraph
    let excerpt = ''
    const metaDesc = doc.querySelector('meta[name="description"]')
    if (metaDesc) {
      excerpt = metaDesc.getAttribute('content') || ''
    } else {
      const firstP = contentEl?.querySelector('p')
      if (firstP) {
        excerpt = firstP.textContent?.trim().substring(0, 250) + '...' || ''
      }
    }
    
    // Generate slug from URL
    const urlParts = url.split('/')
    const slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1] || title.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    return {
      title,
      slug,
      excerpt,
      content,
      featured_image_url: featuredImage,
      published_date: publishedDate,
      meta_title: title,
      meta_description: excerpt
    }
    
  } catch (error) {
    console.error(`Error fetching article ${url}:`, error)
    return null
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting blog post import process...')
    
    // First, get all article links from the main news page
    const articleLinks = await fetchArticleLinks()
    console.log(`Found ${articleLinks.length} article links`)
    
    if (articleLinks.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No articles found on the news page',
          message: 'Could not find any article links to process'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Fetch content for each article
    const blogPosts: BlogPost[] = []
    
    for (const link of articleLinks.slice(0, 10)) { // Limit to first 10 to avoid timeouts
      console.log(`Processing: ${link.title}`)
      const articleContent = await fetchArticleContent(link.url)
      
      if (articleContent) {
        blogPosts.push({
          title: articleContent.title || link.title,
          slug: articleContent.slug || link.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          excerpt: articleContent.excerpt || link.excerpt,
          content: articleContent.content || '<p>Content could not be extracted.</p>',
          featured_image_url: articleContent.featured_image_url || link.featuredImageUrl || '/news/hero.jpg',
          author: link.author,
          published_date: articleContent.published_date || new Date(link.date).toISOString(),
          category: link.category,
          meta_title: articleContent.meta_title,
          meta_description: articleContent.meta_description
        })
      }
      
      // Add small delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log(`Successfully processed ${blogPosts.length} articles`)
    
    if (blogPosts.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No content could be extracted',
          message: 'Found article links but could not extract content from any of them'
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if posts already exist
    const { data: existingPosts } = await supabaseClient
      .from('blog_posts')
      .select('slug')
      .in('slug', blogPosts.map(post => post.slug))

    const existingSlugs = existingPosts?.map(p => p.slug) || []
    const newPosts = blogPosts.filter(post => !existingSlugs.includes(post.slug))
    
    if (newPosts.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All posts already exist in the database',
          existing: existingSlugs,
          skipped: blogPosts.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Insert new blog posts
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert(newPosts)
      .select()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        message: 'Blog posts imported successfully',
        imported: data?.length || 0,
        skipped: existingSlugs.length,
        total_processed: blogPosts.length,
        posts: data?.map(p => ({ title: p.title, slug: p.slug }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})