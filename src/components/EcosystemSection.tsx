import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import shazamLogo from "@/assets/ecosystem/shazam-logo.png";
import dubaiLifeOsLogo from "@/assets/ecosystem/dubai-life-os-logo.png";
import dubaiLifeMapsLogo from "@/assets/ecosystem/dubai-life-maps-logo.png";
import dubaiAerial from "@/assets/dubai-drone-aerial.jpg";

const products = [
  {
    title: "Dubai Life OS",
    tagline: "Personal Operating System",
    description:
      "Your personal operating system for life in Dubai: documents, deadlines, finances, family, vehicles and travel in one place. Everything you need to keep daily life organised.",
    image: dubaiLifeOsLogo,
    href: "https://dubailifeos.ae",
    cta: "Open Life OS",
    current: false,
  },
  {
    title: "Dubai Life Maps",
    tagline: "City Intelligence",
    description:
      "An interactive map of Dubai with live layers: traffic, mobility, environment, parking and neighbourhood context. See the city from above and make smarter decisions every day.",
    image: dubaiLifeMapsLogo,
    href: "https://dubailifemaps.ae/",
    cta: "Explore Maps",
    current: false,
  },
  {
    title: "Shazam Technology Group",
    tagline: "Parent Company",
    description:
      "The creator of the whole ecosystem: Shazam Parking, Dubai Life OS and Dubai Life Maps. We connect technology, data and the daily needs of Dubai residents into one coherent system.",
    image: shazamLogo,
    href: "https://shazam.ae/",
    cta: "Visit Shazam",
    current: true,
  },
];

const EcosystemSection = () => {
  return (
    <section
      id="shazam-ecosystem"
      aria-labelledby="ecosystem-heading"
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
    >
      {/* Drone aerial background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center scale-[1.04]"
        style={{ backgroundImage: `url(${dubaiAerial})` }}
      />
      {/* Brand teal cinematic tint */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--primary-deep) / 0.85) 18%, hsl(var(--primary) / 0.78) 50%, hsl(var(--primary-deep) / 0.88) 82%, hsl(var(--background)) 100%)",
        }}
      />
      {/* Subtle grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Decorative brand glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary-glow/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary/30 blur-3xl" />
      {/* Top + bottom fades into page background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 ring-1 ring-primary/20 text-primary text-xs font-bold tracking-[0.2em] uppercase mb-4">
            <Sparkles className="h-3.5 w-3.5" /> Part of the Shazam Ecosystem
          </span>
          <h2
            id="ecosystem-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-gray-900 mb-4"
          >
            Built by{" "}
            <a
              href="https://shazam.ae/"
              target="_blank"
              rel="noopener"
              className="bg-gradient-to-r from-primary via-primary-glow to-primary-deep bg-clip-text text-transparent hover:underline underline-offset-4"
            >
              Shazam
            </a>{" "}
            - connecting life in Dubai
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Shazam Parking is part of a wider ecosystem of three products. Together they help you understand the city, organise your life and solve everyday mobility in Dubai.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {products.map((p, i) => (
            <motion.a
              key={p.title}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2 animate-frame-pulse"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
                animationDelay: `${i * 0.5}s`,
              }}
            >
              <article className="relative h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
                {/* Logo showcase area with brand-tinted backdrop */}
                <div
                  className="relative aspect-[4/3] overflow-hidden flex items-center justify-center p-8"
                  style={{
                    background:
                      "radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.10) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, hsl(var(--primary-glow) / 0.12) 0%, transparent 55%), linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(174 35% 96%) 100%)",
                  }}
                >
                  {/* glossy top highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/60 to-transparent" />

                  <img
                    src={p.image}
                    alt={`${p.title} logo - ${p.tagline}`}
                    width={280}
                    height={280}
                    loading="lazy"
                    decoding="async"
                    className="relative max-h-[180px] w-auto object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-[0_8px_24px_hsl(var(--primary-deep)/0.25)]"
                  />

                  {p.current && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-lg">
                      You are here
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 border-t border-primary/10">
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary mb-1.5">
                    {p.tagline}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1 leading-relaxed">{p.description}</p>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-primary font-semibold text-sm group-hover:gap-2.5 transition-all">
                    {p.cta}
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
              </article>
            </motion.a>
          ))}
        </div>

        <p className="text-center text-sm text-gray-500 mt-10">
          One ecosystem.{" "}
          <a
            href="https://shazam.ae/"
            target="_blank"
            rel="noopener"
            className="text-primary font-semibold hover:underline"
          >
            Learn more about Shazam →
          </a>
        </p>
      </div>
    </section>
  );
};

export default EcosystemSection;
