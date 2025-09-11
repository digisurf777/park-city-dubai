import { supabase } from "@/integrations/supabase/client";

interface ParkingSpot {
  id: string;
  name: string;
  address: string;
  zone: string;
  available?: boolean;
  buttonText?: string;
  isBookable?: boolean;
  availabilityStatus?: 'available' | 'booked' | 'unavailable';
}

export const checkParkingAvailability = async (spots: ParkingSpot[]): Promise<ParkingSpot[]> => {
  if (!spots.length) return spots;

  try {
    const now = new Date();
    
    // Get all active bookings that overlap with current time
    const { data: activeBookings } = await supabase
      .from('parking_bookings')
      .select('location, zone, start_time, end_time, status')
      .in('status', ['confirmed', 'payment_sent'])
      .lte('start_time', now.toISOString())
      .gte('end_time', now.toISOString());

    // Get parking space overrides from admin
    const listingIds = spots.map(spot => spot.id);
    const { data: parkingSpaces } = await supabase
      .from('parking_spaces')
      .select('listing_id, space_status, override_status')
      .in('listing_id', listingIds);

    // Update availability for each spot
    const updatedSpots = spots.map(spot => {
      // Check for active bookings
      const hasActiveBooking = activeBookings?.some(booking => 
        booking.location === spot.address && 
        booking.zone === spot.zone &&
        booking.status === 'confirmed'
      );

      // Check for admin overrides
      const spaceOverride = parkingSpaces?.find(space => space.listing_id === spot.id);
      const isAdminUnavailable = spaceOverride?.space_status === 'maintenance' || 
                                spaceOverride?.space_status === 'unavailable' ||
                                spaceOverride?.override_status === true;

      let availabilityStatus: 'available' | 'booked' | 'unavailable' = 'available';
      let buttonText = 'Reserve Booking';
      let isBookable = true;

      if (isAdminUnavailable) {
        availabilityStatus = 'unavailable';
        buttonText = 'Unavailable';
        isBookable = false;
      } else if (hasActiveBooking) {
        availabilityStatus = 'booked';
        buttonText = 'Currently Booked';
        isBookable = false;
      }

      return {
        ...spot,
        available: availabilityStatus === 'available',
        buttonText,
        isBookable,
        availabilityStatus
      };
    });

    return updatedSpots;
  } catch (error) {
    console.error('Error checking parking availability:', error);
    // Return spots with default availability if check fails
    return spots.map(spot => ({
      ...spot,
      available: true,
      buttonText: 'Reserve Booking',
      isBookable: true,
      availabilityStatus: 'available' as const
    }));
  }
};

export const setupAvailabilitySubscriptions = (
  zoneName: string, 
  onUpdate: () => void
) => {
  // Subscribe to booking changes
  const bookingsChannel = supabase
    .channel(`parking-bookings-${zoneName}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'parking_bookings'
    }, (payload) => {
      console.log(`Booking change detected for ${zoneName}:`, payload);
      onUpdate();
    })
    .subscribe();

  // Subscribe to parking space overrides
  const spacesChannel = supabase
    .channel(`parking-spaces-${zoneName}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'parking_spaces'
    }, (payload) => {
      console.log(`Parking space change detected for ${zoneName}:`, payload);
      onUpdate();
    })
    .subscribe();

  // Subscribe to listing changes
  const listingsChannel = supabase
    .channel(`parking-listings-${zoneName}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'parking_listings'
    }, (payload) => {
      console.log(`Listing change detected for ${zoneName}:`, payload);
      onUpdate();
    })
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(bookingsChannel);
    supabase.removeChannel(spacesChannel);
    supabase.removeChannel(listingsChannel);
  };
};