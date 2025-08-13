import { supabase } from "@/integrations/supabase/client";

export const logPhotoRepairReport = async (
  failingUrl: string,
  errorType: string = 'broken_url',
  spaceId?: string,
  carParkId?: string
) => {
  try {
    const userAgent = navigator.userAgent;
    const pagePath = window.location.pathname;
    
    // Log to console until database function is ready
    console.warn('Photo repair report:', {
      failing_url: failingUrl,
      error_type: errorType,
      space_id: spaceId,
      car_park_id: carParkId,
      user_agent: userAgent,
      page_path: pagePath
    });
  } catch (error) {
    console.warn('Failed to log photo repair report:', error);
  }
};