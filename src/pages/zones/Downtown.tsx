import { Landmark, Shield, MapPin, Sparkles } from "lucide-react";
import ZonePageLayout from "@/components/zones/ZonePageLayout";
import downtownHero from "/lovable-uploads/f676da2a-39c9-4211-8561-5b884e0ceed8.webp";

const Downtown = () => (
  <ZonePageLayout
    zoneName="Downtown"
    zoneSlug="Downtown"
    heroImage={downtownHero}
    fromPrice={750}
    description="The heart of Dubai — home to the Burj Khalifa, Dubai Mall and the Opera district. Downtown sees constant movement from residents, professionals and visitors, making secure monthly parking a daily essential."
    highlights={[
      {
        icon: Landmark,
        title: "Heart of Dubai",
        text: "Inside walking distance of Burj Khalifa and Dubai Mall.",
      },
      {
        icon: MapPin,
        title: "Walk to everything",
        text: "Steps from Souk Al Bahar, the Fountain and DIFC link.",
      },
      {
        icon: Shield,
        title: "Premium covered spaces",
        text: "Underground bays in luxury residential towers.",
      },
      {
        icon: Sparkles,
        title: "Tourist-area convenience",
        text: "Skip parking-lot queues at the Mall and surrounding hotels.",
      },
    ]}
    showLiveMapsCTA
  />
);

export default Downtown;
