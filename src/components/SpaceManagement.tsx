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
import { Search, Filter, Plus, Settings, RefreshCw, CheckCircle, XCircle, Wrench, Clock, Zap, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    fetchSpaces();
  }, []);

  useEffect(() => {
    filterSpaces();
  }, [spaces, searchTerm, statusFilter, zoneFilter, overrideFilter]);

  const fetchSpaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_parking_spaces_overview');
      
      if (error) throw error;
      
      setSpaces(data || []);
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

    try {
      // Add to loading state
      setLoadingSpaces(prev => new Set(prev.add(spaceId)));
      
      const { data, error } = await supabase.rpc('update_parking_space_status', {
        space_id: spaceId,
        new_status: newStatus,
        is_override: isOverride,
        override_reason: reason || null
      });

      if (error) throw error;

      const statusLabels = {
        available: 'Available to Rent',
        booked: 'Currently Booked',
        maintenance: 'Under Maintenance',
        reserved: 'Reserved'
      };

      toast({
        title: "Success",
        description: `Space status changed to ${statusLabels[newStatus as keyof typeof statusLabels]}`,
      });

      fetchSpaces();
      onRefresh?.();
    } catch (error: any) {
      console.error('Error updating space:', error);
      
      let errorMessage = "Failed to update space status";
      if (error?.message?.includes('Parking space not found')) {
        errorMessage = "Parking space not found. Please initialize parking spaces first using the 'Initialize Test Spaces' button.";
      }
      
      toast({
        title: "Error",
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

  const createSpacesForListing = async () => {
    try {
      const { data, error } = await supabase.rpc('create_parking_spaces_for_listing', {
        p_listing_id: createForm.listingId,
        space_count: createForm.spaceCount,
        space_prefix: createForm.spacePrefix
      });

      if (error) throw error;

      const result = data as unknown as CreateSpacesResponse;

      toast({
        title: "Success",
        description: `${result.spaces_created} spaces created successfully`,
      });

      setShowCreateModal(false);
      setCreateForm({ listingId: '', spaceCount: 1, spacePrefix: 'Space' });
      fetchSpaces();
    } catch (error) {
      console.error('Error creating spaces:', error);
      toast({
        title: "Error",
        description: "Failed to create spaces",
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
    return Array.from(new Set(spaces.map(space => ({ id: space.listing_id, title: space.listing_title }))))
      .filter(listing => listing.id);
  };

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
        <div className="flex gap-2">
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
        </CardContent>
      </Card>

      {/* Spaces Table */}
      <Card>
        <CardHeader>
          <CardTitle>Parking Spaces ({filteredSpaces.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedSpaces.length === filteredSpaces.length && filteredSpaces.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSpaces(filteredSpaces.map(s => s.space_id).filter(Boolean));
                        } else {
                          setSelectedSpaces([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Space</TableHead>
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
                      <input
                        type="checkbox"
                        checked={selectedSpaces.includes(space.space_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSpaces([...selectedSpaces, space.space_id]);
                          } else {
                            setSelectedSpaces(selectedSpaces.filter(id => id !== space.space_id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{space.space_number}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{space.listing_title}</div>
                        <div className="text-muted-foreground">{space.listing_address}</div>
                      </div>
                    </TableCell>
                    <TableCell>{space.listing_zone}</TableCell>
                    <TableCell>{getStatusBadge(space.space_status, space.override_status)}</TableCell>
                    <TableCell>
                      {space.override_status ? (
                        <div className="text-sm">
                          <Badge variant="secondary" className="mb-1">Manual</Badge>
                          {space.override_reason && (
                            <div className="text-xs text-muted-foreground">{space.override_reason}</div>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">Automatic</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(space.last_updated), 'MMM d, HH:mm')}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <div className="flex gap-1">
                          {/* Available Button - Green */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={space.space_status === 'available' ? 'default' : 'outline'}
                                onClick={() => updateSpaceStatus(space.space_id, 'available', true)}
                                disabled={space.space_status === 'available' || loadingSpaces.has(space.space_id) || !space.space_id}
                                className={`text-green-600 hover:text-green-700 border-green-200 hover:border-green-300 ${
                                  space.space_status === 'available' 
                                    ? 'bg-green-50 text-green-700 border-green-300' 
                                    : ''
                                }`}
                                aria-label="Make space available to rent"
                              >
                                {loadingSpaces.has(space.space_id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-3 w-3" />
                                )}
                                <span className="hidden sm:inline ml-1">Available</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Make space available to rent</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Booked Button - Red */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant={space.space_status === 'booked' ? 'default' : 'outline'}
                                onClick={() => updateSpaceStatus(space.space_id, 'booked', true)}
                                disabled={space.space_status === 'booked' || loadingSpaces.has(space.space_id) || !space.space_id}
                                className={`text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 ${
                                  space.space_status === 'booked' 
                                    ? 'bg-red-50 text-red-700 border-red-300' 
                                    : ''
                                }`}
                                aria-label="Mark space as currently booked"
                              >
                                {loadingSpaces.has(space.space_id) ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <XCircle className="h-3 w-3" />
                                )}
                                <span className="hidden sm:inline ml-1">Booked</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Mark space as currently booked</p>
                            </TooltipContent>
                          </Tooltip>

                          {/* Maintenance Button - Yellow with Confirmation */}
                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant={space.space_status === 'maintenance' ? 'default' : 'outline'}
                                    disabled={space.space_status === 'maintenance' || loadingSpaces.has(space.space_id) || !space.space_id}
                                    className={`text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300 ${
                                      space.space_status === 'maintenance' 
                                        ? 'bg-yellow-50 text-yellow-700 border-yellow-300' 
                                        : ''
                                    }`}
                                    aria-label="Set space to maintenance mode"
                                  >
                                    {loadingSpaces.has(space.space_id) ? (
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                      <Wrench className="h-3 w-3" />
                                    )}
                                    <span className="hidden sm:inline ml-1">Maintenance</span>
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Set space to maintenance mode</p>
                              </TooltipContent>
                            </Tooltip>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Set Space to Maintenance</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will mark space "{space.space_number}" as under maintenance and unavailable for booking.
                                  Please provide a reason for maintenance.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <div className="my-4">
                                <Label htmlFor="maintenance-reason">Maintenance Reason</Label>
                                <Textarea
                                  id="maintenance-reason"
                                  placeholder="e.g., Cleaning, Repairs, Safety inspection..."
                                  value={maintenanceReason}
                                  onChange={(e) => setMaintenanceReason(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setMaintenanceReason('')}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    updateSpaceStatus(
                                      space.space_id, 
                                      'maintenance', 
                                      true, 
                                      maintenanceReason || 'Manual maintenance mode'
                                    );
                                    setMaintenanceReason('');
                                  }}
                                  disabled={!maintenanceReason.trim()}
                                >
                                  Confirm Maintenance
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
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
            <div>
              <Label>Number of Spaces</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={createForm.spaceCount}
                onChange={(e) => setCreateForm({...createForm, spaceCount: parseInt(e.target.value) || 1})}
              />
            </div>
            <div>
              <Label>Space Prefix</Label>
              <Input
                value={createForm.spacePrefix}
                onChange={(e) => setCreateForm({...createForm, spacePrefix: e.target.value})}
                placeholder="e.g., Space, Slot, Bay"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={createSpacesForListing} className="flex-1">Create Spaces</Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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