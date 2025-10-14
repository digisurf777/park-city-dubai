import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const MFASetup = () => {
  const { enrollMFA, verifyMFA, mfaEnabled, getMFAFactors, unenrollMFA } = useAuth();
  const [step, setStep] = useState<'enroll' | 'verify'>('enroll');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [factorId, setFactorId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cleanup now happens inside handleEnroll to avoid race conditions

  const isValidQR = (data: string) => data && data.startsWith('otpauth://') && data.length <= 1024;

  const handleEnroll = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1) Clean up any existing factors to prevent duplicates
      const { factors } = await getMFAFactors();
      if (Array.isArray(factors) && factors.length) {
        for (const factor of factors) {
          try { await unenrollMFA(factor.id); } catch (e) { console.warn('Unenroll failed', e); }
        }
        // Give Supabase a brief moment to finalize deletions
        await new Promise((r) => setTimeout(r, 800));
      }

      // 2) Enroll a fresh TOTP factor
      const { qrCode, secret, factorId, error } = await enrollMFA();
      if (error) throw error;

      // 3) Validate QR data to avoid QR render crashes
      if (!isValidQR(qrCode)) {
        console.warn('Received invalid QR data, falling back to manual entry.');
      }

      setQrCode(qrCode);
      setSecret(secret);
      setFactorId(factorId);
      setStep('verify');
      toast.success('2FA setup ready. Scan the QR or enter the code manually.');
    } catch (err: any) {
      console.error('MFA enrollment error:', err);
      toast.error(err?.message || 'Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }
    
    setLoading(true);
    const { error } = await verifyMFA(verificationCode, factorId);
    
    if (error) {
      toast.error('Invalid verification code');
      setLoading(false);
      return;
    }
    
    toast.success('2FA enabled successfully!');
    setLoading(false);
  };

  const copySecret = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(secret);
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement('textarea');
        textArea.value = secret;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success('Secret copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy. Please manually select and copy the code.');
    }
  };

  if (mfaEnabled) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <Shield className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-foreground">
          Two-factor authentication is enabled on your account.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Setup Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Secure your admin account with 2FA using an authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'enroll' && (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                As an administrator, you must enable two-factor authentication to access admin features.
                Use Google Authenticator, Authy, or any compatible authenticator app.
              </AlertDescription>
            </Alert>
            <Button onClick={handleEnroll} disabled={loading}>
              {loading ? 'Setting up...' : 'Begin Setup'}
            </Button>
          </div>
        )}
        
        {step === 'verify' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {qrCode && qrCode.startsWith('otpauth://') && qrCode.length <= 1024 ? (
                <div className="bg-card p-4 rounded-lg border">
                  <QRCodeSVG value={qrCode} size={200} />
                </div>
              ) : (
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    QR unavailable. Use the manual code or open the setup link below:
                  </p>
                  {qrCode?.startsWith('otpauth://') && (
                    <a href={qrCode} className="underline" target="_blank" rel="noreferrer">
                      Open authenticator setup link
                    </a>
                  )}
                </div>
              )}
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Can't scan? Enter this code manually:
                </p>
                <div className="flex items-center gap-2 justify-center">
                  <code className="bg-muted px-3 py-1 rounded text-sm font-mono select-all">
                    {secret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copySecret}
                    disabled={!secret}
                    className="shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">
                Enter 6-digit code from your authenticator app
              </Label>
              <Input
                id="verification-code"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button 
              onClick={handleVerify} 
              disabled={loading || verificationCode.length !== 6}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
