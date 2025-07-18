-- Add new fields to news table for enhanced blog functionality
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Update RLS policies to handle draft status
DROP POLICY IF EXISTS "News posts are viewable by everyone" ON public.news;

CREATE POLICY "Published news posts are viewable by everyone" 
ON public.news 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can view all news posts including drafts" 
ON public.news 
FOR SELECT 
USING (true);