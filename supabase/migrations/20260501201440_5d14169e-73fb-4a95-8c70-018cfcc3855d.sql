-- 1) Add is_ai flag to user_messages
ALTER TABLE public.user_messages
  ADD COLUMN IF NOT EXISTS is_ai boolean NOT NULL DEFAULT false;

-- 2) Create platform_knowledge table
CREATE TABLE IF NOT EXISTS public.platform_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  content text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  priority integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_knowledge_active
  ON public.platform_knowledge (is_active, category, priority DESC);

CREATE INDEX IF NOT EXISTS idx_platform_knowledge_keywords
  ON public.platform_knowledge USING GIN (keywords);

ALTER TABLE public.platform_knowledge ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active knowledge is viewable by everyone" ON public.platform_knowledge;
CREATE POLICY "Active knowledge is viewable by everyone"
  ON public.platform_knowledge
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage knowledge" ON public.platform_knowledge;
CREATE POLICY "Admins can manage knowledge"
  ON public.platform_knowledge
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_platform_knowledge_updated_at ON public.platform_knowledge;
CREATE TRIGGER trg_platform_knowledge_updated_at
  BEFORE UPDATE ON public.platform_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Seed knowledge entries
INSERT INTO public.platform_knowledge (category, title, content, keywords, priority) VALUES
  ('general', 'About Shazam Parking',
   'Shazam Parking is Dubai''s trusted marketplace for monthly parking. Drivers can rent verified spaces in Dubai Marina, Downtown, Palm Jumeirah, Business Bay, DIFC and Deira. Owners can list their unused spot and earn passive monthly income. Bookings are managed end-to-end with secure payments, identity verification and a support team.',
   ARRAY['about','company','what','platform','shazam','dubai'], 100),
  ('booking', 'How bookings work',
   'You browse listings by zone, pick the dates you need, and submit a booking request. Our team confirms the space is available and sends you a secure payment link. Once paid, the booking is confirmed and you''ll receive owner contact details plus access instructions through the in-app chat. Bookings are usually monthly and start from any date.',
   ARRAY['book','booking','how','process','reserve','rent'], 90),
  ('booking', 'Booking confirmation timeline',
   'After you submit a booking, our team reviews and confirms within a few hours during business days. You''ll get an email with the payment link. Once payment is captured the booking is confirmed and you can chat with the owner immediately.',
   ARRAY['confirmation','timeline','how long','wait','approve','approval'], 80),
  ('booking', 'Cancelling or changing a booking',
   'Bookings are final and non-refundable once paid. If you need to change the start date before payment, message us and we''ll help. After payment, please reach out and we''ll do our best within the policy.',
   ARRAY['cancel','change','modify','refund','reschedule'], 80),
  ('payment', 'Refund policy',
   'All bookings are final and non-refundable once payment is captured. This applies to monthly rentals and access-card deposits, except where the law requires otherwise. We always recommend confirming the dates and address before paying.',
   ARRAY['refund','non-refundable','money back','cancel','policy'], 95),
  ('payment', 'Accepted payment methods',
   'We accept major credit and debit cards (Visa, Mastercard, Amex) processed securely through Stripe. Payment links are sent by email after your booking is approved. We never store card details on our servers.',
   ARRAY['pay','payment','card','stripe','method','visa','mastercard'], 70),
  ('payment', 'Pre-authorisation explained',
   'For some bookings we place a temporary hold (pre-authorisation) on your card to confirm funds. The hold is converted to a charge once the booking is confirmed, or released if it is not. Pre-auths typically last 7 days; we may extend if needed.',
   ARRAY['pre-auth','pre authorization','hold','charge','authorise'], 60),
  ('payment', 'Access card deposit',
   'Some buildings require a physical access card or remote. There is a refundable security deposit of AED 500 plus a one-time handling fee of AED 100. The 500 AED deposit is returned in full when you hand the card back undamaged at the end of your booking.',
   ARRAY['access card','remote','deposit','500','handling fee','key'], 85),
  ('payment', 'When are owner payouts sent',
   'Owners are paid monthly for each active booking. Payouts go to the bank account you saved in My Account → Banking Details. The first payout is processed once the renter''s booking is confirmed and active.',
   ARRAY['payout','owner','paid','when','salary','income','bank'], 80),
  ('listing', 'How to list a parking space',
   'Go to "List Your Space" from the top menu, fill in the address, zone, monthly price, photos and availability. We''ll review your listing within 1–2 business days and publish it once approved. You''ll need to add your banking details to receive payouts.',
   ARRAY['list','listing','rent out','owner','add','create','publish'], 90),
  ('listing', 'Listing approval process',
   'Every listing is manually reviewed for quality, accuracy and compliance. We may ask for clearer photos or extra info. Once approved your space goes live and renters can request bookings.',
   ARRAY['approve','approval','review','listing','pending','live'], 70),
  ('listing', 'Photos and quality',
   'Use bright, clear photos showing the parking spot, the building entrance and any access gates. Listings with great photos get up to 3× more bookings. Add at least 3 photos.',
   ARRAY['photo','image','picture','quality','tips'], 50),
  ('account', 'Phone number is required',
   'Your phone number is required so owners and renters can be reached for urgent issues like access. Please add a valid number with country code in My Account → Profile.',
   ARRAY['phone','number','mandatory','required','contact'], 60),
  ('account', 'Two-factor authentication (MFA)',
   'For admins and high-value accounts we require multi-factor authentication. Enable it in My Account → Security. We support time-based one-time passcodes (TOTP) using apps like Google Authenticator or 1Password.',
   ARRAY['mfa','2fa','two factor','security','totp','authenticator'], 50),
  ('account', 'Reset password',
   'Click "Forgot password" on the login page and enter your email. You''ll get a secure reset link. Links expire after 1 hour for safety.',
   ARRAY['password','reset','forgot','login','recover'], 70),
  ('account', 'Identity verification (KYC)',
   'For some bookings we ask for a one-time identity check (Emirates ID or passport) so owners and renters can trust each other. Documents are encrypted and accessible only to verification admins.',
   ARRAY['kyc','verify','verification','id','passport','emirates id','document'], 65),
  ('account', 'Update banking details',
   'Open My Account → Banking Details and add your account holder name, bank, IBAN and SWIFT. We use these to send your monthly payouts. You can update anytime.',
   ARRAY['banking','bank','iban','swift','payout','details','update'], 55),
  ('policy', 'Terms and conditions',
   'Full terms are available at /terms. Key points: bookings are final, deposits are refundable when access cards are returned undamaged, and we may suspend accounts that violate community guidelines.',
   ARRAY['terms','conditions','t&c','rules','policy','legal'], 30),
  ('policy', 'Privacy and data',
   'We only collect what we need to run your booking: profile, contact, booking history, payment status. Documents are encrypted at rest. See /privacy for the full policy.',
   ARRAY['privacy','data','gdpr','personal','info'], 30),
  ('general', 'How to contact a human',
   'If your question is urgent or sensitive, type "talk to a human" and we''ll route you to our admin team. You can also email support@shazamparking.ae.',
   ARRAY['human','agent','admin','support','contact','email','help'], 100),
  ('general', 'Service zones in Dubai',
   'We currently operate in Dubai Marina, Downtown, Palm Jumeirah, Business Bay, DIFC and Deira. New zones are added based on demand.',
   ARRAY['zones','areas','locations','marina','downtown','palm','difc','deira','business bay'], 50),
  ('general', 'Business hours',
   'Our support team is available Sunday to Thursday, 9:00 AM – 7:00 PM Gulf time. For after-hours issues use the chat and we''ll respond first thing the next day. Bookings can be made 24/7.',
   ARRAY['hours','time','open','available','support','when'], 40)
ON CONFLICT DO NOTHING;