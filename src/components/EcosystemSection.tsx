import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import shazamEcosystem from "@/assets/ecosystem/shazam-ecosystem.jpg";
import dubaiLifeOs from "@/assets/ecosystem/dubai-life-os.jpg";
import dubaiLifeMaps from "@/assets/ecosystem/dubai-life-maps.jpg";

const products = [
  {
    title: "Shazam Parking",
    tagline: "You are here",
    description:
      "Long-term parking marketplace for Dubai. Owners earn from unused spaces; drivers secure reliable monthly parking.",
    image: shazamEcosystem,
    href: "https://shazam.ae/",
    cta: "Visit Shazam",
    current: true,
  },
  {
    title: "Dubai Life OS",
    tagline: "Personal Operating System",
    description:
      "One platform to manage admin, documents, deadlines, finances, family, vehicles and travel in Dubai.",
    image: dubaiLifeOs,
    href: "https://dubailifeos.ae",
    cta: "Open Life OS",
    current: false,
  },
  {
    title: "Dubai Life Maps",
    tagline: "City Intelligence",
    description:
      "Interactive city map for Dubai with live layers — traffic, mobility, environment, parking and area context.",
    image: dubaiLifeMaps,
    href: "https://dubailifemaps.ae/",
    cta: "Explore Maps",
    current: false,
  },
];

const EcosystemSection = () => {
  return (
    <section
      id="shazam-ecosystem"
      aria-labelledby="ecosystem-heading"
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-background via-[hsl(174_30%_97%)] to-background"
    >
      {/* Decorative brand glows */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-[28rem] h-[28rem] rounded-full bg-primary-glow/10 blur-3xl" />

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
            — connecting life in Dubai
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Shazam Parking is one of three connected products. Together they help you
            understand the city, organise your life and solve everyday mobility.
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
              className="group relative rounded-2xl p-[2px] transition-all duration-500 hover:-translate-y-2"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
                boxShadow:
                  "0 20px 40px -15px hsl(var(--primary-deep) / 0.35), inset 0 1px 0 0 hsl(0 0% 100% / 0.4)",
              }}
            >
              <article className="relative h-full rounded-[14px] bg-white overflow-hidden flex flex-col">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <img
                    src={p.image}
                    alt={`${p.title} preview — ${p.tagline}`}
                    width={1024}
                    height={682}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* glossy top highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent" />
                  {p.current && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary text-white text-[10px] font-bold tracking-widest uppercase shadow-lg">
                      You are here
                    </span>
                  )}
                </div>

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <p className="text-[11px] font-bold tracking-[0.18em] uppercase text-primary mb-1.5">
                    {p.tagline}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1">{p.description}</p>
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
