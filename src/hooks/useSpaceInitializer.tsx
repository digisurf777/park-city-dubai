import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useSpaceInitializer = () => {
  const { user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeSpacesForListings = async () => {
    if (!user) return;

    try {
      setIsInitializing(true);

      // Check if user is admin
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError || userRoles?.role !== 'admin') {
        console.log('Not admin, skipping space initialization');
        return;
      }

      // Get all approved listings that might not have spaces
      const { data: listings, error: listingsError } = await supabase
        .from('parking_listings')
        .select('id, title')
        .eq('status', 'approved');

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
        return;
      }

      // For each listing, check if it has spaces, if not create some
      for (const listing of listings || []) {
        const { data: existingSpaces, error: spacesError } = await supabase
          .from('parking_spaces')
          .select('id')
          .eq('listing_id', listing.id)
          .limit(1);

        if (spacesError) {
          console.error('Error checking spaces for listing:', listing.id, spacesError);
          continue;
        }

        // If no spaces exist for this listing, create some
        if (!existingSpaces || existingSpaces.length === 0) {
          const spaceCount = Math.floor(Math.random() * 8) + 3; // 3-10 spaces per listing
          
          try {
            const { error: createError } = await supabase.rpc('create_parking_spaces_for_listing', {
              p_listing_id: listing.id,
              space_count: spaceCount,
              space_prefix: 'Space'
            });

            if (createError) {
              console.error('Error creating spaces for listing:', listing.id, createError);
            } else {
              console.log(`Created ${spaceCount} spaces for listing: ${listing.title}`);
            }
          } catch (err) {
            console.error('RPC call failed for listing:', listing.id, err);
          }
        }
      }

      console.log('Space initialization completed');
    } catch (error) {
      console.error('Error during space initialization:', error);
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    initializeSpacesForListings,
    isInitializing
  };
};