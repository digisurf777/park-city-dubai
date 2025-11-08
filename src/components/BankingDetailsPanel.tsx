import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Shield, Eye, EyeOff, Edit, Save, X } from "lucide-react";

interface BankingDetails {
  id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  iban: string;
  swift_code: string;
}

export const BankingDetailsPanel = () => {
  const { user } = useAuth();
  const [bankingDetails, setBankingDetails] = useState<BankingDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    account_holder_name: "",
    bank_name: "",
    account_number: "",
    iban: "",
    swift_code: ""
  });

  useEffect(() => {
    fetchBankingDetails();
  }, [user]);

  const fetchBankingDetails = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("banking_details")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setBankingDetails(data);
        setFormData({
          account_holder_name: data.account_holder_name,
          bank_name: data.bank_name,
          account_number: data.account_number,
          iban: data.iban,
          swift_code: data.swift_code
        });
      }
    } catch (error: any) {
      console.error("Error fetching banking details:", error);
      toast.error("Failed to load banking details");
    } finally {
      setLoading(false);
    }
  };

  const validateIBAN = (iban: string): boolean => {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    return ibanRegex.test(iban.replace(/\s/g, ''));
  };

  const validateSWIFT = (swift: string): boolean => {
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(swift);
  };

  const handleSave = () => {
    // Validate inputs
    if (!formData.account_holder_name || !formData.bank_name || !formData.account_number || !formData.iban || !formData.swift_code) {
      toast.error("All fields are required");
      return;
    }

    if (!validateIBAN(formData.iban)) {
      toast.error("Invalid IBAN format");
      return;
    }

    if (!validateSWIFT(formData.swift_code)) {
      toast.error("Invalid SWIFT code format (should be 8 or 11 characters)");
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSave = async () => {
    if (!user) return;

    try {
      const dataToSave = {
        user_id: user.id,
        ...formData,
        iban: formData.iban.replace(/\s/g, '').toUpperCase(),
        swift_code: formData.swift_code.toUpperCase()
      };

      const { data, error } = bankingDetails
        ? await supabase.from("banking_details").update(dataToSave).eq("id", bankingDetails.id).select().single()
        : await supabase.from("banking_details").insert(dataToSave).select().single();

      if (error) throw error;

      // Log access
      await supabase.from("banking_details_access_audit").insert({
        banking_detail_id: data.id,
        accessed_by: user.id,
        access_type: bankingDetails ? "update" : "view"
      });

      setBankingDetails(data);
      setIsEditing(false);
      toast.success("Banking details saved successfully");
    } catch (error: any) {
      console.error("Error saving banking details:", error);
      toast.error("Failed to save banking details");
    } finally {
      setShowConfirmDialog(false);
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return "****" + accountNumber.slice(-4);
  };

  const maskIBAN = (iban: string) => {
    if (iban.length <= 8) return iban;
    return iban.slice(0, 4) + "**********************" + iban.slice(-4);
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading banking details...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Banking Details
            </CardTitle>
            <CardDescription>
              Secure storage for receiving payments from parking bookings
            </CardDescription>
          </div>
          {bankingDetails && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!bankingDetails && !isEditing ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No banking details added yet</p>
            <Button onClick={() => setIsEditing(true)}>Add Banking Details</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="account_holder_name">Account Holder Name</Label>
                <Input
                  id="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={(e) => setFormData({ ...formData, account_holder_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <div className="relative">
                  <Input
                    id="account_number"
                    value={isEditing || showFullDetails ? formData.account_number : maskAccountNumber(formData.account_number)}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    disabled={!isEditing}
                  />
                  {bankingDetails && !isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowFullDetails(!showFullDetails)}
                    >
                      {showFullDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="iban">IBAN</Label>
                <div className="relative">
                  <Input
                    id="iban"
                    value={isEditing || showFullDetails ? formData.iban : maskIBAN(formData.iban)}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                    disabled={!isEditing}
                    placeholder="AE070331234567890123456"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="swift_code">SWIFT/BIC Code</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={(e) => setFormData({ ...formData, swift_code: e.target.value.toUpperCase() })}
                  disabled={!isEditing}
                  placeholder="NBADAEAA"
                  maxLength={11}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Details
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    if (bankingDetails) {
                      setFormData({
                        account_holder_name: bankingDetails.account_holder_name,
                        bank_name: bankingDetails.bank_name,
                        account_number: bankingDetails.account_number,
                        iban: bankingDetails.iban,
                        swift_code: bankingDetails.swift_code
                      });
                    }
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg border border-border mt-4">
              <div className="flex items-start gap-2">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Your data is secure</p>
                  <p className="text-muted-foreground">
                    Banking details are encrypted and only accessible by you and authorized administrators for payment processing.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Banking Details</AlertDialogTitle>
              <AlertDialogDescription>
                Please verify your banking information is correct before saving:
                <div className="mt-4 space-y-2 text-left">
                  <p><strong>Account Holder:</strong> {formData.account_holder_name}</p>
                  <p><strong>Bank:</strong> {formData.bank_name}</p>
                  <p><strong>IBAN:</strong> {formData.iban}</p>
                  <p><strong>SWIFT:</strong> {formData.swift_code}</p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Review Again</AlertDialogCancel>
              <AlertDialogAction onClick={confirmSave}>Confirm & Save</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
