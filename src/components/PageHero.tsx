import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeroProps {
  /** Background image URL */
  image: string;
  /** Small chip/eyebrow above the title (optional) */
  eyebrow?: string;
  /** Main title — substring matching `highlight` will be rendered with the brand gradient */
  title: string;
  /** Optional sub-string of the title to render with the brand gradient */
  highlight?: string;
  /** Subtitle below the title */
  subtitle?: string;
  /** Height variant */
  size?: "md" | "lg";
  /** Optional CTAs / search bars rendered below the subtitle */
  children?: ReactNode;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
} as const;

const PageHero = ({
  image,
  eyebrow,
  title,
  highlight,
  subtitle,
  size = "md",
  children,
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
        <span className="text-[hsl(160_90%_82%)] drop-shadow-[0_2px_8px_hsl(var(--primary)/0.45)]">
          {match}
        </span>
        {after}
      </>
    );
  };

  const heightClass =
    size === "lg"
      ? "h-[440px] sm:h-[520px] lg:h-[580px]"
      : "h-[380px] sm:h-[460px] lg:h-[520px]";

  return (
    <section className={`relative ${heightClass} -mt-16 overflow-hidden`}>
      {/* Background image with subtle Ken-Burns zoom */}
      <motion.div
        initial={{ scale: 1.12, opacity: 0 }}
        animate={{ scale: 1.04, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />
      {/* Subtle dark overlay for text legibility — keeps the photo clearly visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-background/80" />
      {/* Very light brand tint — barely there, lets the photo breathe */}
      <div className="absolute inset-0 bg-primary-deep/5 mix-blend-multiply" />
      {/* Soft radial vignette for focus */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.3)_100%)]" />
      {/* Decorative brand glows (very subtle) */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-[22rem] h-[22rem] rounded-full bg-primary-glow/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-[24rem] h-[24rem] rounded-full bg-primary/5 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 pt-16 sm:pt-20">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.14, delayChildren: 0.15 } },
          }}
          className="text-center text-white max-w-4xl w-full"
        >
          {eyebrow && (
            <motion.span
              variants={fadeUp}
              className="inline-block mb-4 sm:mb-5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur border border-white/25 text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase"
            >
              ★ {eyebrow}
            </motion.span>
          )}
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.05] tracking-tight mb-3 sm:mb-5 text-3d-light"
          >
            {renderTitle()}
          </motion.h1>
          {subtitle && (
            <motion.p
              variants={fadeUp}
              className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
            >
              {subtitle}
            </motion.p>
          )}
          {children && (
            <motion.div variants={fadeUp} className="mt-6 sm:mt-8 w-full">
              {children}
            </motion.div>
          )}
          {!children && (
            <motion.div
              variants={fadeUp}
              className="mt-6 sm:mt-8 mx-auto h-1 w-20 sm:w-28 rounded-full bg-gradient-to-r from-transparent via-primary-glow to-transparent"
            />
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PageHero;
