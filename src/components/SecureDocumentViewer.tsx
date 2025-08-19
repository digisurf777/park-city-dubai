import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecureDocumentViewerProps {
  verificationId: string;
  documentType: string;
  userFullName: string;
}

export const SecureDocumentViewer = ({ verificationId, documentType, userFullName }: SecureDocumentViewerProps) => {
  const [loading, setLoading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleSecureAccess = async () => {
    setLoading(true);
    try {
      // Use secure admin function to access document
      const { data, error } = await supabase.rpc('admin_get_verification_document', {
        verification_id: verificationId
      });
      
      if (error) {
        console.error('Error accessing document:', error);
        toast.error('Failed to access document securely');
        return;
      }
      
      if (data && data.length > 0) {
        setDocumentUrl(data[0].document_url);
        toast.success('Document accessed - action logged for audit');
      } else {
        toast.error('Document not found');
      }
    } catch (err) {
      console.error('Document access error:', err);
      toast.error('Secure document access failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={handleSecureAccess}
          disabled={loading}
        >
          <Shield className="h-3 w-3 mr-1" />
          {loading ? 'Accessing...' : 'View Document (Secure)'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Secure Document Viewer
          </DialogTitle>
        </DialogHeader>
        
        <Alert className="mb-4">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p><strong>Document Owner:</strong> {userFullName}</p>
              <p><strong>Document Type:</strong> {documentType}</p>
              <p><strong>⚠️ Security Notice:</strong> This access is logged for audit purposes</p>
            </div>
          </AlertDescription>
        </Alert>

        {documentUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Document loaded securely</span>
              <Clock className="h-4 w-4 ml-4" />
              <span>Accessed: {new Date().toLocaleString()}</span>
            </div>
            
            <div className="border rounded-lg p-4 bg-gray-50">
              <img 
                src={documentUrl} 
                alt={`${documentType} for ${userFullName}`}
                className="max-w-full h-auto max-h-[60vh] object-contain mx-auto"
                onError={() => {
                  toast.error('Failed to load document image');
                  setDocumentUrl(null);
                }}
              />
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-xs text-muted-foreground">
                🔒 This document is protected by end-to-end security
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (documentUrl) {
                    window.open(documentUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">Click "View Document" to access securely</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SecureDocumentViewer;