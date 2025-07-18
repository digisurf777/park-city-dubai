
-- Create a table for news images
CREATE TABLE public.news_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT NOT NULL DEFAULT 'inline', -- 'featured' or 'inline'
  alt_text TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.news_images ENABLE ROW LEVEL SECURITY;

-- Create policies for news images
CREATE POLICY "Anyone can view news images" 
  ON public.news_images 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage news images" 
  ON public.news_images 
  FOR ALL 
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_news_images_updated_at
  BEFORE UPDATE ON public.news_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for news images if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for news images
CREATE POLICY "Anyone can view news images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can upload news images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update news images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete news images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');
