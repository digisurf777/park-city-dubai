import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string
}

export const useSEO = ({
  title = "Shazam Parking - Dubai's Trusted Parking Platform",
  description = "Find and book parking spaces in Dubai with Shazam Parking. List your parking space and start earning monthly income. Secure, convenient, and trusted by Dubai residents.",
  keywords = "Dubai parking, parking space rental, Dubai Marina parking, Downtown Dubai parking, secure parking Dubai, monthly parking income",
  image = "/shazam-parking-og-image.jpg",
  url = "https://shazamparking.ae",
  type = "website"
}: SEOProps = {}) => {
  
  const fullImageUrl = image.startsWith('http') ? image : `${window.location.origin}${image}`;
  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Performance optimizations */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//images.unsplash.com" />
      
      
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Shazam Parking" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};

export default useSEO;