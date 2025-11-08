-- Fix function search path security issue with cascade
DROP FUNCTION IF EXISTS public.update_banking_details_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_banking_details_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_banking_details_timestamp
BEFORE UPDATE ON public.banking_details
FOR EACH ROW
EXECUTE FUNCTION public.update_banking_details_updated_at();