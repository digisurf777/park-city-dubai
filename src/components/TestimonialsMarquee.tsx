import { Quote, Star } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  initials: string;
  area: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Booking a monthly spot in Marina took me literally 3 minutes. The owner met me at the gate, handed over the access card, and I've been parking stress-free ever since.",
    name: "Aaliyah Al Marzooqi",
    role: "Marketing Manager",
    initials: "AA",
    area: "Dubai Marina",
  },
  {
    quote:
      "I work in DIFC and used to pay 2,500 AED at a building. Found a private spot on ShazamParking for almost half - same building, same convenience. No-brainer.",
    name: "Ahmed Mohammed",
    role: "Investment Analyst",
    initials: "AM",
    area: "DIFC",
  },
  {
    quote:
      "Listed my spare parking in Downtown and it was rented within a week. Money lands in my account every month - completely passive income.",
    name: "Murtaza Hussain",
    role: "Property Owner",
    initials: "MH",
    area: "Downtown Dubai",
  },
  {
    quote:
      "Customer support replied within minutes when I had a question about my access card. Honestly the smoothest service I've used in Dubai.",
    name: "Sarah Thompson",
    role: "Expat Resident",
    initials: "ST",
    area: "Business Bay",
  },
  {
    quote:
      "Verified spaces, secure payment, real photos - finally a parking platform that feels professional. Highly recommended.",
    name: "Khalid Al Suwaidi",
    role: "Business Owner",
    initials: "KS",
    area: "Palm Jumeirah",
  },
  {
    quote:
      "I rent two parkings through Shazam now. Tenants are vetted, payments are reliable, and I never have to chase anyone for cash.",
    name: "Priya Sharma",
    role: "Real Estate Investor",
    initials: "PS",
    area: "JLT",
  },
  {
    quote:
      "Visited Dubai for 3 months on a project - having a guaranteed monthly spot near my office made my life so much easier.",
    name: "James Walker",
    role: "Project Consultant",
    initials: "JW",
    area: "Sheikh Zayed Road",
  },
  {
    quote:
      "Clean app, clear pricing, no hidden fees. Exactly what Dubai needed.",
    name: "Fatima Rahimi",
    role: "Doctor",
    initials: "FR",
    area: "Deira",
  },
];

const Card = ({ t }: { t: Testimonial }) => (
  <article
    className="shrink-0 w-[88vw] sm:w-[420px] mx-3 sm:mx-4 rounded-2xl p-6 sm:p-7 bg-white relative
               ring-1 ring-primary/20 shadow-[0_18px_40px_-20px_hsl(var(--primary)/0.45)]
               border border-primary/10 hover:ring-primary/40 hover:-translate-y-1 transition-all duration-300
               before:absolute before:inset-0 before:rounded-2xl before:p-[1px]
               before:bg-gradient-to-br before:from-primary/40 before:via-transparent before:to-primary-glow/40
               before:[mask:linear-gradient(#000,#000)_content-box,linear-gradient(#000,#000)] before:[mask-composite:exclude] before:pointer-events-none"
  >
    <div className="flex items-center justify-between mb-4">
      <Quote className="h-7 w-7 text-primary/70" />
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
    </div>
    <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-5 line-clamp-6">
      "{t.quote}"
    </p>
    <div className="flex items-center gap-3 pt-4 border-t border-primary/10">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-sm shadow-md">
        {t.initials}
      </div>
      <div className="min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm truncate">{t.name}</h4>
        <p className="text-xs text-muted-foreground truncate">
          {t.role} · <span className="text-primary font-medium">{t.area}</span>
        </p>
      </div>
    </div>
  </article>
);

const TestimonialsMarquee = () => {
  // Two rows for richer feel - duplicate items for seamless loop
  const rowA = [...TESTIMONIALS, ...TESTIMONIALS];
  const rowB = [...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()];

  return (
    <section className="py-14 sm:py-20 bg-gradient-to-b from-white via-surface to-white relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-primary-glow/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10 sm:mb-14">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
          <Star className="h-3.5 w-3.5 fill-primary" /> 4.9/5 from 1,200+ drivers
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
          What customers say about ShazamParking
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Real stories from drivers and owners across Dubai.
        </p>
      </div>

      {/* Row 1 - left to right scrolling content (visual movement is right→left) */}
      <div
        className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      >
        <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
          {rowA.map((t, i) => (
            <Card key={`a-${i}`} t={t} />
          ))}
        </div>
      </div>

      {/* Row 2 - opposite direction for depth */}
      <div className="group relative overflow-hidden mt-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee-reverse group-hover:[animation-play-state:paused]">
          {rowB.map((t, i) => (
            <Card key={`b-${i}`} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
