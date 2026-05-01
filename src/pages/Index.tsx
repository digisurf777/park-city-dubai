import React from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, CreditCard, Car, DollarSign, Clock, Shield, Quote, Zap, Lock, Wallet, Smartphone, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EcosystemSection from "@/components/EcosystemSection";
import TestimonialsMarquee from "@/components/TestimonialsMarquee";
import TrustedPlatform from "@/components/TrustedPlatform";
import carEnteringParking from "@/assets/car-entering-parking.jpg";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSEO from "@/hooks/useSEO";
import dubaihero from "@/assets/dubai-skyline-hero.webp";
import phonePremium from "@/assets/phone-mockup-hero.png";
import secureParking from "@/assets/secure-parking-hero.webp";
import luxuryCar from "@/assets/luxury-car-dubai-garage.jpg";
import luxuryCarStreet from "@/assets/luxury-car-dubai-street.jpg";
import dubaiDriverPov from "@/assets/dubai-driver-pov.jpg";
import problemCircling from "@/assets/problem-circling.jpg";
import problemExpensive from "@/assets/problem-expensive.jpg";
import problemSafety from "@/assets/problem-safety.jpg";
import problemEmptySpot from "@/assets/problem-empty-spot.jpg";
import businessMan from "@/assets/business-man.webp";
import phoneLogo from "@/assets/phone-logo.webp";
import dubaiMarinaZone from "@/assets/zones/dubai-marina.webp";
import downtownZone from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.webp";
import palmJumeirahZone from "/lovable-uploads/atlantis-hotel-hero.webp";
import businessBayZone from "@/assets/zones/business-bay.webp";
import difcZone from "/lovable-uploads/63d539ac-8cbb-46b2-aa39-3de0695ef8c9.webp";
import deiraZone from "@/assets/zones/deira.webp";
const Index = () => {
  const seoData = useSEO({
    title: "Shazam Parking - Dubai's Trusted Parking Platform",
    description: "Find and book parking spaces in Dubai Marina, Downtown, DIFC, Business Bay, Palm Jumeirah, and Deira. List your parking space and start earning monthly income with Dubai's most trusted parking platform.",
    keywords: "Dubai parking, parking space rental, Dubai Marina parking, Downtown Dubai parking, DIFC parking, Business Bay parking, Palm Jumeirah parking, Deira parking, secure parking Dubai, monthly parking income, rent parking space Dubai",
    url: "/"
  });








  
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
      
      {/* Hero — premium, balanced, readable on mobile */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(174 60% 22% / 0.35) 0%, hsl(174 50% 30% / 0.20) 50%, hsl(174 45% 40% / 0.10) 100%), url(${secureParking})`,
        }}
      >
        {/* Bottom darken for text legibility on mobile (only where text sits) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/10 to-transparent"></div>
        {/* Decorative glows — subtle */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary-glow/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -top-24 -left-24 w-[22rem] h-[22rem] rounded-full bg-primary/10 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10 pt-16 pb-10 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 min-h-[600px] sm:min-h-[680px] lg:min-h-[720px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-12 items-center w-full">
            {/* Left — Text */}
            <motion.div
              className="text-center lg:text-left order-2 lg:order-1"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
              }}
            >
              <motion.span
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
                Trusted in Dubai
              </motion.span>
              <h1 className="text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight mb-4 sm:mb-6">
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}
                  className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                >
                  YOUR TRUSTED
                </motion.span>
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}
                  className="block bg-gradient-to-r from-primary-glow via-[hsl(160_85%_75%)] to-white bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                >
                  PARKING PLATFORM
                </motion.span>
                <motion.span
                  variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } } }}
                  className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                >
                  IN DUBAI
                </motion.span>
              </h1>
              <motion.p
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                className="text-base sm:text-lg lg:text-xl text-white/95 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
              >
                List your parking space in minutes and start earning every month.
              </motion.p>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start"
              >
                <Link to="/find-parking">
                  <Button size="lg" className="w-full sm:w-auto px-7 py-6 text-base font-semibold">
                    Find Parking
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/rent-out-your-space">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-7 py-6 text-base font-semibold bg-white/15 border-white/50 text-white hover:bg-white hover:text-primary backdrop-blur-md"
                  >
                    List Your Space
                  </Button>
                </Link>
              </motion.div>
              {/* Inline social proof */}
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}
                className="hidden sm:flex items-center justify-center lg:justify-start gap-6 mt-8 text-white/90 text-sm"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-glow" />
                  <span>Verified spaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-glow" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary-glow" />
                  <span>Cancel anytime*</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — Phone (transparent PNG, centered & balanced) */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.85, y: 40, rotate: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              >
                {/* Soft glow halo behind phone */}
                <div className="absolute inset-0 -m-10 rounded-full bg-primary-glow/30 blur-3xl animate-pulse-glow pointer-events-none"></div>
                <div className="absolute inset-0 -m-4 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
                <motion.img
                  src={phonePremium}
                  alt="Shazam Parking app shown on a smartphone"
                  className="relative w-44 sm:w-60 md:w-72 lg:w-80 xl:w-[22rem] h-auto drop-shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
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
            link: "/find-parking?district=dubai-marina",
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
                <Link to={location.link} className="block">
                  <Card className="overflow-hidden rounded-2xl ring-1 ring-primary/10 shadow-lg hover:shadow-2xl hover:ring-primary/40 transition-all duration-300 group">
                    <div className="relative aspect-[4/5] sm:aspect-[4/5]">
                      <img src={location.image} alt={location.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async" />
                      {/* Bottom gradient only — keeps image fully visible */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                      {/* Title pinned at bottom-left */}
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow mb-1 drop-shadow">Dubai</p>
                          <motion.h3 initial={{ y: 4, opacity: 0.9 }} whileInView={{ y: 0, opacity: 1 }} className="text-xl sm:text-2xl font-black uppercase text-white drop-shadow-lg leading-tight">
                            {location.name}
                          </motion.h3>
                        </div>
                        <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-elegant ring-2 ring-white/30 group-hover:bg-primary-glow transition-colors">
                          <ArrowRight className="h-5 w-5" />
                        </motion.div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>)}
          </div>
        </div>
      </motion.section>

      {/* How It Works — tightened */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
        className="py-12 sm:py-16 bg-gradient-subtle"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              How it works
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Park in 3 simple steps
            </h2>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-10 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 z-0"></div>

            {[
              { icon: Search, title: "Search & Select", description: "Browse verified spaces near you." },
              { icon: CreditCard, title: "Book Securely", description: "Reserve in seconds with secure payment." },
              { icon: Car, title: "Park & Relax", description: "Arrive — your spot is waiting." },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                viewport={{ once: true }}
                className="relative z-10 text-center"
              >
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <div className="absolute inset-0 bg-gradient-primary rounded-2xl shadow-elegant rotate-3 group-hover:rotate-6 transition-transform"></div>
                  <div className="relative bg-gradient-primary text-primary-foreground rounded-2xl w-20 h-20 flex items-center justify-center shadow-elegant">
                    <step.icon className="h-9 w-9" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white text-primary text-sm font-bold flex items-center justify-center shadow-md ring-2 ring-primary/20">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-1.5">{step.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Problems We Solve — NEW section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
        className="py-14 sm:py-20 bg-white relative overflow-hidden"
      >
        <div className="pointer-events-none absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-10 sm:mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
              The problem
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3">
              Parking in Dubai shouldn't be a daily headache
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              We connect drivers with private parking owners — solving the four biggest pains of city parking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {[
              {
                icon: Clock,
                image: problemCircling,
                problem: "Wasting hours circling for spots",
                solution: "Reserve a guaranteed space in seconds.",
              },
              {
                icon: Wallet,
                image: problemExpensive,
                problem: "Paying premium hotel & mall rates",
                solution: "Save up to 60% on monthly parking.",
              },
              {
                icon: Lock,
                image: problemSafety,
                problem: "Worrying about car safety",
                solution: "Verified, private, secure locations only.",
              },
              {
                icon: TrendingUp,
                image: problemEmptySpot,
                problem: "Empty parking spaces wasting money",
                solution: "Owners earn passive monthly income.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2 flex"
                style={{
                  background:
                    'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)',
                  boxShadow:
                    '0 24px 48px -16px hsl(var(--primary-deep) / 0.5), 0 10px 20px -8px hsl(var(--primary) / 0.35), inset 0 1px 0 0 hsl(0 0% 100% / 0.4)',
                }}
              >
                <div className="relative rounded-[14px] bg-white overflow-hidden flex flex-col w-full">
                  {/* Visual — bigger, more prominent */}
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.problem}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      width={1000}
                      height={1000}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
                    {/* Glossy top highlight */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />
                    <div className="absolute top-3 left-3 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant ring-2 ring-white/50">
                      <item.icon className="h-6 w-6" />
                    </div>
                  </div>
                  {/* Text */}
                  <div className="p-5 sm:p-6">
                    <p className="text-xs font-semibold text-foreground/55 line-through mb-1.5">
                      {item.problem}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
                      {item.solution}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>


      {/* Own a Parking Space — premium */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.2 }}
        className="py-14 sm:py-20 bg-gradient-to-br from-surface via-white to-surface-2 relative overflow-hidden"
      >
        <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/15 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-32 -right-20 w-96 h-96 rounded-full bg-primary-glow/15 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">
                Own a parking space?
                <span className="block text-gradient-primary mt-1">Turn it into income.</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-lg mx-auto lg:mx-0">
                Your unused parking spot can earn steady monthly income. We handle bookings, payments, and tenant matching — you just get paid.
              </p>

              {/* Stat badges */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 max-w-md mx-auto lg:mx-0">
                {[
                  { value: "AED 1k+", label: "Avg. monthly" },
                  { value: "5 min", label: "To list" },
                  { value: "0%", label: "Fees to list" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-3 rounded-xl glass-card hover-lift"
                  >
                    <div className="text-lg sm:text-xl font-black text-gradient-primary leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/rent-out-your-space">
                  <Button size="lg" className="w-full sm:w-auto px-7 py-6 text-base font-semibold">
                    List Your Space
                    <ArrowRight className="ml-1 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/calculator">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto px-7 py-6 text-base font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    Estimate earnings
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Image — premium frame */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2 relative"
            >
              {/* Soft outer glow */}
              <div className="absolute inset-0 -m-6 rounded-[2.25rem] bg-gradient-primary opacity-25 blur-3xl pointer-events-none"></div>

              {/* Clean rounded image frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-elegant bg-background">
                <motion.img
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.5 }}
                  src={luxuryCar}
                  alt="Luxury car parked in a premium Dubai garage at golden hour"
                  className="w-full h-auto object-cover block"
                  loading="lazy"
                  decoding="async"
                  width={1280}
                  height={1280}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>


      {/* Find Parking Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-surface via-white to-surface-2 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div
                className="group relative rounded-3xl p-[3px] bg-gradient-to-br from-primary via-primary-glow to-primary-deep shadow-[0_30px_60px_-20px_hsl(var(--primary)/0.55)] animate-frame-pulse overflow-hidden"
              >
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-transparent to-primary-glow/30 blur-2xl opacity-60 pointer-events-none" />
                <div className="relative rounded-[22px] overflow-hidden bg-white">
                  <img
                    src={carEnteringParking}
                    alt="Luxury car entering a premium Dubai building parking garage at golden hour"
                    className="w-full object-cover aspect-[4/3] transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                    width={1536}
                    height={1024}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary-deep/30 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold text-primary shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" /> Premium Locations
                  </div>
                </div>
              </div>
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
            {[
              { Icon: DollarSign, title: "Save Money", desc: "Lower-cost monthly parking, no hidden fees." },
              { Icon: Clock, title: "Save Time", desc: "Book in seconds, skip the daily search." },
              { Icon: Shield, title: "Absolute Convenience", desc: "Verified spaces and secure payments." },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="group text-center p-6 sm:p-8 rounded-2xl glass-primary hover-lift"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-8 sm:h-10 w-8 sm:w-10" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">{title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Why choose ShazamParking?
            </h2>
            <h3 className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 px-4">
              We are the quickest, easiest, and the most secure way to rent a parking space in Dubai!
            </h3>
            <div className="mx-auto max-w-2xl rounded-2xl ring-1 ring-primary/15 shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.35)] p-1.5 bg-gradient-to-br from-primary/10 to-transparent animate-[float_8s_ease-in-out_infinite] overflow-hidden">
              <img src={dubaiDriverPov} alt="Stylish man in Dubai using the ShazamParking app next to his luxury car with Burj Khalifa in the background" className="rounded-xl w-full object-cover aspect-video" loading="lazy" decoding="async" width={1536} height={1024} />
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-surface-2 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
              Rent a parking space in just 3 simple steps
            </h2>
          </div>
          <div className="flex justify-center">
            <img alt="Three simple steps to rent parking" className="max-w-4xl w-full" src="/lovable-uploads/e36f8df6-09a1-434e-aac9-f077569e37a1.webp" />
          </div>
        </div>
      </section>

      {/* Testimonials — animated marquee */}
      <TestimonialsMarquee />

      {/* Trusted Platform — partners + badges */}
      <TrustedPlatform />


      {/* Final CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-surface">
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

      {/* Shazam Ecosystem */}
      <EcosystemSection />

      <Footer />
    </div>;
};
export default Index;