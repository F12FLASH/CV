import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Mail, MailOpen, Star } from "lucide-react";
import type { Review } from "../types";

interface ReviewCardProps {
  review: Review;
  projects: any[];
  onDelete: (id: number) => void;
  onMarkAsRead: (id: number) => void;
}

export function ReviewCard({ review, projects, onDelete, onMarkAsRead }: ReviewCardProps) {
  const project = projects.find((p) => p.id === review.projectId);

  return (
    <Card
      className={`${!review.read ? "bg-muted/20" : ""}`}
      data-testid={`card-review-${review.id}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium">{review.authorName}</span>
              <span className="text-sm text-muted-foreground">{review.authorEmail}</span>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              {!review.read && (
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  New
                </Badge>
              )}
            </div>
            <p className="text-sm mb-2">{review.content}</p>
            <div className="text-xs text-muted-foreground">
              <span>For: {project?.title || `Project #${review.projectId}`}</span>
              <span className="mx-2">•</span>
              <span>{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onMarkAsRead(review.id)}
              title={review.read ? "Mark as unread" : "Mark as read"}
              data-testid={`button-mark-read-${review.id}`}
            >
              {review.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(review.id)}
              className="text-destructive hover:text-destructive"
              title="Delete"
              data-testid={`button-delete-${review.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
