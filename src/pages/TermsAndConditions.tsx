import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  const currentDomain = window.location.hostname;

  return (
    <>
      <Helmet>
        <title>Terms and Conditions - Shazam Parking</title>
        <meta name="description" content="Read our complete terms and conditions, user agreements, and legal policies for parking booking and listing services." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h1 className="text-4xl font-bold text-foreground mb-8">General Terms and Conditions</h1>
              
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
                
                <p className="mb-4">
                  1.1 The website {currentDomain} ("<strong>Site</strong>") is operated by Shazam Technology Solutions – FZCO, a company registered in the United Arab Emirates, with the registered number 63137(trading as ShazamParking) ("<strong>we</strong>" or "<strong>us</strong>") and membership is open to any individual who chooses to register an account with the Site ("<strong>Account</strong>").
                </p>
                
                <p className="mb-4">
                  1.2 These terms and conditions of use ("<strong>Terms</strong>") will apply to anyone who accesses or uses the Site ("<strong>you</strong>"). Whether you register an Account or not, by accessing or using the Site you expressly consent to be bound by these Terms in full, and you also agree to be bound by the terms of our Privacy Policy and Cookies Notice.
                </p>
                
                <p className="mb-4">
                  1.3 If you wish to book a parking space through the Site ("<strong>Driver</strong>"), you will also be bound by our Driver Agreement.
                </p>
                
                <p className="mb-4">
                  1.4 If you are a parking space owner and you wish to rent your parking space through the Site("<strong>Owner</strong>"), you will also be bound by our Owner Agreement.
                </p>
                
                <p className="mb-4">
                  1.5 These Terms supersede any prior agreements between you and us in relation to our services. These Terms apply to the extent they do not conflict with the terms and conditions in our Driver Agreement and Owner Agreement (as applicable). In the event of inconsistency, the terms of our Driver Agreement and Owner Agreement (as applicable) prevail. For the avoidance of doubt, the Owner Agreement and Driver Agreement cannot apply simultaneously to the same transaction. Each listing is governed by the Terms and the Owner Agreement, while each booking is governed by the Terms and the Driver Agreement.
                </p>
                
                <p className="mb-4">
                  1.6 Please note that these Terms may be amended from time to time. Notification of any changes will be made by posting new terms onto the Site. In continuing to use the Site, you confirm that you accept the amended Terms in full.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">2. Registration</h2>
                
                <p className="mb-4">
                  2.1 Registration with the Site is currently free, however in order to become a registered user you will have to provide some personal information. You agree that all information supplied by you is true, accurate and complete and will be kept up to date at all times.
                </p>
                
                <p className="mb-4">
                  2.2 Please note that any personal information that you provide to us will be subject to our Privacy Policy. You agree that we may use the personal information supplied by you in accordance with our Privacy Policy. Protecting your privacy is important to us. Please review our Privacy Policy in order to better understand our commitment to maintaining your privacy as well as our use and disclosure of your personal information.
                </p>
                
                <p className="mb-4">
                  2.3 We will use the information provided to us to contact you. We are not liable if you fail to provide accurate contact information and you do not receive a booking confirmation or other information from us that you may be expecting. If you become aware that you have supplied invalid contact information, please contact us immediately to correct the information we hold about you.
                </p>
                
                <p className="mb-4">
                  2.4 You must not have more than one Account and we reserve the right, at our sole discretion, to delete or cancel the Account of any person who, in our opinion, has breached this clause.
                </p>
                
                <p className="mb-4">
                  2.5 You are not entitled to allow any other person to use your Account. You must not share your password and account details with anyone else.
                </p>
                
                <p className="mb-4">
                  2.6 You must not impersonate any other person in any Account, whether or not that other person is a user of the Site. You agree that you will not create any false Account or use your Account for any immoral or illegal activity or purpose including (without limit) malicious or fraudulent bookings, fraudulent listings or money laundering.
                </p>
                
                <p className="mb-4">
                  2.7 All notices sent to you will be sent to the email address (or other channel or method) provided to us (as updated by you). By accepting these Terms you give your consent to receive communications from us by any channel or method we choose (including but not limited to email, phone, text message or social media platform) and you agree that all agreements, notices, disclosures and other communications that we provide to you by email (or other channel or method) satisfy any legal requirement that such communications be in writing.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">3. Use and Abuse of the Site</h2>
                
                <p className="mb-4">
                  3.1 You must not use the Site to publish any offensive, inaccurate, misleading, defamatory, fraudulent, or illegal information or content.
                </p>
                
                <p className="mb-4">
                  3.2 We reserve the right, at our sole discretion, to remove any content from the Site, terminate your Account or membership and restrict your access to our services at any time for any reason. You acknowledge that your use of the Site and related services is subject to our sole discretion and we may, at our sole discretion, suspend or terminate your Account or withdraw your rights to use the Site and related service at any time and without prior notice or liability.
                </p>
                
                <p className="mb-4">
                  3.3 If we suspend or terminate your Account, you will not be able to use the Site or related services any longer, you may not be able to access all areas of the Site, and you will not be entitled to register an account again on the Site. In the event of termination, these Terms will continue in full force, so far as such terms relate to existing bookings or the consequences of any previous booking.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">4. Advertising and Commercial Use</h2>
                
                <p className="mb-4">
                  4.1 You are not entitled to directly advertise to or solicit the custom of other users of the Site without our express written consent.
                </p>
                
                <p className="mb-4">
                  4.2 You are not entitled to resell or commercially exploit the Site's contents other than content you have posted. You are not entitled to use any data mining, robots, or similar data gathering and extraction tools to collect usernames, email addresses or any other data for the purposes of sending unsolicited email or for any other use.
                </p>
                
                <p className="mb-4">
                  4.3 In the event that we determine, in our sole opinion, that you have been sending unsolicited emails to our users then we reserve the right to terminate without notice your use of the Site without limiting any other rights and remedies we may have.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">5. Our Liability</h2>
                
                <p className="mb-4">
                  5.1 The material displayed on our Site is provided without any guarantees, conditions or warranties as to its accuracy and is provided on an "as is" basis. To the extent permitted by law, we hereby expressly exclude all conditions, warranties and other terms which might otherwise be implied by any law, regulation, statute, common law or law of equity.
                </p>
                
                <p className="mb-4">
                  5.2 Your access to the Site may be occasionally restricted to allow for repairs, maintenance or the introduction of new facilities or services and any such interruptions shall not constitute a breach by us of these Terms.
                </p>
                
                <p className="mb-4">
                  5.3 From time to time, it may be necessary to suspend access to the Site for a period of time and any such interruptions shall not constitute a breach by us of these Terms.
                </p>
                
                <p className="mb-4">
                  5.4 If you choose to use the Site, you do so at your own risk. You acknowledge and agree that we do not have an obligation to verify any listing or conduct background checks on the Owners, Drivers or on any parking spaces listed on the Site.
                </p>
                
                <p className="mb-4">
                  5.5 You understand that we do not make any attempt to verify the statements provided by the Owner which are published on the Site describing the key details of the listing or to verify, review or visit any parking spaces. We make no representations, endorsements or warranties as to the completeness of the information provided by the Owners and/or Drivers.
                </p>
                
                <p className="mb-4">
                  5.6 We will not be liable for any business, financial, or economic loss, nor for any consequential or indirect loss (such as lost reputation, lost profit or lost opportunity) arising as a result of, or in connection with, your use of the Site.
                </p>
                
                <p className="mb-4">
                  5.7 We will not be liable for: (a) losses not caused by our breach; (b) any and all indirect losses; (c) any loss arising as a result of the accuracy, timeliness, completeness or usefulness of any information provided by us; (d) failure to provide our services due to events beyond our control; (e) personal injury or property damage resulting from your access to and/or use of the Site.
                </p>
                
                <p className="mb-4">
                  5.8 If you are listing your parking space on the Site, you will be solely responsible and liable for ensuring that your use of the Site is in compliance with any and all rules and regulations applicable to you. We will not be liable for any losses caused by your failure to comply with applicable rules and regulations.
                </p>
                
                <p className="mb-4">
                  5.9 If we breach these Terms, we shall only be liable for losses up to the greater of: (a) the amount paid by you to us; or (b) AED 500, unless otherwise required by law.
                </p>
                
                <p className="mb-4">
                  5.10 You have certain mandatory rights under the law. Nothing in these Terms is intended to affect these statutory rights.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">6. Your Liability</h2>
                
                <p className="mb-4">
                  6.1 You are liable for paying all of the charges in relation to your use of the Site and any related services.
                </p>
                
                <p className="mb-4">
                  6.2 You are also liable to pay any fines and/or penalty notices you receive due to your use of the Site or in any way connected with our services. We will not be liable for any parking fines or penalties applied by authorities.
                </p>
                
                <p className="mb-4">
                  6.3 You will be liable for any and all fines, losses, legal actions and damages due to, or in any way connected with, your use of the Site or related services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">7. Other Sites and Linking</h2>
                
                <p className="mb-4">
                  7.1 The Site may include links to other websites or material which are beyond our control. We are not responsible for content on any site or material outside this Site.
                </p>
                
                <p className="mb-4">
                  7.2 You may share a link to our home page, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it.
                </p>
                
                <p className="mb-4">
                  7.3 Our Site must not be framed on any other site, nor may you create a link to any part of our Site other than the home page. We reserve the right to withdraw linking permission without notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">8. Intellectual Property</h2>
                
                <p className="mb-4">
                  8.1 The format and content of this Site is protected by international copyright and we reserve all rights in relation to our copyright and trademarks.
                </p>
                
                <p className="mb-4">
                  8.2 By displaying user-generated content on this Site you expressly assign all copyright and other rights to such content to us. We are permitted to use any user-generated content for any of our other business purposes.
                </p>
                
                <p className="mb-4">
                  8.3 We do not screen user-generated content and cannot give any assurance as to its accuracy or completeness. Users are prohibited from publishing any defamatory, misleading or offensive content.
                </p>
                
                <p className="mb-4">
                  8.4 This Site may not be reproduced, duplicated, copied, sold, or otherwise exploited for any commercial purpose without our express written consent.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">9. Governing Law and Dispute Resolution</h2>
                
                <p className="mb-4">
                  9.1 These Terms shall be governed by the laws of England and Wales and are made between us (Shazam Technology Solutions – FZCO) and you.
                </p>
                
                <p className="mb-4">
                  9.2 Both you and Shazam Technology Solutions – FZCO irrevocably agree to submit to the exclusive jurisdiction of the courts of the Dubai International Financial Centre.
                </p>
                
                <p className="mb-4">
                  9.3 This clause shall survive the expiration or termination of these Terms and shall be treated as an independent agreement.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-4">10. General</h2>
                
                <p className="mb-4">
                  10.1 We may make changes to the format of the Site, services provided, or to the Site's content at any time without notice.
                </p>
                
                <p className="mb-4">
                  10.2 If any provision of these Terms is prohibited by law or judged to be unlawful, the provision shall be severed without affecting the remaining provisions.
                </p>
                
                <p className="mb-4">
                  10.3 We may assign, subcontract or transfer these Terms without your prior consent. You may not assign or transfer these Terms.
                </p>
                
                <p className="mb-4">
                  10.4 No delay in enforcing any term shall be deemed a waiver of any right under these Terms.
                </p>
                
                <p className="mb-4">
                  10.5 No clause of these Terms is enforceable by a person who is not a party to these Terms.
                </p>
                
                <p className="mb-4">
                  10.6 If you have any questions, complaints or comments about us or the services, please contact us at{" "}
                  <a href="mailto:support@shazam.ae" className="text-primary hover:underline">
                    support@shazam.ae
                  </a>.
                </p>
                
                <p className="mb-4">
                  10.7 In the event of any inconsistency between the English version of these Terms and any translation, the English version shall prevail.
                </p>
              </section>

              <div className="bg-muted p-6 rounded-lg mt-12">
                <p className="text-sm text-muted-foreground text-center">
                  These terms and conditions are effective as of the date of publication on our website. 
                  Shazam Parking reserves the right to modify these terms at any time.
                </p>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default TermsAndConditions;