import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Eye, Copy, ExternalLink, Search, FileText, Calendar, User, 
  CheckCircle, XCircle, Clock, Download, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import SecureDocumentViewer from './SecureDocumentViewer';

interface Verification {
  id: string;
  user_id: string;
  full_name: string;
  document_type: string;
  document_image_url: string;
  verification_status: string;
  nationality?: string;
  created_at: string;
  profiles?: {
    user_id: string;
    full_name: string;
    email: string;
    phone?: string;
    user_type: string;
  } | null;
}

interface DocumentManagementPanelProps {
  verifications: Verification[];
  loading: boolean;
  onRefresh: () => void;
}

const DocumentManagementPanel: React.FC<DocumentManagementPanelProps> = ({
  verifications,
  loading,
  onRefresh
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentViewDialog, setDocumentViewDialog] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified': 
        return 'default';
      case 'pending': 
        return 'secondary';
      case 'rejected': 
        return 'destructive';
      default: 
        return 'secondary';
    }
  };

  const copyToClipboard = async (text: string, label: string = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const openInSupabase = (verificationId: string) => {
    const query = `SELECT * FROM user_verifications WHERE id = '${verificationId}';`;
    const encodedQuery = encodeURIComponent(query);
    const supabaseUrl = `https://supabase.com/dashboard/project/eoknluyunximjlsnyceb/sql/new?content=${encodedQuery}`;
    window.open(supabaseUrl, '_blank');
  };

  const handleViewDocument = (verificationId: string) => {
    setSelectedDocumentId(verificationId);
    setDocumentViewDialog(true);
  };

  const filteredVerifications = verifications.filter(verification => {
    const matchesSearch = 
      verification.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.document_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verification.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || verification.verification_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getDocumentNumber = (index: number) => {
    return `DOC-${String(index + 1).padStart(4, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Management ({verifications.length})
            </CardTitle>
            <Button onClick={onRefresh} size="sm" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, email, document type, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredVerifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'No documents match your search criteria' 
                : 'No verification documents found'
              }
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVerifications.map((verification, index) => (
                <div
                  key={verification.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs font-mono">
                          {getDocumentNumber(index)}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(verification.verification_status)}
                          <Badge variant={getStatusBadgeVariant(verification.verification_status)}>
                            {verification.verification_status}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(verification.created_at), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{verification.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{verification.document_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{verification.nationality || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span>{verification.profiles?.email || 'Email not available'}</span>
                        {' • '}
                        <span className={
                          verification.profiles?.user_type === 'Profile missing' || 
                          verification.profiles?.user_type === 'Unknown' ? 'text-amber-600 font-medium' : ''
                        }>
                          {verification.profiles?.user_type || 'Unknown'}
                        </span>
                        {(verification.profiles?.user_type === 'Profile missing' || 
                          verification.profiles?.full_name === 'Profile needs repair') && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Needs repair
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDocument(verification.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(verification.id, 'Document ID')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        ID
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(verification.document_image_url, 'Document URL')}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        URL
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openInSupabase(verification.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Supabase
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Dialog */}
      {selectedDocumentId && (
        <Dialog open={documentViewDialog} onOpenChange={setDocumentViewDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <SecureDocumentViewer
              verificationId={selectedDocumentId}
              documentType=""
              fullName=""
              verificationStatus=""
              isAdmin={true}
              onAccessGranted={() => {
                setDocumentViewDialog(false);
                setSelectedDocumentId(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DocumentManagementPanel;