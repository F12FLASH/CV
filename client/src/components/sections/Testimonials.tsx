import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const defaultTestimonials = [
  {
    id: 1,
    name: "John Smith",
    role: "CEO",
    company: "TechCorp",
    content: "Loi delivered exceptional work on our web application. His attention to detail and technical expertise exceeded our expectations.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    role: "Product Manager",
    company: "StartupXYZ",
    content: "Working with Loi was a fantastic experience. He understood our vision and translated it into a beautiful, functional product.",
    rating: 5,
  },
];

export function Testimonials() {
  const { data: testimonialsData = [] } = useQuery({
    queryKey: ['testimonials', 'active'],
    queryFn: () => api.getTestimonials(true),
    staleTime: 60000,
  });

  const testimonials = testimonialsData.length > 0 ? testimonialsData : defaultTestimonials;
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    if (!autoplay || testimonials.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoplay, testimonials.length]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
    setAutoplay(false);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setAutoplay(false);
  };

  if (testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            What Clients <span className="text-primary">Say</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mb-2">
            Real feedback from clients who've transformed their business with our solutions
          </p>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
              className="bg-card border border-border rounded-2xl p-8 md:p-12"
            >
              <div className="flex items-start gap-4 mb-6">
                <Quote className="w-8 h-8 text-primary flex-shrink-0" />
                <div className="flex gap-1">
                  {Array.from({ length: testimonials[current].rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
              </div>

              <p className="text-lg md:text-xl mb-8 italic text-foreground/90">
                "{testimonials[current].content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">
                    {testimonials[current].name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="font-bold">{testimonials[current].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonials[current].role}{testimonials[current].company ? `, ${testimonials[current].company}` : ''}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-8">
            <Button variant="outline" size="icon" onClick={prev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrent(idx);
                    setAutoplay(false);
                  }}
                  className={`h-2 rounded-full transition-all ${
                    idx === current ? "bg-primary w-8" : "bg-muted w-2"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={next}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
