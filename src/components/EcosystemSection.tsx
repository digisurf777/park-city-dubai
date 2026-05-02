import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import shazamLogo from "@/assets/ecosystem/shazam-logo.png";
import dubaiLifeOsLogo from "@/assets/ecosystem/dubai-life-os-logo.png";
import dubaiLifeMapsLogo from "@/assets/ecosystem/dubai-life-maps-logo.png";
import shazamPreview from "@/assets/ecosystem/shazam-preview.png";
import dubaiLifeOsPreview from "@/assets/ecosystem/dubai-life-os-preview.png";
import dubaiLifeMapsPreview from "@/assets/ecosystem/dubai-life-maps-preview.png";
import dubaiAerial from "@/assets/dubai-drone-aerial.jpg";

const products = [
  {
    title: "Dubai Life OS",
    tagline: "Personal Operating System",
    description:
      "Your personal operating system for life in Dubai: documents, deadlines, finances, family, vehicles and travel in one place.",
    preview: dubaiLifeOsPreview,
    logo: dubaiLifeOsLogo,
    href: "https://dubailifeos.ae",
    cta: "Open Life OS",
  },
  {
    title: "Shazam Technology Group",
    tagline: "Parent Company",
    description:
      "The creator of the whole ecosystem: Shazam Parking, Dubai Life OS and Dubai Life Maps. We connect technology, data and the daily needs of Dubai residents.",
    preview: shazamPreview,
    logo: shazamLogo,
    href: "https://shazam.ae/",
    cta: "Visit Shazam",
    featured: true,
  },
  {
    title: "Dubai Life Maps",
    tagline: "City Intelligence",
    description:
      "An interactive map of Dubai with live layers: traffic, mobility, environment, parking and neighbourhood context. See the city from above.",
    preview: dubaiLifeMapsPreview,
    logo: dubaiLifeMapsLogo,
    href: "https://dubailifemaps.ae/",
    cta: "Explore Maps",
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
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--primary-deep) / 0.28) 16%, hsl(var(--primary) / 0.18) 50%, hsl(var(--primary-deep) / 0.32) 84%, hsl(var(--background)) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 35% at 50% 22%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary-glow)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-glow)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div className="pointer-events-none absolute -top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary-glow/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary/12 blur-3xl" />
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
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md ring-1 ring-white/30 text-primary-glow text-xs font-bold tracking-[0.2em] uppercase mb-4 shadow-[0_4px_16px_-4px_rgb(0_0_0/0.6)]">
            <Sparkles className="h-3.5 w-3.5" /> Part of the Shazam Ecosystem
          </span>
          <h2
            id="ecosystem-heading"
            className="font-black tracking-tight text-white mb-4 [text-shadow:0_2px_8px_rgb(0_0_0/0.7),0_4px_24px_rgb(0_0_0/0.5)]"
          >
            <span className="block text-3xl sm:text-4xl lg:text-5xl">
              Built by{" "}
              <a
                href="https://shazam.ae/"
                target="_blank"
                rel="noopener"
                className="inline-block uppercase font-black tracking-wider bg-gradient-to-r from-primary-glow via-primary to-primary-glow bg-clip-text text-transparent hover:scale-105 transition-transform [text-shadow:none] drop-shadow-[0_4px_18px_hsl(var(--primary)/0.65)]"
              >
                SHAZAM
              </a>
            </span>
            <span
              className="block mt-2 text-xl sm:text-2xl lg:text-3xl font-light italic text-white/90"
              style={{ fontFamily: '"Playfair Display", Georgia, serif' }}
            >
              Connecting life in Dubai
            </span>
          </h2>
          <p className="text-base sm:text-lg text-white font-medium [text-shadow:0_2px_8px_rgb(0_0_0/0.75),0_1px_3px_rgb(0_0_0/0.6)]">
            Shazam Parking is part of a wider ecosystem of three products. Together they help you understand the city, organise your life and solve everyday mobility in Dubai.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
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
              className={`group relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2 ${
                p.featured ? "md:scale-[1.03] md:-translate-y-1" : ""
              }`}
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
                boxShadow: p.featured
                  ? "0 30px 60px -20px hsl(var(--primary-deep) / 0.7), 0 0 0 1px hsl(var(--primary-glow) / 0.4)"
                  : "0 18px 40px -16px hsl(var(--primary-deep) / 0.5)",
              }}
            >
              <article className="relative h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
                {/* Preview screenshot */}
                <div className="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden bg-gray-900">
                  <img
                    src={p.preview}
                    alt={`${p.title} preview - ${p.tagline}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Bottom gradient for logo legibility */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Small logo bottom-right corner */}
                  <div className="absolute bottom-3 right-3 h-11 w-11 rounded-xl bg-white/95 backdrop-blur ring-1 ring-white/60 shadow-lg flex items-center justify-center p-1.5">
                    <img
                      src={p.logo}
                      alt=""
                      aria-hidden="true"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1 border-t border-primary/10">
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary mb-1.5">
                    {p.tagline}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1 leading-relaxed">{p.description}</p>

                  {/* Premium 3D CTA button */}
                  <div
                    className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white font-bold text-sm tracking-wide transition-all duration-300 group-hover:translate-y-[-2px] group-active:translate-y-[1px]"
                    style={{
                      background:
                        "linear-gradient(180deg, hsl(var(--primary-glow)) 0%, hsl(var(--primary)) 55%, hsl(var(--primary-deep)) 100%)",
                      boxShadow:
                        "0 10px 22px -8px hsl(var(--primary-deep) / 0.65), inset 0 1px 0 0 hsl(0 0% 100% / 0.45), inset 0 -2px 0 0 hsl(var(--primary-deep) / 0.45)",
                      textShadow: "0 1px 2px hsl(var(--primary-deep) / 0.55)",
                    }}
                  >
                    {p.cta}
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </article>
            </motion.a>
          ))}
        </div>

        <p className="text-center text-sm text-white/85 mt-10 drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]">
          One ecosystem.{" "}
          <a
            href="https://shazam.ae/"
            target="_blank"
            rel="noopener"
            className="text-primary-glow font-semibold hover:text-white hover:underline transition-colors"
          >
            Learn more about Shazam →
          </a>
        </p>
      </div>
    </section>
  );
};

export default EcosystemSection;
