import { Check, Code, Smartphone, Palette, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const iconMap: Record<string, any> = {
  code: Code,
  smartphone: Smartphone,
  palette: Palette,
  lightbulb: Lightbulb,
};

const defaultServices = [
  {
    id: 1,
    title: "Web Development",
    description: "Custom websites and web applications tailored to your needs",
    price: "From $2,000",
    features: ["React/Next.js", "Node.js/Express", "Database Design", "API Development"],
    icon: "code",
  },
  {
    id: 2,
    title: "Mobile App Development",
    description: "Cross-platform mobile applications",
    price: "From $5,000",
    features: ["React Native", "iOS & Android", "App Store Publishing", "Maintenance"],
    icon: "smartphone",
  },
  {
    id: 3,
    title: "UI/UX Design",
    description: "User-centered design solutions",
    price: "From $1,500",
    features: ["User Research", "Wireframing", "Prototyping", "Design Systems"],
    icon: "palette",
  },
];

export function Services() {
  const { data: servicesData = [] } = useQuery({
    queryKey: ['services', 'active'],
    queryFn: () => api.getServices(true),
    staleTime: 60000,
  });

  const services = servicesData.length > 0 ? servicesData : defaultServices;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service: any) => {
            const IconComponent = iconMap[service.icon] || Code;
            return (
              <Card key={service.id} className="flex flex-col hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">{service.description}</p>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {service.price && (
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold text-primary">{service.price}</span>
                    </div>
                  )}
                  <ul className="space-y-2">
                    {(service.features || []).map((feature: string) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-auto">Learn More</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
