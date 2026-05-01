import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface PageHeroProps {
  /** Background image URL */
  image: string;
  /** Small chip/eyebrow above the title (optional) */
  eyebrow?: string;
  /** Main title — second word can be highlighted via `highlight` */
  title: string;
  /** Optional sub-string of the title to render with the brand gradient */
  highlight?: string;
  /** Subtitle below the title */
  subtitle?: string;
  /** Height variant */
  size?: "md" | "lg";
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
} as const;

const PageHero = ({
  image,
  eyebrow,
  title,
  highlight,
  subtitle,
  size = "md",
}: PageHeroProps) => {
  // Split title around the highlighted span (case-insensitive)
  const renderTitle = () => {
    if (!highlight) return title;
    const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return title;
    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + highlight.length);
    const after = title.slice(idx + highlight.length);
    return (
      <>
        {before}
        <span className="bg-gradient-to-r from-primary-glow via-[hsl(160_85%_75%)] to-white bg-clip-text text-transparent">
          {match}
        </span>
        {after}
      </>
    );
  };

  const heightClass =
    size === "lg"
      ? "h-[420px] sm:h-[480px] lg:h-[520px]"
      : "h-[340px] sm:h-[400px] lg:h-[440px]";

  return (
    <section className={`relative ${heightClass} overflow-hidden`}>
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Branded gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-deep/85 via-primary/55 to-black/55" />
      {/* Bottom darken for text legibility */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 via-black/15 to-transparent" />
      {/* Decorative glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[22rem] h-[22rem] rounded-full bg-primary-glow/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[24rem] h-[24rem] rounded-full bg-primary/30 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 pt-16">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          className="text-center text-white max-w-3xl"
        >
          {eyebrow && (
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-white text-xs sm:text-sm font-medium mb-4 sm:mb-5"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
              {eyebrow}
            </motion.span>
          )}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-3 sm:mb-5 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          >
            {renderTitle()}
          </motion.h1>
          {subtitle && (
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
            >
              {subtitle}
            </motion.p>
          )}
          {/* Decorative underline accent */}
          <motion.div
            variants={fadeUp}
            className="mt-6 sm:mt-8 mx-auto h-1 w-20 sm:w-28 rounded-full bg-gradient-to-r from-transparent via-primary-glow to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
