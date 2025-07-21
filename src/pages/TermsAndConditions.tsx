import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Terms and Conditions - ShazamParking</title>
        <meta name="description" content="Terms and Conditions for ShazamParking - parking space booking platform in Dubai, UAE" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">General Terms and Conditions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <div className="space-y-4">
                <p><strong>1.1</strong> The website shazamparking.ae ("Site") is operated by Shazam Technology Solutions – FZCO, a company registered in the United Arab Emirates, with the registered number 63137 (trading as ShazamParking) ("we" or "us") and membership is open to any individual who chooses to register an account with the Site ("Account").</p>
                
                <p><strong>1.2</strong> These terms and conditions of use ("Terms") will apply to anyone who accesses or uses the Site ("you"). Whether you register an Account or not, by accessing or using the Site you expressly consent to be bound by these Terms in full, and you also agree to be bound by the terms of our Privacy Policy and Cookies Notice.</p>
                
                <p><strong>1.3</strong> If you wish to book a parking space through the Site ("Driver"), you will also be bound by our Driver Agreement.</p>
                
                <p><strong>1.4</strong> If you are a parking space owner and you wish to rent your parking space through the Site ("Owner"), you will also be bound by our Owner Agreement.</p>
                
                <p><strong>1.5</strong> These Terms supersede any prior agreements between you and us in relation to our services. These Terms apply to the extent they do not conflict with the terms and conditions in our Driver Agreement and Owner Agreement (as applicable). In the event of inconsistency, the terms of our Driver Agreement and Owner Agreement (as applicable) prevail. For the avoidance of doubt, the Owner Agreement and Driver Agreement cannot apply simultaneously to the same transaction. Each listing is governed by the Terms and the Owner Agreement, while each booking is governed by the Terms and the Driver Agreement.</p>
                
                <p><strong>1.6</strong> Please note that these Terms may be amended from time to time. Notification of any changes will be made by posting new terms onto the Site. In continuing to use the Site, you confirm that you accept the amended Terms in full.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Registration</h2>
              <div className="space-y-4">
                <p><strong>2.1</strong> Registration with the Site is currently free, however in order to become a registered user you will have to provide some personal information. You agree that all information supplied by you is true, accurate and complete and will be kept up to date at all times.</p>
                
                <p><strong>2.2</strong> Please note that any personal information that you provide to us will be subject to our Privacy Policy. You agree that we may use the personal information supplied by you in accordance with our Privacy Policy. Protecting your privacy is important to us. Please review our Privacy Policy in order to better understand our commitment to maintaining your privacy as well as our use and disclosure of your personal information.</p>
                
                <p><strong>2.3</strong> We will use the information provided to us to contact you. We are not liable if you fail to provide accurate contact information and you do not receive a booking confirmation or other information from us that you may be expecting. If you become aware that you have supplied invalid contact information, please contact us immediately to correct the information we hold about you.</p>
                
                <p><strong>2.4</strong> You must not have more than one Account and we reserve the right, at our sole discretion, to delete or cancel the Account of any person who, in our opinion, has breached this clause.</p>
                
                <p><strong>2.5</strong> You are not entitled to allow any other person to use your Account. You must not share your password and account details with anyone else.</p>
                
                <p><strong>2.6</strong> You must not impersonate any other person in any Account, whether or not that other person is a user of the Site. You agree that you will not create any false Account or use your Account for any immoral or illegal activity or purpose including (without limit) malicious or fraudulent bookings, fraudulent listings or money laundering.</p>
                
                <p><strong>2.7</strong> All notices sent to you will be sent to the email address (or other channel or method) provided to us (as updated by you). By accepting these Terms you give your consent to receive communications from us by any channel or method we choose (including but not limited to email, phone, text message or social media platform) and you agree that all agreements, notices, disclosures and other communications that we provide to you by email (or other channel or method) satisfy any legal requirement that such communications be in writing.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Use and Abuse of the Site</h2>
              <div className="space-y-4">
                <p><strong>3.1</strong> You must not use the Site to publish any offensive, inaccurate, misleading, defamatory, fraudulent, or illegal information or content.</p>
                
                <p><strong>3.2</strong> We reserve the right, at our sole discretion, to remove any content from the Site, terminate your Account or membership and restrict your access to our services at any time for any reason. You acknowledge that your use of the Site and related services is subject to our sole discretion and we may, at our sole discretion, suspend or terminate your Account or withdraw your rights to use the Site and related service at any time and without prior notice or liability. We may, at our sole discretion, suspend or terminate your Account.</p>
                
                <p><strong>3.3</strong> If we suspend or terminate your Account, you will not be able to use the Site or related services any longer, you may not be able to access all areas of the Site, and you will not be entitled to register an account again on the Site. In the event of termination, these Terms will continue in full force, so far as such terms relate to existing bookings or the consequences of any previous booking (including terms relating to fees, disclaimers, liability and damage).</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Advertising and Commercial Use</h2>
              <div className="space-y-4">
                <p><strong>4.1</strong> You are not entitled to directly advertise to or solicit the custom of other users of the Site without our express written consent.</p>
                
                <p><strong>4.2</strong> You are not entitled to resell or commercially exploit the Site's contents other than content you have posted. You are not entitled to use any data mining, robots, or similar data gathering and extraction tools to collect usernames, email addresses or any other data for the purposes of sending unsolicited email or for any other use.</p>
                
                <p><strong>4.3</strong> In the event that we determine, in our sole opinion, that you have been sending unsolicited emails to our users then we reserve the right to terminate without notice your use of the Site without limiting any other rights and remedies we may have.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Our Liability</h2>
              <div className="space-y-4">
                <p><strong>5.1</strong> The material displayed on our Site is provided without any guarantees, conditions or warranties as to its accuracy and is provided on an "as is" basis. To the extent permitted by law, we hereby expressly exclude all conditions, warranties and other terms which might otherwise be implied by any law, regulation, statute, common law or law of equity. Although we aim to offer you the best service possible, we make no promise that the services at the Site will meet your requirements and cannot guarantee that the services will be fault-free.</p>
                
                <p><strong>5.2</strong> Your access to the Site may be occasionally restricted to allow for repairs, maintenance or the introduction of new facilities or services and any such interruptions shall not constitute a breach by us of these Terms. We will attempt to restore the service as soon as we reasonably can.</p>
                
                <p><strong>5.3</strong> From time to time, it may be necessary to suspend access to the Site for a period of time and any such interruptions shall not constitute a breach by us of these Terms.</p>
                
                <p><strong>5.4</strong> If you choose to use the Site, you do so at your own risk. You acknowledge and agree that we do not have an obligation to verify any listing or conduct background checks on the Owners, Drivers or on any parking spaces listed on the Site.</p>
                
                <p><strong>5.5</strong> You understand that we do not make any attempt to verify the statements provided by the Owner which are published on the Site describing the key details of the listing (including, but not limited to, the location of the parking space, features of the parking space and instructions to obtain access to the parking space) or to verify, review or visit any parking spaces. We make no representations, endorsements or warranties as to the completeness of the information provided by the Owners and/or Drivers, the conduct of the Owners and/or Drivers, or the compatibility with any current or future Owners and/or Drivers using the Site.</p>
                
                <p><strong>5.6</strong> We will not be liable for any business, financial, or economic loss, nor for any consequential or indirect loss (such as lost reputation, lost profit or lost opportunity) arising as a result of, or in connection with, your use of the Site, whether such loss is incurred or suffered as a result of our negligence or otherwise.</p>
                
                <p><strong>5.7</strong> We will not be liable for: (a) losses not caused by our breach; (b) any and all indirect losses to the fullest extent permitted by law (which means loss to you which is a side effect of the main loss or damage, and where you and we could not have reasonably expected that loss would arise at the time of entering into these terms); (c) any loss arising as a result of the accuracy, timeliness, completeness or usefulness of any information provided by us or in connection with the Site; (d) failure to provide our services or to meet any of our obligations under these Terms where such failure is due to events beyond our control (for example a network failure); (e) personal injury or property damage, of any nature whatsoever, resulting from your access to and/or use of the Site and/or services and/or any booking with an Owner and/or Driver, to the fullest extent permissible by law (for clarity, we will not be liable in any way, in any circumstances, for any and all injury, liability or damage (including damage to the car park, building, vehicle and/or personal property) of the user or any third party).</p>
                
                <p><strong>5.8</strong> Without prejudice to clause 5.7 above, for clarity, if you are listing your parking space on the Site, you will be solely responsible and liable for ensuring that your use of the Site is in compliance with any and all rules and regulations applicable to you (including, but not limited to, your building rules and regulations and/or any lease/tenancy agreement requirements). If applicable, you shall be required to obtain (and by listing your parking space on the Site, you duly confirm that you have obtained) any requisite permit and/or approval in order to list your parking space. We will not be liable for any losses, either direct or indirect, caused by, or in any way connected with, your failure to comply with any and all rules and regulations applicable to you. By continuing to use the Site, you warrant that your listing and use of the Site is in compliance with any and all rules and regulations applicable to you.</p>
                
                <p><strong>5.9</strong> If we breach these Terms or are otherwise liable to you for any other type of claim, we shall only be liable to you for losses up to the greater of: (a) the amount paid by you to us in relation to the services giving rise to the dispute between us; or (b) AED 500, unless otherwise required by law including as relating to liability for death or personal injury caused by our negligence.</p>
                
                <p><strong>5.10</strong> You have certain mandatory rights under the law. Nothing in these Terms (including this section) is intended to or will affect these statutory rights.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Liability</h2>
              <div className="space-y-4">
                <p><strong>6.1</strong> You are liable for paying all of the charges in relation to your use of the Site and any related services.</p>
                
                <p><strong>6.2</strong> You are also liable to pay any fines and/or penalty notices you (or we as a result of your actions or inactions) receive due to your use of the Site or in any way connected with our services or Site. To the greatest extent permitted by law, we will, under no circumstances, be liable to you for any loss or damage you may suffer in relation to any parking fines/general penalties applied by authorities to you in relation to your breach of any rules and regulations, road markings or other relevant legislation.</p>
                
                <p><strong>6.3</strong> You will be liable for any and all fines, losses, legal actions and damages (including, but not limited to, any action commenced by a landlord or housing authority for a failure to adhere to housing or contractual obligations) due to, or in any way connected with, your use of the Site or related services.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Other Sites and Linking</h2>
              <div className="space-y-4">
                <p><strong>7.1</strong> The Site may include links to other websites or material which are beyond our control. We are not responsible for content on any site or material outside this Site.</p>
                
                <p><strong>7.2</strong> You may share a link to our home page, provided you do so in a way that is fair and legal and does not damage our reputation or take advantage of it. However, you must not establish a link in such a way as to suggest any form of association, approval or endorsement on our part where none exists.</p>
                
                <p><strong>7.3</strong> Our Site must not be framed on any other site, nor may you create a link to any part of our Site other than the home page. We reserve the right to withdraw linking permission without notice.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              <div className="space-y-4">
                <p><strong>8.1</strong> The format and content of this Site is protected by international copyright and we reserve all rights in relation to our copyright, whether owned by us or licensed to us, and all rights are reserved to any of our registered and unregistered trademarks (whether owned by us or licensed to us) which appear on the Site.</p>
                
                <p><strong>8.2</strong> By displaying user-generated content on this Site you expressly assign all copyright and other rights to such content to us (and you agree to waive all moral rights in relation to such content). For the avoidance of doubt, we are permitted to use any user-generated content for any of our other business purposes, even following termination of your Account and/or membership.</p>
                
                <p><strong>8.3</strong> We do not screen user-generated content (including content relating to available parking space listings) or information on the Site and we cannot give any assurance or endorsement as to its accuracy or completeness. Users of this Site are expressly prohibited from publishing any defamatory, misleading or offensive content or any content which infringes any other persons intellectual property rights (e.g. copyright). We do not accept liability in respect of such content, and the user responsible will be personally liable for any damages or other liability arising and you agree to indemnify us in relation to any liability we may suffer as a result of any such content.</p>
                
                <p><strong>8.4</strong> This Site or any portion of this Site may not be reproduced, duplicated, copied, sold, resold, visited, or otherwise exploited for any commercial purpose without our express written consent. You may not systematically extract and/or re-utilize parts of the contents of the Site without our express written consent. In particular, you may not utilize any data mining, robots, or similar data gathering and extraction tools to extract (whether once or many times) for re-utilization of any substantial parts of this Site without our express written consent.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law and Dispute Resolution</h2>
              <div className="space-y-4">
                <p><strong>9.1</strong> These Terms and any non-contractual obligations connected with it, shall be governed by the laws of England and Wales and are made between us (Shazam Technology Solutions - FZCO) and you.</p>
                
                <p><strong>9.2</strong> Both you and Shazam Technology Solutions - FZCO irrevocably agree to submit to the exclusive jurisdiction of the courts of the Dubai International Financial Centre and any proceedings may be brought against you and/or us or any respective assets in such courts. The courts of the Dubai International Financial Centre are the exclusive jurisdiction and no other court is to have jurisdiction to: (i) determine any claim, dispute or difference arising under or in connection with these Terms, any non-contractual obligations connected with it, or in connection with the negotiation, existence, legal validity, enforceability or termination of these Terms, whether the alleged liability shall arise under the laws of England and Wales or under some other country and regardless of whether a particular cause of action may successfully be brought in the courts of England and Wales; or (ii) grant interim remedies, or other provisions or protective relief.</p>
                
                <p><strong>9.3</strong> This clause shall survive the expiration or termination of these Terms and, in such event, shall be treated as an independent agreement. This clause shall not be regarded as invalid, non-existent or ineffective in the event that the rest of these Terms are invalid or did not come into existence or have become ineffective, and it shall, for that purpose, be treated as a distinct agreement.</p>
              </div>
            </section>

            <Separator className="my-6" />

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. General</h2>
              <div className="space-y-4">
                <p><strong>10.1</strong> We may make changes to the format of the Site, services provided, or to the Site's content at any time without notice.</p>
                
                <p><strong>10.2</strong> You agree that these Terms are fair and reasonable in all circumstances. However, if any provision of these Terms is prohibited by law or judged by a court to be unlawful, void or unenforceable, the provision shall, to the extent required, be severed from these Terms and rendered ineffective as far as possible without modifying the remaining provisions of these Terms. In other words, the invalidity of any provisions in these Terms does not affect the validity and enforceability of the rest of these Terms.</p>
                
                <p><strong>10.3</strong> We may assign, subcontract or transfer these Terms or any of our rights or obligations in them, in whole or in part, without your prior consent, provided this will not lead to a reduction of the rights you are entitled to by virtue of these Terms or by law. You may not assign, subcontract or transfer these Terms or any of our rights or obligations, in whole or in part.</p>
                
                <p><strong>10.4</strong> No delay on the part of either party in enforcing against the other party any term or condition of these Terms shall either be, or be deemed to be, a waiver or in any way prejudice any right of that party under these Terms.</p>
                
                <p><strong>10.5</strong> No clause of these Terms is enforceable under the Contracts (Rights of Third Parties) Act 1999 by a person who is not a party to these Terms.</p>
                
                <p><strong>10.6</strong> If you have any questions, complaints or comments about us or the services, then please contact us via <a href="mailto:support@shazam.ae" className="text-blue-600 hover:underline">support@shazam.ae</a>.</p>
                
                <p><strong>10.7</strong> In the event of any inconsistency or conflict between the English version of these Terms and any translation (including any Arabic version), the English version shall prevail and govern.</p>
              </div>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6">DRIVER AGREEMENT</h2>
              <div className="space-y-6">
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">1. These Terms</h3>
                  <div className="space-y-3">
                    <p><strong>1.1</strong> Shazam Technology Solutions – FZCO, a company registered in the United Arab Emirates, with the registered number 63137 (trading as ShazamParking) ("us", "we" or "ShazamParking") provides a website (shazamparking.ae ("Site")) and associated services connecting our ShazamParking registered owners who have a parking space, charging point or storage spaces for vehicles and bicycles ("Owners") with those seeking to book such parking space, charging point or storage spaces ("Services"). These terms and conditions apply to all Services provided or arranged by ShazamParking to or for you, the recipient of the Services ("Driver" or "you").</p>
                    
                    <p><strong>1.2</strong> These terms and conditions will apply at any time when you use the Site or any other method of accessing the Services (including via the ShazamParking application). By continuing to use the Site or the Services, you accept these terms and conditions and they will apply to the agreement between you and us (the "Agreement").</p>
                    
                    <p><strong>1.3</strong> This Agreement governs the relationship between us and you in relation to the use of parking spaces, charging points or storage spaces (together, the "Parking Spaces"). When making bookings for Parking Spaces using the Services ("Bookings") and using the Parking Spaces, you will be bound by your obligations under this Agreement and any additional obligations included in a listing relating to a Parking Space.</p>
                    
                    <p><strong>1.4</strong> These terms and conditions may be amended from time to time, as we continually develop the services we provide. We may amend this Agreement by posting the amended terms and conditions on the Site. These amended terms and conditions would take effect immediately on the day they are posted. Should you no longer wish to use the Services you can simply stop using the Services. You can also log out from your account with us ("Account") and can contact us by emailing support@shazam.ae and request that we deactivate your Account. The terms and conditions on the Site at the time you enter into a Booking for a Parking Space or use any other Services will be the ones that apply. You may terminate this Agreement if you do not wish to be bound by any such amendments but by continuing to use the Site or our Services you will be deemed to have accepted the new terms.</p>
                    
                    <p><strong>1.5</strong> This Agreement is with you, the person using the Services. You will comply with the terms of this Agreement and any additional restrictions in relation to the Parking Space. If you allow another person to make use of a Booking you have made (and park in a Parking Space), you agree you will remain responsible for the Booking and the use of that Parking Space.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">2. Registration</h3>
                  <div className="space-y-3">
                    <p><strong>2.1</strong> In order to make a Booking you must register an Account as set out on the Site.</p>
                    
                    <p><strong>2.2</strong> Once you have created an Account, you will need to provide us with the registration number of the vehicle you are making the Booking for and any other relevant additional information we may need from you. You must also provide us with any other information relating to you as we may reasonably request at any time which may include, but is not limited to, photographic identification for you such as a valid form of government identification, passport or driving licence.</p>
                    
                    <p><strong>2.3</strong> Booking confirmations and other relevant information in relation to the Services will be sent to the email address you give us and in your Account on the Site ("Booking Confirmation").</p>
                    
                    <p><strong>2.4</strong> Please make sure your contact details are correct, as we will not be responsible if this email address is incorrect and you do not receive a Booking Confirmation or other information from us that you might be expecting. If you notice that your email address is incorrect please contact us to correct this.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">3. Our Role</h3>
                  <div className="space-y-3">
                    <p><strong>3.1</strong> You acknowledge that ShazamParking operates as an independent technology platform and service provider. We do not act as your agent or represent you in any capacity. No agency, partnership, joint venture, or employment relationship is created between you and ShazamParking under this Agreement.</p>
                    
                    <p><strong>3.2</strong> By entering into this Agreement, you gain access to Parking Spaces listed by independent Owners via our platform for temporary use during the applicable booking period ("Booking Period"), subject to the terms and conditions of this Agreement.</p>
                    
                    <p><strong>3.3</strong> You agree to pay us applicable fees for the services we provide, which include (but are not limited to) facilitating your ability to access Parking Spaces from Owners. You will not pay Owners directly and have no contractual relationship with them.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">4. Bookings, and Payment</h3>
                  <div className="space-y-3">
                    <p><strong>4.1 General Process</strong></p>
                    <p>To request a Parking Space listed on the Site, you must submit a booking request by selecting your required dates and providing valid payment details (the "Booking Request").</p>
                    
                    <p>Upon submission of a Booking Request, we will, at our sole discretion, either immediately charge your payment method or place a pre-authorisation hold for the applicable booking amount.</p>
                    
                    <p>Within 48 hours of the Booking Request, we will confirm the availability of the Parking Space with the Owner. If the space is available, we will proceed as follows:</p>
                    <ul className="list-disc pl-6">
                      <li>if a pre-authorisation hold was placed, the corresponding amount will be charged at that time; or</li>
                      <li>if payment was already processed, no further action is needed.</li>
                    </ul>
                    
                    <p>If your Booking Request has been accepted, you will receive a booking confirmation via email and/or through your Account, which includes access details and a link to the in-Site chat where you may coordinate directly with the Owner to access the Parking Space.</p>
                    
                    <p>If the Parking Space is not available, then we will either:</p>
                    <ul className="list-disc pl-6">
                      <li>refund the charged amount (if payment was collected), or</li>
                      <li>cancel the pre-authorisation hold (if applicable),</li>
                    </ul>
                    <p>in both cases within ten (10) working days.</p>
                    
                    <p><strong>4.2 Access Cards and Deposits</strong></p>
                    <p>In cases where access to the Parking Space requires a physical access card or device, a separate access card fee will be charged at the time of the Booking Request (the "Refundable Access Charge").</p>
                    
                    <p>The Refundable Access Charge will be refunded to you within ten (10) working days after the end of the Booking Period, but only if the Owner confirms that:</p>
                    <ul className="list-disc pl-6">
                      <li>the access card or device has been returned in good condition, and</li>
                      <li>no damage has occurred to the Parking Space.</li>
                    </ul>
                    
                    <p>If the Owner reports any issues or non-return of the access card/device, the Refundable Access Charge may be withheld in part or in full at our sole discretion.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">5. The Licence for the Booking Period</h3>
                  <div className="space-y-3">
                    <p><strong>5.1</strong> You are only permitted to use the Parking Space during the Booking Period.</p>
                    
                    <p><strong>5.2</strong> Each Booking is only valid for the vehicle details you entered details for when at the time you made the Booking. If you wish to change the vehicle details i.e. Vehicle Registration Number, you can do this by logging in to your Account or contacting us. If you wish to change your dates, you will have to cancel your booking and re-book for the correct date. You will be issued a refund according to our cancelation policy, as may be updated without notice from time to time, a copy of which is located in the Annex ("Cancellation Policy").</p>
                    
                    <p><strong>5.3</strong> During your Booking, if you have any concerns or queries about the Parking Space you must immediately contact us and the Owner using the Site chat platform.</p>
                    
                    <p><strong>5.4</strong> Upon arrival at the Parking Space at the start of your Booking Period, you should inspect the Parking Space and ensure you are satisfied that it meets the description on the Site. If you are not satisfied you must contact us and the Owner immediately. We highly recommend taking full photographic and videographic evidence of the Parking Space at the outset and regularly throughout the Booking period.</p>
                    
                    <p><strong>5.5</strong> Unless the Owner has agreed to a later departure time or a further Booking Period (with such agreement being made through the Site) you will be liable to pay the full price for any additional time stayed.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">6. Complaints and Disputes</h3>
                  <div className="space-y-3">
                    <p><strong>6.1</strong> You agree that if you have any dispute with an Owner concerning them or their Parking Space, associated electric vehicle charging equipment (if applicable) or any use of the Parking Space, you will attempt to resolve it in the first instance by directly communicating with the Owner via our in-Site chat.</p>
                    
                    <p><strong>6.2</strong> In the event that a dispute cannot be resolved with the Owner directly, you may refer the dispute to us or make a complaint. Similarly, an Owner may refer a dispute to us or make a complaint. We will seek to resolve the dispute between you and an Owner and we may require that you make a further payment or we may require that you are entitled to a refund of payment(s) you have made in relation to the relevant Booking.</p>
                    
                    <p><strong>6.3</strong> You agree that if we determine that you should make further payment(s), you will be responsible for these amounts and we may use our funds in order to settle a dispute and then deduct such funds from you as a reimbursement from you. You agree that our findings on any dispute between you and the Owner are final and that you will abide by any ruling made by us in this respect.</p>
                    
                    <p><strong>6.4</strong> You agree that the provisions in this clause will survive any termination of this Agreement.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">7. Cancellation and Termination</h3>
                  <div className="space-y-3">
                    <p><strong>7.1</strong> If you want to cancel a Booking you must do so through the Cancellation Policy.</p>
                    
                    <p><strong>7.3</strong> If you fail to cancel a Booking in accordance with the Cancellation Policy you will be liable for the full amount of the fees payable to us and to the Owner in relation to your Booking.</p>
                    
                    <p><strong>7.4</strong> Bookings may only be cancelled in accordance with the Cancellation Policy.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">8. Your obligations</h3>
                  <div className="space-y-3">
                    <p><strong>8.1</strong> You:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>(a) agree to observe and act in accordance with this Agreement;</li>
                      <li>(b) will not use the Parking Space or deal with the Owner in any way which could be deemed to be harmful to our business or reputation;</li>
                      <li>(c) will not attempt to book any Parking Space advertised on our Site other than through the booking procedure described in clause 4;</li>
                      <li>(d) will provide us with accurate information and ensure that all details that we hold about you (including your email address) are up to date and valid; and</li>
                      <li>(e) where applicable, only provide us with credit or debit card details for an account which is yours and which you are authorised to use to make payments.</li>
                    </ul>
                    
                    <p><strong>8.2</strong> You agree that you will not create any false account with us or use your account for any immoral or illegal activity or purpose including (without limit) malicious or fraudulent bookings or money laundering.</p>
                    
                    <p><strong>8.3</strong> You agree that you have primary responsibility for your own safety and the safety of your vehicle during the Booking. The Owner is not responsible for ensuring the safety of you or your vehicle.</p>
                    
                    <p><strong>8.4</strong> You shall not allow any vehicle other than the vehicle specified in the Booking Confirmation to occupy the Parking Space at any time during the Booking Period. If anyone other than you is using the Parking Space for the Booking Period, you agree you will remain responsible for the Booking and the use of the Parking Space.</p>
                    
                    <p><strong>8.5</strong> In relation to the Booking you undertake to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>(a) keep the Parking Space clean, tidy and clear of rubbish and leave the Parking Space in the same condition as you find it;</li>
                      <li>(b) park the vehicle in the Parking Space without obstructing any adjoining or nearby parking spaces or property;</li>
                      <li>(c) notify the Owner and us of any damage to the Parking Space during the Booking Period as soon as it occurs;</li>
                      <li>(d) not do or permit to be done on the Parking Space anything which is or which may be or become a nuisance, (whether actionable or not) damage, annoyance, inconvenience or disturbance to the Owner or to the owner or occupier of neighbouring property;</li>
                      <li>(e) not conduct any illegal or immoral activity from the Parking Space;</li>
                      <li>(f) not conduct any business or commercial activity whatsoever from the Parking Space; and</li>
                      <li>(g) not use the Parking Space for any purpose other than for parking in accordance with this Agreement.</li>
                    </ul>
                    
                    <p><strong>8.6</strong> You acknowledge that the Parking Space is someone else's property and you agree not to access any other part of the property to which the Parking Space is attached.</p>
                    
                    <p><strong>8.7</strong> All communications between Drivers and Owners must take place exclusively within the Site's chat platform. You are prohibited from sharing personal contact information, making off-platform arrangements, or circumventing fees. We can monitor and access messages. Any breach of this clause may result in Account suspension or termination, reporting to UAE authorities if fraud is suspected, and we may withhold up to 100% of any outstanding amounts otherwise due to you, at our sole discretion, based on the severity of the breach.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">9. Termination and suspension</h3>
                  <div className="space-y-3">
                    <p><strong>9.1</strong> If you do not comply with the terms of this Agreement we may suspend or close your Account and you will not be able to use our Services (including making Bookings). We may also cancel a Booking in accordance with our Cancellation Policy if you do not comply with the terms of this Agreement including your payment obligation in clause 4, and may, at our discretion, close your Account and terminate this Agreement.</p>
                    
                    <p><strong>9.2</strong> If we suspend your Account or access to the Site for any reason, we may refuse to provide you with any Services including the right to make any further Bookings. If you attempt to circumvent this clause by attempting to create a new account, we reserve the right to terminate this Agreement and any existing Account you may have.</p>
                    
                    <p><strong>9.3</strong> Upon termination you will no longer be able to use our Services or make Bookings through us. If, when we terminate this Agreement, you have any outstanding Bookings for which you have made pre-payment you may be refunded in accordance with the Cancellation Policy.</p>
                    
                    <p><strong>9.4</strong> In the event of termination the terms of this Agreement will continue in full force, so far as such terms relate to existing Bookings or the consequences of any previous Booking (including terms relating to fees, disclaimers, liability and damage).</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">10. Our liability to you under this Agreement</h3>
                  <div className="space-y-3">
                    <p><strong>10.1</strong> If you choose to use the Site and Services, you do so at your sole risk. You acknowledge and agree that we do not have an obligation to verify the listing or conduct background checks on any Owners. The Site and Services are provided "as is". We make no promises that the Site or Services will meet your requirements or be available on an uninterrupted, secure, or error-free basis. We make no promises regarding the quality of the Services or the accuracy, timeliness, truthfulness, completeness or reliability of any content obtained through the Site or Services.</p>
                    
                    <p><strong>10.2</strong> You are solely responsible for all of your communications and interactions with other users of the Site or Services and with other persons with whom you communicate or interact as a result of your use of the Site or Services, including, but not limited to, any Owners. You understand that we do not make any attempt to verify the statements of users of the Site or Services or to review or visit any Parking Spaces. You agree to take reasonable precautions in all communications and interactions with other users of the Site or Services and with other persons with whom you communicate or interact as a result of your use of the Site or Services, including, but not limited to Owners, particularly if you decide to meet in person.</p>
                    
                    <p><strong>10.3</strong> We accept liability for death or personal injury caused by our negligence. We also accept liability for fraud and fraudulent misrepresentation by us.</p>
                    
                    <p><strong>10.4</strong> Other than our liability mentioned above, if we breach these terms or are otherwise liable to you for any other type of claim, we shall only be liable to you for losses up to the greater of: (a) the amount paid by you to us in relation to the Booking giving rise to the dispute between us; or (b) AED 500, unless otherwise required by law including as relating to liability for death or personal injury caused by our negligence.</p>
                    
                    <p><strong>10.5</strong> We will not be liable for: (a) losses not caused by our breach; (b) any and all indirect losses to the fullest extent permitted by law (which means loss to you which is a side effect of the main loss or damage, and where you and we could not have reasonably expected that loss would arise at the time of entering into these terms); (c) any loss arising as a result of the accuracy, timeliness, completeness or usefulness of any information provided by us or in connection with the Site or Services; (d) failure to provide our Services or to meet any of our obligations under these terms where such failure is due to events beyond our control (for example a network failure); (e) personal injury or property damage, of any nature whatsoever, resulting from your access to and use of the Site or Services or any booking with a parking space owner or driver to the fullest extent permissible by law (for clarity, we will not be liable in any way, in any circumstances, for any and all injury, liability or damage (including damage to the car park, building, vehicle and/or personal property) of the user or any third party).</p>
                    
                    <p><strong>10.6</strong> You have certain rights under the law. Nothing in these terms (including this section) is intended to or will affect these statutory rights. You agree that the above exclusions of liability are reasonable in all the circumstances, especially in light of the fact that our Services include only the provision of the Site and Services and responsibility for the Parking Space and fulfilment of a Booking lies solely with the Owner.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">11. Electric vehicle charging</h3>
                  <div className="space-y-3">
                    <p><strong>11.1</strong> You must follow all user instructions in relation to the use of a charge point. It is your responsibility to ensure that the charging of your vehicle using a charge point is carried out safely so as to avoid injury to any person or damage to property. In particular, this includes but is not limited to ensuring that you take all reasonable care when charging your vehicle and that:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>(a) you have all necessary connector cables to enable your vehicle to be charged at a charge point;</li>
                      <li>(b) the connector cable must be safely plugged into your vehicle and the positioning of the connector cable must not create a tripping hazard to any person; and</li>
                      <li>(c) the connector cable must not be unplugged from the vehicle before the plug is removed from the charge point; and the vehicle must not be driven with the connector cable still attached to the charge point.</li>
                    </ul>
                    
                    <p><strong>11.2</strong> You will be responsible for any damage caused to a charge point, any other property or for any injury to any person due to a breach of these terms, or failure to comply with any user instructions or guidance in relation to a charge point and/or your vehicle. You must notify the Owner and us immediately of any damage caused to a charge point.</p>
                    
                    <p><strong>11.3</strong> Please be aware that the Owner is responsible for the charge point (including for the supply of electricity to such charge point) and we have no responsibility or liability to you in respect of such charge point. If you suffer any damage, loss or injury whilst using a charge point, you must notify us and the Owner immediately.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">12. General</h3>
                  <div className="space-y-3">
                    <p><strong>12.1</strong> No term of this Agreement will be enforceable by any person that is not a party to it including (if you are domiciled in the UK) any enforcement through the Contract (Rights of Third Parties) Act 1999.</p>
                    
                    <p><strong>12.2</strong> You acknowledge that we may transfer our rights under the terms (and any related claims) to any third party without having to obtain your prior permission provided that this will not affect the standard of services you receive under this Agreement and that we notify you of the date on which we will transfer our rights and obligations under this Agreement to another legal entity, Your only rights under or in connection with this Agreement will be against the new legal entity and not against us.</p>
                    
                    <p><strong>12.3</strong> You agree that these terms are fair and reasonable in all the circumstances. However, if any provision of these terms is prohibited by law or judged by a court to be unlawful, void or unenforceable, the provision shall, to the extent required, be severed from these terms and rendered ineffective as far as possible without modifying the remaining provisions of these terms. In other words, the invalidity of any provisions in these terms does not affect the validity and enforceability of the rest of these terms.</p>
                    
                    <p><strong>12.4</strong> If you breach these terms and we take no action against you, we will still be entitled to use our rights and remedies in any other situation where you breach these terms.</p>
                    
                    <p><strong>12.5</strong> You agree that your right to access and use the Services is also subject to applicable law and any rules or policies applied by the relevant App Store from which you access the ShazamParking application (if and when available).</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">13. Confidentiality</h3>
                  <div className="space-y-3">
                    <p><strong>13.1</strong> Except as otherwise agreed in these terms and conditions, each party agrees with the other to keep secret and not share (except for with its employees, advisers and contractors) any confidential information it receives from the other party through the Services.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">14. Governing Law and Jurisdiction</h3>
                  <div className="space-y-3">
                    <p><strong>14.1</strong> This Agreement and any non-contractual obligations connected with it shall be governed by and construed according to the laws of England and Wales.</p>
                    
                    <p><strong>14.2</strong> The parties to this Agreement irrevocably agree that the courts of the Dubai International Financial Centre are the exclusive jurisdiction and no other court is to have jurisdiction to: (a) determine any claim, dispute or difference arising under or in connection with this Agreement, any non-contractual obligations connected with it, or in connection with the negotiation, existence, legal validity, enforceability or termination of this Agreement, whether the alleged liability shall arise under the laws of England and Wales or under some other country and regardless of whether a particular cause of action may successfully be brought in the courts of England and Wales ("Proceedings"); or (b) grant interim remedies, or other provisions or protective relief.</p>
                    
                    <p><strong>14.3</strong> The parties to this Agreement submit to the exclusive jurisdiction of the courts of the Dubai International Financial Centre and any Proceedings may be brought against the parties to this Agreement or any of them or any of their respective assets in such courts.</p>
                    
                    <p><strong>14.4</strong> This clause shall survive the expiration or termination of this Agreement and in such event shall be treated as an independent agreement. This clause shall not be regarded as invalid, non-existent or ineffective in the event that the rest of this Agreement is invalid or did not come into existence or has become ineffective, and it shall for that purpose be treated as a distinct agreement.</p>
                    
                    <p><strong>14.5</strong> In the event of any inconsistency or conflict between the English version of this Agreement and any translation (including any Arabic version), the English version shall prevail and govern.</p>
                  </div>
                </section>
              </div>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6">STANDARD PAYMENT TERMS</h2>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">(Standalone Terms Governing Invoiced Services Rendered by Shazam Technology Solutions – FZCO)</p>
                <p>These standard payment terms ("Standard Payment Terms") apply to any individual, entity or corporate party (the "you") to whom Shazam Technology Solutions – FZCO (the "us" or "we") has rendered services and issued an invoice - and to whom no other written terms of service apply, specifically excluding any payment made directly through the ShazamParking.ae website ("Site"). Subject to the foregoing, these Standard Payment Terms shall operate as an independent and self-contained set of contractual provisions and shall be incorporated by reference into any service transaction or invoice issued by us to a you.</p>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">1. Scope and Binding Nature</h3>
                  <div className="space-y-3">
                    <p><strong>1.1</strong> These Standard Payment Terms govern all invoiced engagements where we have delivered, performed, or facilitated any form of service or deliverable to you, and to whom no other written terms of service apply, specifically excluding any payment made directly through the Site.</p>
                    
                    <p><strong>1.2</strong> By receiving or accepting any service deliverable and/or invoice from us, excluding any service provided under separate written terms or payment made directly through the Site, you acknowledge and agree that these Standard Payment Terms shall be binding and enforceable in full.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">2. Invoice and Payment Terms</h3>
                  <div className="space-y-3">
                    <p><strong>2.1</strong> All invoices issued by us are payable within seven (7) calendar days from the date of the invoice unless otherwise agreed in writing by us.</p>
                    
                    <p><strong>2.5</strong> All payments shall be made in United Arab Emirates Dirhams (AED), by bank transfer to the account nominated by the Company or in such other currency or by such other method as we may stipulate in writing.</p>
                    
                    <p><strong>2.6</strong> Payments must be made free and clear of any deductions or withholdings, save where required by law. You shall be responsible for all associated transfer fees, currency conversion charges, or intermediary banking costs.</p>
                    
                    <p><strong>2.7</strong> We may register for UAE Value Added Tax (VAT) when required or voluntarily elects to do so. From the date of registration, VAT shall apply in addition to all Fees payable by you.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">3. Late Payment and Consequences</h3>
                  <div className="space-y-3">
                    <p><strong>3.1</strong> Where full payment is not received by the due date, we shall be entitled to exercise any or all of the following rights without prejudice to any other rights or remedies:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>(a) apply a late payment fee of AED 200 per calendar week (or part thereof) of delay;</li>
                      <li>(b) suspend the provision of any further services or Site access until payment is received;</li>
                      <li>(c) terminate any active or pending service arrangements with the Client;</li>
                      <li>(d) withhold deliverables, data access, or documentation otherwise due to you; and</li>
                      <li>(e) report the non-payment to appropriate credit or industry reporting databases, where applicable.</li>
                    </ul>
                    
                    <p><strong>3.2</strong> We shall not be liable for any loss or damage incurred by you resulting from such suspension, termination or withholding.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">4. Invoice Disputes</h3>
                  <div className="space-y-3">
                    <p><strong>4.1</strong> You must raise any dispute or query regarding an invoice within five (5) calendar days of the invoice date.</p>
                    
                    <p><strong>4.2</strong> Disputes must be raised in writing to support@shazam.ae, stating clear grounds for the objection.</p>
                    
                    <p><strong>4.3</strong> If no dispute is raised within the prescribed period, the invoice shall be deemed valid and accepted in full.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">5. No Right of Set-Off</h3>
                  <div className="space-y-3">
                    <p><strong>5.1</strong> You shall not be entitled to withhold or deduct any amount from any invoice payable to us on account of any actual or alleged counterclaim, unless such set-off has been expressly acknowledged and agreed in writing by us.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">6. Costs of Recovery</h3>
                  <div className="space-y-3">
                    <p><strong>6.1</strong> You shall indemnify and reimburse us for all reasonable costs incurred in enforcing payment, including but not limited to: legal fees, debt collection agency costs, court filing and service fees, enforcement costs, and administrative charges.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">7. Governing Law and Dispute Resolution</h3>
                  <div className="space-y-3">
                    <p><strong>7.1</strong> These Standard Payment Terms and any non-contractual obligations connected with it shall be governed by the laws of England and Wales and are made between us and you.</p>
                    
                    <p><strong>7.2</strong> Both parties irrevocably agree to submit to the exclusive jurisdiction of the courts of the Dubai International Financial Centre and any proceedings may be brought against us and/or you or any respective assets in such courts. The courts of the Dubai International Financial Centre are the exclusive jurisdiction and no other court is to have jurisdiction to: (i) determine any claim, dispute or difference arising under or in connection with this Standard Payment Terms, any non-contractual obligations connected with it, or in connection with the negotiation, existence, legal validity, enforceability or termination of these Standard Payment Terms, whether the alleged liability shall arise under the laws of England and Wales or under some other country and regardless of whether a particular cause of action may successfully be brought in the courts of England and Wales; or (ii) grant interim remedies, or other provisions or protective relief.</p>
                    
                    <p><strong>7.3</strong> This clause 7 shall survive the expiration or termination of these Standard Payment Terms and in such event shall be treated as an independent agreement. This clause shall not be regarded as invalid, non-existent or ineffective in the event that the rest of these Standard Payment Terms are invalid or did not come into existence or have become ineffective, and it shall for that purpose be treated as a distinct agreement.</p>
                    
                    <p><strong>7.4</strong> In the event of any inconsistency or conflict between the English version of this Agreement and any translation (including any Arabic version), the English version shall prevail and govern.</p>
                  </div>
                </section>
              </div>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6">ANNEXURE A - Cancellation Policy</h2>
              <div className="space-y-6">
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">1. Binding Nature of Bookings</h3>
                  <div className="space-y-3">
                    <p>All bookings have a minimum period of a month and are payable in advance. Once payment is processed, the booking is final, non-cancellable, and non-refundable by the Driver, subject only to the exceptions in clause 3 below except where required otherwise by UAE consumer protection law. By making payment, the Driver and Owner confirm full acceptance of this policy.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">2. Driver Cancellations – Strict No Refund Policy</h3>
                  <div className="space-y-3">
                    <p>Drivers may not cancel a booking once payment is made.</p>
                    <p>No refund, credit, or partial adjustment will be given for changes in personal circumstances or non-use of the space.</p>
                    <p>All communications regarding cancellation or disputes must be sent via email to support@shazam.ae and are only valid upon written acknowledgment by us.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">3. Limited Exceptions – At Our Discretion</h3>
                  <div className="space-y-3">
                    <p>We may, in our sole discretion, issue a full or partial refund if the Driver is unable to access or use the space due to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Access Failure – e.g. blocked space, faulty or missing access card;</li>
                      <li>Third-Party Intervention – e.g. landlord, strata, or regulatory authority prevents use;</li>
                      <li>Force Majeure – including, but not limited to, acts of God, war, fire, flood, pandemic, or government orders, as recognized under UAE Civil Code; or</li>
                      <li>Serious Owner Misconduct – e.g. fraudulent listing, breach of lease, untruthful details</li>
                    </ul>
                    <p>All claims must be made within 48 hours of the incident, by email, with supporting evidence.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">4. Owner Cancellations</h3>
                  <div className="space-y-3">
                    <p>Owners may only cancel a confirmed booking before the Booking Period begins and only where:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Access is legally or physically restricted;</li>
                      <li>Force majeure applies; or</li>
                      <li>Building policies or legal issues prevent fulfilment.</li>
                    </ul>
                    <p>Cancellations must be made by email to us and the Driver. In these cases, the Driver will receive a full refund.</p>
                    <p>Repeat cancellations or cancellations due to Owner negligence may lead to delisting and penalties.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">5. Refund Processing and Deductions</h3>
                  <div className="space-y-3">
                    <p>All approved refunds will be processed within 20 business days</p>
                    <p>Refunds are issued net of:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Credit card transaction fees; and</li>
                      <li>Reasonable administrative fees (not exceeding 10% of the price of the Booking Period), unless otherwise required by law.</li>
                    </ul>
                    <p>Refunds will only be issued to the original payment method.</p>
                    <p>The Access Card Fee is refundable only if:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>Access devices are returned in good condition; and</li>
                      <li>No claims are made within 48 hours post-rental.</li>
                    </ul>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">6. Abuse and Enforcement</h3>
                  <div className="space-y-3">
                    <p>Any fraudulent, abusive, or misleading conduct by a Driver or Owner will result in account suspension and potential legal action.</p>
                    <p>No refunds are given to Drivers who "no-show" or do not use the Parking Space for the entirety of the Booking Period.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">7. Final Authority</h3>
                  <div className="space-y-3">
                    <p>We retain full discretion to resolve cancellation or refund requests. Our written determination shall be final and binding.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">8. Owner Liability for Commission in Cases of Misconduct or Listing Failures</h3>
                  <div className="space-y-3">
                    <p>Where a booking is cancelled, disrupted, or refunded due to Owner misconduct or failure to comply with obligations, including but not limited to:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>the building not permitting tenant parking;</li>
                      <li>landlord or strata restrictions that were not disclosed;</li>
                      <li>failure to obtain or maintain required approvals;</li>
                      <li>breach of lease, building rules, or contractual representations; and/or</li>
                      <li>false, misleading, or materially incomplete listing information,</li>
                    </ul>
                    <p>the Owner shall be liable to pay us a minimum of 20% or the fee for the entire Booking Period and any other reasonable administrative expenses incurred by us.</p>
                    <p>This amount shall be payable within 5 business days of demand, and we may deduct the amount from:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      <li>any pending or future Owner payouts; and/or</li>
                      <li>the payment method linked to the Owner account.</li>
                    </ul>
                    <p>This obligation is in addition to any other remedies or delisting action that we may take.</p>
                  </div>
                </section>
              </div>
            </section>

            <Separator className="my-8" />

            <section className="mb-8">
              <h2 className="text-3xl font-bold mb-6">ANNEXURE B - Referral Program</h2>
              <div className="space-y-6">
                <p>We may, from time to time, operate a Driver Referral Program and an Owner Referral Program (each a "Referral Program") to reward eligible Drivers and Owners for introducing new Drivers and/or new Owners to the Site.</p>
                
                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">(a) Driver Referral</h3>
                  <div className="space-y-3">
                    <p>Under the Driver Referral Program, a Driver may refer another individual who completes a Booking for the first time using the Site. If the referred Driver completes a Booking of at least three (3) months, the referring Driver shall receive a credit of AED 50 against their next Booking, and the referred Driver shall also receive a credit of AED 50.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">(b) Owner Referral</h3>
                  <div className="space-y-3">
                    <p>Under the Owner Referral Program, an existing Owner may refer a new Owner who lists a Parking Space and successfully completes a Booking of at least three (3) months. Once the referred Owner's Booking is complete and the Site payment is made, the referring Owner shall receive a credit or payout of AED 100, as determined by us.</p>
                  </div>
                </section>

                <section className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">(c) Eligibility and Conditions</h3>
                  <div className="space-y-3">
                    <p><strong>(i)</strong> The referred Driver or Owner must not already have (or have had in 2-year period preceding the referral) an account on the Site.</p>
                    
                    <p><strong>(ii)</strong> Any referral must be made through the Site's official referral link or code system, if available, or otherwise in accordance with the instructions provided by us.</p>
                    
                    <p><strong>(iii)</strong> Referral rewards shall not be available if we, acting reasonably, determine that the referral was self-created, fraudulent, or in breach of these terms.</p>
                    
                    <p><strong>(iv)</strong> We reserve the right to cancel, suspend or modify any Referral Program at any time, in whole or in part, without prior notice.</p>
                    
                    <p><strong>(v)</strong> Referral rewards are non-transferable, have no cash value unless otherwise stated, and may be used only in accordance with the Site's policies.</p>
                    
                    <p><strong>(vi)</strong> Our decision regarding eligibility, calculation of rewards and any related disputes shall be final and binding.</p>
                    
                    <p><strong>(vii)</strong> Owners and Drivers may not circumvent the Site's payment processes or booking rules by misusing the Referral Program. Any such conduct shall be treated as a material breach and may result in suspension, termination or forfeiture of any accrued referral rewards.</p>
                  </div>
                </section>
              </div>
            </section>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
