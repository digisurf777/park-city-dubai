-- Create documents table for verification uploads
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  bucket_id TEXT NOT NULL DEFAULT 'verification',
  storage_path TEXT NOT NULL UNIQUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own documents" ON public.documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON public.documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents" ON public.documents
  FOR ALL USING (is_admin(auth.uid()));

-- Create verification bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification', 'verification', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification bucket
CREATE POLICY "Users can upload own verification docs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own verification docs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'verification' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Admins can manage all verification docs" ON storage.objects
  FOR ALL USING (bucket_id = 'verification' AND is_admin(auth.uid()));