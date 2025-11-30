import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { Plus } from "lucide-react";

export default function AdminServicesEnhanced() {
  const services = [
    {
      id: 1,
      name: "Web Development",
      price: 2999,
      features: ["Custom Design", "Responsive", "SEO", "Performance"],
    },
    {
      id: 2,
      name: "E-commerce",
      price: 4999,
      features: ["Web Dev", "Payment Gateway", "Inventory", "Analytics"],
    },
    {
      id: 3,
      name: "Consultation",
      price: 299,
      features: ["1-hour session", "Expert advice", "Action plan"],
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Services</h1>
            <p className="text-muted-foreground">Manage services and pricing</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>

        {/* Service Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Service Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Service</th>
                    <th className="text-center py-3 px-2">Consultation</th>
                    <th className="text-center py-3 px-2">Web Dev</th>
                    <th className="text-center py-3 px-2">E-commerce</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">Price</td>
                    <td className="text-center">$299</td>
                    <td className="text-center">$2,999</td>
                    <td className="text-center">$4,999</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">Custom Design</td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">Responsive</td>
                    <td className="text-center">-</td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-2 font-medium">Payment Gateway</td>
                    <td className="text-center">-</td>
                    <td className="text-center">-</td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-medium">Analytics</td>
                    <td className="text-center">-</td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                    <td className="text-center">
                      <Check className="w-4 h-4 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{service.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-bold">${service.price}</span>
                  <span className="text-sm text-muted-foreground">/project</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full">Edit Service</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
