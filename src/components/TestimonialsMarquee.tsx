import { Quote, Star } from "lucide-react";
import { motion } from "framer-motion";

type Testimonial = {
  quote: string;
  name: string;
  initials: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Really useful service. Easy to use!",
    name: "Natasha Alves",
    initials: "NA",
  },
  {
    quote:
      "Great initiative! Very easy to use and helps solve the parking crisis in Dubai.",
    name: "Fatima Shafqat Hussain",
    initials: "FH",
  },
  {
    quote:
      "Easiest passive income I've ever received. My carpark was just sitting there. May as well generate some money. This platform made it effortless.",
    name: "Adam Leonard",
    initials: "AL",
  },
];

const TestimonialsMarquee = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white via-surface to-white relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-primary-glow/10 blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-[0.18em] mb-4 ring-1 ring-primary/20">
            <Star className="h-3.5 w-3.5 fill-primary" /> Loved by drivers
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.1]">
            What customers say about{" "}
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary-deep bg-clip-text text-transparent">
              ShazamParking
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl p-[1.5px] h-full"
              style={{
                background:
                  "linear-gradient(135deg, hsl(var(--primary)/0.5) 0%, hsl(var(--primary-glow)/0.25) 50%, hsl(var(--primary-deep)/0.5) 100%)",
              }}
            >
              <div className="relative flex flex-col h-full rounded-[15px] bg-white p-7 sm:p-8 shadow-[0_18px_40px_-22px_hsl(var(--primary)/0.4)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-[0_28px_55px_-22px_hsl(var(--primary)/0.55)]">
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-glow)) 100%)",
                      boxShadow: "0 8px 20px -6px hsl(var(--primary)/0.6)",
                    }}
                  >
                    <Quote className="h-5 w-5" />
                  </span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed italic mb-6 flex-1">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3 pt-5 border-t border-primary/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.initials}
                  </div>
                  <h4 className="font-bold text-gray-900">{t.name}</h4>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
