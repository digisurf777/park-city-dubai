-- Add secure access token fields to encrypted_document_refs table
ALTER TABLE public.encrypted_document_refs 
ADD COLUMN IF NOT EXISTS document_access_token text,
ADD COLUMN IF NOT EXISTS token_expires_at timestamp with time zone;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_encrypted_refs_access_token 
ON public.encrypted_document_refs(document_access_token) 
WHERE document_access_token IS NOT NULL;

-- Create index for token expiry cleanup
CREATE INDEX IF NOT EXISTS idx_encrypted_refs_token_expiry 
ON public.encrypted_document_refs(token_expires_at) 
WHERE token_expires_at IS NOT NULL;