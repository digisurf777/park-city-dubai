import { useSEO } from "@/hooks/useSEO";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CookiesNotice = () => {
  const seo = useSEO({
    title: "Cookies Notice - Shazam Parking",
    description: "Learn about how we use cookies on our website to improve your experience and provide better services.",
    keywords: "cookies, privacy, data protection, website cookies, analytics"
  });

  return (
    <>
      {seo}
      <Navbar />
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary to-secondary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">Cookies Notice</h1>
            <p className="text-lg sm:text-xl opacity-90">Last Reviewed: 2 July 2025</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 sm:space-y-8 text-foreground">
              <section className="touch-manipulation">
                <p className="text-sm sm:text-base leading-relaxed">
                  This Cookie Policy explains how Shazam Technology Solutions – FZCO ("<strong>Shazam</strong>", "<strong>we</strong>", "<strong>us</strong>", or "<strong>our</strong>"), a company registered in the United Arab Emirates with license number 63137, uses cookies and similar technologies through www.shazamparking.ae (the "<strong>Website</strong>").
                </p>
                <p className="text-sm sm:text-base leading-relaxed mt-4">
                  By continuing to browse or use our Website, you agree to our use of cookies as described in this Policy, in accordance with applicable UAE regulations, including the Federal Decree-Law No. 45 of 2021.
                </p>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">1. What Are Cookies?</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently and to collect analytical information about user interaction and performance.
                </p>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">2. Why We Use Cookies</h2>
                <p className="text-sm sm:text-base leading-relaxed">We use cookies to:</p>
                <ul className="list-disc pl-4 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                  <li className="touch-target">Ensure the Website functions securely and effectively</li>
                  <li className="touch-target">Improve user experience by tracking preferences</li>
                  <li className="touch-target">Gather aggregated statistics to help us understand how users interact with the Website</li>
                  <li className="touch-target">Ensure content is tailored appropriately for our audience</li>
                </ul>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">3. Types of Cookies We Use</h2>
                <ul className="list-disc pl-4 sm:pl-6 space-y-3 text-sm sm:text-base">
                  <li className="touch-target leading-relaxed"><strong>Strictly Necessary Cookies</strong>: Essential to enable you to navigate and use basic Website features.</li>
                  <li className="touch-target leading-relaxed"><strong>Performance and Analytics Cookies</strong>: Help us collect anonymous data on Website usage (e.g., page visits, time spent, bounce rates). These may include third-party cookies such as Google Analytics.</li>
                  <li className="touch-target leading-relaxed"><strong>Functionality Cookies</strong> (minimal use): May remember user choices such as language preferences (if applicable).</li>
                </ul>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">4. Managing and Controlling Cookies</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  You have the right to decide whether to accept or reject cookies. Most browsers automatically accept cookies, but you can modify your settings to decline them:
                </p>
                <ul className="list-disc pl-4 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                  <li className="touch-target">Visit your browser's "Help" section for details on blocking or deleting cookies</li>
                  <li className="touch-target">Note: Disabling some cookies may affect the Website's functionality or performance</li>
                </ul>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">5. Third-Party Cookies</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  We may allow trusted third-party services to place cookies through the Website for analytics or technical support purposes. These cookies are governed by the respective third party's cookie and privacy policies.
                </p>
                <p className="text-sm sm:text-base leading-relaxed mt-3">Examples include:</p>
                <ul className="list-disc pl-4 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                  <li className="touch-target">Google Analytics: Tracks anonymous usage patterns</li>
                  <li className="touch-target">Cloud hosting providers (may set temporary session cookies for security)</li>
                </ul>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">6. Cookie Duration</h2>
                <p className="text-sm sm:text-base leading-relaxed">Cookies may be:</p>
                <ul className="list-disc pl-4 sm:pl-6 space-y-2 mt-3 text-sm sm:text-base">
                  <li className="touch-target"><strong>Session cookies</strong>: Deleted when you close your browser</li>
                  <li className="touch-target"><strong>Persistent cookies</strong>: Stored until they expire or are manually deleted</li>
                </ul>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">7. Changes to This Policy</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  We may update this Cookie Policy to reflect changes in our practices or legal obligations. Updates will be posted on this page with a revised "Last Reviewed". We encourage users to review this page regularly.
                </p>
              </section>

              <section className="touch-manipulation">
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 touch-target">8. Contact Us</h2>
                <p className="text-sm sm:text-base leading-relaxed">
                  If you have questions about our use of cookies, please contact us at{' '}
                  <a 
                    href="mailto:support@shazam.ae" 
                    className="text-primary hover:text-primary/80 underline touch-target font-medium"
                    style={{ textDecorationThickness: '2px' }}
                  >
                    support@shazam.ae
                  </a>
                </p>
              </section>

              {/* Mobile-friendly accept section */}
              <section className="mt-8 sm:mt-12 p-4 sm:p-6 bg-gray-50 rounded-lg border touch-manipulation">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 touch-target">Cookie Preferences</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  By using our website, you accept our use of cookies as described in this policy.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium touch-target transition-colors duration-200 text-center"
                  >
                    Accept & Continue
                  </button>
                  <button 
                    onClick={() => window.history.back()}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium touch-target transition-colors duration-200 text-center"
                  >
                    Go Back
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CookiesNotice;