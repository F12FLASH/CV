import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import type { FAQ } from "../types";

interface FAQCardProps {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (faq: FAQ) => void;
}

export function FAQCard({ faq, onEdit, onDelete, onToggleVisibility }: FAQCardProps) {
  return (
    <Card data-testid={`card-faq-${faq.id}`}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium">{faq.question}</span>
              <Badge variant={faq.visible ? "default" : "secondary"}>
                {faq.visible ? "Visible" : "Hidden"}
              </Badge>
              <Badge variant="outline">Order: {faq.order}</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleVisibility(faq)}
              title={faq.visible ? "Hide" : "Show"}
              data-testid={`button-toggle-${faq.id}`}
            >
              {faq.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(faq)}
              data-testid={`button-edit-${faq.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(faq.id)}
              className="text-destructive hover:text-destructive"
              data-testid={`button-delete-${faq.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
