-- Create 'parking-images' storage bucket if it doesn't exist and set appropriate policies
-- Note: We avoid modifying reserved schemas beyond allowed Storage bucket and policies configuration.

-- 1) Create the bucket (id and name must match)
INSERT INTO storage.buckets (id, name, public)
VALUES ('parking-images', 'parking-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2) Create policies on storage.objects for this bucket
-- Enable public read access for files in this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Public read access for parking-images'
  ) THEN
    CREATE POLICY "Public read access for parking-images"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'parking-images');
  END IF;
END $$;

-- Allow authenticated users to upload into this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Authenticated users can upload to parking-images'
  ) THEN
    CREATE POLICY "Authenticated users can upload to parking-images"
      ON storage.objects
      FOR INSERT
      WITH CHECK (
        bucket_id = 'parking-images' AND auth.role() = 'authenticated'
      );
  END IF;
END $$;

-- Allow owners to update their own files within this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Owners can update files in parking-images'
  ) THEN
    CREATE POLICY "Owners can update files in parking-images"
      ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'parking-images' AND owner = auth.uid())
      WITH CHECK (bucket_id = 'parking-images' AND owner = auth.uid());
  END IF;
END $$;

-- Allow owners to delete their own files within this bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
      AND tablename = 'objects' 
      AND policyname = 'Owners can delete files in parking-images'
  ) THEN
    CREATE POLICY "Owners can delete files in parking-images"
      ON storage.objects
      FOR DELETE
      USING (bucket_id = 'parking-images' AND owner = auth.uid());
  END IF;
END $$;
