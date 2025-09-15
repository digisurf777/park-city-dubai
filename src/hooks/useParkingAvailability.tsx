import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ParkingSpotWithAvailability {
  id: string;
  name: string;
  district: string;
  price: number;
  image: string;
  images: string[];
  specs: string[];
  available: boolean;
  address: string;
  description: string;
  totalSpaces: number;
  availableSpaces: number;
  bookedSpaces: number;
  maintenanceSpaces: number;
  availabilityText: string;
}

export const useParkingAvailability = (zone?: string) => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpotWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching parking spots with availability for zone:', zone);
      
      // First try the public-safe function for published listings
      let { data, error } = await supabase.rpc('get_public_parking_listings_with_availability');
      
      // If public function fails or returns empty, fallback to the admin function
      if (error || !data || data.length === 0) {
        console.log('Public function failed or empty, trying admin function:', error);
        const adminResult = await supabase.rpc('get_parking_listings_with_availability');
        data = adminResult.data;
        error = adminResult.error;
      }
      
      if (error) {
        console.error('Error fetching parking spots:', error);
        throw error;
      }

      console.log('Raw availability data:', data);

      // Filter by zone if specified and transform data
      const zoneFilter = zone ? zone.trim().toLowerCase() : null;
      const filteredData = zoneFilter 
        ? data?.filter((listing: any) => (listing.zone || '').trim().toLowerCase() === zoneFilter) || []
        : data || [];

      const transformedData = filteredData.map((spot: any) => {
        // Generate availability text
        let availabilityText = '';
        if (spot.total_spaces === 0) {
          availabilityText = 'Available for booking';
        } else if (spot.available_spaces > 0) {
          availabilityText = `${spot.available_spaces} of ${spot.total_spaces} spaces available`;
        } else {
          availabilityText = 'Currently fully booked';
        }

        return {
          id: spot.id,
          name: spot.title,
          district: spot.zone,
          price: spot.price_per_month || 0,
          image: spot.images && spot.images.length > 0 ? spot.images[0] : "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          images: spot.images || [],
          specs: spot.features || ["Access Card", "Covered", "2.1m Height"],
          available: spot.is_available,
          address: spot.address,
          description: spot.description,
          totalSpaces: Number(spot.total_spaces),
          availableSpaces: Number(spot.available_spaces),
          bookedSpaces: Number(spot.booked_spaces),
          maintenanceSpaces: Number(spot.maintenance_spaces),
          availabilityText
        };
      });

      // Deduplicate by normalized name + address + district to avoid duplicates across IDs
      const normalize = (v?: string) => (v || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const seen = new Map<string, typeof transformedData[number]>();
      for (const s of transformedData) {
        const key = `${normalize(s.name)}|${normalize(s.address)}|${normalize(s.district)}`;
        const existing = seen.get(key);
        if (!existing || s.availableSpaces > existing.availableSpaces) {
          seen.set(key, s);
        }
      }
      const uniqueData = Array.from(seen.values());

      console.log('Transformed availability data:', uniqueData);
      console.log('Deduplicated listings count:', uniqueData.length);
      
      setParkingSpots(uniqueData);
    } catch (err) {
      console.error('Error in fetchParkingSpots:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch parking spots');
      
      // Fallback to demo data for development
      const demoData: ParkingSpotWithAvailability[] = [
        {
          id: "demo-1",
          name: zone ? `Demo Parking - ${zone}` : "Demo Parking Space",
          district: zone || "Downtown",
          price: 850,
          image: "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png",
          images: ["/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.png"],
          specs: ["Covered", "24/7 Security", "Premium"],
          available: true,
          address: `Demo Address, ${zone || "Downtown"}`,
          description: `Secure parking space in ${zone || "Downtown"} with 24/7 access and premium amenities.`,
          totalSpaces: 0,
          availableSpaces: 0,
          bookedSpaces: 0,
          maintenanceSpaces: 0,
          availabilityText: "Available for booking"
        }
      ];
      setParkingSpots(demoData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkingSpots();

    // Set up real-time subscription to both parking_listings and parking_spaces changes
    const listingsChannel = supabase
      .channel(`parking-listings-${zone || 'all'}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parking_listings'
      }, (payload) => {
        console.log('Real-time parking listing change:', payload);
        fetchParkingSpots();
      })
      .subscribe();

    const spacesChannel = supabase
      .channel(`parking-spaces-${zone || 'all'}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parking_spaces'
      }, (payload) => {
        console.log('Real-time parking spaces change:', payload);
        fetchParkingSpots();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(spacesChannel);
    };
  }, [zone]);

  const refreshAvailability = () => {
    fetchParkingSpots();
  };

  return {
    parkingSpots,
    loading,
    error,
    refreshAvailability
  };
};