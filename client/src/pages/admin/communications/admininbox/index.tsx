import { useState, useEffect } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Loader2 } from "lucide-react";
import { useMessages, useSmtpStatus, useMarkAsRead, useDeleteMessage, useArchiveMessage, useReplyToMessage } from "./hooks";
import { MessageList, MessageDetail, InboxHeader } from "./components";
import { useToast } from "@/hooks/use-toast";

export default function AdminInboxPage() {
  const { toast } = useToast();
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const { data: messages = [], isLoading, refetch } = useMessages();
  const { data: smtpStatus } = useSmtpStatus();

  const markAsReadMutation = useMarkAsRead();
  const deleteMutation = useDeleteMessage();
  const archiveMutation = useArchiveMessage();
  const replyMutation = useReplyToMessage();

  useEffect(() => {
    setReplyContent("");
  }, [selectedMessageId]);

  const filteredMessages = messages.filter(m => 
    !m.archived && (
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const effectiveSelectedId = selectedMessageId ?? filteredMessages[0]?.id ?? null;
  const selectedMessage = filteredMessages.find(m => m.id === effectiveSelectedId) || filteredMessages[0] || null;

  const handleSelectMessage = (id: number) => {
    setSelectedMessageId(id);
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.read) {
      markAsReadMutation.mutate(id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this message permanently?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          const remaining = filteredMessages.filter(m => m.id !== id);
          if (remaining.length > 0) {
            setSelectedMessageId(remaining[0].id);
          } else {
            setSelectedMessageId(null);
          }
        }
      });
    }
  };

  const handleArchive = (id: number) => {
    archiveMutation.mutate(id);
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({ title: "Error", description: "Please write a reply first", variant: "destructive" });
      return;
    }
    replyMutation.mutate(
      { id: selectedMessage.id, replyContent: replyContent.trim() },
      { onSuccess: () => setReplyContent("") }
    );
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
      <InboxHeader
        value={searchQuery}
        onChange={setSearchQuery}
        unreadCount={unreadCount}
        onRefresh={() => refetch()}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
        <div className="border rounded-lg overflow-hidden">
          <MessageList
            messages={filteredMessages}
            selectedId={effectiveSelectedId}
            onSelect={handleSelectMessage}
          />
        </div>

        <div className="lg:col-span-2 border rounded-lg overflow-hidden">
          <MessageDetail
            message={selectedMessage}
            replyContent={replyContent}
            onReplyChange={setReplyContent}
            onSendReply={handleSendReply}
            onDelete={handleDelete}
            onArchive={handleArchive}
            isReplying={replyMutation.isPending}
            smtpStatus={smtpStatus}
          />
        </div>
      </div>
    </AdminLayout>
  );
}
