import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminDelistingNotificationRequest {
  listingTitle: string;
  zone: string;
  ownerName: string;
  ownerEmail: string;
  affectedBookingsCount: number;
  affectedCustomers: Array<{
    name: string;
    email: string;
    startDate: string;
    endDate: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      listingTitle,
      zone,
      ownerName,
      ownerEmail,
      affectedBookingsCount,
      affectedCustomers,
    }: AdminDelistingNotificationRequest = await req.json();

    console.log(`Sending admin notification for delisting: ${listingTitle}`);

    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    };

    const customerRows = affectedCustomers.length > 0 
      ? affectedCustomers.map(c => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${c.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${c.email}</td>
            <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${formatDate(c.startDate)} - ${formatDate(c.endDate)}</td>
          </tr>
        `).join('')
      : `<tr><td colspan="3" style="padding: 10px; text-align: center; color: #666;">No active bookings affected</td></tr>`;

    const emailResponse = await resend.emails.send({
      from: "ShazamParking <notifications@shazamparking.ae>",
      to: ["support@shazamparking.ae"],
      subject: `🚨 Listing Delisted: ${listingTitle} - ${affectedBookingsCount} Booking(s) Affected`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #dc2626; padding: 30px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Listing Delisted</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      <h2 style="color: #333; margin: 0 0 20px 0;">Admin Notification</h2>
                      
                      <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        A parking listing has been removed from the platform.
                      </p>
                      
                      <!-- Listing Details -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border-radius: 8px; margin: 20px 0;">
                        <tr>
                          <td style="padding: 20px;">
                            <h3 style="color: #dc2626; margin: 0 0 15px 0;">Listing Details:</h3>
                            <table width="100%" cellpadding="5" cellspacing="0">
                              <tr>
                                <td style="color: #666; width: 120px;">Title:</td>
                                <td style="color: #333; font-weight: bold;">${listingTitle}</td>
                              </tr>
                              <tr>
                                <td style="color: #666;">Zone:</td>
                                <td style="color: #333; font-weight: bold;">${zone}</td>
                              </tr>
                              <tr>
                                <td style="color: #666;">Owner:</td>
                                <td style="color: #333; font-weight: bold;">${ownerName || 'Unknown'}</td>
                              </tr>
                              <tr>
                                <td style="color: #666;">Owner Email:</td>
                                <td style="color: #333; font-weight: bold;">${ownerEmail || 'N/A'}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Impact Summary -->
                      <div style="background-color: ${affectedBookingsCount > 0 ? '#fef2f2' : '#f0fdf4'}; border-left: 4px solid ${affectedBookingsCount > 0 ? '#dc2626' : '#16a34a'}; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 16px; color: #333;">
                          <strong>Bookings Affected:</strong> ${affectedBookingsCount}
                        </p>
                        ${affectedBookingsCount > 0 ? '<p style="margin: 5px 0 0 0; font-size: 14px; color: #dc2626;">These bookings have been automatically cancelled.</p>' : '<p style="margin: 5px 0 0 0; font-size: 14px; color: #16a34a;">No active bookings were affected.</p>'}
                      </div>
                      
                      <!-- Affected Customers Table -->
                      ${affectedBookingsCount > 0 ? `
                        <h3 style="color: #333; margin: 20px 0 10px 0;">Affected Customers:</h3>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                          <tr style="background-color: #f9fafb;">
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0;">Customer Name</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0;">Email</th>
                            <th style="padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0;">Booking Period</th>
                          </tr>
                          ${customerRows}
                        </table>
                      ` : ''}
                      
                      <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        This is an automated notification from the ShazamParking system.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #1a1a2e; padding: 20px; text-align: center;">
                      <p style="color: #ffffff; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} ShazamParking Admin System
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Admin delisting notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error sending admin delisting notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
