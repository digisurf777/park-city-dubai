import { Quote } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "ShazamParking is a game-changer for anyone looking for a stress-free parking experience, it's easy to use, reliable and convenient.",
    name: "Aaliyah Armasi",
  },
  {
    quote:
      "I highly recommend ShazamParking, it offers an easy-to-use platform, a wide range of parking options, and excellent customer service, making it the perfect parking solution.",
    name: "Ahmed Mohammed",
  },
  {
    quote:
      "ShazamParking is my go-to platform for parking, it's user-friendly, reliable, and offers a wide range of options, making it convenient and easy to find a parking spot.",
    name: "Murtaza Hussain",
  },
];

const TestimonialsMarquee = () => {
  return (
    <section className="py-14 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 text-center mb-10 sm:mb-14">
          What customers say about ShazamParking
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, i) => (
            <article
              key={i}
              className="rounded-2xl bg-white p-6 sm:p-8 border border-gray-200 shadow-sm"
            >
              <Quote className="h-7 w-7 text-primary mb-5" />
              <p className="text-gray-600 leading-relaxed italic mb-6">
                "{t.quote}"
              </p>
              <h4 className="font-bold text-gray-900">{t.name}</h4>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsMarquee;
