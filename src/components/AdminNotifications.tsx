import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, MapPin, Calendar, DollarSign, User, Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
interface AdminNotification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  booking_id: string | null;
  user_id: string | null;
  is_read: boolean;
  priority: string;
  created_at: string;
  parking_bookings?: {
    id: string;
    location: string;
    zone: string;
    start_time: string;
    end_time: string;
    cost_aed: number;
    duration_hours: number;
    status: string;
    user_id: string;
    listing_id?: string;
  };
  customerProfile?: {
    full_name: string;
    email: string;
    phone: string;
    verification_status: string;
  };
}
interface UserProfile {
  full_name: string;
  phone: string;
  email: string;
}
interface AdminNotificationsProps {
  isAdmin: boolean;
}
const AdminNotifications = ({
  isAdmin
}: AdminNotificationsProps) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    componentMounted: false,
    fetchAttempts: 0,
    lastFetchTime: null as string | null,
    authErrors: [] as string[],
    sessionInfo: null as any
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    console.log('🔔 AdminNotifications useEffect - isAdmin:', isAdmin, 'at', timestamp);

    // Update debug info
    setDebugInfo(prev => ({
      ...prev,
      componentMounted: true,
      sessionInfo: {
        timestamp,
        isAdmin,
        host: window.location.host,
        incognito: !window.sessionStorage,
        userAgent: navigator.userAgent.includes('Incognito') || navigator.userAgent.includes('Private')
      }
    }));
    if (isAdmin) {
      console.log('✅ Admin confirmed, fetching notifications...');
      setAdminCheckComplete(true);
      fetchNotifications();

      // Set up real-time subscription for notifications
      const channel = supabase.channel('admin-notifications-changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'admin_notifications'
      }, payload => {
        console.log('Real-time notification change:', payload);
        fetchNotifications();
      }).subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      console.log('❌ Not admin yet, waiting...');
      setLoading(true);

      // Add timeout with better error tracking
      const timeout = setTimeout(() => {
        if (!isAdmin && !adminCheckComplete) {
          console.log('🔄 Timeout reached, admin status still false');
          setDebugInfo(prev => ({
            ...prev,
            authErrors: [...prev.authErrors, `${timestamp}: Admin check timeout after 15s`].slice(-3)
          }));
          setLoading(false);
        }
      }, 15000); // Increased to 15 seconds

      return () => clearTimeout(timeout);
    }
  }, [isAdmin, adminCheckComplete]);
  const fetchNotifications = async () => {
    const timestamp = new Date().toLocaleTimeString();
    try {
      console.log('📡 Fetching notifications at', timestamp);

      // Update debug info
      setDebugInfo(prev => ({
        ...prev,
        fetchAttempts: prev.fetchAttempts + 1,
        lastFetchTime: timestamp
      }));

      // Check session first
      const {
        data: sessionData
      } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        console.error('❌ No active session for notifications fetch');
        setDebugInfo(prev => ({
          ...prev,
          authErrors: [...prev.authErrors, `${timestamp}: No session available`].slice(-3)
        }));
        throw new Error('No active session');
      }
      const {
        data,
        error
      } = await supabase.from('admin_notifications').select(`
          *,
          parking_bookings!inner (
            id,
            location,
            zone,
            start_time,
            end_time,
            cost_aed,
            duration_hours,
            status,
            user_id,
            listing_id
          )
        `).order('created_at', {
        ascending: false
      }).limit(50);
      
      if (error) throw error;

      // Fetch user info and proper zone from parking listings
      if (data) {
        const enrichedData = await Promise.all(
          data.map(async (notification) => {
            let properZone = notification.parking_bookings?.zone;
            
            // Try to get the proper zone from parking_listings with flexible matching
            if (notification.parking_bookings?.location) {
              const location = String(notification.parking_bookings.location).trim();
              let listingZone: string | null = null;

              // 1) Flexible match in private listings (admin has access)
              const { data: listingData } = await supabase
                .from('parking_listings')
                .select('zone')
                .or(
                  `address.eq.${location},title.eq.${location},address.ilike.%${location}%,title.ilike.%${location}%`
                )
                .in('status', ['approved', 'published'])
                .limit(1)
                .maybeSingle();

              if (listingData?.zone) {
                listingZone = listingData.zone as string;
              } else {
                // 2) Fallback to public listings
                const { data: publicListing } = await supabase
                  .from('parking_listings_public')
                  .select('zone')
                  .or(
                    `address.eq.${location},title.eq.${location},address.ilike.%${location}%,title.ilike.%${location}%`
                  )
                  .eq('status', 'published')
                  .limit(1)
                  .maybeSingle();
                if (publicListing?.zone) listingZone = publicListing.zone as string;
              }

              if (listingZone) {
                properZone = listingZone;
              }
            }
            
            if (notification.parking_bookings?.user_id) {
              const { data: userInfo } = await supabase
                .rpc('get_user_display_info', { user_uuid: notification.parking_bookings.user_id });
              
              return {
                ...notification,
                parking_bookings: {
                  ...notification.parking_bookings,
                  zone: properZone
                },
                customerProfile: userInfo?.[0] || undefined
              };
            }
            
            return {
              ...notification,
              parking_bookings: {
                ...notification.parking_bookings,
                zone: properZone
              }
            };
          })
        );
        
        console.log('✅ Fetched notifications successfully:', enrichedData.length, 'notifications');
        setNotifications(enrichedData);
      } else {
        setNotifications([]);
      }

      // Clear any auth errors on success
      setDebugInfo(prev => ({
        ...prev,
        authErrors: []
      }));
    } catch (error: any) {
      const errorMsg = error.message || 'Unknown error';
      console.error('❌ Error fetching notifications:', error);
      setDebugInfo(prev => ({
        ...prev,
        authErrors: [...prev.authErrors, `${timestamp}: ${errorMsg}`].slice(-3)
      }));
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      const {
        error
      } = await supabase.from('admin_notifications').update({
        is_read: true,
        read_at: new Date().toISOString()
      }).eq('id', notificationId);
      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.map(n => n.id === notificationId ? {
        ...n,
        is_read: true
      } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const sendSupportChatNotification = async (userId: string, subject: string, message: string) => {
    try {
      const { error } = await supabase.from('user_messages').insert({
        user_id: userId,
        subject,
        message,
        from_admin: true,
        read_status: false
      });
      
      if (error) throw error;
      console.log('✅ Support chat notification sent successfully');
    } catch (error) {
      console.error('❌ Failed to send support chat notification:', error);
      // Don't throw - we don't want to break the main flow
    }
  };
  const approveBooking = async (notification: AdminNotification) => {
    if (!notification.booking_id || !notification.parking_bookings) return;
    setActionLoading(`approve-${notification.id}`);
    try {
      // Resolve customer email/name from enriched notification or RPC fallback
      const booking = notification.parking_bookings;
      let userEmail = notification.customerProfile?.email || '';
      let userName = notification.customerProfile?.full_name || 'Customer';
      if (!userEmail) {
        const { data: userInfo } = await supabase
          .rpc('get_user_display_info', { user_uuid: booking.user_id });
        if (userInfo && userInfo[0]) {
          userEmail = userInfo[0].email || '';
          userName = userInfo[0].full_name || userName;
        }
      }

      // Update booking status - use 'confirmed' instead of 'approved'
      const { error: updateError } = await supabase.from('parking_bookings').update({
        status: 'confirmed'
      }).eq('id', notification.booking_id);
      if (updateError) throw updateError;

      // Get owner information from listing (primary) or driver_owner_messages (fallback)
      let ownerEmail = null;
      let ownerName = null;
      let ownerId = null;

      // Primary: Get owner from the listing
      if (booking.listing_id) {
        const { data: listing, error: listingError } = await supabase
          .from("parking_listings")
          .select("owner_id")
          .eq("id", booking.listing_id)
          .single();

        if (!listingError && listing?.owner_id) {
          ownerId = listing.owner_id;
          console.log("Found owner ID from listing:", ownerId);
        }
      }

      // Fallback: Try to get owner from driver_owner_messages if listing lookup failed
      if (!ownerId) {
        const { data: ownerMessages } = await supabase
          .from("driver_owner_messages")
          .select("owner_id")
          .eq("booking_id", notification.booking_id)
          .limit(1);

        if (ownerMessages && ownerMessages.length > 0) {
          ownerId = ownerMessages[0].owner_id;
          console.log("Found owner ID from messages (fallback):", ownerId);
        }
      }

      // Get owner profile if we have an owner ID
      if (ownerId) {
        const { data: ownerProfile, error: ownerProfileError } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("user_id", ownerId)
          .single();

        if (!ownerProfileError && ownerProfile) {
          ownerEmail = ownerProfile.email;
          ownerName = ownerProfile.full_name;
          console.log("Owner email found:", ownerEmail);
        } else {
          console.warn("Could not fetch owner profile:", ownerProfileError);
        }
      } else {
        console.warn("No owner found for booking:", notification.booking_id);
      }

      // Send confirmation email to driver
      console.log('📧 [Booking Approval] Starting email sending process...');
      console.log('📧 [Booking Approval] Driver email:', userEmail);
      console.log('📧 [Booking Approval] Driver name:', userName);
      console.log('📧 [Booking Approval] Owner ID:', ownerId);
      console.log('📧 [Booking Approval] Owner email:', ownerEmail);
      console.log('📧 [Booking Approval] Owner name:', ownerName);
      
      if (userEmail) {
        try {
          console.log('📧 [Booking Approval] Invoking send-booking-confirmed for driver...');
          const { data, error } = await supabase.functions.invoke('send-booking-confirmed', {
            body: {
              userEmail,
              userName,
              bookingDetails: {
                location: booking.location,
                startDate: format(new Date(booking.start_time), 'PPP'),
                endDate: format(new Date(booking.end_time), 'PPP'),
                amount: `${booking.cost_aed} AED`
              }
            }
          });
          if (error) {
            console.error('❌ [Booking Approval] send-booking-confirmed returned error:', error);
          } else {
            console.log('✅ [Booking Approval] Driver confirmation email sent successfully:', data);
          }
        } catch (emailError) {
          console.error('❌ [Booking Approval] Failed to send driver confirmation email:', emailError);
        }
      } else {
        console.warn('⚠️ [Booking Approval] No customer email found; skipping driver email');
      }

      // Send confirmation email to owner if found
      if (ownerEmail) {
        try {
          console.log('📧 [Booking Approval] Invoking send-owner-booking-confirmed for owner...');
          const { data, error } = await supabase.functions.invoke('send-owner-booking-confirmed', {
            body: {
              ownerEmail: ownerEmail,
              ownerName: ownerName,
              bookingDetails: {
                location: booking.location,
                driverName: userName,
                startDate: format(new Date(booking.start_time), 'PPP'),
                endDate: format(new Date(booking.end_time), 'PPP'),
              }
            }
          });
          if (error) {
            console.error('❌ [Booking Approval] send-owner-booking-confirmed returned error:', error);
          } else {
            console.log('✅ [Booking Approval] Owner confirmation email sent successfully:', data);
          }
        } catch (emailError) {
          console.error('❌ [Booking Approval] Failed to send owner confirmation email:', emailError);
        }
      } else {
        console.warn('⚠️ [Booking Approval] No owner email found; skipping owner email');
      }

      // Send support chat notification
      await sendSupportChatNotification(
        booking.user_id,
        'Booking Confirmed! 🎉',
        `Your booking has been successfully confirmed! 🎯\n\n` +
        `📍 Booking Details:\n\n` +
        `Location: ${booking.location}\n` +
        `Start Date: ${format(new Date(booking.start_time), 'PPP')}\n` +
        `End Date: ${format(new Date(booking.end_time), 'PPP')}\n` +
        `Amount: ${booking.cost_aed} AED\n\n` +
        `💬 Connect directly with the parking space owner through the in-platform chat to discuss access arrangements and any other details.\n\n` +
        `Should you have any questions or require assistance, please contact us at support@shazamparking.ae or use the internal chat function available in your dashboard.`
      );

      // Mark notification as read
      await markAsRead(notification.id);
      toast({
        title: "Success",
        description: "Booking confirmed and both parties notified"
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast({
        title: "Error",
        description: "Failed to approve booking",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };
  const deleteBooking = async (notification: AdminNotification) => {
    if (!notification.booking_id) return;
    const confirmed = window.confirm(`Are you sure you want to delete this booking permanently?\n\n` + `Location: ${notification.parking_bookings?.location}\n` + `Cost: ${notification.parking_bookings?.cost_aed} AED\n\n` + `This action cannot be undone.`);
    if (!confirmed) return;
    setActionLoading(`delete-${notification.id}`);
    try {
      // Primary: call secure RPC that cleans related records
      const {
        data,
        error
      } = await supabase.rpc('admin_delete_booking_complete', {
        booking_id: notification.booking_id
      });
      if (error) throw error;

      // Mark as read and refresh
      await markAsRead(notification.id);
      toast({
        title: 'Success',
        description: 'Booking deleted successfully'
      });
      fetchNotifications();
    } catch (err: any) {
      console.error('RPC delete failed, attempting fallback deletes...', err);
      try {
        // Fallback: perform explicit deletes with admin RLS policies
        await supabase.from('driver_owner_messages').delete().eq('booking_id', notification.booking_id);
        await supabase.from('admin_notifications').delete().eq('booking_id', notification.booking_id);
        await supabase.from('user_notifications').delete().eq('booking_id', notification.booking_id);
        const {
          error: delBookingErr
        } = await supabase.from('parking_bookings').delete().eq('id', notification.booking_id);
        if (delBookingErr) throw delBookingErr;
        await markAsRead(notification.id);
        toast({
          title: 'Success',
          description: 'Booking deleted successfully'
        });
        fetchNotifications();
      } catch (finalErr: any) {
        console.error('Fallback delete failed:', finalErr);
        toast({
          title: 'Error',
          description: `Failed to delete booking: ${finalErr?.message || 'Unknown error'}`,
          variant: 'destructive'
        });
      }
    } finally {
      setActionLoading(null);
    }
  };
  const rejectBooking = async (notification: AdminNotification) => {
    if (!notification.booking_id || !notification.parking_bookings) return;
    setActionLoading(`reject-${notification.id}`);
    try {
      // Get user profile data
      const {
        data: userProfile
      } = await supabase.from('profiles').select('full_name, phone, email').eq('user_id', notification.parking_bookings.user_id).single();

      // Update booking status
      const {
        error: updateError
      } = await supabase.from('parking_bookings').update({
        status: 'cancelled'
      }).eq('id', notification.booking_id);
      if (updateError) throw updateError;

      // Send rejection email
      const booking = notification.parking_bookings;
      try {
        await supabase.functions.invoke('send-booking-rejected', {
          body: {
            userEmail: userProfile?.email || '',
            userName: userProfile?.full_name || 'Customer',
            bookingDetails: {
              location: booking.location,
              startDate: format(new Date(booking.start_time), 'PPP'),
              endDate: format(new Date(booking.end_time), 'PPP'),
              amount: `${booking.cost_aed} AED`
            }
          }
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
        // Don't fail the rejection if email fails
      }

      // Send support chat notification
      await sendSupportChatNotification(
        booking.user_id,
        'Booking Update ❌',
        `We're sorry, but your parking booking request could not be approved at this time.\n\n` +
        `📍 Location: ${booking.location}\n` +
        `📅 Dates: ${format(new Date(booking.start_time), 'PPP')} - ${format(new Date(booking.end_time), 'PPP')}\n\n` +
        `Please contact our support team if you need alternative parking options or have any questions.`
      );

      // Mark notification as read
      await markAsRead(notification.id);
      toast({
        title: "Success",
        description: "Booking rejected successfully"
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      toast({
        title: "Error",
        description: "Failed to reject booking",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const revertToPending = async (notification: AdminNotification) => {
    if (!notification.booking_id || !notification.parking_bookings) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to revert this booking back to pending status?\n\n` +
      `Location: ${notification.parking_bookings?.location}\n` +
      `Cost: ${notification.parking_bookings?.cost_aed} AED\n\n` +
      `This will change the status from approved to pending.`
    );
    
    if (!confirmed) return;
    
    setActionLoading(`revert-${notification.id}`);
    try {
      const booking = notification.parking_bookings;

      // Resolve customer email/name
      let userEmail = notification.customerProfile?.email || '';
      let userName = notification.customerProfile?.full_name || 'Customer';
      
      if (!userEmail) {
        const { data: userInfo } = await supabase
          .rpc('get_user_display_info', { user_uuid: booking.user_id });
        if (userInfo && userInfo[0]) {
          userEmail = userInfo[0].email || '';
          userName = userInfo[0].full_name || userName;
        }
      }

      // Update booking status back to pending
      const { error: updateError } = await supabase
        .from('parking_bookings')
        .update({ status: 'pending' })
        .eq('id', notification.booking_id);
      
      if (updateError) throw updateError;

      // Send email notification
      if (userEmail) {
        try {
          await supabase.functions.invoke('send-booking-pending-payment', {
            body: {
              userEmail,
              userName,
              bookingDetails: {
                location: booking.location,
                startDate: format(new Date(booking.start_time), 'PPP'),
                endDate: format(new Date(booking.end_time), 'PPP'),
                amount: `${booking.cost_aed} AED`
              }
            }
          });
        } catch (emailError) {
          console.error('Failed to send pending payment email:', emailError);
        }
      }

      // Send support chat notification
      await sendSupportChatNotification(
        booking.user_id,
        'Booking Status Updated 🔄',
        `Your booking status has been reverted to pending.\n\n` +
        `📍 Location: ${booking.location}\n` +
        `📅 Dates: ${format(new Date(booking.start_time), 'PPP')} - ${format(new Date(booking.end_time), 'PPP')}\n` +
        `💰 Amount: ${booking.cost_aed} AED\n\n` +
        `Your booking will be approved once payment is issued. Please check your email for payment instructions.`
      );

      // Mark notification as read
      await markAsRead(notification.id);
      
      toast({
        title: "Success",
        description: "Booking reverted to pending status and notification sent"
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error reverting booking:', error);
      toast({
        title: "Error",
        description: "Failed to revert booking status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent':
        return 'bg-red-200 text-red-900 border-red-300';
      case 'normal':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  const unreadCount = notifications.filter(n => !n.is_read).length;
  if (loading) {
    return <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm text-gray-500">
          {!isAdmin ? 'Verifying admin access...' : 'Loading notifications...'}
        </p>
        
        {/* Debug info for loading state */}
        {(debugInfo.fetchAttempts > 0 || debugInfo.authErrors.length > 0) && <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs max-w-md">
            <div className="font-medium mb-2">Debug Info:</div>
            <div>Fetch attempts: {debugInfo.fetchAttempts}</div>
            <div>Component mounted: {debugInfo.componentMounted ? 'Yes' : 'No'}</div>
            <div>Last fetch: {debugInfo.lastFetchTime || 'Never'}</div>
            {debugInfo.sessionInfo && <div>Browser: {debugInfo.sessionInfo.incognito ? 'Incognito' : 'Normal'}</div>}
            {debugInfo.authErrors.length > 0 && <div className="mt-2">
                <div className="font-medium text-red-600">Recent Errors:</div>
                {debugInfo.authErrors.map((error, index) => <div key={index} className="text-red-600">{error}</div>)}
              </div>}
          </div>}
      </div>;
  }
  if (!isAdmin && !loading) {
    return <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="text-center">
          <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Admin access required</p>
          <p className="text-sm text-gray-400 mt-2">Please ensure you are logged in with admin privileges</p>
        </div>
      </div>;
  }
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Admin Notifications</h2>
        {unreadCount > 0 && (
          <Badge className="bg-primary text-primary-foreground shadow-md text-sm px-3 py-1">
            {unreadCount} unread
          </Badge>
        )}
      </div>

      {notifications.length === 0 ? <Card>
          <CardContent className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No notifications yet</p>
          </CardContent>
        </Card> : <div className="space-y-4">
          {notifications.map(notification => <Card key={notification.id} className={`transition-all duration-200 hover:shadow-lg ${!notification.is_read ? 'border-l-4 border-l-primary bg-primary/5 ring-1 ring-primary/15' : 'border-l-4 border-l-slate-200'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <CardTitle className="text-lg text-slate-900 font-bold">{notification.title}</CardTitle>
                      <Badge className={`${getPriorityColor(notification.priority)} font-semibold uppercase text-[10px] tracking-wide`}>
                        {notification.priority}
                      </Badge>
                      {!notification.is_read && <Badge className="bg-primary text-primary-foreground font-semibold">New</Badge>}
                    </div>
                    <p className="text-sm text-slate-700">{notification.message}</p>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {format(new Date(notification.created_at), 'PPP p')}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {notification.parking_bookings && <CardContent className="pt-0">
                  {/* Customer Information - Always show when booking exists */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100/40 rounded-lg p-4 mb-4 border border-blue-200 shadow-sm">
                      <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-900">
                        <User className="h-4 w-4" />
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-600 font-semibold block mb-1">Name:</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-slate-900">{notification.customerProfile?.full_name || 'N/A'}</span>
                            {notification.customerProfile?.verification_status === 'verified' && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">Verified</Badge>
                            )}
                            {notification.customerProfile?.verification_status === 'pending' && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
                            )}
                            {notification.customerProfile?.verification_status === 'rejected' && (
                              <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>
                            )}
                            {notification.customerProfile?.verification_status === 'not_verified' && (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-300">Not Verified</Badge>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-600 font-semibold block mb-1">Email:</span>
                          <span className="font-semibold text-slate-900 break-all">{notification.customerProfile?.email || 'N/A'}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-600 font-semibold block mb-1">Phone:</span>
                          <span className="font-semibold text-slate-900">{notification.customerProfile?.phone || '-'}</span>
                        </div>
                      </div>
                    </div>

                  {/* Booking Period Information */}
                  <div className={`rounded-lg p-4 mb-4 shadow-sm ${notification.parking_bookings.status === 'confirmed' ? 'bg-gradient-to-br from-green-50 to-green-100/40 border border-green-300' : 'bg-slate-50 border border-slate-200'}`}>
                    <h4 className={`font-bold mb-3 flex items-center gap-2 ${notification.parking_bookings.status === 'confirmed' ? 'text-green-900' : 'text-slate-800'}`}>
                      <Calendar className="h-4 w-4" />
                      Booking Period
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">Location:</span>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="font-semibold text-slate-900">{notification.parking_bookings.location}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">Zone:</span>
                        <span className="font-semibold text-slate-900">{notification.parking_bookings.zone || 'Unknown'}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">Start:</span>
                        <span className="font-semibold text-slate-900">{format(new Date(notification.parking_bookings.start_time), 'PPP p')}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">End:</span>
                        <span className="font-semibold text-slate-900">{format(new Date(notification.parking_bookings.end_time), 'PPP p')}</span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">Duration:</span>
                        <span className="font-semibold text-slate-900">
                          {`${Math.max(1, Math.round(notification.parking_bookings.duration_hours / 720))} month${Math.max(1, Math.round(notification.parking_bookings.duration_hours / 720)) !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600 font-semibold block mb-1">Total Cost:</span>
                        <span className={`font-bold text-base ${notification.parking_bookings.status === 'confirmed' ? 'text-green-700' : 'text-emerald-700'}`}>{notification.parking_bookings.cost_aed} AED</span>
                        {(notification.parking_bookings as any).security_deposit_amount > 0 && (
                          <span className="block text-sm text-blue-700 mt-1 font-medium">
                            + {(notification.parking_bookings as any).security_deposit_amount} AED refundable access card deposit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {notification.parking_bookings.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={() => approveBooking(notification)} disabled={actionLoading !== null} className="flex-1 bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold shadow-[0_8px_20px_-6px_hsl(142_70%_35%/0.5)] hover:shadow-[0_12px_28px_-6px_hsl(142_70%_35%/0.7)] hover:-translate-y-0.5 transition-all">
                        {actionLoading === `approve-${notification.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Approve
                      </Button>

                      <Button onClick={() => rejectBooking(notification)} disabled={actionLoading !== null} className="flex-1 bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold shadow-[0_8px_20px_-6px_hsl(15_80%_45%/0.5)] hover:shadow-[0_12px_28px_-6px_hsl(15_80%_45%/0.7)] hover:-translate-y-0.5 transition-all">
                        {actionLoading === `reject-${notification.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                        Reject
                      </Button>

                      <Button onClick={() => deleteBooking(notification)} disabled={actionLoading !== null} className="flex-1 bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold shadow-[0_8px_20px_-6px_hsl(0_75%_40%/0.5)] hover:shadow-[0_12px_28px_-6px_hsl(0_75%_40%/0.7)] hover:-translate-y-0.5 transition-all">
                        {actionLoading === `delete-${notification.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete
                      </Button>
                    </div>
                  )}

                  {notification.parking_bookings.status === 'confirmed' && (
                    <div className="flex flex-col sm:flex-row gap-2 items-stretch">
                      <div className="flex-1 flex items-center justify-center py-2">
                        <Badge className="text-sm bg-gradient-to-br from-green-600 to-emerald-700 text-white px-4 py-1.5 shadow-md">
                          ✓ Approved
                        </Badge>
                      </div>

                      <Button
                        onClick={() => revertToPending(notification)}
                        disabled={actionLoading !== null}
                        className="border-2 border-orange-500 text-orange-700 bg-orange-50 hover:bg-orange-100 hover:border-orange-600 font-semibold shadow-sm hover:shadow-md transition-all"
                        variant="outline"
                      >
                        {actionLoading === `revert-${notification.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2" />
                        )}
                        Revert to Pending
                      </Button>

                      <Button onClick={() => deleteBooking(notification)} disabled={actionLoading !== null} className="bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold shadow-[0_8px_20px_-6px_hsl(0_75%_40%/0.5)] hover:shadow-[0_12px_28px_-6px_hsl(0_75%_40%/0.7)] hover:-translate-y-0.5 transition-all">
                        {actionLoading === `delete-${notification.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete
                      </Button>
                    </div>
                  )}

                  {notification.parking_bookings.status === 'cancelled' && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-1 flex items-center justify-center py-2">
                        <Badge className="text-sm bg-gradient-to-br from-red-600 to-rose-700 text-white px-4 py-1.5 shadow-md">
                          ✗ Rejected
                        </Badge>
                      </div>

                      <Button onClick={() => deleteBooking(notification)} disabled={actionLoading !== null} className="bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-semibold shadow-[0_8px_20px_-6px_hsl(0_75%_40%/0.5)] hover:shadow-[0_12px_28px_-6px_hsl(0_75%_40%/0.7)] hover:-translate-y-0.5 transition-all">
                        {actionLoading === `delete-${notification.id}` ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                        Delete
                      </Button>
                    </div>
                  )}
                </CardContent>}
            </Card>)}
        </div>}
    </div>;
};
export default AdminNotifications;