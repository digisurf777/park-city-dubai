import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";
import NewsLoadingSkeleton from "@/components/NewsLoadingSkeleton";
import NewsPagination from "@/components/NewsPagination";
import OptimizedNewsCard from "@/components/OptimizedNewsCard";

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image_url: string | null;
  publication_date: string;
}

interface NewsPageCache {
  articles: NewsPost[];
  totalPages: number;
  fetchedAt: number;
}

// Module-level cache (survives navigation within session)
const ARTICLES_PER_PAGE = 9;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min
const newsCache: Map<number, NewsPageCache> = new Map();

const News = () => {
  const seoData = useSEO({
    title: "Latest News & Updates - Shazam Parking Dubai",
    description:
      "Stay updated with the latest news, updates, and insights about parking in Dubai. Read about new parking zones, city developments, and Shazam Parking platform updates.",
    keywords:
      "Dubai parking news, parking updates Dubai, city developments, urban planning Dubai, parking regulations, Dubai Marina news, Downtown Dubai updates",
    url: "/news",
  });

  const [newsArticles, setNewsArticles] = useState<NewsPost[]>(
    () => newsCache.get(1)?.articles ?? []
  );
  const [totalPages, setTotalPages] = useState<number>(
    () => newsCache.get(1)?.totalPages ?? 1
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(() => !newsCache.has(1));
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = newsCache.get(currentPage);
    const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

    // Show cached immediately, refresh silently in background if stale
    if (cached) {
      setNewsArticles(cached.articles);
      setTotalPages(cached.totalPages);
      setLoading(false);
      if (isFresh) return;
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchNewsArticles = async () => {
      try {
        const from = (currentPage - 1) * ARTICLES_PER_PAGE;
        const to = from + ARTICLES_PER_PAGE - 1;

        // Single round-trip: data + exact count
        // Only select the columns the card actually needs
        const { data, count, error } = await supabase
          .from("news")
          .select("id, title, content, image_url, publication_date", {
            count: "exact",
          })
          .eq("status", "published")
          .order("publication_date", { ascending: false })
          .range(from, to)
          .abortSignal(controller.signal);

        if (error) throw error;
        if (controller.signal.aborted) return;

        const articles = (data as NewsPost[]) || [];
        const pages = Math.max(1, Math.ceil((count ?? 0) / ARTICLES_PER_PAGE));

        newsCache.set(currentPage, {
          articles,
          totalPages: pages,
          fetchedAt: Date.now(),
        });

        setNewsArticles(articles);
        setTotalPages(pages);

        // Prefetch next page in background for snappy pagination
        const nextPage = currentPage + 1;
        if (nextPage <= pages && !newsCache.has(nextPage)) {
          const nextFrom = (nextPage - 1) * ARTICLES_PER_PAGE;
          const nextTo = nextFrom + ARTICLES_PER_PAGE - 1;
          supabase
            .from("news")
            .select("id, title, content, image_url, publication_date", {
              count: "exact",
            })
            .eq("status", "published")
            .order("publication_date", { ascending: false })
            .range(nextFrom, nextTo)
            .then(({ data: nextData, count: nextCount }) => {
              if (nextData) {
                newsCache.set(nextPage, {
                  articles: nextData as NewsPost[],
                  totalPages: Math.max(
                    1,
                    Math.ceil((nextCount ?? 0) / ARTICLES_PER_PAGE)
                  ),
                  fetchedAt: Date.now(),
                });
              }
            });
        }
      } catch (error: any) {
        if (error?.name === "AbortError") return;
        console.error("Error fetching news articles:", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    fetchNewsArticles();

    return () => controller.abort();
  }, [currentPage]);

  // Smooth scroll to top on page change (after data is shown)
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface to-background animate-fade-in">
      {seoData}


      {/* Hero Section */}
      <PageHero
        image="/lovable-uploads/ba4a4def-2cd7-4e97-89d5-074c13f0bbe8.webp"
        eyebrow="Newsroom"
        title="Latest News"
        highlight="News"
        subtitle="Updates, insights and stories from ShazamParking and the Dubai parking scene."
        size="lg"
      />

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading && newsArticles.length === 0 ? (
          <NewsLoadingSkeleton />
        ) : (
          <>
            {refreshing && (
              <div className="mb-4 flex justify-center">
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Refreshing latest news…
                </span>
              </div>
            )}
            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-200 ${
                refreshing ? "opacity-90" : "opacity-100"
              }`}
            >
              {newsArticles.map((article, index) => (
                <OptimizedNewsCard
                  key={article.id}
                  article={article}
                  priority={index < 3}
                />
              ))}
            </div>

            <NewsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={loading}
            />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default News;
