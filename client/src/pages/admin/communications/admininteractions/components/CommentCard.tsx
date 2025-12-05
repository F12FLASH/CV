import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Mail, MailOpen } from "lucide-react";
import type { Comment } from "../types";
import { getStatusColor } from "../types";

interface CommentCardProps {
  comment: Comment;
  posts: any[];
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onMarkAsRead: (id: number) => void;
}

export function CommentCard({
  comment,
  posts,
  onApprove,
  onReject,
  onMarkAsRead,
}: CommentCardProps) {
  const post = posts.find((p) => p.id === comment.postId);

  return (
    <Card
      className={`${!comment.read ? "bg-muted/20" : ""} border-l-4 ${getStatusColor(comment.status)}`}
      data-testid={`card-comment-${comment.id}`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium">{comment.authorName}</span>
              <span className="text-sm text-muted-foreground">{comment.authorEmail}</span>
              <Badge
                variant={comment.status === "Approved" ? "default" : "secondary"}
                className={comment.status === "Approved" ? "bg-green-500" : ""}
              >
                {comment.status}
              </Badge>
              {!comment.read && (
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  New
                </Badge>
              )}
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            <div className="text-xs text-muted-foreground">
              <span>On: {post?.title || `Post #${comment.postId}`}</span>
              <span className="mx-2">•</span>
              <span>{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "N/A"}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onMarkAsRead(comment.id)}
              title={comment.read ? "Mark as unread" : "Mark as read"}
              data-testid={`button-mark-read-${comment.id}`}
            >
              {comment.read ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </Button>
            {comment.status === "Pending" && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => onApprove(comment.id)}
                className="text-green-500 hover:text-green-600"
                title="Approve"
                data-testid={`button-approve-${comment.id}`}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => onReject(comment.id)}
              className="text-destructive hover:text-destructive"
              title="Delete"
              data-testid={`button-delete-${comment.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
