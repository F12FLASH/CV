import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  Paperclip,
  Mail,
  Loader2,
  Eye,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: number;
  sender: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  starred: boolean;
  tag: string;
  createdAt: string | null;
  archived: boolean;
}

export default function AdminInbox() {
  const { toast } = useToast();
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: messages = [], isLoading, refetch } = useQuery<Message[]>({
    queryKey: ['/api/messages'],
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({ title: "Message deleted" });
      if (selectedMessageId === deleteMutation.variables) {
        const remainingMessages = messages.filter(m => m.id !== deleteMutation.variables);
        if (remainingMessages.length > 0) {
          setSelectedMessageId(remainingMessages[0].id);
        } else {
          setSelectedMessageId(null);
        }
      }
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to delete message", variant: "destructive" });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PUT", `/api/messages/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      toast({ title: "Message archived" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to archive message", variant: "destructive" });
    },
  });

  const filteredMessages = messages.filter(m => 
    !m.archived && (
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const effectiveSelectedId = selectedMessageId ?? filteredMessages[0]?.id ?? null;
  const selectedMessage = filteredMessages.find(m => m.id === effectiveSelectedId) || filteredMessages[0];

  const handleSelectMessage = (id: number) => {
    setSelectedMessageId(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) {
      markAsReadMutation.mutate(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this message permanently?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleArchive = (id: number) => {
    archiveMutation.mutate(id);
  };

  const unreadCount = messages.filter(m => !m.read && !m.archived).length;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Inbox
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">{unreadCount} unread</Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground">{filteredMessages.length} messages</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => refetch()}
          data-testid="button-refresh-inbox"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="h-[calc(100vh-12rem)] flex flex-col md:flex-row bg-card border border-border rounded-lg overflow-hidden">
        <div className="w-full md:w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-messages"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="font-medium">No messages</p>
                  <p className="text-sm">Your inbox is empty</p>
                </div>
              ) : (
                filteredMessages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg.id)}
                    className={`flex flex-col gap-2 p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                      !msg.read ? "bg-primary/5" : ""
                    } ${effectiveSelectedId === msg.id ? "bg-muted" : ""}`}
                    data-testid={`button-message-${msg.id}`}
                  >
                    <div className="flex justify-between items-start w-full gap-2">
                      <span className={`font-medium truncate ${!msg.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {msg.sender}
                      </span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {msg.createdAt ? formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true }) : ''}
                      </span>
                    </div>
                    <span className="text-sm font-medium truncate w-full">
                      {msg.subject}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {msg.message}
                    </span>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      {!msg.read && (
                        <Badge variant="default" className="text-[10px] h-5">New</Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {msg.tag || "General"}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {selectedMessage ? (
            <>
              <div className="h-16 border-b border-border flex items-center justify-between px-6 gap-2">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleArchive(selectedMessage.id)}
                    disabled={archiveMutation.isPending}
                    title="Archive"
                    data-testid="button-archive-message"
                  >
                    <Archive size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(selectedMessage.id)}
                    disabled={deleteMutation.isPending}
                    title="Delete"
                    data-testid="button-delete-message"
                  >
                    <Trash2 size={18} />
                  </Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  {!selectedMessage.read && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => markAsReadMutation.mutate(selectedMessage.id)}
                      disabled={markAsReadMutation.isPending}
                      title="Mark as read"
                      data-testid="button-mark-read"
                    >
                      <Eye size={18} />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" title="Star">
                    <Star size={18} />
                  </Button>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                    <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                    <div className="flex gap-2 flex-shrink-0">
                      <Badge variant="outline">{selectedMessage.tag || "General"}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        {selectedMessage.sender.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{selectedMessage.sender}</div>
                        <div className="text-sm text-muted-foreground">{selectedMessage.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                  <Separator className="mb-6" />
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="mt-8 border border-border rounded-lg p-4 bg-card">
                  <div className="text-sm text-muted-foreground mb-2">Reply to {selectedMessage.sender}</div>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-sm outline-none" 
                    placeholder="Write your reply..."
                    data-testid="textarea-reply"
                  />
                  <div className="flex justify-between items-center mt-4 gap-2 flex-wrap">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" /> Attach
                    </Button>
                    <Button size="sm" data-testid="button-send-reply">
                      <Reply className="w-4 h-4 mr-2" /> Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Mail className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium">No message selected</p>
              <p className="text-sm">Select a message from the list to view</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
