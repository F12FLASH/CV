import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, Edit, Trash } from "lucide-react";
import type { Post } from "../types";
import { bgImages } from "../types";

interface PostCardProps {
  post: Post;
  onEdit: (postId: number) => void;
  onDelete: (postId: number) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const imageUrl = post.featuredImage || bgImages[post.id % bgImages.length];

  return (
    <Card data-testid={`card-post-${post.id}`} className="overflow-hidden">
      <div
        className="h-32 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="w-full h-full bg-black/40" />
      </div>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold" data-testid={`text-post-title-${post.id}`}>
                {post.title}
              </h3>
              <Badge variant="secondary">{post.category}</Badge>
              <Badge
                variant={post.status === "Published" ? "default" : "outline"}
                className={post.status === "Published" ? "bg-green-500" : ""}
              >
                {post.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {post.excerpt || post.content?.substring(0, 100) || "No excerpt available"}
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {formatDate(post.publishedAt || post.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" /> {post.views || 0} views
              </span>
              {post.tags && post.tags.length > 0 && (
                <span className="text-primary">
                  {post.tags.slice(0, 3).join(", ")}
                  {post.tags.length > 3 && "..."}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(post.id)}
              data-testid={`button-edit-post-${post.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(post.id)}
              data-testid={`button-delete-post-${post.id}`}
            >
              <Trash className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
