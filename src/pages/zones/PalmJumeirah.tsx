import { Palmtree, Waves, Shield, Wallet } from "lucide-react";
import ZonePageLayout from "@/components/zones/ZonePageLayout";

const PalmJumeirah = () => (
  <ZonePageLayout
    zoneName="Palm Jumeirah"
    zoneSlug="Palm Jumeirah"
    heroImage="/lovable-uploads/atlantis-hotel-hero.webp"
    fromPrice={850}
    description="Golden Mile, Shoreline and Nakheel Mall house a mix of boutique offices, clinics and wellness spaces. The Palm sees regular activity from residents, business owners and staff who operate across the island's connected communities."
    highlights={[
      {
        icon: Palmtree,
        title: "Iconic island living",
        text: "Park inside Palm landmarks and boutique residences.",
      },
      {
        icon: Waves,
        title: "Beach & resort proximity",
        text: "Walk to Atlantis, Nakheel Mall and the Shoreline beach.",
      },
      {
        icon: Shield,
        title: "Resident-only buildings",
        text: "Access-card secured towers with on-site management.",
      },
      {
        icon: Wallet,
        title: "From AED 850/month",
        text: "Premium island parking without daily hotel rates.",
      },
    ]}
  />
);

export default PalmJumeirah;
