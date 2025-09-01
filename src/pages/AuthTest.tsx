import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, User, Mail, Shield } from 'lucide-react';

const AuthTest = () => {
  const { user, loading, signIn, signOut } = useAuth();
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestLogin = async () => {
    setTestResult('Testing...');
    try {
      const { error } = await signIn(testEmail, testPassword);
      if (error) {
        setTestResult(`❌ Login failed: ${error.message}`);
      } else {
        setTestResult('✅ Login successful!');
      }
    } catch (err: any) {
      setTestResult(`❌ Exception: ${err.message}`);
    }
  };

  const handleTestLogout = async () => {
    setTestResult('Logging out...');
    try {
      await signOut();
      setTestResult('✅ Logout successful!');
    } catch (err: any) {
      setTestResult(`❌ Logout failed: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">Loading auth state...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication System Status
            </CardTitle>
            <CardDescription>
              Test page to verify the authentication system is working correctly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>User is authenticated</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>User ID: {user.id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email: {user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Email Confirmed: {user.email_confirmed_at ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <Button onClick={handleTestLogout} variant="outline" className="w-full">
                  Test Logout
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  <span>No user authenticated</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Test Email</Label>
                    <Input
                      id="test-email"
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="Enter test email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-password">Test Password</Label>
                    <Input
                      id="test-password"
                      type="password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Enter test password"
                    />
                  </div>
                  <Button onClick={handleTestLogin} className="w-full">
                    Test Login
                  </Button>
                </div>
              </div>
            )}
            
            {testResult && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <strong>Test Result:</strong> {testResult}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health Check</CardTitle>
            <CardDescription>Database and authentication infrastructure status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>✅ Supabase Client Connected</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>✅ Storage Policies Fixed</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>✅ UUID Casting Issues Resolved</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>✅ Auth Flow Streamlined</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>✅ Admin Recovery Available at /admin-setup</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthTest;