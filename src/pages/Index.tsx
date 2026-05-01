import React from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MapPin, Search, CreditCard, Car, DollarSign, Clock, Shield, Quote, Zap, Lock, Wallet, Smartphone, TrendingUp, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EmailConfirmationBanner } from "@/components/EmailConfirmationBanner";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useSEO from "@/hooks/useSEO";
import dubaihero from "@/assets/dubai-skyline-hero.webp";
import phonePremium from "@/assets/phone-mockup-premium.webp";
import secureParking from "@/assets/secure-parking-hero.webp";
import luxuryCar from "@/assets/luxury-car-dubai.webp";
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
      
      {/* Hero — premium, balanced, ~85vh */}
      <section
        className="relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(135deg, hsl(174 65% 22% / 0.85) 0%, hsl(0 0% 0% / 0.55) 100%), url(${secureParking})`,
        }}
      >
        {/* Decorative blurred glows */}
        <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/30 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-primary-glow/25 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white z-10 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 min-h-[640px] sm:min-h-[680px] lg:min-h-[720px] flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center w-full">
            {/* Left — Text */}
            <div className="text-center lg:text-left animate-fade-in order-2 lg:order-1">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-white text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
                Dubai's #1 Parking Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-4 sm:mb-6">
                <span className="block text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">Park Smarter.</span>
                <span className="block text-gradient-primary bg-gradient-to-r from-primary-glow via-primary to-primary-glow">
                  Earn Bigger.
                </span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                Find verified monthly parking across Dubai — or list your space in minutes and earn passive income.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
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
                    className="w-full sm:w-auto px-7 py-6 text-base font-semibold bg-white/10 border-white/40 text-white hover:bg-white hover:text-primary backdrop-blur-md"
                  >
                    List Your Space
                  </Button>
                </Link>
              </div>
              {/* Inline social proof */}
              <div className="hidden sm:flex items-center justify-center lg:justify-start gap-6 mt-8 text-white/80 text-sm">
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
              </div>
            </div>

            {/* Right — Phone */}
            <div className="flex justify-center lg:justify-end order-1 lg:order-2">
              <div className="relative">
                {/* Glow ring behind phone */}
                <div className="absolute inset-0 -m-8 rounded-[50%] bg-primary/40 blur-3xl animate-pulse-glow pointer-events-none"></div>
                <img
                  src={phonePremium}
                  alt="Shazam Parking app shown on a smartphone"
                  className="relative w-56 sm:w-64 md:w-72 lg:w-80 xl:w-[22rem] h-auto drop-shadow-[0_25px_50px_rgba(0,0,0,0.5)] animate-float"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={1024}
                  height={1536}
                />
              </div>
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
                <Card className="overflow-hidden rounded-2xl ring-1 ring-primary/10 shadow-lg hover:shadow-2xl hover:ring-primary/30 transition-all duration-300 group">
                  <div className="relative aspect-video">
                    <img src={location.image} alt={location.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" decoding="async" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-primary/60"></div>
                    <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6 flex flex-col items-center text-white p-4 sm:p-5 rounded-2xl glass-dark">
                      <motion.h3 initial={{
                    scale: 0.9
                  }} whileHover={{
                    scale: 1.05
                  }} className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 uppercase text-center drop-shadow-lg">
                        {location.name}
                      </motion.h3>
                      <Link to={location.link}>
                        <motion.div whileHover={{
                      scale: 1.05
                    }} whileTap={{
                      scale: 0.95
                    }}>
                          <Button className="px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-semibold">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: Clock,
                problem: "Wasting hours circling for spots",
                solution: "Reserve a guaranteed space in seconds.",
              },
              {
                icon: Wallet,
                problem: "Paying premium hotel & mall rates",
                solution: "Save up to 60% on monthly parking.",
              },
              {
                icon: Lock,
                problem: "Worrying about car safety",
                solution: "Verified, private, secure locations only.",
              },
              {
                icon: TrendingUp,
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
                className="group relative p-5 sm:p-6 rounded-2xl glass-card hover-lift"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-foreground/60 line-through mb-1.5">
                  {item.problem}
                </p>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {item.solution}
                </p>
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
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                <Wallet className="h-3.5 w-3.5" />
                For owners
              </span>
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
              {/* Outer glow */}
              <div className="absolute inset-0 -m-4 rounded-[2rem] bg-gradient-primary opacity-30 blur-2xl animate-pulse-glow pointer-events-none"></div>

              {/* Gradient border frame */}
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-primary via-primary-glow to-primary-deep shadow-elegant animate-float">
                <div className="rounded-3xl overflow-hidden bg-background relative">
                  <motion.img
                    whileHover={{ scale: 1.04 }}
                    transition={{ duration: 0.5 }}
                    src={luxuryCar}
                    alt="Luxury car parked in Dubai"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Floating earnings card */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-[260px] glass-card rounded-2xl p-4 shadow-elegant"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-primary text-primary-foreground flex items-center justify-center shadow-elegant">
                        <TrendingUp className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">This month</p>
                        <p className="text-lg sm:text-xl font-black text-foreground leading-tight">
                          + AED 1,250
                        </p>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    </div>
                  </motion.div>
                </div>
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
              <div className="rounded-2xl ring-1 ring-primary/20 shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.4)] p-1.5 bg-gradient-to-br from-primary/15 to-transparent animate-[float_7s_ease-in-out_infinite]">
                <img src={dubaihero} alt="Dubai UAE skyline" className="w-full rounded-xl shadow-lg" loading="lazy" decoding="async" />
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
            <div className="mx-auto max-w-2xl rounded-2xl ring-1 ring-primary/15 shadow-[0_20px_40px_-15px_hsl(var(--primary)/0.35)] p-1.5 bg-gradient-to-br from-primary/10 to-transparent animate-[float_8s_ease-in-out_infinite]">
              <img src={businessMan} alt="Successful businessman" className="rounded-xl w-full" loading="lazy" decoding="async" />
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
          }].map((testimonial, index) => <Card key={index} className="p-6 sm:p-8 glass-card hover-lift border-0 rounded-2xl">
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
    }} className="py-12 sm:py-16 lg:py-20 relative overflow-hidden bg-gradient-to-br from-[hsl(174_57%_36%)] via-primary to-[hsl(174_60%_50%)]">
        {/* Decorative blurred blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
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
              <span className="text-white text-4xl font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]">
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
                <Button size="lg" className="bg-white text-primary hover:bg-white hover:text-primary px-10 sm:px-16 py-5 sm:py-7 text-xl sm:text-2xl font-bold shadow-[0_6px_0_0_rgba(0,0,0,0.15),0_20px_40px_-10px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2),0_24px_50px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all duration-300 w-full sm:w-auto h-auto">
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
            }} className="flex items-center gap-2 px-4 py-2 rounded-full glass-dark">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white text-primary text-sm font-bold shadow-md">✓</span>
                  {text}
                </motion.div>)}
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

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

      <Footer />
    </div>;
};
export default Index;