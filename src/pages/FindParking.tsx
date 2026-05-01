import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, X, Car, CreditCard, Ruler } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";
import DubaiLiveMapsCTA from "@/components/DubaiLiveMapsCTA";

import dubaiMarinaZone from "@/assets/zones/dubai-marina-real.webp";
import downtownZone from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.webp";
import findParkingHero from "@/assets/find-parking-hero.jpg";
import palmJumeirahZone from "/lovable-uploads/atlantis-hotel-hero.webp";
import businessBayZone from "@/assets/zones/business-bay-real.webp";
import difcZone from "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.webp";
import deiraZone from "@/assets/zones/deira-real.webp";
const FindParking = () => {
  const seoData = useSEO({
    title: "Find a Parking Space in Dubai | Monthly Rentals - Shazam Parking",
    description: "Looking for a parking space in Dubai? Browse verified monthly parking rentals in Marina, Downtown, Business Bay, DIFC, Palm Jumeirah and Deira. Secure, hassle-free booking.",
    keywords: "find parking Dubai, monthly parking Dubai, rent parking space, Dubai Marina parking, Downtown parking, Business Bay parking, DIFC parking, Palm Jumeirah parking",
    url: "/find-a-parking-space"
  });
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const districtZones = [{
    name: "Dubai Marina",
    slug: "dubai-marina"
  }, {
    name: "Downtown",
    slug: "downtown"
  }, {
    name: "Palm Jumeirah",
    slug: "palm-jumeirah"
  }, {
    name: "Business Bay",
    slug: "business-bay"
  }, {
    name: "DIFC",
    slug: "difc"
  }, {
    name: "Deira",
    slug: "deira"
  }];

  // Fetch parking spots from database
  useEffect(() => {
    fetchParkingSpots();

    // Set up real-time subscription to parking_listings changes
    const channel = supabase.channel('parking-listings-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'parking_listings'
    }, payload => {
      console.log('Real-time parking listing change:', payload);
      // Refetch data when any parking listing changes
      fetchParkingSpots();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handle URL parameters on component mount
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      const district = districtZones.find(d => d.slug === districtParam);
      if (district) {
        setSelectedDistricts([district.name]);
        // Scroll to listings
        setTimeout(() => {
          const listingsSection = document.getElementById('listings-section');
          if (listingsSection) {
            listingsSection.scrollIntoView({
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [searchParams]);
  const fetchParkingSpots = async () => {
    try {
      setLoading(true);
      console.log('Fetching parking spots from database...');
      const { data, error } = await supabase.from('parking_listings_public').select('*');
      console.log('Database query result:', {
        data,
        error,
        count: data?.length
      });
      if (error) {
        console.error('Error fetching parking spots:', error);
        return;
      }

      // Transform the data to match the UI format
      const transformedData = data?.map((listing: any) => {
        console.log('Processing listing:', listing.title, 'with images:', listing.images);
        const basePrice = listing.price_per_month || Math.round(listing.price_per_hour * 24 * 30);
        // Add 100 AED service fee to match calculator pricing
        const customerPrice = basePrice + 100;
        return {
          id: listing.id,
          name: listing.title,
          district: listing.zone,
          price: customerPrice,
          basePrice: basePrice,
          image: listing.images && listing.images.length > 0 ? listing.images[0] : "/lovable-uploads/df8d1c6e-af94-4aa0-953c-34a15faf930f.webp",
          images: listing.images || [],
          specs: listing.features || ["Access Card", "Secure"],
          available: listing.status === 'approved'
        };
      }) || [];
      console.log('Transformed data:', transformedData);
      setParkingSpots(transformedData);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
    } finally {
      setLoading(false);
    }
  };

  const districts = ["Palm Jumeirah", "Dubai Marina", "Downtown", "DIFC", "Business Bay", "JLT", "Barsha Heights", "Deira"];
  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev => prev.includes(district) ? prev.filter(d => d !== district) : [...prev, district]);
  };
  const handleSelectZone = (districtSlug: string) => {
    // Navigate to dedicated zone page
    window.location.href = `/zones/${districtSlug}`;
  };
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDistricts([]);
    setPriceRange([0, 1500]);
    setShowAvailableOnly(false);
    // Clear URL parameters
    setSearchParams(new URLSearchParams());
  };
  const filteredSpots = parkingSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchTerm.toLowerCase()) || spot.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistricts.length === 0 || selectedDistricts.includes(spot.district);
    const matchesPrice = spot.price >= priceRange[0] && spot.price <= priceRange[1];
    const matchesAvailability = !showAvailableOnly || spot.available;
    return matchesSearch && matchesDistrict && matchesPrice && matchesAvailability;
  });
  return <div className="min-h-screen bg-gradient-to-b from-surface to-background animate-fade-in">
      {seoData}
      <Navbar />
      
      {/* Hero Section - Mobile Optimized */}
      <div className="relative h-[400px] sm:h-[500px] lg:h-[560px] -mt-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center scale-105" style={{ backgroundImage: `url(${findParkingHero})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-deep/65 via-primary-deep/35 to-background"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 pt-20">
          <div className="text-center text-white max-w-4xl">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-xs font-bold tracking-[0.2em] uppercase">
              ★ Find Your Spot
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight text-3d-light">
              Find a Parking Space <span className="text-gradient-primary bg-gradient-to-r from-primary-glow to-white bg-clip-text text-transparent">in Dubai</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              The quickest, easiest, and most secure way to rent a monthly parking space across Dubai.
            </p>
          </div>

          {/* Premium Search Bar */}
          <div className="w-full max-w-3xl mt-8 px-2">
            <div className="frame-3d p-2 sm:p-3 flex flex-col sm:flex-row gap-2 items-stretch">
              <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-white rounded-xl">
                <Search className="h-5 w-5 text-primary flex-shrink-0" />
                <Input
                  placeholder="Search by zone, building, or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-base"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} className="p-1 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button className="btn-3d-primary px-6 py-3 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2 sm:min-w-[140px]">
                <Search className="h-4 w-4" />
                Search
              </button>
            </div>
            {/* Quick chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {districtZones.slice(0, 6).map((z) => (
                <button
                  key={z.slug}
                  onClick={() => handleSelectZone(z.slug)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur border border-white/25 text-white hover:bg-white/25 transition-colors"
                >
                  {z.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* District Selector Section - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Choose Your Zone</h2>
          <p className="text-muted-foreground text-base sm:text-lg">Select a zone to find parking spaces in that area</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7 lg:gap-8">
          {districtZones.map(zone => {
          const zoneImages = {
            'dubai-marina': dubaiMarinaZone,
            'downtown': downtownZone,
            'palm-jumeirah': palmJumeirahZone,
            'business-bay': businessBayZone,
            'difc': difcZone,
            'deira': deiraZone
          };
          return (
            <div
              key={zone.slug}
              className="group relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2 touch-manipulation"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)',
                boxShadow: '0 20px 40px -15px hsl(var(--primary-deep) / 0.45), inset 0 1px 0 0 hsl(0 0% 100% / 0.4)',
              }}
            >
              <div className="relative overflow-hidden rounded-[14px] bg-white">
                {/* Zone Image */}
                <div className="relative h-48 sm:h-56 lg:h-64 overflow-hidden">
                  <img src={zoneImages[zone.slug as keyof typeof zoneImages]} alt={zone.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" decoding="async" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  {/* glossy top highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />

                  {/* Zone Title Overlay */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-white text-center px-4 drop-shadow-lg">
                      {zone.name}
                    </h3>
                  </div>
                </div>

                {/* Select Zone Button */}
                <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                  <Button onClick={() => handleSelectZone(zone.slug)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium min-h-[44px] touch-manipulation shadow-lg">
                    Select zone
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Dubai Live Maps CTA */}
        <DubaiLiveMapsCTA />

        {/* Parking Listings Section */}
        {loading ? <div id="listings-section" className="mt-16 text-center">
            <p className="text-muted-foreground">Loading parking spots...</p>
          </div> : filteredSpots.length > 0 ? <div id="listings-section" className="mt-16">
            
            
            
          </div> : <div id="listings-section" className="mt-16 text-center">
            <p className="text-muted-foreground">No parking spots found matching your criteria.</p>
          </div>}
      </div>

      <Footer />

    </div>;
};
export default FindParking;