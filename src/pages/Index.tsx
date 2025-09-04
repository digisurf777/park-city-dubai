import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, CreditCard, Car, DollarSign, Clock, Shield, Quote } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSEO from "@/hooks/useSEO";
import dubaihero from "@/assets/dubai-skyline-hero.jpg";
import secureParking from "@/assets/secure-parking-hero.jpg";
import luxuryCar from "@/assets/luxury-car-dubai.png";
import businessMan from "@/assets/business-man.jpg";
import phoneLogo from "@/assets/phone-logo.png";
import dubaiMarinaZone from "@/assets/zones/dubai-marina.jpg";
import downtownZone from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.png";
import palmJumeirahZone from "/lovable-uploads/atlantis-hotel-hero.jpg";
import businessBayZone from "@/assets/zones/business-bay.jpg";
import difcZone from "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.png";
import deiraZone from "@/assets/zones/deira.jpg";

const Index = () => {
  const [processingOAuth, setProcessingOAuth] = useState(false);
  
  const seoData = useSEO({
    title: "Shazam Parking - Dubai's Trusted Parking Platform",
    description: "Find and book parking spaces in Dubai Marina, Downtown, DIFC, Business Bay, Palm Jumeirah, and Deira. List your parking space and start earning monthly income with Dubai's most trusted parking platform.",
    keywords: "Dubai parking, parking space rental, Dubai Marina parking, Downtown Dubai parking, DIFC parking, Business Bay parking, Palm Jumeirah parking, Deira parking, secure parking Dubai, monthly parking income, rent parking space Dubai",
    url: "/"
  });

  // Handle OAuth callback tokens (both implicit flow and authorization code flow)
  useEffect(() => {
    const handleOAuthTokens = async () => {
      const fragment = window.location.hash;
      const searchParams = new URLSearchParams(window.location.search);
      const authCode = searchParams.get('code');
      
      // Check for either access_token in fragment (implicit flow) or code in query params (authorization code flow)
      if ((fragment && fragment.includes('access_token')) || authCode) {
        console.log('Index: Found OAuth callback, processing...', { 
          hasFragment: !!fragment, 
          hasCode: !!authCode 
        });
        setProcessingOAuth(true);
        
        try {
          // Give Supabase time to process the OAuth callback automatically
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if we now have a session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Index: Error getting session after OAuth:', error);
          } else if (session) {
            console.log('Index: OAuth successful, user signed in:', session.user.email);
            // Clear both URL fragment and query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.log('Index: No session found after OAuth processing');
          }
        } catch (error) {
          console.error('Index: Error processing OAuth tokens:', error);
        } finally {
          setProcessingOAuth(false);
        }
      }
    };

    handleOAuthTokens();
  }, []);

  // Show loading state while processing OAuth
  if (processingOAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Completing sign in...</p>
        </div>
      </div>
    );
  }
  return <div className="min-h-screen bg-white">
      {seoData}
      <Navbar />
      
      {/* Email Confirmation Banner */}
      <div className="relative">
        <div className="px-4 pt-2">
          <div className="max-w-7xl mx-auto">
            <EmailConfirmationBanner />
          </div>
        </div>
      </div>
      
      {/* Hero Section - Simplified animations for better performance */}
      <section className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${secureParking})`,
      backgroundSize: 'cover'
    }}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between min-h-screen pt-20 sm:pt-24 lg:pt-0 py-8 sm:py-16 lg:py-[141px]">
            {/* Left side - Text */}
            <div className="text-center lg:text-left lg:flex-1 mb-8 lg:mb-0 mt-8 sm:mt-16 lg:mt-0 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight px-2 lg:px-0 mb-4">
                <span className="block text-white" style={{
                textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)'
              }}>
                  YOUR TRUSTED
                </span>
                <span className="block text-primary font-black" style={{
                textShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
              }}>
                  PARKING PLATFORM
                </span>
                <span className="block text-white" style={{
                textShadow: '3px 3px 12px rgba(0, 0, 0, 0.9), 0 0 30px rgba(0, 0, 0, 0.7)'
              }}>
                  IN DUBAI
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mt-4 px-2 lg:px-0" style={{
              textShadow: '2px 2px 8px rgba(0, 0, 0, 0.7)'
            }}>
                List your parking space in minutes and start earning every month.
              </p>
            </div>
            
            {/* Right side - Phone Image */}
            <div className="lg:flex-1 flex justify-center lg:justify-end">
              <picture>
                <source media="(max-width: 640px)" srcSet="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" type="image/webp" width="256" height="467" />
                <source media="(max-width: 1024px)" srcSet="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" type="image/webp" width="320" height="583" />
                <img alt="Shazam Parking Mobile App" className="w-64 sm:w-80 md:w-96 lg:max-w-md h-auto transition-transform duration-300 hover:scale-105" src="/lovable-uploads/c910d35f-a4b2-4c06-88e3-7f5b16a45558.png" loading="eager" {...{
                fetchpriority: 'high'
              }} decoding="async" width="384" height="700" style={{
                contentVisibility: 'auto'
              }} />
              </picture>
            </div>
          </div>
          
          {/* CTA Button - Centered */}
          <div className="flex justify-center mt-8 sm:mt-12 lg:absolute lg:bottom-20 lg:left-1/2 lg:transform lg:-translate-x-1/2 px-4">
            <Link to="/my-account">
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-full w-full sm:w-auto shadow-lg transition-all duration-300 hover:scale-105">
                LOGIN / SIGN UP
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Parking Locations */}
      <motion.section initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} transition={{
      duration: 0.8
    }} viewport={{
      once: true,
      amount: 0.2
    }} className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} viewport={{
          once: true
        }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              POPULAR PARKING LOCATIONS IN DUBAI
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {[{
            name: "Dubai Marina",
            link: "/zones/dubai-marina",
            image: dubaiMarinaZone
          }, {
            name: "Downtown",
            link: "/find-parking?district=downtown",
            image: downtownZone
          }, {
            name: "Palm Jumeirah",
            link: "/find-parking?district=palm-jumeirah",
            image: palmJumeirahZone
          }, {
            name: "Business Bay",
            link: "/find-parking?district=business-bay",
            image: businessBayZone
          }, {
            name: "DIFC",
            link: "/find-parking?district=difc",
            image: difcZone
          }, {
            name: "Deira",
            link: "/find-parking?district=deira",
            image: deiraZone
          }].map((location, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: index * 0.1
          }} viewport={{
            once: true
          }} whileHover={{
            y: -5
          }}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                  <div className="relative aspect-video">
                    <img src={location.image} alt={location.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 group-hover:bg-opacity-30"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 sm:p-6">
                      <motion.h3 initial={{
                    scale: 0.9
                  }} whileHover={{
                    scale: 1.05
                  }} className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4 uppercase text-center">
                        {location.name}
                      </motion.h3>
                      <Link to={location.link}>
                        <motion.div whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }}>
                          <Button className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base lg:text-lg font-semibold transition-all duration-300">
                            Select Zone
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>)}
          </div>
        </div>
      </motion.section>

      {/* How It Works Strip */}
      <motion.section initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} transition={{
      duration: 0.8
    }} viewport={{
      once: true,
      amount: 0.2
    }} className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} viewport={{
          once: true
        }} className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              How It Works
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[{
            icon: Search,
            title: "Search & Select",
            description: "Find the perfect parking location from our verified spaces"
          }, {
            icon: CreditCard,
            title: "Book & Pay Securely",
            description: "Reserve your spot instantly with secure online payment"
          }, {
            icon: Car,
            title: "Park & Relax",
            description: "Arrive at your destination with parking available"
          }].map((step, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3 + index * 0.2
          }} viewport={{
            once: true
          }} whileHover={{
            y: -5
          }} className="text-center">
                <motion.div initial={{
              scale: 0
            }} whileInView={{
              scale: 1
            }} transition={{
              duration: 0.5,
              delay: 0.5 + index * 0.2
            }} viewport={{
              once: true
            }} whileHover={{
              scale: 1.1
            }} className="bg-primary/10 rounded-full w-16 sm:w-20 h-16 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <step.icon className="h-8 sm:h-10 w-8 sm:w-10 text-primary" />
                </motion.div>
                <motion.h3 initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} transition={{
              duration: 0.6,
              delay: 0.7 + index * 0.2
            }} viewport={{
              once: true
            }} className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">
                  {step.title}
                </motion.h3>
                <motion.p initial={{
              opacity: 0
            }} whileInView={{
              opacity: 1
            }} transition={{
              duration: 0.6,
              delay: 0.9 + index * 0.2
            }} viewport={{
              once: true
            }} className="text-gray-600 text-sm sm:text-base px-4">
                  {step.description}
                </motion.p>
              </motion.div>)}
          </div>
        </div>
      </motion.section>

      {/* Rent Out Your Space Section */}
      <motion.section initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} transition={{
      duration: 0.8
    }} viewport={{
      once: true,
      amount: 0.2
    }} className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div initial={{
            opacity: 0,
            x: -50
          }} whileInView={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} viewport={{
            once: true
          }} className="text-center lg:text-left">
              <motion.h2 initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.3
            }} viewport={{
              once: true
            }} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Are you looking to rent out your space?
              </motion.h2>
              <motion.p initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.5
            }} viewport={{
              once: true
            }} className="text-base lg:text-xl text-gray-600 mb-6 sm:mb-8 uppercase font-semibold sm:text-lg">ShazamParking
IS HERE TO HELP YOU</motion.p>
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6,
              delay: 0.7
            }} viewport={{
              once: true
            }}>
                <Link to="/rent-out-your-space">
                  <motion.div whileHover={{
                  scale: 1.05
                }} whileTap={{
                  scale: 0.95
                }}>
                    <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto shadow-lg transition-all duration-300">
                      List Your Space
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div initial={{
            opacity: 0,
            x: 50
          }} whileInView={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.8,
            delay: 0.4
          }} viewport={{
            once: true
          }} className="order-first lg:order-last">
              <motion.img whileHover={{
              scale: 1.05
            }} transition={{
              duration: 0.3
            }} src={luxuryCar} alt="Luxury car in Dubai" className="w-full rounded-lg shadow-lg" loading="lazy" decoding="async" />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Find Parking Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src={dubaihero} alt="Dubai UAE skyline" className="w-full rounded-lg shadow-lg" loading="lazy" decoding="async" />
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                Are you looking for a parking space?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 uppercase font-semibold">FIND YOUR SPACE WITH   ShazamParking</p>
              <Link to="/find-parking">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
                  Book a Space
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center">
              <DollarSign className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Save Money</h3>
            </div>
            <div className="text-center">
              <Clock className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Save Time</h3>
            </div>
            <div className="text-center">
              <Shield className="h-12 sm:h-16 w-12 sm:w-16 text-primary mx-auto mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-4">Absolute Convenience</h3>
            </div>
          </div>

          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Why choose ShazamParking?
            </h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 px-4">
              We are the quickest, easiest, and the most secure way to rent a parking space in Dubai!
            </h3>
            <img src={businessMan} alt="Successful businessman" className="mx-auto rounded-lg shadow-lg max-w-2xl w-full" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Rent a parking space in just 3 simple steps
            </h2>
          </div>
          <div className="flex justify-center">
            <img alt="Three simple steps to rent parking" className="max-w-4xl w-full" src="/lovable-uploads/e36f8df6-09a1-434e-aac9-f077569e37a1.png" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              What customers say about ShazamParking
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[{
            quote: "ShazamParking is a game-changer for anyone looking for a stress-free parking experience, it's easy to use, reliable and convenient.",
            name: "Aaliyah Armasi"
          }, {
            quote: "I highly recommend ShazamParking, it offers an easy-to-use platform, a wide range of parking options, and excellent customer service, making it the perfect parking solution.",
            name: "Ahmed Mohammed"
          }, {
            quote: "ShazamParking is my go-to platform for parking, it's user-friendly, reliable, and offers a wide range of options, making it convenient and easy to find a parking spot.",
            name: "Murtaza Hussain"
          }].map((testimonial, index) => <Card key={index} className="p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <Quote className="h-6 sm:h-8 w-6 sm:w-8 text-primary mb-3 sm:mb-4" />
                <p className="text-gray-600 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.quote}"</p>
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{testimonial.name}</h4>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Hero CTA Banner - Matching Reference Style */}
      <motion.section initial={{
      opacity: 0
    }} whileInView={{
      opacity: 1
    }} transition={{
      duration: 0.8
    }} viewport={{
      once: true,
      amount: 0.2
    }} className="py-12 sm:py-16 lg:py-20 bg-primary relative overflow-hidden">
        {/* Clean Background */}
        <div className="absolute inset-0 bg-primary"></div>
        
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center relative z-10">
          {/* Main Headline - Exact Match to Reference */}
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} viewport={{
          once: true
        }} className="mb-6 sm:mb-8">
            <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.3
          }} viewport={{
            once: true
          }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 tracking-tight">
              Own a Parking Space?
            </motion.h1>
            <motion.h2 initial={{
            opacity: 0,
            y: 30
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.5
          }} viewport={{
            once: true
          }} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-[0.9] tracking-tight">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-400 bg-clip-text drop-shadow-sm text-slate-200 text-4xl font-semibold">
                Turn it into a steady passive income.
              </span>
            </motion.h2>
          </motion.div>
          
          {/* CTA Button */}
          <motion.div initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.7
        }} viewport={{
          once: true
        }} className="space-y-6 sm:space-y-8">
            <Link to="/rent-out-your-space">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Button size="lg" className="bg-white text-primary hover:bg-yellow-50 hover:text-primary px-10 sm:px-16 py-5 sm:py-7 text-xl sm:text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 w-full sm:w-auto">
                  Start Earning Today
                </Button>
              </motion.div>
            </Link>
            
            {/* Trust Indicators */}
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.6,
            delay: 0.9
          }} viewport={{
            once: true
          }} className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-white/95 text-sm sm:text-base font-semibold">
              {["Free to list", "Earn up to AED 1,000/month", "Secure payments"].map((text, index) => <motion.div key={index} initial={{
              opacity: 0,
              x: -20
            }} whileInView={{
              opacity: 1,
              x: 0
            }} transition={{
              duration: 0.5,
              delay: 1 + index * 0.1
            }} viewport={{
              once: true
            }} className="flex items-center gap-2">
                  <span className="text-yellow-300 text-lg">✓</span>
                  {text}
                </motion.div>)}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Your Trusted Parking Platform
          </h2>
          <h3 className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 px-4">ShazamParking
Makes it Easy</h3>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
            Revolutionising parking in Dubai
          </p>
          <Link to="/about-us">
            <Button className="bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg w-full sm:w-auto">
              About Us
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;