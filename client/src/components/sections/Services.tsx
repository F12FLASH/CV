import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    id: 1,
    title: "Web Development",
    description: "Custom websites and web applications tailored to your needs",
    price: "2,999",
    features: ["Responsive Design", "SEO Optimized", "Fast Performance", "Modern Stack"],
    icon: "🚀",
  },
  {
    id: 2,
    title: "E-Commerce Solutions",
    description: "Full-featured online stores with payment integration",
    price: "4,999",
    features: ["Product Management", "Payment Gateway", "Inventory System", "Analytics"],
    icon: "🛍️",
  },
  {
    id: 3,
    title: "UI/UX Design",
    description: "Beautiful and intuitive user interfaces for your projects",
    price: "1,499",
    features: ["Wireframing", "Prototyping", "Design System", "User Testing"],
    icon: "🎨",
  },
  {
    id: 4,
    title: "Consultation",
    description: "Expert guidance for your digital transformation journey",
    price: "299",
    features: ["Strategy Planning", "Tech Stack Advice", "Best Practices", "1hr Session"],
    icon: "💡",
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            Services &amp; <span className="text-primary">Solutions</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mb-2">
            Comprehensive services to bring your digital vision to life
          </p>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-3">{service.icon}</div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">${service.price}</span>
                  {service.id !== 4 && <span className="text-xs text-muted-foreground">/project</span>}
                </div>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-auto">Learn More</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
