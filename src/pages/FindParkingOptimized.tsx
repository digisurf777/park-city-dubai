import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Search, X, Car, CreditCard, Ruler, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 6; // Reduce initial load

const FindParkingOptimized = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1500]);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  const districtZones = [
    { name: "Dubai Marina", slug: "dubai-marina" },
    { name: "Downtown", slug: "downtown" },
    { name: "Palm Jumeirah", slug: "palm-jumeirah" },
    { name: "Business Bay", slug: "business-bay" },
    { name: "DIFC", slug: "difc" },
    { name: "Deira", slug: "deira" }
  ];

  // Memoized filtered results for better performance
  const filteredSpots = useMemo(() => {
    return parkingSpots.filter(spot => {
      const matchesSearch = !searchTerm || 
        spot.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spot.address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDistrict = selectedDistricts.length === 0 || 
        selectedDistricts.includes(spot.zone);
      
      const matchesPrice = spot.price_per_month >= priceRange[0] && 
        spot.price_per_month <= priceRange[1];
      
      return matchesSearch && matchesDistrict && matchesPrice;
    });
  }, [parkingSpots, searchTerm, selectedDistricts, priceRange]);

  // Paginated results
  const paginatedSpots = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredSpots.slice(0, startIndex + ITEMS_PER_PAGE);
  }, [filteredSpots, page]);

  const totalPages = Math.ceil(filteredSpots.length / ITEMS_PER_PAGE);

  // Optimized fetch function with error handling
  const fetchParkingSpots = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parking_listings')
        .select('id, title, description, address, zone, price_per_hour, price_per_month, features, images, status')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParkingSpots(data || []);
    } catch (error) {
      console.error('Error fetching parking spots:', error);
      setParkingSpots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  // Handle URL parameters
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      const district = districtZones.find(d => d.slug === districtParam);
      if (district) {
        setSelectedDistricts([district.name]);
      }
    }
  }, [searchParams]);

  // Handle image load errors
  const handleImageError = useCallback((spotId: string) => {
    setImageLoadErrors(prev => new Set(prev).add(spotId));
  }, []);

  const handleDistrictChange = useCallback((district: string, checked: boolean) => {
    setSelectedDistricts(prev => 
      checked 
        ? [...prev, district]
        : prev.filter(d => d !== district)
    );
    setPage(1); // Reset to first page
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedDistricts([]);
    setPriceRange([0, 1500]);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page, totalPages]);

  // Skeleton loader component
  const SkeletonCard = () => (
    <Card className="overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section - Simplified */}
      <section className="bg-primary py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Find Your Perfect Parking Spot
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">
              Discover convenient and affordable parking spaces across Dubai
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters - Mobile Optimized */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by location, building name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Mobile-friendly filters */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Districts */}
              <div>
                <h3 className="font-medium mb-3">Districts</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2">
                  {districtZones.map((district) => (
                    <div key={district.slug} className="flex items-center space-x-2">
                      <Checkbox
                        id={district.slug}
                        checked={selectedDistricts.includes(district.name)}
                        onCheckedChange={(checked) => 
                          handleDistrictChange(district.name, checked as boolean)
                        }
                      />
                      <label htmlFor={district.slug} className="text-sm font-medium cursor-pointer">
                        {district.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="lg:col-span-2">
                <h3 className="font-medium mb-3">
                  Monthly Price: AED {priceRange[0]} - AED {priceRange[1]}
                </h3>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={1500}
                  min={0}
                  step={50}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>AED 0</span>
                  <span>AED 1,500+</span>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedDistricts.length > 0 || priceRange[0] > 0 || priceRange[1] < 1500) && (
              <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="listings-section" className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {loading ? 'Loading...' : `${filteredSpots.length} parking spots found`}
            </h2>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          )}

          {/* Results Grid */}
          {!loading && (
            <>
              {paginatedSpots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedSpots.map((spot) => (
                    <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="relative aspect-video bg-gray-200">
                        {spot.images && spot.images.length > 0 && !imageLoadErrors.has(spot.id) ? (
                          <img
                            src={spot.images[0]}
                            alt={spot.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                            onError={() => handleImageError(spot.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Car className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary text-white">
                            {spot.zone}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{spot.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{spot.description}</p>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="line-clamp-1">{spot.address}</span>
                        </div>

                        {/* Features */}
                        {spot.features && spot.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {spot.features.slice(0, 3).map((feature: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {spot.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{spot.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Pricing */}
                        <div className="mb-4">
                          <div className="text-lg font-bold text-primary">
                            AED {spot.price_per_month || 'N/A'}/month
                          </div>
                          {spot.price_per_hour && (
                            <div className="text-sm text-gray-500">
                              AED {spot.price_per_hour}/hour
                            </div>
                          )}
                        </div>

                        <Link to={`/parking/${spot.id}`}>
                          <Button className="w-full touch-manipulation min-h-[44px]">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No parking spots found</h3>
                  <p className="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear All Filters
                  </Button>
                </div>
              )}

              {/* Load More Button */}
              {paginatedSpots.length < filteredSpots.length && (
                <div className="text-center mt-8">
                  <Button 
                    onClick={loadMore} 
                    variant="outline" 
                    className="px-8 py-3 touch-manipulation min-h-[44px]"
                  >
                    Load More ({filteredSpots.length - paginatedSpots.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FindParkingOptimized;