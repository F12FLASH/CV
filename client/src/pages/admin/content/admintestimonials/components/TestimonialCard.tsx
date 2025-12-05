import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Edit, Trash } from "lucide-react";
import type { Testimonial } from "../types";

interface TestimonialCardProps {
  testimonial: Testimonial;
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

export function TestimonialCard({
  testimonial,
  onEdit,
  onDelete,
  isDeleting,
}: TestimonialCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={testimonial.avatar || undefined} />
            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{testimonial.name}</h3>
            <p className="text-sm text-muted-foreground">
              {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
            </p>
            <div className="flex gap-1 mt-2">
              {[...Array(testimonial.rating || 5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-yellow-500 text-yellow-500"
                  data-testid={`star-${i}`}
                />
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
        <div className="flex items-center justify-between mt-4 gap-2">
          <Badge variant={testimonial.active ? "default" : "secondary"}>
            {testimonial.active ? "Active" : "Inactive"}
          </Badge>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(testimonial)}
              data-testid={`button-edit-testimonial-${testimonial.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive"
              onClick={() => onDelete(testimonial.id)}
              disabled={isDeleting}
              data-testid={`button-delete-testimonial-${testimonial.id}`}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
