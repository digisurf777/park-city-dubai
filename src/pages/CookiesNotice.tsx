import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CookiesNotice = () => {
  const currentDomain = window.location.hostname;

  return (
    <>
      <Helmet>
        <title>Cookie Policy - Shazam Parking</title>
        <meta name="description" content="Learn about how Shazam Parking uses cookies and similar technologies on our website." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-1 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h1 className="text-4xl font-bold text-foreground mb-8">Cookie Policy</h1>
              
              <p className="text-muted-foreground mb-6">Last Reviewed: 2 July 2025</p>

              <p className="mb-6">
                This Cookie Policy explains how Shazam Technology Solutions – FZCO ("<strong>Shazam</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>"), a company registered in the United Arab Emirates with license number 63137, uses cookies and similar technologies through {currentDomain} (the "<strong>Website</strong>").
              </p>

              <p className="mb-8">
                By continuing to browse or use our Website, you agree to our use of cookies as described in this Policy, in accordance with applicable UAE regulations, including the Federal Decree-Law No. 45 of 2021.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mb-4">1. What Are Cookies?</h2>
              <p className="mb-6">
                Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently and to collect analytical information about user interaction and performance.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Why We Use Cookies</h2>
              <p className="mb-2">We use cookies to:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Ensure the Website functions securely and effectively</li>
                <li>Improve user experience by tracking preferences</li>
                <li>Gather aggregated statistics to help us understand how users interact with the Website</li>
                <li>Ensure content is tailored appropriately for our audience</li>
              </ul>

              <h2 className="text-2xl font-semibold text-foreground mb-4">3. Types of Cookies We Use</h2>
              <ul className="list-disc pl-6 mb-6">
                <li><strong>Strictly Necessary Cookies</strong>: Essential to enable you to navigate and use basic Website features.</li>
                <li><strong>Performance and Analytics Cookies</strong>: Help us collect anonymous data on Website usage (e.g., page visits, time spent, bounce rates). These may include third-party cookies such as Google Analytics.</li>
                <li><strong>Functionality Cookies</strong> (minimal use): May remember user choices such as language preferences (if applicable).</li>
              </ul>

              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Managing and Controlling Cookies</h2>
              <p className="mb-2">You have the right to decide whether to accept or reject cookies. Most browsers automatically accept cookies, but you can modify your settings to decline them:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Visit your browser's "Help" section for details on blocking or deleting cookies</li>
                <li>Note: Disabling some cookies may affect the Website's functionality or performance</li>
              </ul>

              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Third-Party Cookies</h2>
              <p className="mb-4">
                We may allow trusted third-party services to place cookies through the Website for analytics or technical support purposes. These cookies are governed by the respective third party's cookie and privacy policies.
              </p>
              <p className="mb-2">Examples include:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Google Analytics: Tracks anonymous usage patterns</li>
                <li>Cloud hosting providers (may set temporary session cookies for security)</li>
              </ul>

              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookie Duration</h2>
              <p className="mb-2">Cookies may be:</p>
              <ul className="list-disc pl-6 mb-6">
                <li><strong>Session cookies</strong>: Deleted when you close your browser</li>
                <li><strong>Persistent cookies</strong>: Stored until they expire or are manually deleted</li>
              </ul>

              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Changes to This Policy</h2>
              <p className="mb-6">
                We may update this Cookie Policy to reflect changes in our practices or legal obligations. Updates will be posted on this page with a revised "Last Reviewed". We encourage users to review this page regularly.
              </p>

              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Contact Us</h2>
              <p className="mb-6">
                If you have questions about our use of cookies, please contact us at support@shazam.ae
              </p>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default CookiesNotice;