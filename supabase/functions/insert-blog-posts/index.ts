import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
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
    const titleEl = doc.querySelector('h1.entry-title, h1.post-title, h1, .entry-title, .post-title, .single-post-title')
    const title = titleEl?.textContent?.trim() || 'Untitled'
    
    // Extract content with enhanced formatting
    const contentEl = doc.querySelector('.entry-content, .post-content, .content, article .entry-content, main .entry-content, .single-post-content')
    let content = ''
    
    if (contentEl) {
      // Clean up the content - remove unwanted elements
      const unwantedElements = contentEl.querySelectorAll('script, style, noscript, .sharedaddy, .jp-relatedposts, .navigation, .comments, .comment-form')
      unwantedElements.forEach(el => el.remove())
      
      // Get raw HTML content
      content = contentEl.innerHTML || contentEl.textContent || ''
      
      // Enhanced content formatting
      content = formatContentWithHeaders(content)
      
      // Convert relative URLs to absolute
      content = content.replace(/src="\/wp-content/g, 'src="https://shazamparking.ae/wp-content')
      content = content.replace(/href="\/(?!http)/g, 'href="https://shazamparking.ae/')
      content = content.replace(/src="\/uploads/g, 'src="https://shazamparking.ae/uploads')
      
      // Ensure images have proper styling
      content = content.replace(/<img([^>]*)>/g, '<img$1 style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 8px;">')
    }
    
    // Extract featured image with multiple fallbacks
    let featuredImage = ''
    const imageSelectors = [
      '.wp-post-image',
      '.featured-image img',
      '.post-thumbnail img', 
      '.entry-image img',
      'meta[property="og:image"]',
      '.single-post-thumbnail img',
      'article img:first-of-type'
    ]
    
    for (const selector of imageSelectors) {
      const imageEl = doc.querySelector(selector)
      if (imageEl) {
        featuredImage = imageEl.getAttribute('src') || imageEl.getAttribute('content') || ''
        if (featuredImage) break
      }
    }
    
    if (featuredImage && !featuredImage.startsWith('http')) {
      featuredImage = 'https://shazamparking.ae' + featuredImage
    }
    
    // Enhanced date extraction
    let publishedDate = ''
    const dateSelectors = [
      'time[datetime]',
      '.post-date',
      '.entry-date', 
      '.published',
      'meta[property="article:published_time"]',
      '.date'
    ]
    
    for (const selector of dateSelectors) {
      const dateEl = doc.querySelector(selector)
      if (dateEl) {
        publishedDate = dateEl.getAttribute('datetime') || 
                      dateEl.getAttribute('content') || 
                      dateEl.textContent || ''
        if (publishedDate) break
      }
    }
    
    // Parse and format date with better handling
    if (publishedDate) {
      try {
        // Handle various date formats
        let date = new Date(publishedDate)
        if (isNaN(date.getTime())) {
          // Try parsing common formats
          const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/
          const match = publishedDate.match(dateRegex)
          if (match) {
            date = new Date(`${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`)
          }
        }
        publishedDate = date.toISOString()
      } catch {
        publishedDate = new Date().toISOString()
      }
    } else {
      publishedDate = new Date().toISOString()
    }
    
    // Enhanced excerpt extraction
    let excerpt = ''
    const metaDesc = doc.querySelector('meta[name="description"]')
    if (metaDesc) {
      excerpt = metaDesc.getAttribute('content') || ''
    } else {
      // Extract from first meaningful paragraph
      const paragraphs = contentEl?.querySelectorAll('p')
      if (paragraphs && paragraphs.length > 0) {
        for (const p of paragraphs) {
          const text = p.textContent?.trim() || ''
          if (text.length > 50) {
            excerpt = text.substring(0, 200) + '...'
            break
          }
        }
      }
    }
    
    // Generate SEO-friendly slug from URL
    const urlParts = url.split('/')
    let slug = urlParts[urlParts.length - 2] || urlParts[urlParts.length - 1] || ''
    
    // Clean up slug
    if (!slug || slug === '') {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-')
    }
    
    // Extract author
    let author = 'admin'
    const authorEl = doc.querySelector('.author-name, .post-author, .entry-author, .author')
    if (authorEl) {
      author = authorEl.textContent?.trim() || 'admin'
    }
    
    // Extract category
    let category = 'ShazamParking'
    const categoryEl = doc.querySelector('.post-category, .entry-category, .category')
    if (categoryEl) {
      category = categoryEl.textContent?.trim() || 'ShazamParking'
    }
    
    return {
      title,
      slug,
      excerpt,
      content,
      featured_image_url: featuredImage,
      published_date: publishedDate,
      author,
      category,
      meta_title: title,
      meta_description: excerpt
    }
    
  } catch (error) {
    console.error(`Error fetching article ${url}:`, error)
    return null
  }
}

function formatContentWithHeaders(content: string): string {
  // Add proper header styling and structure
  content = content.replace(/<h([1-6])([^>]*)>/g, '<h$1$2 style="font-weight: bold; margin: 2rem 0 1rem 0; color: #1a1a1a; line-height: 1.3;">')
  
  // Style H2 headers prominently
  content = content.replace(/<h2([^>]*)>/g, '<h2$1 style="font-size: 1.75rem; font-weight: bold; margin: 2.5rem 0 1rem 0; color: #00B67A; line-height: 1.3; border-bottom: 2px solid #00B67A; padding-bottom: 0.5rem;">')
  
  // Style H3 headers
  content = content.replace(/<h3([^>]*)>/g, '<h3$1 style="font-size: 1.4rem; font-weight: bold; margin: 2rem 0 1rem 0; color: #333; line-height: 1.3;">')
  
  // Improve paragraph spacing
  content = content.replace(/<p([^>]*)>/g, '<p$1 style="margin: 1rem 0; line-height: 1.7; color: #666;">')
  
  // Style lists
  content = content.replace(/<ul([^>]*)>/g, '<ul$1 style="margin: 1rem 0; padding-left: 1.5rem; color: #666;">')
  content = content.replace(/<ol([^>]*)>/g, '<ol$1 style="margin: 1rem 0; padding-left: 1.5rem; color: #666;">')
  content = content.replace(/<li([^>]*)>/g, '<li$1 style="margin: 0.5rem 0; line-height: 1.6;">')
  
  // Style links
  content = content.replace(/<a([^>]*)>/g, '<a$1 style="color: #00B67A; text-decoration: underline;">')
  
  // Style strong/bold text
  content = content.replace(/<strong([^>]*)>/g, '<strong$1 style="font-weight: bold; color: #333;">')
  content = content.replace(/<b([^>]*)>/g, '<b$1 style="font-weight: bold; color: #333;">')
  
  return content
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
    
    for (const link of articleLinks) { // Process all articles
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