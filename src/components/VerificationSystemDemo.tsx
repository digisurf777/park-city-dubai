import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VerificationStatusBadge } from '@/components/VerificationStatusBadge';
import { UserVerificationDashboard } from '@/components/UserVerificationDashboard';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Shield, 
  User, 
  FileText, 
  Mail, 
  Bell,
  ArrowRight
} from 'lucide-react';

export const VerificationSystemDemo = () => {
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'verified' | 'rejected' | null>('pending');

  const demoStatuses = [
    { value: null, label: 'Not Submitted', color: 'gray' },
    { value: 'pending' as const, label: 'Pending Review', color: 'orange' },
    { value: 'approved' as const, label: 'Approved', color: 'green' },
    { value: 'verified' as const, label: 'Verified', color: 'green' },
    { value: 'rejected' as const, label: 'Rejected', color: 'red' }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">User Verification System</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Complete verification flow with admin approval, user notifications, and access control
        </p>
      </div>

      {/* Verification Flow Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Process Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Step 1: User Submission */}
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. User Submits</h3>
              <p className="text-sm text-muted-foreground">
                User uploads ID documents via verification form
              </p>
              <Badge variant="secondary" className="mt-2">
                Status: Pending
              </Badge>
            </div>

            <ArrowRight className="hidden md:block mx-auto mt-8 text-muted-foreground" />

            {/* Step 2: Admin Review */}
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Admin Reviews</h3>
              <p className="text-sm text-muted-foreground">
                Admin reviews documents and makes approval decision
              </p>
              <Badge variant="outline" className="mt-2">
                Admin Panel
              </Badge>
            </div>

            <ArrowRight className="hidden md:block mx-auto mt-8 text-muted-foreground" />

            {/* Step 3: Notification */}
            <div className="text-center p-4 border rounded-lg">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">3. User Notified</h3>
              <p className="text-sm text-muted-foreground">
                User receives email and inbox notification of decision
              </p>
              <Badge variant="default" className="mt-2">
                Email + Message
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Status Badge Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Status to Preview:</label>
              <div className="flex gap-2 flex-wrap">
                {demoStatuses.map((status) => (
                  <Button
                    key={status.label}
                    variant={selectedStatus === status.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedStatus(status.value)}
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-medium mb-3">Badge Preview:</h4>
              <div className="flex gap-4 items-center">
                <VerificationStatusBadge status={selectedStatus} size="sm" />
                <VerificationStatusBadge status={selectedStatus} size="md" />
                <VerificationStatusBadge status={selectedStatus} size="lg" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Dashboard Demo */}
      <Card>
        <CardHeader>
          <CardTitle>User Dashboard Experience</CardTitle>
        </CardHeader>
        <CardContent>
          <UserVerificationDashboard 
            onStartVerification={() => alert('Would navigate to verification form')}
            onResubmitVerification={() => alert('Would open resubmission form')}
          />
        </CardContent>
      </Card>

      {/* Features Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            System Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-700">✅ User Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Document submission form with file upload
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Real-time status tracking and badges  
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Email notifications for status changes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Access control for bookings and listings
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  In-app messaging system for updates
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700">🔧 Admin Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Pending verification queue management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Secure document viewer with access logging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  One-click approve/reject with notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Bulk user management and messaging
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Audit trail for verification actions
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <Shield className="h-8 w-8 text-blue-600 mb-2" />
              <h4 className="font-semibold mb-1">Document Security</h4>
              <p className="text-sm text-muted-foreground">
                Secure file storage with access logging and encryption
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <Bell className="h-8 w-8 text-orange-600 mb-2" />
              <h4 className="font-semibold mb-1">Audit Trail</h4>
              <p className="text-sm text-muted-foreground">
                Complete audit log of all verification actions and access
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">Access Control</h4>
              <p className="text-sm text-muted-foreground">
                Feature access blocked until verification is complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};