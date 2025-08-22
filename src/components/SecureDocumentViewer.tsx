import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, Shield, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecureDocumentViewerProps {
  verificationId: string;
  documentType: string;
  fullName: string;
  verificationStatus: string;
  onAccessGranted?: () => void;
  isAdmin?: boolean;
}

interface AccessTokenData {
  access_token: string;
  expires_at: string;
  verification_id: string;
  access_duration_minutes: number;
  security_level: string;
}

interface DocumentAccessData {
  access_granted: boolean;
  document_type: string;
  full_name: string;
  verification_status: string;
  security_level: string;
  expires_at: string;
  verification_id: string;
  error?: string;
}

const SecureDocumentViewer: React.FC<SecureDocumentViewerProps> = ({
  verificationId,
  documentType,
  fullName,
  verificationStatus,
  onAccessGranted,
  isAdmin = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<AccessTokenData | null>(null);
  const [documentData, setDocumentData] = useState<DocumentAccessData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [documentUrl, setDocumentUrl] = useState<string>('');

  // Calculate time remaining for token expiration
  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(accessToken.expires_at);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        setAccessToken(null);
        setDocumentData(null);
        setDocumentUrl('');
        if (isDialogOpen) {
          toast.warning('Document access has expired');
          setIsDialogOpen(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [accessToken, isDialogOpen]);

  const generateAccessToken = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-secure-document-token', {
        body: {
          verification_id: verificationId,
          access_duration_minutes: isAdmin ? 30 : 15, // Admins get longer access
          access_method: isAdmin ? 'admin_view' : 'user_view'
        }
      });

      if (error) throw error;

      const tokenData = data as AccessTokenData;
      setAccessToken(tokenData);
      
      toast.success(`Secure access granted for ${tokenData.access_duration_minutes} minutes`);
      
      // Automatically fetch document data
      await fetchDocumentWithToken(tokenData.access_token);
      
      if (onAccessGranted) {
        onAccessGranted();
      }
    } catch (error: any) {
      console.error('Failed to generate access token:', error);
      toast.error(`Access denied: ${error.message || 'Unable to generate secure access token'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocumentWithToken = async (token: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-secure-document-access', {
        body: {
          verification_id: verificationId,
          access_token: token
        }
      });

      if (error) throw error;

      const docData = data as DocumentAccessData;
      
      if (docData.access_granted) {
        setDocumentData(docData);
        
        // Get the actual document URL through the existing secure system
        try {
          const { data: urlData, error: urlError } = await supabase
            .rpc('admin_get_verification_document', {
              verification_id: verificationId
            });

          if (!urlError && urlData && urlData.length > 0) {
            setDocumentUrl(urlData[0].document_url);
          }
        } catch (urlErr) {
          console.error('Failed to get document URL:', urlErr);
        }
        
        setIsDialogOpen(true);
      } else {
        toast.error(`Access denied: ${docData.error}`);
      }
    } catch (error: any) {
      console.error('Failed to access document:', error);
      toast.error(`Document access failed: ${error.message}`);
    }
  };

  const revokeAccess = async () => {
    if (!accessToken || !isAdmin) return;

    try {
      const { error } = await supabase.functions.invoke('revoke-document-access-tokens', {
        body: { verification_id: verificationId }
      });

      if (error) throw error;

      setAccessToken(null);
      setDocumentData(null);
      setDocumentUrl('');
      setIsDialogOpen(false);
      
      toast.success('Document access has been revoked');
    } catch (error: any) {
      console.error('Failed to revoke access:', error);
      toast.error(`Failed to revoke access: ${error.message}`);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'maximum': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4" />
            Secure Document Access
            {accessToken && (
              <Badge variant="outline" className={getSecurityLevelColor(documentData?.security_level || 'standard')}>
                {documentData?.security_level || 'Standard'} Security
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground">
            <p><strong>Document:</strong> {documentType.replace('_', ' ').toUpperCase()}</p>
            <p><strong>Owner:</strong> {fullName}</p>
            <p><strong>Status:</strong> {verificationStatus}</p>
          </div>

          {accessToken ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-green-600 font-medium">
                  Access expires in: {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  disabled={!documentData}
                  size="sm"
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Document
                </Button>
                
                {isAdmin && (
                  <Button 
                    onClick={revokeAccess}
                    variant="destructive"
                    size="sm"
                  >
                    Revoke Access
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Button 
              onClick={generateAccessToken}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Secure Access...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Request Secure Access
                </>
              )}
            </Button>
          )}

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Security Notice:</p>
              <p>This document contains sensitive government ID information. Access is time-limited and all viewing attempts are logged for security purposes.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Secure Document View
              <Badge variant="outline" className={getSecurityLevelColor(documentData?.security_level || 'standard')}>
                {documentData?.security_level || 'Standard'} Security
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Viewing {documentType.replace('_', ' ').toUpperCase()} for {fullName}
              {accessToken && (
                <span className="block mt-1 text-sm">
                  Access expires in: {formatTimeRemaining(timeRemaining)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {documentUrl ? (
              <div className="relative">
                <img 
                  src={documentUrl} 
                  alt={`${documentType} document for ${fullName}`}
                  className="w-full h-auto max-h-[60vh] object-contain border rounded"
                  onError={(e) => {
                    console.error('Failed to load document image');
                    toast.error('Failed to load document image');
                  }}
                />
                
                <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                  CONFIDENTIAL - ID VERIFICATION
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 border border-dashed rounded">
                <div className="text-center">
                  <Shield className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Document loading...</p>
                </div>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <p><strong>Security Information:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>This document view session is logged and monitored</li>
                <li>Access automatically expires in {formatTimeRemaining(timeRemaining)}</li>
                <li>Unauthorized access attempts are reported to administrators</li>
                <li>Document contains sensitive personal identification information</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecureDocumentViewer;