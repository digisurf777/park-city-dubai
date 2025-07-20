import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CookiesNotice = () => {
  return (
    <>
      <Helmet>
        <title>Cookies Notice | ShazamParking</title>
        <meta name="description" content="ShazamParking Cookies Notice - Learn about how we use cookies and similar technologies on our website, your rights, and how to manage cookie preferences." />
      </Helmet>
      
      <Navbar />
      
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold mb-8 text-center">Cookie Policy</h1>
            
            <p className="text-center text-muted-foreground mb-8">
              Last Reviewed: 2 July 2025
            </p>
            
            <p className="mb-6">
              This Cookie Policy explains how Shazam Technology Solutions – FZCO (<strong>"Shazam"</strong>, 
              <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>), a company registered 
              in the United Arab Emirates with license number 63137, uses cookies and similar technologies 
              through {window.location.hostname} (the <strong>"Website"</strong>).
            </p>
            
            <p className="mb-8">
              By continuing to browse or use our Website, you agree to our use of cookies as described in 
              this Policy, in accordance with applicable UAE regulations, including the Federal Decree-Law No. 45 of 2021.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies?</h2>
              
              <p className="mb-4">
                Cookies are small text files placed on your device by websites you visit. They are widely used 
                to make websites work efficiently and to collect analytical information about user interaction and performance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Why We Use Cookies</h2>
              
              <p className="mb-4">We use cookies to:</p>
              
              <ul className="list-disc pl-6 mb-4">
                <li>Ensure the Website functions securely and effectively</li>
                <li>Improve user experience by tracking preferences</li>
                <li>Gather aggregated statistics to help us understand how users interact with the Website</li>
                <li>Ensure content is tailored appropriately for our audience</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Strictly Necessary Cookies</h3>
                  <p>Essential to enable you to navigate and use basic Website features.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Performance and Analytics Cookies</h3>
                  <p>Help us collect anonymous data on Website usage (e.g., page visits, time spent, bounce rates). 
                  These may include third-party cookies such as Google Analytics.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Functionality Cookies (minimal use)</h3>
                  <p>May remember user choices such as language preferences (if applicable).</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Managing and Controlling Cookies</h2>
              
              <p className="mb-4">
                You have the right to decide whether to accept or reject cookies. Most browsers automatically 
                accept cookies, but you can modify your settings to decline them:
              </p>
              
              <ul className="list-disc pl-6 mb-4">
                <li>Visit your browser's "Help" section for details on blocking or deleting cookies</li>
                <li>Note: Disabling some cookies may affect the Website's functionality or performance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Third-Party Cookies</h2>
              
              <p className="mb-4">
                We may allow trusted third-party services to place cookies through the Website for analytics 
                or technical support purposes. These cookies are governed by the respective third party's cookie 
                and privacy policies.
              </p>
              
              <p className="mb-4">Examples include:</p>
              
              <ul className="list-disc pl-6 mb-4">
                <li>Google Analytics: Tracks anonymous usage patterns</li>
                <li>Cloud hosting providers (may set temporary session cookies for security)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Cookie Duration</h2>
              
              <p className="mb-4">Cookies may be:</p>
              
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Session cookies</strong>: Deleted when you close your browser</li>
                <li><strong>Persistent cookies</strong>: Stored until they expire or are manually deleted</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Changes to This Policy</h2>
              
              <p className="mb-4">
                We may update this Cookie Policy to reflect changes in our practices or legal obligations. 
                Updates will be posted on this page with a revised "Last Reviewed". We encourage users to 
                review this page regularly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
              
              <p className="mb-4">
                If you have questions about our use of cookies, please contact us at{" "}
                <a href="mailto:support@shazam.ae" className="text-primary hover:underline">
                  support@shazam.ae
                </a>.
              </p>
            </section>

            <div className="bg-muted p-6 rounded-lg mt-12">
              <p className="text-sm text-muted-foreground text-center">
                This Cookie Policy is effective as of the date of last review shown above. 
                ShazamParking reserves the right to modify this policy at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default CookiesNotice;