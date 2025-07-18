
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pencil, Trash2, Eye, UserCheck, UserX, Mail, Phone, Calendar, MapPin, Car, Search } from 'lucide-react';
import { format } from 'date-fns';

interface UserProfile {
  user_id: string;
  full_name: string;
  phone: string;
  user_type: 'renter' | 'owner';
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
  signup_notified: boolean;
}

interface UserActivity {
  parking_bookings: number;
  parking_listings: number;
  verification_status: string | null;
  last_booking: string | null;
  last_listing: string | null;
  messages_count: number;
}

interface UserDetails extends UserProfile {
  activity: UserActivity;
  email: string;
  last_sign_in: string | null;
  is_online: boolean;
}

const UserManagementTab = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Form state for editing
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editUserType, setEditUserType] = useState<'renter' | 'owner'>('renter');

  useEffect(() => {
    fetchUsers();
    setupRealtimePresence();
  }, []);

  const setupRealtimePresence = () => {
    const channel = supabase.channel('user-presence');
    
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUserIds = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.user_id) {
              onlineUserIds.add(presence.user_id);
            }
          });
        });
        setOnlineUsers(onlineUserIds);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        newPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers(prev => new Set(prev).add(presence.user_id));
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          if (presence.user_id) {
            setOnlineUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(presence.user_id);
              return newSet;
            });
          }
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Fetch all user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user activities
      const userDetails: UserDetails[] = [];

      for (const profile of profiles || []) {
        try {
          // Get auth user data (requires service role, fallback gracefully)
          let authUser = null;
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(profile.user_id);
            authUser = authData.user;
          } catch (authError) {
            console.warn('Could not fetch auth data for user:', profile.user_id);
          }

          // Fetch user activity
          const [bookingsResult, listingsResult, verificationsResult, messagesResult] = await Promise.all([
            supabase.from('parking_bookings').select('id, created_at').eq('user_id', profile.user_id),
            supabase.from('parking_listings').select('id, created_at').eq('owner_id', profile.user_id),
            supabase.from('user_verifications').select('verification_status').eq('user_id', profile.user_id).maybeSingle(),
            supabase.from('user_messages').select('id').eq('user_id', profile.user_id)
          ]);

          const activity: UserActivity = {
            parking_bookings: bookingsResult.data?.length || 0,
            parking_listings: listingsResult.data?.length || 0,
            verification_status: verificationsResult.data?.verification_status || null,
            last_booking: bookingsResult.data?.[0]?.created_at || null,
            last_listing: listingsResult.data?.[0]?.created_at || null,
            messages_count: messagesResult.data?.length || 0
          };

          userDetails.push({
            ...profile,
            activity,
            email: authUser?.email || 'Unknown',
            last_sign_in: authUser?.last_sign_in_at || null,
            is_online: onlineUsers.has(profile.user_id)
          });
        } catch (error) {
          console.error('Error fetching data for user:', profile.user_id, error);
          // Add user with minimal data
          userDetails.push({
            ...profile,
            activity: {
              parking_bookings: 0,
              parking_listings: 0,
              verification_status: null,
              last_booking: null,
              last_listing: null,
              messages_count: 0
            },
            email: 'Unknown',
            last_sign_in: null,
            is_online: false
          });
        }
      }

      setUsers(userDetails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: UserDetails) => {
    setEditingUser(user);
    setEditFullName(user.full_name || '');
    setEditPhone(user.phone || '');
    setEditUserType(user.user_type);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: editFullName.trim(),
          phone: editPhone.trim(),
          user_type: editUserType,
        })
        .eq('user_id', editingUser.user_id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"? This will permanently delete all their data including bookings, listings, and messages. This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete user using auth admin (this will cascade delete profile and related data)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user. You may not have sufficient permissions.",
        variant: "destructive",
      });
    }
  };

  const handleViewUserDetails = (user: UserDetails) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesType = userTypeFilter === 'all' || user.user_type === userTypeFilter;
    
    return matchesSearch && matchesType;
  });

  const getUserTypeIcon = (userType: string) => {
    return userType === 'owner' ? <Car className="h-4 w-4" /> : <Search className="h-4 w-4" />;
  };

  const getUserTypeBadge = (userType: string) => {
    return userType === 'owner' ? 
      <Badge variant="default" className="flex items-center gap-1">
        <Car className="h-3 w-3" />
        Parking Owner
      </Badge> : 
      <Badge variant="secondary" className="flex items-center gap-1">
        <Search className="h-3 w-3" />
        Parking Seeker
      </Badge>;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by user type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="renter">Parking Seekers</SelectItem>
            <SelectItem value="owner">Parking Owners</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => onlineUsers.has(u.user_id)).length}
            </div>
            <p className="text-xs text-muted-foreground">Online Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.filter(u => u.user_type === 'owner').length}</div>
            <p className="text-xs text-muted-foreground">Parking Owners</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users.filter(u => u.user_type === 'renter').length}</div>
            <p className="text-xs text-muted-foreground">Parking Seekers</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management ({filteredUsers.length} users)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {onlineUsers.has(user.user_id) ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          )}
                          {getUserTypeIcon(user.user_type)}
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name || 'Unknown'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUserTypeBadge(user.user_type)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {onlineUsers.has(user.user_id) ? (
                          <Badge variant="default" className="bg-green-500">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <UserX className="h-3 w-3 mr-1" />
                            Offline
                          </Badge>
                        )}
                        {user.activity.verification_status && (
                          <Badge variant={user.activity.verification_status === 'verified' ? 'default' : 'secondary'}>
                            {user.activity.verification_status}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Bookings: {user.activity.parking_bookings}</div>
                        <div>Listings: {user.activity.parking_listings}</div>
                        <div>Messages: {user.activity.messages_count}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(user.created_at), 'MMM dd, yyyy')}
                        </div>
                        {user.last_sign_in && (
                          <div className="text-muted-foreground mt-1">
                            Last: {format(new Date(user.last_sign_in), 'MMM dd, HH:mm')}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewUserDetails(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditUser(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteUser(user.user_id, user.full_name || user.email)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {editingUser.full_name || editingUser.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="editUserType">User Type</Label>
                <Select value={editUserType} onValueChange={(value: 'renter' | 'owner') => setEditUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="renter">Parking Seeker</SelectItem>
                    <SelectItem value="owner">Parking Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveUser}>Save Changes</Button>
                <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* User Details Dialog */}
      {selectedUser && showUserDetails && (
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details: {selectedUser.full_name || selectedUser.email}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Profile Information</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>Phone:</strong> {selectedUser.phone || 'Not provided'}</div>
                    <div><strong>User Type:</strong> {getUserTypeBadge(selectedUser.user_type)}</div>
                    <div><strong>Status:</strong> {onlineUsers.has(selectedUser.user_id) ? '🟢 Online' : '🔴 Offline'}</div>
                    <div><strong>Joined:</strong> {format(new Date(selectedUser.created_at), 'PPP p')}</div>
                    {selectedUser.last_sign_in && (
                      <div><strong>Last Sign In:</strong> {format(new Date(selectedUser.last_sign_in), 'PPP p')}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Activity Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Parking Bookings:</strong> {selectedUser.activity.parking_bookings}</div>
                    <div><strong>Parking Listings:</strong> {selectedUser.activity.parking_listings}</div>
                    <div><strong>Messages:</strong> {selectedUser.activity.messages_count}</div>
                    <div><strong>Verification:</strong> {selectedUser.activity.verification_status || 'Not submitted'}</div>
                    {selectedUser.activity.last_booking && (
                      <div><strong>Last Booking:</strong> {format(new Date(selectedUser.activity.last_booking), 'PPP')}</div>
                    )}
                    {selectedUser.activity.last_listing && (
                      <div><strong>Last Listing:</strong> {format(new Date(selectedUser.activity.last_listing), 'PPP')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserManagementTab;
