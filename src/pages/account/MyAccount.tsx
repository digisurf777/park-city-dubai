import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MyAccount = () => {
  const [activeBookings] = useState([
    {
      id: "BK001",
      location: "Downtown Parking Bay",
      startDate: "2024-01-15",
      endDate: "2024-07-15",
      duration: "6 Months",
      price: "AED 2,700",
      status: "active",
      address: "Downtown Dubai, Dubai"
    }
  ]);

  const [pastBookings] = useState([
    {
      id: "BK002",
      location: "DIFC Business Center",
      startDate: "2023-06-01",
      endDate: "2023-12-01",
      duration: "6 Months",
      price: "AED 2,430",
      status: "completed",
      address: "DIFC, Dubai"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-primary text-primary-foreground";
      case "completed":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-20 pb-8 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">My Account</h1>
          <p className="text-muted-foreground">Manage your parking bookings and account settings</p>
        </div>
      </section>

      {/* Account Content */}
      <section className="pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="bookings" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bookings" className="space-y-6 mt-6">
              {/* Active Bookings */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Active Bookings</h2>
                {activeBookings.length > 0 ? (
                  <div className="space-y-4">
                    {activeBookings.map((booking) => (
                      <Card key={booking.id} className="p-6 border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-foreground">{booking.location}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2" />
                              {booking.address}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              {booking.startDate} to {booking.endDate} ({booking.duration})
                            </div>
                            <p className="font-semibold text-primary">{booking.price}</p>
                          </div>
                          <div className="flex gap-2 mt-4 md:mt-0">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Chat
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-border">
                    <p className="text-muted-foreground">No active bookings</p>
                  </Card>
                )}
              </div>

              {/* Past Bookings */}
              <div>
                <h2 className="text-2xl font-semibold text-foreground mb-4">Past Bookings</h2>
                {pastBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <Card key={booking.id} className="p-6 border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-semibold text-foreground">{booking.location}</h3>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground flex items-center mb-2">
                              <MapPin className="h-4 w-4 mr-2" />
                              {booking.address}
                            </p>
                            <div className="flex items-center text-sm text-muted-foreground mb-2">
                              <Calendar className="h-4 w-4 mr-2" />
                              {booking.startDate} to {booking.endDate} ({booking.duration})
                            </div>
                            <p className="font-semibold text-primary">{booking.price}</p>
                          </div>
                          <div className="flex gap-2 mt-4 md:mt-0">
                            <Button variant="outline" size="sm">
                              Book Again
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center border-border">
                    <p className="text-muted-foreground">No past bookings</p>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="profile" className="space-y-6 mt-6">
              <Card className="p-6 border-border">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Profile Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                    <p className="text-muted-foreground">John Doe</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                    <p className="text-muted-foreground">john.doe@example.com</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                    <p className="text-muted-foreground">+971 50 123 4567</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Member Since</label>
                    <p className="text-muted-foreground">January 2023</p>
                  </div>
                </div>
                <Button className="mt-6 bg-primary hover:bg-primary/90">
                  Edit Profile
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyAccount;