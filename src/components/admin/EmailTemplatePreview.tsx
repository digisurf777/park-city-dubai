import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Mail, Car, DollarSign } from "lucide-react";

const getDriverEmailTemplate = (firstName: string = "Customer") => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>How Was Your Parking Experience This Month?</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #10b981; padding: 30px 40px; text-align: center;">
              <img src="https://shazamparking.ae/lovable-uploads/logo.png" alt="ShazamParking" style="height: 50px; width: auto;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">How Was Your Parking Experience This Month?</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We hope your experience with ShazamParking this month has been smooth.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                If you've encountered any issues, please notify us immediately, and in any case no later than 48 hours from this email.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for parking with us.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Kind regards,<br>
                <strong>The ShazamParking Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      <a href="https://shazamparking.ae" style="color: #10b981; text-decoration: none;">shazamparking.ae</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      Email: <a href="mailto:support@shazamparking.ae" style="color: #9ca3af; text-decoration: none;">support@shazamparking.ae</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      Location: Dubai, UAE
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 20px 0;">
                      Registered: Shazam Technology Solutions FZCO
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                      This email and any attachments are confidential and intended solely for the addressee. 
                      If you have received this email in error, please notify the sender immediately and delete this email. 
                      Any unauthorized copying, disclosure, or distribution of this email is strictly prohibited.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                © ${currentYear} ShazamParking. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

const getOwnerEmailTemplate = (firstName: string = "Partner") => {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Monthly ShazamParking Payout Is Being Processed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td style="padding: 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="background-color: #10b981; padding: 30px 40px; text-align: center;">
              <img src="https://shazamparking.ae/lovable-uploads/logo.png" alt="ShazamParking" style="height: 50px; width: auto;" />
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px;">
              <h1 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0;">Your Monthly Payout Is Being Processed</h1>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Dear ${firstName},
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                We are processing your monthly payout for your ShazamParking listing. The payment will be transferred to your registered bank account within the next 15 days.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                If you have any questions about your payout or need to update your banking details, please contact us.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for being a valued ShazamParking partner.
              </p>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Kind regards,<br>
                <strong>The ShazamParking Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #1f2937; padding: 30px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="text-align: center;">
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      <a href="https://shazamparking.ae" style="color: #10b981; text-decoration: none;">shazamparking.ae</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      Email: <a href="mailto:support@shazamparking.ae" style="color: #9ca3af; text-decoration: none;">support@shazamparking.ae</a>
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                      Location: Dubai, UAE
                    </p>
                    <p style="color: #9ca3af; font-size: 14px; margin: 0 0 20px 0;">
                      Registered: Shazam Technology Solutions FZCO
                    </p>
                    <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
                      This email and any attachments are confidential and intended solely for the addressee. 
                      If you have received this email in error, please notify the sender immediately and delete this email. 
                      Any unauthorized copying, disclosure, or distribution of this email is strictly prohibited.
                    </p>
                  </td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 20px 0 0 0;">
                © ${currentYear} ShazamParking. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const EmailTemplatePreview = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-5 w-5" />
              Email Templates
            </CardTitle>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide Templates
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View Templates
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Driver Check-in Email Template */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Car className="h-4 w-4 text-blue-500" />
                  <span>Driver Monthly Check-in</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>From:</strong> ShazamParking &lt;noreply@shazamparking.ae&gt;</p>
                  <p><strong>Subject:</strong> How Was Your Parking Experience This Month?</p>
                  <p><strong>BCC:</strong> support@shazamparking.ae</p>
                </div>
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <iframe
                    srcDoc={getDriverEmailTemplate("{firstName}")}
                    title="Driver Check-in Email Preview"
                    className="w-full h-[400px] bg-white"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>

              {/* Owner Payout Email Template */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <span>Owner Payout Notification</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong>From:</strong> ShazamParking &lt;noreply@shazamparking.ae&gt;</p>
                  <p><strong>Subject:</strong> Your Monthly ShazamParking Payout Is Being Processed</p>
                  <p><strong>BCC:</strong> support@shazamparking.ae</p>
                </div>
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <iframe
                    srcDoc={getOwnerEmailTemplate("{firstName}")}
                    title="Owner Payout Email Preview"
                    className="w-full h-[400px] bg-white"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              Note: <code className="bg-muted px-1 rounded">{"{firstName}"}</code> is replaced with the recipient's actual first name when the email is sent.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
