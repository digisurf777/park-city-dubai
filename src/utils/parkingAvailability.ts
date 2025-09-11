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
  console.log('🔍 Starting availability check for', spots.length, 'spots');
  if (!spots.length) return spots;

  try {
    const now = new Date();
    console.log('⏰ Current time:', now.toISOString());
    
    // Get all active bookings that overlap with current time
    const { data: activeBookings, error: bookingError } = await supabase
      .from('parking_bookings')
      .select('location, zone, start_time, end_time, status')
      .in('status', ['confirmed', 'payment_sent'])
      .lte('start_time', now.toISOString())
      .gte('end_time', now.toISOString());

    console.log('📋 Active bookings query result:', {
      activeBookings,
      error: bookingError,
      count: activeBookings?.length || 0
    });

    // Get parking space overrides from admin
    const listingIds = spots.map(spot => spot.id);
    console.log('🏗️ Checking admin overrides for listing IDs:', listingIds);

    const { data: parkingSpaces, error: spacesError } = await supabase
      .from('parking_spaces')
      .select('listing_id, space_status, override_status')
      .in('listing_id', listingIds);

    console.log('⚙️ Parking spaces query result:', {
      parkingSpaces,
      error: spacesError,
      count: parkingSpaces?.length || 0
    });

    // Update availability for each spot
    const updatedSpots = spots.map(spot => {
      console.log(`\n🚗 Processing spot: ${spot.name} (ID: ${spot.id})`);
      console.log('📍 Spot address:', spot.address);
      console.log('🗺️ Spot zone:', spot.zone);

      // Normalize addresses for better matching
      const normalizeAddress = (address: string) => {
        return address.toLowerCase()
          .replace(/[^\w\s]/g, '') // Remove punctuation
          .replace(/\s+/g, ' ')     // Normalize spaces
          .trim();
      };

      const normalizedSpotAddress = normalizeAddress(spot.address);
      console.log('🔧 Normalized spot address:', normalizedSpotAddress);

      // Check for active bookings with improved matching
      const matchingBookings = activeBookings?.filter(booking => {
        const normalizedBookingLocation = normalizeAddress(booking.location);
        const addressMatch = normalizedBookingLocation.includes(normalizedSpotAddress) ||
                            normalizedSpotAddress.includes(normalizedBookingLocation) ||
                            booking.location === spot.address;
        const zoneMatch = booking.zone === spot.zone;
        const statusMatch = booking.status === 'confirmed';
        
        console.log(`📊 Booking comparison:`, {
          bookingLocation: booking.location,
          normalizedBookingLocation,
          addressMatch,
          zoneMatch,
          statusMatch,
          overall: addressMatch && zoneMatch && statusMatch
        });

        return addressMatch && zoneMatch && statusMatch;
      });

      const hasActiveBooking = matchingBookings && matchingBookings.length > 0;
      console.log('🔒 Has active booking:', hasActiveBooking, matchingBookings?.length || 0, 'matches');

      // Check for admin overrides
      const spaceOverride = parkingSpaces?.find(space => space.listing_id === spot.id);
      const isAdminUnavailable = spaceOverride?.space_status === 'maintenance' || 
                                spaceOverride?.space_status === 'unavailable' ||
                                spaceOverride?.override_status === true;

      console.log('👨‍💼 Admin override check:', {
        spaceOverride,
        isAdminUnavailable,
        space_status: spaceOverride?.space_status,
        override_status: spaceOverride?.override_status
      });

      let availabilityStatus: 'available' | 'booked' | 'unavailable' = 'available';
      let buttonText = 'Reserve Booking';
      let isBookable = true;

      if (isAdminUnavailable) {
        availabilityStatus = 'unavailable';
        buttonText = 'Unavailable';
        isBookable = false;
        console.log('❌ Status: UNAVAILABLE (admin override)');
      } else if (hasActiveBooking) {
        availabilityStatus = 'booked';
        buttonText = 'Currently Booked';
        isBookable = false;
        console.log('🔒 Status: BOOKED (active booking found)');
      } else {
        console.log('✅ Status: AVAILABLE');
      }

      const result = {
        ...spot,
        available: availabilityStatus === 'available',
        buttonText,
        isBookable,
        availabilityStatus
      };

      console.log('📤 Final result for spot:', {
        name: spot.name,
        available: result.available,
        buttonText: result.buttonText,
        isBookable: result.isBookable,
        availabilityStatus: result.availabilityStatus
      });

      return result;
    });

    console.log('🎯 Availability check completed. Summary:', {
      totalSpots: updatedSpots.length,
      available: updatedSpots.filter(s => s.availabilityStatus === 'available').length,
      booked: updatedSpots.filter(s => s.availabilityStatus === 'booked').length,
      unavailable: updatedSpots.filter(s => s.availabilityStatus === 'unavailable').length
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