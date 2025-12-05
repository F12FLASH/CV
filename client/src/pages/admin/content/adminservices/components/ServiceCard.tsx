import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash2 } from "lucide-react";
import type { Service } from "../types";

interface ServiceCardProps {
  service: Service;
  onEdit: (service: Service) => void;
  onDelete: (id: number) => void;
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  return (
    <Card
      className="flex flex-col"
      data-testid={`card-service-${service.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{service.title}</CardTitle>
            {!service.active && (
              <Badge variant="outline" className="mt-2">
                Inactive
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-bold">{service.price}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {service.description}
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {service.features && service.features.length > 0 && (
          <ul className="space-y-2">
            {service.features.map((feature: string) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2 pt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(service)}
            className="flex-1"
            data-testid={`button-edit-service-${service.id}`}
          >
            <Edit className="w-4 h-4 mr-1" /> Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(service.id)}
            data-testid={`button-delete-service-${service.id}`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
