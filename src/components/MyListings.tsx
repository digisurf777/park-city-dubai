import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Home, Calendar, MapPin, Eye, Edit, Trash } from "lucide-react";
import { format } from "date-fns";
import { ShareButton } from "@/components/ShareButton";

interface ParkingListing {
  id: string;
  title: string;
  address: string;
  zone: string;
  price_per_month: number;
  status: string;
  created_at: string;
  images: string[];
  features: string[];
}

export const MyListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<ParkingListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserListings();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchUserListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('parking_listings')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel('user-listings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'parking_listings',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          fetchUserListings(); // Refresh on any change to user's listings
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Live';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please login to view your listings</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          My Parking Listings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading your listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-8">
            <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No parking listings yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start earning by renting out your parking space
            </p>
            <Button 
              onClick={() => window.location.href = '/rent-out-your-space'}
              className="mt-2"
            >
              List Your Space
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{listing.title}</h4>
                        <Badge variant={getStatusVariant(listing.status)}>
                          {getStatusText(listing.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{listing.zone}</span>
                        </div>
                        <span>•</span>
                        <span className="font-medium">{listing.price_per_month} AED/month</span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">{listing.address}</p>

                      {listing.features && listing.features.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {listing.features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted {format(new Date(listing.created_at), 'MMM d, yyyy')}</span>
                      </div>

                      {listing.status === 'pending' && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 mt-2">
                          <p className="text-xs text-orange-800">
                            ⏳ Your listing is being reviewed by our team. You'll be notified once it's approved.
                          </p>
                        </div>
                      )}

                      {listing.status === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded p-2 mt-2">
                          <p className="text-xs text-green-800">
                            ✅ Your listing is live and visible to potential renters!
                          </p>
                        </div>
                      )}

                      {listing.status === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                          <p className="text-xs text-red-800">
                            ❌ Your listing was rejected. Please contact support for more details.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-1 ml-4">
                      {listing.status === 'approved' && (
                        <ShareButton
                          title={listing.title}
                          description={`Check out this parking space: ${listing.title} for AED ${listing.price_per_month}/month in ${listing.zone}`}
                          url={`${window.location.origin}/product/${listing.id}`}
                          price={listing.price_per_month}
                          location={listing.zone}
                          size="sm"
                          variant="ghost"
                        />
                      )}
                      {listing.images && listing.images.length > 0 && (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {listing.status === 'pending' && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};