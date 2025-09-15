import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ListingSpace {
  listing_id: string;
  space_id: string;
  space_status: 'available' | 'booked' | 'maintenance' | 'reserved';
  space_number: string;
  override_status: boolean;
}

export const useListingSpaces = (listingIds: string[] = []) => {
  const [spaces, setSpaces] = useState<ListingSpace[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSpaces = async () => {
    if (listingIds.length === 0) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parking_spaces')
        .select('id, listing_id, space_status, space_number, override_status')
        .in('listing_id', listingIds);

      if (error) throw error;

      const formattedSpaces: ListingSpace[] = (data || []).map(space => ({
        listing_id: space.listing_id,
        space_id: space.id,
        space_status: space.space_status as ListingSpace['space_status'],
        space_number: space.space_number,
        override_status: space.override_status
      }));

      setSpaces(formattedSpaces);
    } catch (error) {
      console.error('Error fetching spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSpaceForListing = async (listingId: string) => {
    try {
      const { error } = await supabase.rpc('create_parking_spaces_for_listing', {
        p_listing_id: listingId,
        space_count: 1,
        space_prefix: 'Main'
      });

      if (error) throw error;

      // Refresh spaces after creation
      await fetchSpaces();
      
      return { success: true };
    } catch (error) {
      console.error('Error creating space:', error);
      toast({
        title: "Error",
        description: "Failed to create parking space",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const updateSpaceStatus = async (spaceId: string, newStatus: ListingSpace['space_status'], reason?: string) => {
    try {
      const { error } = await supabase.rpc('update_parking_space_status', {
        space_id: spaceId,
        new_status: newStatus,
        is_override: !!reason,
        override_reason: reason || null
      });

      if (error) throw error;

      // Update local state optimistically
      setSpaces(prev => prev.map(space => 
        space.space_id === spaceId 
          ? { ...space, space_status: newStatus, override_status: !!reason }
          : space
      ));

      toast({
        title: "Success",
        description: `Space status updated to ${newStatus}`,
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating space status:', error);
      toast({
        title: "Error",
        description: "Failed to update space status",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  const getListingSpaceStatus = (listingId: string): {
    status: 'no_spaces' | 'available' | 'booked' | 'mixed';
    hasSpaces: boolean;
    availableCount: number;
    totalCount: number;
  } => {
    const listingSpaces = spaces.filter(space => space.listing_id === listingId);
    
    if (listingSpaces.length === 0) {
      return { status: 'no_spaces', hasSpaces: false, availableCount: 0, totalCount: 0 };
    }

    const totalCount = listingSpaces.length;
    const availableCount = listingSpaces.filter(space => space.space_status === 'available').length;
    const bookedCount = listingSpaces.filter(space => space.space_status === 'booked').length;
    
    if (availableCount === totalCount) {
      return { status: 'available', hasSpaces: true, availableCount, totalCount };
    } else if (bookedCount === totalCount) {
      return { status: 'booked', hasSpaces: true, availableCount, totalCount };
    } else {
      return { status: 'mixed', hasSpaces: true, availableCount, totalCount };
    }
  };

  useEffect(() => {
    fetchSpaces();
  }, [listingIds.length]);

  // Set up real-time subscription for space changes
  useEffect(() => {
    if (listingIds.length === 0) return;

    const channel = supabase
      .channel('listing-spaces-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parking_spaces',
        filter: `listing_id=in.(${listingIds.join(',')})`
      }, () => {
        fetchSpaces();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingIds]);

  return {
    spaces,
    loading,
    fetchSpaces,
    createSpaceForListing,
    updateSpaceStatus,
    getListingSpaceStatus
  };
};