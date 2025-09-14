-- Add indexes for better news page performance
CREATE INDEX IF NOT EXISTS idx_news_publication_date_status 
ON news(publication_date DESC, status) 
WHERE status = 'published';

-- Add index for verification documents search
CREATE INDEX IF NOT EXISTS idx_user_verifications_status_created 
ON user_verifications(verification_status, created_at DESC);

-- Add index for user profiles search
CREATE INDEX IF NOT EXISTS idx_profiles_search 
ON profiles(full_name, email, user_type);

-- Optimize parking listings queries
CREATE INDEX IF NOT EXISTS idx_parking_listings_status_zone 
ON parking_listings(status, zone) 
WHERE status = 'approved';