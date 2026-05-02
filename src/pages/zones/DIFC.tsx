import { Briefcase, Shield, Train, Sparkles } from "lucide-react";
import ZonePageLayout from "@/components/zones/ZonePageLayout";
import difcHero from "@/assets/zones/difc-real.webp";

const DIFC = () => (
  <ZonePageLayout
    zoneName="DIFC"
    zoneSlug="DIFC"
    heroImage={difcHero}
    fromPrice={900}
    description="The Dubai International Financial Centre is the city's premier business district — home to global banks, law firms and Michelin-starred restaurants. Reliable parking is essential for the professionals who drive its daily rhythm."
    highlights={[
      {
        icon: Briefcase,
        title: "Financial district core",
        text: "Steps from Gate Village, ICD Brookfield and Index Tower.",
      },
      {
        icon: Shield,
        title: "Covered & guarded",
        text: "Premium underground bays with 24/7 security teams.",
      },
      {
        icon: Train,
        title: "Walk to the metro",
        text: "Direct access to Emirates Towers and Financial Centre stations.",
      },
      {
        icon: Sparkles,
        title: "Premium spaces",
        text: "Luxury-grade buildings, valet-friendly access where available.",
      },
    ]}
  />
);

export default DIFC;
