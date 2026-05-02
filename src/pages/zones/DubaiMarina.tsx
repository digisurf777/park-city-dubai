import { Waves, Train, MapPin, Shield } from "lucide-react";
import ZonePageLayout from "@/components/zones/ZonePageLayout";
import dubaiMarinaHero from "@/assets/zones/dubai-marina-real.webp";

const DubaiMarina = () => (
  <ZonePageLayout
    zoneName="Dubai Marina"
    zoneSlug="Dubai Marina"
    heroImage={dubaiMarinaHero}
    fromPrice={600}
    description="This vibrant waterfront district blends lifestyle with business. With offices in Marina Plaza and Al Habtoor Tower, plus frequent movement between JBR, JLT and Media City, many rely on being close to where they live or work."
    highlights={[
      {
        icon: Waves,
        title: "Waterfront lifestyle",
        text: "Park inside Marina Walk towers and JBR residences.",
      },
      {
        icon: Train,
        title: "Tram & metro access",
        text: "Walk to Marina, JLT and DAMAC metro / tram stations.",
      },
      {
        icon: MapPin,
        title: "JBR walking distance",
        text: "Steps from The Beach, The Walk and Bluewaters bridge.",
      },
      {
        icon: Shield,
        title: "Building-secure",
        text: "Access-card controlled towers with 24/7 concierge.",
      },
    ]}
  />
);

export default DubaiMarina;
