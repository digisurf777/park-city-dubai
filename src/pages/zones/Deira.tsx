import { Building2, Shield, Train, Wallet } from "lucide-react";
import ZonePageLayout from "@/components/zones/ZonePageLayout";
import deiraHero from "@/assets/zones/deira-real.webp";

const Deira = () => (
  <ZonePageLayout
    zoneName="Deira"
    zoneSlug="Deira"
    heroImage={deiraHero}
    fromPrice={500}
    description="One of Dubai's oldest commercial quarters, Deira remains a critical base for logistics firms, retail traders, and financial service providers. The workforce here spans both established businesses and day-to-day operators who keep the city moving."
    highlights={[
      {
        icon: Building2,
        title: "Heritage commercial hub",
        text: "Stay close to the souks, gold market and Deira corniche.",
      },
      {
        icon: Train,
        title: "Metro & bus access",
        text: "Walk to Union, Baniyas Square and Al Rigga stations.",
      },
      {
        icon: Shield,
        title: "24/7 secure access",
        text: "Verified buildings with controlled entry and CCTV.",
      },
      {
        icon: Wallet,
        title: "From AED 500/month",
        text: "Best monthly value in the city — billed transparently.",
      },
    ]}
  />
);

export default Deira;
