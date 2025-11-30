import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useMockData } from "@/context/MockContext";
import { 
  Search, 
  Star, 
  Archive, 
  Trash2, 
  Reply, 
  MoreHorizontal,
  Paperclip
} from "lucide-react";
import { useState } from "react";

export default function AdminInbox() {
  const { messages, markAsRead, deleteMessage } = useMockData();
  const [selectedMessageId, setSelectedMessageId] = useState<number>(messages[0]?.id || 0);

  const selectedMessage = messages.find(m => m.id === selectedMessageId) || messages[0];

  const handleSelectMessage = (id: number) => {
    setSelectedMessageId(id);
    markAsRead(id);
  };

  const handleDelete = (id: number) => {
    if (confirm("Move this message to trash?")) {
      deleteMessage(id);
      if (selectedMessageId === id && messages.length > 1) {
        const nextMessage = messages.find(m => m.id !== id);
        if (nextMessage) setSelectedMessageId(nextMessage.id);
      }
    }
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row bg-card border border-border rounded-lg overflow-hidden">
        {/* Sidebar / List */}
        <div className="w-full md:w-80 border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-9" />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col">
              {messages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg.id)}
                  className={`flex flex-col gap-2 p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                    !msg.read ? "bg-primary/5" : ""
                  } ${selectedMessageId === msg.id ? "bg-muted" : ""}`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`font-medium ${!msg.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {msg.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">{msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                  <span className="text-sm font-medium truncate w-full">
                    {msg.subject}
                  </span>
                  <span className="text-xs text-muted-foreground truncate w-full">
                    {msg.message}
                  </span>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px] h-5">
                      {msg.tag}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Message View */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedMessage ? (
            <>
              {/* Toolbar */}
              <div className="h-16 border-b border-border flex items-center justify-between px-6">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon"><Archive size={18} /></Button>
                  <Button variant="ghost" size="icon" onClick={() => selectedMessage && handleDelete(selectedMessage.id)}><Trash2 size={18} /></Button>
                  <Separator orientation="vertical" className="h-6 mx-2" />
                  <Button variant="ghost" size="icon"><Star size={18} /></Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{selectedMessage.subject}</h2>
                    <div className="flex gap-2">
                      <Badge variant="outline">{selectedMessage.tag}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                        {selectedMessage.sender.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{selectedMessage.sender}</div>
                        <div className="text-sm text-muted-foreground">{selectedMessage.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <Separator className="mb-6" />
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                {/* Reply Box */}
                <div className="mt-8 border border-border rounded-lg p-4 bg-card">
                  <div className="text-sm text-muted-foreground mb-2">Reply to {selectedMessage.sender}</div>
                  <textarea 
                    className="w-full bg-transparent border-none focus:ring-0 resize-none min-h-[100px] text-sm" 
                    placeholder="Write your reply..."
                  />
                  <div className="flex justify-between items-center mt-4">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" /> Attach
                    </Button>
                    <Button size="sm">
                      <Reply className="w-4 h-4 mr-2" /> Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div className="flex-1 flex items-center justify-center text-muted-foreground">
               Select a message to read
             </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
