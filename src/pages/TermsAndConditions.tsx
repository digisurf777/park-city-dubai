import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <>
      <Helmet>
        <title>Terms and Conditions | ShazamParking</title>
        <meta name="description" content="ShazamParking Terms and Conditions - Read our complete terms of service, user agreements, and legal policies for parking booking and listing services in Dubai, UAE." />
      </Helmet>
      
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-8 text-center">General Terms and Conditions</h1>
            
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              
              <p className="mb-4">
                1.1 The website {window.location.hostname} (<strong>"Site"</strong>) is operated by Shazam Technology Solutions – FZCO, 
                a company registered in the United Arab Emirates, with the registered number 63137 (trading as ShazamParking) 
                (<strong>"we"</strong> or <strong>"us"</strong>) and membership is open to any individual who chooses to register 
                an account with the Site (<strong>"Account"</strong>).
              </p>
              
              <p className="mb-4">
                1.2 These terms and conditions of use (<strong>"Terms"</strong>) will apply to anyone who accesses or uses 
                the Site (<strong>"you"</strong>). Whether you register an Account or not, by accessing or using the Site 
                you expressly consent to be bound by these Terms in full, and you also agree to be bound by the terms of 
                our Privacy Policy and Cookies Notice.
              </p>
              
              <p className="mb-4">
                1.3 If you wish to book a parking space through the Site (<strong>"Driver"</strong>), you will also be 
                bound by our Driver Agreement.
              </p>
              
              <p className="mb-4">
                1.4 If you are a parking space owner and you wish to rent your parking space through the Site 
                (<strong>"Owner"</strong>), you will also be bound by our Owner Agreement.
              </p>
              
              <p className="mb-4">
                1.5 These Terms supersede any prior agreements between you and us in relation to our services. These Terms 
                apply to the extent they do not conflict with the terms and conditions in our Driver Agreement and Owner 
                Agreement (as applicable). In the event of inconsistency, the terms of our Driver Agreement and Owner 
                Agreement (as applicable) prevail. For the avoidance of doubt, the Owner Agreement and Driver Agreement 
                cannot apply simultaneously to the same transaction. Each listing is governed by the Terms and the Owner 
                Agreement, while each booking is governed by the Terms and the Driver Agreement.
              </p>
              
              <p className="mb-4">
                1.6 Please note that these Terms may be amended from time to time. Notification of any changes will be 
                made by posting new terms onto the Site. In continuing to use the Site, you confirm that you accept the 
                amended Terms in full.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Registration</h2>
              
              <p className="mb-4">
                2.1 Registration with the Site is currently free, however in order to become a registered user you will 
                have to provide some personal information. You agree that all information supplied by you is true, 
                accurate and complete and will be kept up to date at all times.
              </p>
              
              <p className="mb-4">
                2.2 Please note that any personal information that you provide to us will be subject to our Privacy Policy. 
                You agree that we may use the personal information supplied by you in accordance with our Privacy Policy. 
                Protecting your privacy is important to us. Please review our Privacy Policy in order to better understand 
                our commitment to maintaining your privacy as well as our use and disclosure of your personal information.
              </p>
              
              <p className="mb-4">
                2.3 We will use the information provided to us to contact you. We are not liable if you fail to provide 
                accurate contact information and you do not receive a booking confirmation or other information from us 
                that you may be expecting. If you become aware that you have supplied invalid contact information, please 
                contact us immediately to correct the information we hold about you.
              </p>
              
              <p className="mb-4">
                2.4 You must not have more than one Account and we reserve the right, at our sole discretion, to delete 
                or cancel the Account of any person who, in our opinion, has breached this clause.
              </p>
              
              <p className="mb-4">
                2.5 You are not entitled to allow any other person to use your Account. You must not share your password 
                and account details with anyone else.
              </p>
              
              <p className="mb-4">
                2.6 You must not impersonate any other person in any Account, whether or not that other person is a user 
                of the Site. You agree that you will not create any false Account or use your Account for any immoral 
                or illegal activity or purpose including (without limit) malicious or fraudulent bookings, fraudulent 
                listings or money laundering.
              </p>
              
              <p className="mb-4">
                2.7 All notices sent to you will be sent to the email address (or other channel or method) provided to us 
                (as updated by you). By accepting these Terms you give your consent to receive communications from us by 
                any channel or method we choose (including but not limited to email, phone, text message or social media 
                platform) and you agree that all agreements, notices, disclosures and other communications that we provide 
                to you by email (or other channel or method) satisfy any legal requirement that such communications be in writing.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Use and Abuse of the Site</h2>
              
              <p className="mb-4">
                3.1 You must not use the Site to publish any offensive, inaccurate, misleading, defamatory, fraudulent, 
                or illegal information or content.
              </p>
              
              <p className="mb-4">
                3.2 We reserve the right, at our sole discretion, to remove any content from the Site, terminate your 
                Account or membership and restrict your access to our services at any time for any reason. You acknowledge 
                that your use of the Site and related services is subject to our sole discretion and we may, at our sole 
                discretion, suspend or terminate your Account or withdraw your rights to use the Site and related service 
                at any time and without prior notice or liability. We may, at our sole discretion, suspend or terminate your Account.
              </p>
              
              <p className="mb-4">
                3.3 If we suspend or terminate your Account, you will not be able to use the Site or related services 
                any longer, you may not be able to access all areas of the Site, and you will not be entitled to register 
                an account again on the Site. In the event of termination, these Terms will continue in full force, so far 
                as such terms relate to existing bookings or the consequences of any previous booking (including terms 
                relating to fees, disclaimers, liability and damage).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Advertising and Commercial Use</h2>
              
              <p className="mb-4">
                4.1 You are not entitled to directly advertise to or solicit the custom of other users of the Site 
                without our express written consent.
              </p>
              
              <p className="mb-4">
                4.2 You are not entitled to resell or commercially exploit the Site's contents other than content you 
                have posted. You are not entitled to use any data mining, robots, or similar data gathering and extraction 
                tools to collect usernames, email addresses or any other data for the purposes of sending unsolicited 
                email or for any other use.
              </p>
              
              <p className="mb-4">
                4.3 In the event that we determine, in our sole opinion, that you have been sending unsolicited emails 
                to our users then we reserve the right to terminate without notice your use of the Site without limiting 
                any other rights and remedies we may have.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Our Liability</h2>
              
              <p className="mb-4">
                5.1 The material displayed on our Site is provided without any guarantees, conditions or warranties as 
                to its accuracy and is provided on an "as is" basis. To the extent permitted by law, we hereby expressly 
                exclude all conditions, warranties and other terms which might otherwise be implied by any law, regulation, 
                statute, common law or law of equity. Although we aim to offer you the best service possible, we make no 
                promise that the services at the Site will meet your requirements and cannot guarantee that the services 
                will be fault-free.
              </p>
              
              <p className="mb-4">
                5.2 Your access to the Site may be occasionally restricted to allow for repairs, maintenance or the 
                introduction of new facilities or services and any such interruptions shall not constitute a breach by 
                us of these Terms. We will attempt to restore the service as soon as we reasonably can.
              </p>
              
              <p className="mb-4">
                5.3 From time to time, it may be necessary to suspend access to the Site for a period of time and any 
                such interruptions shall not constitute a breach by us of these Terms.
              </p>
              
              <p className="mb-4">
                5.4 If you choose to use the Site, you do so at your own risk. You acknowledge and agree that we do not 
                have an obligation to verify any listing or conduct background checks on the Owners, Drivers or on any 
                parking spaces listed on the Site.
              </p>
              
              <p className="mb-4">
                5.5 You understand that we do not make any attempt to verify the statements provided by the Owner which 
                are published on the Site describing the key details of the listing (including, but not limited to, the 
                location of the parking space, features of the parking space and instructions to obtain access to the 
                parking space) or to verify, review or visit any parking spaces. We make no representations, endorsements 
                or warranties as to the completeness of the information provided by the Owners and/or Drivers, the conduct 
                of the Owners and/or Drivers, or the compatibility with any current or future Owners and/or Drivers using the Site.
              </p>
              
              <p className="mb-4">
                5.6 We will not be liable for any business, financial, or economic loss, nor for any consequential or 
                indirect loss (such as lost reputation, lost profit or lost opportunity) arising as a result of, or in 
                connection with, your use of the Site, whether such loss is incurred or suffered as a result of our 
                negligence or otherwise.
              </p>
              
              <p className="mb-4">
                5.7 We will not be liable for: (a) losses not caused by our breach; (b) any and all indirect losses to 
                the fullest extent permitted by law (which means loss to you which is a side effect of the main loss or 
                damage, and where you and we could not have reasonably expected that loss would arise at the time of 
                entering into these terms); (c) any loss arising as a result of the accuracy, timeliness, completeness 
                or usefulness of any information provided by us or in connection with the Site; (d) failure to provide 
                our services or to meet any of our obligations under these Terms where such failure is due to events 
                beyond our control (for example a network failure); (e) personal injury or property damage, of any nature 
                whatsoever, resulting from your access to and/or use of the Site and/or services and/or any booking with 
                an Owner and/or Driver, to the fullest extent permissible by law (for clarity, we will not be liable in 
                any way, in any circumstances, for any and all injury, liability or damage (including damage to the car 
                park, building, vehicle and/or personal property) of the user or any third party).
              </p>
              
              <p className="mb-4">
                5.8 Without prejudice to clause 5.7 above, for clarity, if you are listing your parking space on the 
                Site, you will be solely responsible and liable for ensuring that your use of the Site is in compliance 
                with any and all rules and regulations applicable to you (including, but not limited to, your building 
                rules and regulations and/or any lease/tenancy agreement requirements). If applicable, you shall be 
                required to obtain (and by listing your parking space on the Site, you duly confirm that you have obtained) 
                any requisite permit and/or approval in order to list your parking space. We will not be liable for any 
                losses, either direct or indirect, caused by, or in any way connected with, your failure to comply with 
                any and all rules and regulations applicable to you. By continuing to use the Site, you warrant that your 
                listing and use of the Site is in compliance with any and all rules and regulations applicable to you.
              </p>
              
              <p className="mb-4">
                5.9 If we breach these Terms or are otherwise liable to you for any other type of claim, we shall only 
                be liable to you for losses up to the greater of: (a) the amount paid by you to us in relation to the 
                services giving rise to the dispute between us; or (b) AED 500, unless otherwise required by law including 
                as relating to liability for death or personal injury caused by our negligence.
              </p>
              
              <p className="mb-4">
                5.10 You have certain mandatory rights under the law. Nothing in these Terms (including this section) 
                is intended to or will affect these statutory rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Your Liability</h2>
              
              <p className="mb-4">
                6.1 You are liable for paying all of the charges in relation to your use of the Site and any related services.
              </p>
              
              <p className="mb-4">
                6.2 You are also liable to pay any fines and/or penalty notices you (or we as a result of your actions 
                or inactions) receive due to your use of the Site or in any way connected with our services or Site. To 
                the greatest extent permitted by law, we will, under no circumstances, be liable to you for any loss or 
                damage you may suffer in relation to any parking fines/general penalties applied by authorities to you 
                in relation to your breach of any rules and regulations, road markings or other relevant legislation.
              </p>
              
              <p className="mb-4">
                6.3 You will be liable for any and all fines, losses, legal actions and damages (including, but not limited 
                to, any action commenced by a landlord or housing authority for a failure to adhere to housing or contractual 
                obligations) due to, or in any way connected with, your use of the Site or related services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Other Sites and Linking</h2>
              
              <p className="mb-4">
                7.1 The Site may include links to other websites or material which are beyond our control. We are not 
                responsible for content on any site or material outside this Site.
              </p>
              
              <p className="mb-4">
                7.2 You may share a link to our home page, provided you do so in a way that is fair and legal and does 
                not damage our reputation or take advantage of it. However, you must not establish a link in such a way 
                as to suggest any form of association, approval or endorsement on our part where none exists.
              </p>
              
              <p className="mb-4">
                7.3 Our Site must not be framed on any other site, nor may you create a link to any part of our Site 
                other than the home page. We reserve the right to withdraw linking permission without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Intellectual Property</h2>
              
              <p className="mb-4">
                8.1 The format and content of this Site is protected by international copyright and we reserve all rights 
                in relation to our copyright, whether owned by us or licensed to us, and all rights are reserved to any 
                of our registered and unregistered trademarks (whether owned by us or licensed to us) which appear on the Site.
              </p>
              
              <p className="mb-4">
                8.2 By displaying user-generated content on this Site you expressly assign all copyright and other rights 
                to such content to us (and you agree to waive all moral rights in relation to such content). For the 
                avoidance of doubt, we are permitted to use any user-generated content for any of our other business 
                purposes, even following termination of your Account and/or membership.
              </p>
              
              <p className="mb-4">
                8.3 We do not screen user-generated content (including content relating to available parking space listings) 
                or information on the Site and we cannot give any assurance or endorsement as to its accuracy or completeness. 
                Users of this Site are expressly prohibited from publishing any defamatory, misleading or offensive content 
                or any content which infringes any other persons intellectual property rights (e.g. copyright). We do not 
                accept liability in respect of such content, and the user responsible will be personally liable for any 
                damages or other liability arising and you agree to indemnify us in relation to any liability we may suffer 
                as a result of any such content.
              </p>
              
              <p className="mb-4">
                8.4 This Site or any portion of this Site may not be reproduced, duplicated, copied, sold, resold, visited, 
                or otherwise exploited for any commercial purpose without our express written consent. You may not systematically 
                extract and/or re-utilize parts of the contents of the Site without our express written consent. In particular, 
                you may not utilize any data mining, robots, or similar data gathering and extraction tools to extract 
                (whether once or many times) for re-utilization of any substantial parts of this Site without our express written consent.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law and Dispute Resolution</h2>
              
              <p className="mb-4">
                9.1 These Terms and any non-contractual obligations connected with it, shall be governed by the laws of 
                England and Wales and are made between us (Shazam Technology Solutions – FZCO) and you.
              </p>
              
              <p className="mb-4">
                9.2 Both you and Shazam Technology Solutions – FZCO irrevocably agree to submit to the exclusive jurisdiction 
                of the courts of the Dubai International Financial Centre and any proceedings may be brought against you 
                and/or us or any respective assets in such courts. The courts of the Dubai International Financial Centre 
                are the exclusive jurisdiction and no other court is to have jurisdiction to: (i) determine any claim, dispute 
                or difference arising under or in connection with these Terms, any non-contractual obligations connected with 
                it, or in connection with the negotiation, existence, legal validity, enforceability or termination of these 
                Terms, whether the alleged liability shall arise under the laws of England and Wales or under some other 
                country and regardless of whether a particular cause of action may successfully be brought in the courts of 
                England and Wales; or (ii) grant interim remedies, or other provisions or protective relief.
              </p>
              
              <p className="mb-4">
                9.3 This clause shall survive the expiration or termination of these Terms and, in such event, shall be 
                treated as an independent agreement. This clause shall not be regarded as invalid, non-existent or ineffective 
                in the event that the rest of these Terms are invalid or did not come into existence or have become ineffective, 
                and it shall, for that purpose, be treated as a distinct agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. General</h2>
              
              <p className="mb-4">
                10.1 We may make changes to the format of the Site, services provided, or to the Site's content at any time without notice.
              </p>
              
              <p className="mb-4">
                10.2 You agree that these Terms are fair and reasonable in all circumstances. However, if any provision 
                of these Terms is prohibited by law or judged by a court to be unlawful, void or unenforceable, the provision 
                shall, to the extent required, be severed from these Terms and rendered ineffective as far as possible 
                without modifying the remaining provisions of these Terms. In other words, the invalidity of any provisions 
                in these Terms does not affect the validity and enforceability of the rest of these Terms.
              </p>
              
              <p className="mb-4">
                10.3 We may assign, subcontract or transfer these Terms or any of our rights or obligations in them, in 
                whole or in part, without your prior consent, provided this will not lead to a reduction of the rights 
                you are entitled to by virtue of these Terms or by law. You may not assign, subcontract or transfer these 
                Terms or any of our rights or obligations, in whole or in part.
              </p>
              
              <p className="mb-4">
                10.4 No delay on the part of either party in enforcing against the other party any term or condition of 
                these Terms shall either be, or be deemed to be, a waiver or in any way prejudice any right of that party under these Terms.
              </p>
              
              <p className="mb-4">
                10.5 No clause of these Terms is enforceable under the Contracts (Rights of Third Parties) Act 1999 by 
                a person who is not a party to these Terms.
              </p>
              
              <p className="mb-4">
                10.6 If you have any questions, complaints or comments about us or the services, then please contact us via{" "}
                <a href="mailto:support@shazam.ae" className="text-primary hover:underline">
                  support@shazam.ae
                </a>.
              </p>
              
              <p className="mb-4">
                10.7 In the event of any inconsistency or conflict between the English version of these Terms and any 
                translation (including any Arabic version), the English version shall prevail and govern.
              </p>
            </section>

            {/* Owner Agreement Section */}
            <section className="mb-8 border-t pt-8">
              <h1 className="text-3xl font-bold mb-6 text-center">OWNER AGREEMENT</h1>
              
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">1. These Terms</h2>
                
                <p className="mb-4">
                  1.1 Shazam Technology Solutions – FZCO, a company registered in the United Arab Emirates, with the 
                  registered number 63137 (trading as ShazamParking) (<strong>"us"</strong>, <strong>"we"</strong> or 
                  <strong>"ShazamParking"</strong>) provides a website ({window.location.hostname} 
                  (<strong>"Site"</strong>)) and associated services (<strong>"Services"</strong>) connecting those 
                  seeking to book parking spaces, charging points or storage spaces for vehicles and bicycles 
                  (<strong>"Drivers"</strong>) with our registered owners who own and operate such parking spaces 
                  (<strong>"you"</strong> or the <strong>"Owners"</strong>).
                </p>
                
                <p className="mb-4">
                  1.2 These terms and conditions will apply at any time when you use the Site or any other method of 
                  accessing the Services (including via the ShazamParking application (where applicable)). By continuing 
                  to use the Site and/or the Services, you accept these terms and conditions and they will apply to this 
                  agreement between you and us (<strong>"Agreement"</strong>).
                </p>
                
                <p className="mb-4">
                  1.3 This Agreement governs the relationship between us and you in relation to the use of parking spaces, 
                  charging points or storage spaces (together, the <strong>"Parking Spaces"</strong>). When listing your 
                  Parking Spaces using the Services (<strong>"Bookings"</strong>) and making available for use the Parking 
                  Spaces, you will be bound by your obligations under this Agreement.
                </p>
                
                <p className="mb-4">
                  1.4 These terms and conditions may be amended from time to time as we continually develop the services 
                  we provide. We may amend this Agreement by posting the amended terms and conditions on the Site.
                </p>
                
                <p className="mb-4">
                  1.5 This Agreement is with you, the person using the Services. You will comply with the terms of this 
                  Agreement and any additional requirements in relation to the Parking Space.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">2. Services and listing</h2>
                
                <p className="mb-4">
                  2.1 In order to take Bookings for your Parking Spaces you must register an Account as set out on the Site.
                </p>
                
                <p className="mb-4">
                  2.2 We may advertise your Parking Space on the Site, the ShazamParking application and selected third 
                  party websites to increase the reach of your Parking Space to potential Drivers.
                </p>
                
                <p className="mb-4">
                  2.3 You will be required to complete your own listing for the Site. In your listing, you agree to provide 
                  all relevant information about the Parking Space including: (a) the address and a full description of the 
                  Parking Space; (b) any restrictions on the types of vehicles that are suitable for the Parking Space; 
                  (c) any other information or restrictions which apply to the Parking Space; and (d) if installed, any 
                  details relating to electric vehicle charging equipment.
                </p>
                
                <p className="mb-4">
                  2.4 You are responsible for the accuracy of all information in your listing and any information you provide 
                  to us in relation to a Booking.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">3. Our Role</h2>
                
                <p className="mb-4">
                  3.1 You acknowledge that ShazamParking operates as an independent technology platform and service provider. 
                  We do not act as your agent or represent you in any capacity.
                </p>
                
                <p className="mb-4">
                  3.2 By entering into this Agreement, you grant us a limited, non-exclusive right to list your Parking 
                  Space on the Site and to license it to third-party Drivers for temporary use.
                </p>
                
                <p className="mb-4">
                  3.3 We enter into a separate Driver Agreement with each Driver under which the Driver, amongst other 
                  things, pays a fee to us for access to services, including access to your Parking Space.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">4. Bookings, payment, and charges</h2>
                
                <p className="mb-4">
                  4.1 You may make your Parking Space available for booking. It is your responsibility to ensure that 
                  you inform us of any dates your Parking Space will not be available for booking.
                </p>
                
                <p className="mb-4">
                  4.2 You agree that we will manage the entire booking process and you authorise us to accept a booking 
                  for an available date without further reference to you.
                </p>
                
                <p className="mb-4">
                  4.3 In exchange for the Owner providing access to the Parking Space, we will transmit payment of the 
                  amount owed pursuant to this Agreement to the Owner within 15 working days following the end of the 
                  first month of the Booking Period.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">5. Your obligations</h2>
                
                <p className="mb-4">
                  5.1 You must: (a) honour all bookings with Drivers; (b) ensure that the Driver has access to the 
                  Parking Space; (c) not deliberately do anything which will put the Driver or their vehicle at risk; 
                  (d) provide your Parking Space in accordance with your listing details; (e) ensure all information 
                  is true and accurate; (f) keep the Parking Space clean and tidy; (g) deal with all Drivers professionally; 
                  and (h) deal with queries and complaints promptly.
                </p>
                
                <p className="mb-4">
                  5.2 All communications between Drivers and Owners must take place exclusively within the Site's chat 
                  platform. You are prohibited from sharing personal contact information or making off-platform arrangements.
                </p>
              </div>
            </section>

            {/* Driver Agreement Section */}
            <section className="mb-8 border-t pt-8">
              <h1 className="text-3xl font-bold mb-6 text-center">DRIVER AGREEMENT</h1>
              
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">1. These Terms</h2>
                
                <p className="mb-4">
                  1.1 Shazam Technology Solutions – FZCO provides a website ({window.location.hostname}) and associated 
                  services connecting those seeking to book parking spaces with registered owners who own and operate 
                  such parking spaces.
                </p>
                
                <p className="mb-4">
                  1.2 These terms and conditions will apply when you use the Site or Services. By continuing to use the 
                  Site and/or Services, you accept these terms and conditions.
                </p>
                
                <p className="mb-4">
                  1.3 This Agreement governs the relationship between us and you in relation to booking and using parking 
                  spaces through our Services.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">2. Services and booking</h2>
                
                <p className="mb-4">
                  2.1 To make a booking for a Parking Space you must register an Account as set out on the Site.
                </p>
                
                <p className="mb-4">
                  2.2 We will provide information to you about available Parking Spaces listed by Owners on the Site.
                </p>
                
                <p className="mb-4">
                  2.3 You acknowledge that we operate as an independent technology platform. We do not act as your agent 
                  or represent you in any capacity.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">3. Payment</h2>
                
                <p className="mb-4">
                  3.1 Payment shall be charged from you at the time of the Booking request.
                </p>
                
                <p className="mb-4">
                  3.2 If your Booking requires an access card/device, we will collect a refundable access card/device 
                  fee at the time of Booking.
                </p>
                
                <p className="mb-4">
                  3.3 All fees are stated inclusive of any applicable VAT or other taxes.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">4. The Licence for the Booking Period</h2>
                
                <p className="mb-4">
                  4.1 You are only permitted to use the Parking Space during the Booking Period.
                </p>
                
                <p className="mb-4">
                  4.2 Each Booking is only valid for the vehicle details you entered when making the Booking.
                </p>
                
                <p className="mb-4">
                  4.3 Upon arrival at the Parking Space, you should inspect it and ensure you are satisfied that it 
                  meets the description on the Site.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">5. Your obligations</h2>
                
                <p className="mb-4">
                  5.1 You must: (a) observe and act in accordance with this Agreement; (b) not use the Parking Space 
                  in any way harmful to our business; (c) provide accurate information; (d) keep the Parking Space 
                  clean and tidy; (e) park without obstructing adjoining spaces; (f) not conduct illegal activities; 
                  and (g) use the Parking Space only for parking.
                </p>
                
                <p className="mb-4">
                  5.2 All communications between Drivers and Owners must take place exclusively within the Site's chat 
                  platform. You are prohibited from sharing personal contact information.
                </p>
              </div>
            </section>

            {/* Standard Payment Terms Section */}
            <section className="mb-8 border-t pt-8">
              <h1 className="text-3xl font-bold mb-6 text-center">STANDARD PAYMENT TERMS</h1>
              
              <p className="mb-4 italic text-center">
                (Standalone Terms Governing Invoiced Services Rendered by Shazam Technology Solutions – FZCO)
              </p>
              
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">1. Scope and Binding Nature</h2>
                
                <p className="mb-4">
                  1.1 These Standard Payment Terms govern all invoiced engagements where we have delivered, performed, 
                  or facilitated any form of service or deliverable to you, excluding any payment made directly through the Site.
                </p>
                
                <p className="mb-4">
                  1.2 By receiving or accepting any service deliverable and/or invoice from us, you acknowledge and agree 
                  that these Standard Payment Terms shall be binding and enforceable in full.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">2. Invoice and Payment Terms</h2>
                
                <p className="mb-4">
                  2.1 All invoices issued by us are payable within seven (7) calendar days from the date of the invoice 
                  unless otherwise agreed in writing by us.
                </p>
                
                <p className="mb-4">
                  2.2 All payments shall be made in United Arab Emirates Dirhams (AED), by bank transfer to the account 
                  nominated by the Company.
                </p>
                
                <p className="mb-4">
                  2.3 Payments must be made free and clear of any deductions or withholdings, save where required by law.
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">3. Late Payment and Consequences</h2>
                
                <p className="mb-4">
                  3.1 Where full payment is not received by the due date, we shall be entitled to apply a late payment 
                  fee of AED 200 per calendar week (or part thereof) of delay.
                </p>
              </div>
            </section>

            <div className="bg-muted p-6 rounded-lg mt-12">
              <p className="text-sm text-muted-foreground text-center">
                These terms and conditions are effective as of the date of publication on our website. 
                ShazamParking reserves the right to modify these terms at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default TermsAndConditions;