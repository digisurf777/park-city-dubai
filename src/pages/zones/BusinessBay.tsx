import { Building2, Shield, Eye, Car } from "lucide-react";
import ZonePageLayout from "@/components/zones/ZonePageLayout";
import businessBayHero from "@/assets/zones/business-bay-real.webp";

const BusinessBay = () => (
  <ZonePageLayout
    zoneName="Business Bay"
    zoneSlug="Business Bay"
    heroImage={businessBayHero}
    fromPrice={650}
    description="Business Bay is Dubai's central commercial hub — a dense cluster of offices, hotels and waterfront residences right next to Downtown. Reliable monthly parking is essential to navigate its constant flow."
    highlights={[
      {
        icon: Building2,
        title: "Central business hub",
        text: "Park inside towers along Marasi Drive and Al Abraj Street.",
      },
      {
        icon: Eye,
        title: "Burj Khalifa views",
        text: "Premium buildings with skyline-facing covered bays.",
      },
      {
        icon: Shield,
        title: "24/7 secure access",
        text: "Manned entries, CCTV and access-card controlled gates.",
      },
      {
        icon: Car,
        title: "Easy SZR access",
        text: "Direct on/off ramps to Sheikh Zayed Road in seconds.",
      },
    ]}
  />
);

export default BusinessBay;
