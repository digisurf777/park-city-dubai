import { ExternalLink, Map } from "lucide-react";

interface DubaiLiveMapsCTAProps {
  variant?: "full" | "compact";
  zoneName?: string;
}

const DubaiLiveMapsCTA = ({ variant = "full", zoneName }: DubaiLiveMapsCTAProps) => {
  if (variant === "compact") {
    return (
      <a
        href="https://dubailifemaps.ae/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 ring-1 ring-primary/20 text-primary text-sm font-semibold hover:bg-primary/15 hover:ring-primary/40 transition-all"
      >
        <Map className="h-4 w-4" />
        Explore on Dubai Live Maps
        <ExternalLink className="h-3.5 w-3.5 opacity-70" />
      </a>
    );
  }

  return (
    <div
      className="relative my-8 sm:my-12 rounded-2xl p-[2px] overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 50%, hsl(var(--primary-deep)) 100%)",
        boxShadow:
          "0 20px 40px -15px hsl(var(--primary-deep) / 0.4), inset 0 1px 0 0 hsl(0 0% 100% / 0.4)",
      }}
    >
      <div className="relative rounded-[14px] bg-gradient-to-br from-[hsl(174_30%_10%)] via-[hsl(174_40%_15%)] to-[hsl(174_30%_10%)] p-6 sm:p-8 overflow-hidden">
        {/* Decorative glows */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary-glow/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8">
          <div className="flex-shrink-0 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-primary/20 ring-1 ring-primary/40 flex items-center justify-center">
            <Map className="h-7 w-7 sm:h-8 sm:w-8 text-primary-glow" />
          </div>

          <div className="flex-1 text-white">
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-glow mb-1.5">
              Powered by the Shazam Ecosystem
            </p>
            <h3 className="text-xl sm:text-2xl font-bold mb-1.5">
              See {zoneName ? zoneName : "this area"} live on Dubai Live Maps
            </h3>
            <p className="text-sm sm:text-base text-white/75">
              Open the interactive city map to explore traffic, mobility and area context
              before you book.
            </p>
          </div>

          <a
            href="https://dubailifemaps.ae/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm sm:text-base hover:bg-primary-glow hover:text-primary-deep transition-all shadow-lg whitespace-nowrap"
          >
            Open Live Maps
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default DubaiLiveMapsCTA;
