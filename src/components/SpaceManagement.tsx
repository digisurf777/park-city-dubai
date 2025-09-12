import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, Plus, Settings, RefreshCw, CheckCircle, XCircle, Wrench, Clock, Zap, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSpaceInitializer } from '@/hooks/useSpaceInitializer';

interface ParkingSpace {
  space_id: string;
  listing_id: string;
  listing_title: string;
  listing_address: string;
  listing_zone: string;
  space_number: string;
  space_status: string;
  override_status: boolean;
  override_reason: string | null;
  override_by: string | null;
  last_updated: string;
}

interface CreateSpacesResponse {
  success: boolean;
  listing_id: string;
  spaces_created: number;
  total_requested: number;
  message: string;
}

interface SpaceManagementProps {
  onRefresh?: () => void;
}

const SpaceManagement = ({ onRefresh }: SpaceManagementProps) => {
  const { toast } = useToast();
  const { initializeSpacesForListings, isInitializing } = useSpaceInitializer();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [filteredSpaces, setFilteredSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSpaces, setLoadingSpaces] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [overrideFilter, setOverrideFilter] = useState('all');
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [maintenanceReason, setMaintenanceReason] = useState('');
  const [createForm, setCreateForm] = useState({
    listingId: '',
    spaceCount: 1,
    spacePrefix: 'Space'
  });
  const [bulkAction, setBulkAction] = useState({
    status: 'available' as const,
    reason: ''
  });
  const [viewMode, setViewMode] = useState<'listings' | 'spaces'>('listings');
  const [listingFilter, setListingFilter] = useState<string | 'all'>('all');

  useEffect(() => {
    fetchSpaces();

    // Set up real-time subscription for parking spaces changes
    const spacesChannel = supabase
      .channel('parking-spaces-admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parking_spaces'
      }, (payload) => {
        console.log('Real-time parking spaces change detected:', payload);
        // Refresh spaces data when changes occur
        fetchSpaces();
      })
      .subscribe();

    // Set up real-time subscription for parking listings changes
    const listingsChannel = supabase
      .channel('parking-listings-admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'parking_listings'
      }, (payload) => {
        console.log('Real-time parking listings change detected:', payload);
        // Refresh spaces data when changes occur
        fetchSpaces();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(spacesChannel);
      supabase.removeChannel(listingsChannel);
    };
  }, []);

  useEffect(() => {
    filterSpaces();
  }, [spaces, searchTerm, statusFilter, zoneFilter, overrideFilter]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_parking_spaces_overview');
      
      if (error) throw error;
      
      // Deduplicate rows: prefer real space_id; fallback to per-listing unique when spaces are virtual
      const normalize = (v?: string) => (v || '').trim().toLowerCase().replace(/\s+/g, ' ');
      const byKey = new Map<string, ParkingSpace>();
      (data || []).forEach((s: ParkingSpace) => {
        const hasValidId = s.space_id && s.space_id !== 'null' && s.space_id !== 'undefined';
        const key = hasValidId ? s.space_id : `${s.listing_id}|${normalize(s.space_number)}`;
        const existing = byKey.get(key);
        if (!existing) {
          byKey.set(key, s);
        } else {
          // keep the latest
          const prev = existing.last_updated ? new Date(existing.last_updated).getTime() : 0;
          const next = s.last_updated ? new Date(s.last_updated).getTime() : 0;
          if (next > prev) byKey.set(key, s);
        }
      });
      
      // Additionally, if a listing ended up with multiple rows, keep just one (since each car park has one space)
      const onePerListing = new Map<string, ParkingSpace>();
      Array.from(byKey.values()).forEach((s) => {
        const existing = onePerListing.get(s.listing_id);
        if (!existing) {
          onePerListing.set(s.listing_id, s);
        } else {
          const prev = existing.last_updated ? new Date(existing.last_updated).getTime() : 0;
          const next = s.last_updated ? new Date(s.last_updated).getTime() : 0;
          if (next > prev) onePerListing.set(s.listing_id, s);
        }
      });

      setSpaces(Array.from(onePerListing.values()));
    } catch (error) {
      console.error('Error fetching spaces:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parking spaces",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterSpaces = () => {
    let filtered = spaces;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(space => 
        space.listing_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.listing_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        space.space_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(space => space.space_status === statusFilter);
    }

    // Zone filter
    if (zoneFilter !== 'all') {
      filtered = filtered.filter(space => space.listing_zone === zoneFilter);
    }

    // Override filter
    if (overrideFilter !== 'all') {
      filtered = filtered.filter(space => {
        if (overrideFilter === 'manual') return space.override_status;
        if (overrideFilter === 'automatic') return !space.override_status;
        return true;
      });
    }

    // Listing filter (set from "Manage spaces")
    if (listingFilter !== 'all') {
      filtered = filtered.filter(space => space.listing_id === listingFilter);
    }

    setFilteredSpaces(filtered);
  };

  const updateSpaceStatus = async (spaceId: string, newStatus: string, isOverride: boolean = true, reason?: string) => {
    // Validate that we have a real space ID
    if (!spaceId || spaceId === 'null' || spaceId === 'undefined') {
      toast({
        title: "No Parking Spaces Found",
        description: "Please click 'Initialize Test Spaces' first to create parking space records.",
        variant: "destructive",
      });
      return;
    }

    const space = spaces.find(s => s.space_id === spaceId);
    if (!space) {
      toast({
        title: "Error",
        description: "Space not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Add to loading state
      setLoadingSpaces(prev => new Set(prev.add(spaceId)));
      
      const { data, error } = await supabase.rpc('update_parking_space_status', {
        space_id: spaceId,
        new_status: newStatus,
        is_override: isOverride,
        override_reason: reason || null
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to update space status');
      }

      if (data && typeof data === 'object' && 'success' in data && (data as any).success) {
        const statusLabels = {
          available: 'Available to Rent',
          booked: 'Currently Booked',
          maintenance: 'Under Maintenance',
          reserved: 'Reserved'
        };

        toast({
          title: "Status Updated Successfully",
          description: `${space.listing_title} - ${space.space_number} is now ${statusLabels[newStatus as keyof typeof statusLabels]}`,
        });

        // Refresh the data to show live updates
        await fetchSpaces();
        onRefresh?.();
      } else {
        const errorMsg = (data && typeof data === 'object' && 'message' in data) 
          ? (data as any).message 
          : 'Update failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error updating space:', error);
      
      let errorMessage = "Failed to update space status";
      if (error?.message?.includes('Parking space not found')) {
        errorMessage = "Parking space not found. Please initialize parking spaces first using the 'Initialize Test Spaces' button.";
      } else if (error?.message?.includes('Access denied')) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      // Remove from loading state
      setLoadingSpaces(prev => {
        const next = new Set(prev);
        next.delete(spaceId);
        return next;
      });
    }
  };

  const deleteCarPark = async (listingId: string, listingTitle: string) => {
    try {
      setLoadingSpaces(prev => new Set(prev.add(listingId)));
      
      const { data, error } = await supabase.rpc('admin_delete_parking_listing_complete', {
        listing_id: listingId
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to delete car park');
      }

      if (data && typeof data === 'object' && 'success' in data && (data as any).success) {
        toast({
          title: "Car Park Deleted Successfully",
          description: `${listingTitle} has been permanently removed from both admin panel and website`,
        });

        // Refresh the data immediately to show live updates
        await fetchSpaces();
        
        // Also trigger refresh callback for any parent components
        onRefresh?.();
      } else {
        const errorMsg = (data && typeof data === 'object' && 'message' in data) 
          ? (data as any).message 
          : 'Delete failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error deleting car park:', error);
      
      let errorMessage = "Failed to delete car park";
      if (error?.message?.includes('Access denied')) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingSpaces(prev => {
        const next = new Set(prev);
        next.delete(listingId);
        return next;
      });
    }
  };

  const deleteSpace = async (spaceId: string, spaceNumber: string, listingTitle: string) => {
    if (!spaceId || spaceId === 'null' || spaceId === 'undefined') {
      toast({
        title: "Error",
        description: "Invalid space ID. Cannot delete this space.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingSpaces(prev => new Set(prev.add(spaceId)));
      
      const { data, error } = await supabase.rpc('delete_parking_space', {
        space_id: spaceId
      });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message || 'Failed to delete space');
      }

      if (data && typeof data === 'object' && 'success' in data && (data as any).success) {
        toast({
          title: "Car Park Deleted Successfully",
          description: `${listingTitle} has been permanently removed from both admin panel and website`,
        });

        // Refresh the data immediately to show live updates
        await fetchSpaces();
        
        // Also trigger refresh callback for any parent components
        onRefresh?.();
        
        // Force a browser refresh to ensure website updates immediately
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errorMsg = (data && typeof data === 'object' && 'message' in data) 
          ? (data as any).message 
          : 'Delete failed';
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      console.error('Error deleting space:', error);
      
      let errorMessage = "Failed to delete car park";
      if (error?.message?.includes('Access denied')) {
        errorMessage = "Access denied: Admin privileges required";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingSpaces(prev => {
        const next = new Set(prev);
        next.delete(spaceId);
        return next;
      });
    }
  };

  const createSpacesForListing = async () => {
    try {
      const { data, error } = await supabase.rpc('create_parking_spaces_for_listing', {
        p_listing_id: createForm.listingId,
        space_count: 1, // Always create only 1 space per car park
        space_prefix: 'Main'
      });

      if (error) throw error;

      const result = data as unknown as CreateSpacesResponse;

      if (result.success) {
        toast({
          title: "Success",
          description: `Car park space created successfully`,
        });

        setShowCreateModal(false);
        setCreateForm({ listingId: '', spaceCount: 1, spacePrefix: 'Main' });
        fetchSpaces();
      } else {
        toast({
          title: "Info",
          description: result.message || "Space already exists for this car park",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error creating spaces:', error);
      toast({
        title: "Error",
        description: "Failed to create car park space",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateSpaces = async () => {
    try {
      for (const spaceId of selectedSpaces) {
        await updateSpaceStatus(spaceId, bulkAction.status, true, bulkAction.reason);
      }

      toast({
        title: "Success",
        description: `Updated ${selectedSpaces.length} spaces successfully`,
      });

      setShowBulkModal(false);
      setSelectedSpaces([]);
      setBulkAction({ status: 'available', reason: '' });
    } catch (error) {
      console.error('Error bulk updating spaces:', error);
      toast({
        title: "Error",
        description: "Failed to update spaces",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, isOverride: boolean) => {
    const baseClasses = "text-xs font-medium";
    const overrideClasses = isOverride ? "ring-2 ring-orange-300" : "";
    
    switch (status) {
      case 'available':
        return <Badge variant="outline" className={`${baseClasses} ${overrideClasses} bg-green-50 text-green-700 border-green-200`}>Available</Badge>;
      case 'booked':
        return <Badge variant="outline" className={`${baseClasses} ${overrideClasses} bg-red-50 text-red-700 border-red-200`}>Booked</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className={`${baseClasses} ${overrideClasses} bg-yellow-50 text-yellow-700 border-yellow-200`}>Maintenance</Badge>;
      case 'reserved':
        return <Badge variant="outline" className={`${baseClasses} ${overrideClasses} bg-blue-50 text-blue-700 border-blue-200`}>Reserved</Badge>;
      default:
        return <Badge variant="outline" className={baseClasses}>{status}</Badge>;
    }
  };

  const getUniqueZones = () => {
    return Array.from(new Set(spaces.map(space => space.listing_zone))).filter(Boolean);
  };

  const getUniqueListings = () => {
    const byId = new Map<string, { id: string; title: string }>();
    spaces.forEach(space => {
      if (space.listing_id && !byId.has(space.listing_id)) {
        byId.set(space.listing_id, { id: space.listing_id, title: space.listing_title });
      }
    });
    return Array.from(byId.values());
  };

  // Build per-listing summaries from filtered spaces
  type ListingSummary = {
    listing_id: string;
    listing_title: string;
    listing_address: string;
    listing_zone: string;
    total: number;
    available: number;
    booked: number;
    maintenance: number;
    reserved: number;
    overridesManual: number;
    last_updated: string | null;
  };

  const listingSummaries: ListingSummary[] = Object.values(
    filteredSpaces.reduce((acc, s) => {
      const id = s.listing_id;
      if (!acc[id]) {
        acc[id] = {
          listing_id: id,
          listing_title: s.listing_title,
          listing_address: s.listing_address,
          listing_zone: s.listing_zone,
          total: 0,
          available: 0,
          booked: 0,
          maintenance: 0,
          reserved: 0,
          overridesManual: 0,
          last_updated: null
        } as ListingSummary;
      }
      acc[id].total += 1;
      if (s.space_status === 'available') acc[id].available += 1;
      if (s.space_status === 'booked') acc[id].booked += 1;
      if (s.space_status === 'maintenance') acc[id].maintenance += 1;
      if (s.space_status === 'reserved') acc[id].reserved += 1;
      if (s.override_status) acc[id].overridesManual += 1;
      const current = acc[id].last_updated ? new Date(acc[id].last_updated) : null;
      const next = s.last_updated ? new Date(s.last_updated) : null;
      if (next && (!current || next > current)) acc[id].last_updated = s.last_updated;
      return acc;
    }, {} as Record<string, ListingSummary>)
  );

  // Check if we have actual parking spaces or just listings
  const hasActualSpaces = spaces.some(space => space.space_id && space.space_id !== 'null');
  const hasListingsButNoSpaces = spaces.length > 0 && !hasActualSpaces;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading spaces...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Availability Overview */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Parking Availability Overview</h3>
        <p className="text-blue-600 text-sm">
          Changes to individual parking spaces now update live on the website. 
          When all spaces for a listing are booked/maintenance, it shows "Currently Booked". 
          When spaces are available, it shows "Book Now" with availability count.
        </p>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Space Management</h2>
        <div className="flex gap-2 items-center">
          <div className="flex rounded-md border">
            <Button 
              variant={viewMode === 'listings' ? 'default' : 'outline'}
              onClick={() => setViewMode('listings')}
              className="rounded-r-none"
            >
              Listings
            </Button>
            <Button 
              variant={viewMode === 'spaces' ? 'default' : 'outline'}
              onClick={() => setViewMode('spaces')}
              className="rounded-l-none border-l"
            >
              Spaces
            </Button>
          </div>
          <Button 
            onClick={() => {
              initializeSpacesForListings();
              setTimeout(fetchSpaces, 1000);
            }} 
            variant={hasListingsButNoSpaces ? "default" : "secondary"}
            disabled={isInitializing}
            className={`flex items-center gap-2 ${hasListingsButNoSpaces ? 'bg-blue-600 hover:bg-blue-700 text-white animate-pulse' : ''}`}
          >
            <Zap className="h-4 w-4" />
            {isInitializing ? 'Initializing...' : 'Initialize Test Spaces'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Spaces
          </Button>
          <Button onClick={fetchSpaces} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Warning Notice */}
      {hasListingsButNoSpaces && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                  <Zap className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800">
                  No Parking Spaces Found
                </h3>
                <p className="mt-1 text-sm text-orange-700">
                  You have {spaces.length} approved parking listings but no actual parking space records. 
                  The action buttons (Available, Booked, Maintenance) won't work until you create parking spaces.
                </p>
                <div className="mt-4">
                  <Button 
                    onClick={() => {
                      initializeSpacesForListings();
                      setTimeout(fetchSpaces, 1000);
                    }} 
                    disabled={isInitializing}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isInitializing ? 'Creating Spaces...' : 'Initialize Spaces Now'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {spaces.length === 0 && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">No Parking Listings Found</h3>
              <p className="mt-1 text-sm text-gray-600">
                Create some approved parking listings first, then return here to manage parking spaces.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search spaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zone</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {getUniqueZones().map(zone => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Override Status</Label>
              <Select value={overrideFilter} onValueChange={setOverrideFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="manual">Manual Override</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              {selectedSpaces.length > 0 && (
                <Button 
                  onClick={() => setShowBulkModal(true)} 
                  className="w-full flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Bulk Update ({selectedSpaces.length})
                </Button>
              )}
            </div>
          </div>
          {listingFilter !== 'all' && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline">
                Filtering by listing: {spaces.find(s => s.listing_id === listingFilter)?.listing_title || listingFilter}
              </Badge>
              <Button variant="ghost" size="sm" onClick={() => setListingFilter('all')}>Clear</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Spaces Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Parking Spaces</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Listing</Label>
              <Select value={createForm.listingId} onValueChange={(value) => setCreateForm({...createForm, listingId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a listing" />
                </SelectTrigger>
                <SelectContent>
                  {getUniqueListings().map(listing => (
                    <SelectItem key={listing.id} value={listing.id}>{listing.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
              <p><strong>Note:</strong> Each car park listing can only have one parking space. This ensures a 1:1 relationship between listings and available spaces on the website.</p>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createSpacesForListing} className="flex-1">Create Spaces</Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Listings Overview Table (deduplicated by listing) */}
      {viewMode === 'listings' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Listings Overview ({listingSummaries.length})</span>
              <div className="text-sm text-muted-foreground">
                Available: {listingSummaries.reduce((a,l)=>a+l.available,0)} | 
                Booked: {listingSummaries.reduce((a,l)=>a+l.booked,0)} | 
                Maintenance: {listingSummaries.reduce((a,l)=>a+l.maintenance,0)}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Spaces</TableHead>
                  <TableHead>Booked</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Overrides</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listingSummaries.map((l) => (
                  <TableRow key={l.listing_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{l.listing_title}</div>
                        <div className="text-sm text-muted-foreground">{l.listing_address}</div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{l.listing_zone}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {l.available} / {l.total} Available
                      </Badge>
                    </TableCell>
                    <TableCell>{l.booked}</TableCell>
                    <TableCell>{l.maintenance}</TableCell>
                    <TableCell>{l.overridesManual}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {l.last_updated ? format(new Date(l.last_updated), 'MMM d, HH:mm') : '—'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => { setViewMode('spaces'); setListingFilter(l.listing_id); }}>
                        Manage spaces
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Parking Spaces Table */}
      {viewMode === 'spaces' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Parking Spaces ({filteredSpaces.length})</span>
              <div className="text-sm text-muted-foreground">
                Available: {filteredSpaces.filter(s => s.space_status === 'available').length} | 
                Booked: {filteredSpaces.filter(s => s.space_status === 'booked').length} | 
                Maintenance: {filteredSpaces.filter(s => s.space_status === 'maintenance').length}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Override</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSpaces.map((space) => (
                  <TableRow key={space.space_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{space.listing_title}</div>
                        <div className="text-sm text-muted-foreground">{space.listing_address}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{space.listing_zone}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(space.space_status, space.override_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {space.override_status ? (
                          <div>
                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                              Manual
                            </Badge>
                            {space.override_reason && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="text-xs text-muted-foreground mt-1 truncate max-w-[100px]">
                                      {space.override_reason}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{space.override_reason}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Auto
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(space.last_updated), 'MMM d, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={space.space_status === 'available' ? "default" : "outline"}
                                onClick={() => updateSpaceStatus(space.space_id, 'available')}
                                disabled={!space.space_id || loadingSpaces.has(space.space_id)}
                                className="h-8 w-8 p-0"
                              >
                                {loadingSpaces.has(space.space_id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Set Available</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={space.space_status === 'booked' ? "default" : "outline"}
                                onClick={() => updateSpaceStatus(space.space_id, 'booked')}
                                disabled={!space.space_id || loadingSpaces.has(space.space_id)}
                                className="h-8 w-8 p-0"
                              >
                                {loadingSpaces.has(space.space_id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Set Booked</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant={space.space_status === 'maintenance' ? "default" : "outline"}
                              disabled={!space.space_id || loadingSpaces.has(space.space_id)}
                              className="h-8 w-8 p-0"
                            >
                              {loadingSpaces.has(space.space_id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Wrench className="h-3 w-3" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Set Maintenance Mode</AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="space-y-2">
                                  <p>This will mark the space as under maintenance.</p>
                                  <Textarea
                                    placeholder="Reason for maintenance (optional)"
                                    value={maintenanceReason}
                                    onChange={(e) => setMaintenanceReason(e.target.value)}
                                  />
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={!space.space_id}
                                onClick={() => {
                                  if (!space.space_id) return;
                                  updateSpaceStatus(space.space_id, 'maintenance', true, maintenanceReason);
                                  setMaintenanceReason('');
                                }}
                              >
                                Set Maintenance
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={space.space_status === 'reserved' ? "default" : "outline"}
                                onClick={() => updateSpaceStatus(space.space_id, 'reserved')}
                                disabled={!space.space_id || loadingSpaces.has(space.space_id)}
                                className="h-8 w-8 p-0"
                              >
                                {loadingSpaces.has(space.space_id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Clock className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Set Reserved</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loadingSpaces.has(space.space_id || space.listing_id)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {loadingSpaces.has(space.space_id || space.listing_id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {space.space_id ? "Delete Parking Space" : "Delete Car Park"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                <div className="space-y-2">
                                  <p>
                                    {space.space_id 
                                      ? "Are you sure you want to permanently delete this parking space?"
                                      : "Are you sure you want to permanently delete this entire car park?"
                                    }
                                  </p>
                                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800">
                                      {space.space_id ? "Space Details:" : "Car Park Details:"}
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                      {space.listing_title}
                                      {space.space_id && ` - ${space.space_number}`}
                                    </p>
                                  </div>
                                  <p className="text-sm text-red-600 font-medium">
                                    This action cannot be undone and will be immediately reflected on your website.
                                    {!space.space_id && " All associated data will be permanently deleted."}
                                  </p>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  if (space.space_id) {
                                    deleteSpace(space.space_id, space.space_number, space.listing_title);
                                  } else {
                                    deleteCarPark(space.listing_id, space.listing_title);
                                  }
                                }}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {space.space_id ? "Delete Space" : "Delete Car Park"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Bulk Update Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Update Spaces ({selectedSpaces.length} selected)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={bulkAction.status} onValueChange={(value: any) => setBulkAction({...bulkAction, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Reason (Optional)</Label>
              <Input
                value={bulkAction.reason}
                onChange={(e) => setBulkAction({...bulkAction, reason: e.target.value})}
                placeholder="Reason for status change"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={bulkUpdateSpaces} className="flex-1">Update Spaces</Button>
              <Button variant="outline" onClick={() => setShowBulkModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpaceManagement;