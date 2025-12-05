import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Mail, Trash2, Archive, Reply, Send, Star, AlertCircle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Message, SmtpStatus } from "./types";

interface MessageListProps {
  messages: Message[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function MessageList({ messages, selectedId, onSelect }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Mail className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-1">No messages</h3>
        <p className="text-sm text-muted-foreground">Your inbox is empty</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-4 cursor-pointer hover-elevate border-b ${
            selectedId === message.id ? "bg-accent" : ""
          } ${!message.read ? "font-medium" : ""}`}
          onClick={() => onSelect(message.id)}
          data-testid={`message-item-${message.id}`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${!message.read ? "bg-primary" : "bg-transparent"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="truncate">{message.sender}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm font-medium truncate">{message.subject}</p>
              <p className="text-xs text-muted-foreground truncate">{message.message}</p>
              {message.tag && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {message.tag}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </ScrollArea>
  );
}

interface MessageDetailProps {
  message: Message | null;
  replyContent: string;
  onReplyChange: (content: string) => void;
  onSendReply: () => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
  isReplying: boolean;
  smtpStatus?: SmtpStatus;
}

export function MessageDetail({
  message,
  replyContent,
  onReplyChange,
  onSendReply,
  onDelete,
  onArchive,
  isReplying,
  smtpStatus,
}: MessageDetailProps) {
  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Mail className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-1">Select a message</h3>
        <p className="text-sm text-muted-foreground">Choose a message from the list to view</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between gap-2">
        <h2 className="font-semibold truncate">{message.subject}</h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onArchive(message.id)}
            data-testid="button-archive-message"
          >
            <Archive className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(message.id)}
            data-testid="button-delete-message"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {message.sender.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{message.sender}</span>
                <span className="text-sm text-muted-foreground">&lt;{message.email}&gt;</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {message.createdAt && formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          <Separator />

          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {message.message}
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t space-y-3">
        {smtpStatus && !smtpStatus.configured && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>SMTP not configured - replies will not be sent</span>
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => onReplyChange(e.target.value)}
            className="min-h-[80px]"
            data-testid="textarea-reply"
          />
        </div>
        <Button 
          onClick={onSendReply} 
          disabled={isReplying || !replyContent.trim()}
          data-testid="button-send-reply"
        >
          <Send className="w-4 h-4 mr-2" />
          {isReplying ? "Sending..." : "Send Reply"}
        </Button>
      </div>
    </div>
  );
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  unreadCount: number;
  onRefresh: () => void;
}

export function InboxHeader({ value, onChange, unreadCount, onRefresh }: SearchBarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-3xl font-heading font-bold">Inbox</h1>
        <p className="text-muted-foreground">
          {unreadCount > 0 ? `${unreadCount} unread messages` : "All messages read"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search messages..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-64"
          data-testid="input-search-messages"
        />
        <Button variant="outline" onClick={onRefresh} data-testid="button-refresh-inbox">
          Refresh
        </Button>
      </div>
    </div>
  );
}
