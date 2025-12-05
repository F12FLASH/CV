import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { Service } from "../types";

interface ServiceComparisonTableProps {
  services: Service[];
}

export function ServiceComparisonTable({ services }: ServiceComparisonTableProps) {
  const sortedServices = [...services].sort((a, b) => a.order - b.order);
  const maxFeatures = Math.max(0, Math.max(...services.map((s) => (s.features || []).length)));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2">Feature</th>
                {sortedServices.map((service) => (
                  <th key={service.id} className="text-center py-3 px-2">
                    {service.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-3 px-2 font-medium">Price</td>
                {sortedServices.map((service) => (
                  <td key={service.id} className="text-center py-3 px-2">
                    <span className="font-semibold">{service.price}</span>
                  </td>
                ))}
              </tr>
              {Array.from({ length: maxFeatures }).map((_, featureIdx) => (
                <tr key={featureIdx} className="border-b">
                  <td className="py-3 px-2 font-medium text-sm">
                    {services[0]?.features?.[featureIdx] || "Feature"}
                  </td>
                  {sortedServices.map((service) => (
                    <td key={service.id} className="text-center py-3 px-2">
                      {service.features && service.features[featureIdx] ? (
                        <Check className="w-4 h-4 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
