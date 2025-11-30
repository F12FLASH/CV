
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mail, Plus, Edit, Trash, Eye, Send } from "lucide-react";
import { useState } from "react";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  description: string;
  category: string;
  status: "active" | "draft";
}

export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([
    {
      id: 1,
      name: "Welcome Email",
      subject: "Welcome to Our Portfolio!",
      description: "Sent to new newsletter subscribers",
      category: "Newsletter",
      status: "active"
    },
    {
      id: 2,
      name: "Contact Form Response",
      subject: "Thank you for reaching out",
      description: "Auto-reply for contact form submissions",
      category: "Contact",
      status: "active"
    },
    {
      id: 3,
      name: "Project Update",
      subject: "Your project update",
      description: "Send project progress updates to clients",
      category: "Projects",
      status: "draft"
    },
  ]);

  const handleDelete = (id: number) => {
    if (confirm("Delete this template?")) {
      setTemplates(templates.filter(t => t.id !== id));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Email Templates</h1>
            <p className="text-muted-foreground">Create and manage email templates</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Mail className="w-8 h-8 text-primary" />
                  <Badge variant={template.status === "active" ? "default" : "secondary"}>
                    {template.status}
                  </Badge>
                </div>
                <CardTitle className="mt-3">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Subject:</p>
                    <p className="text-sm font-medium">{template.subject}</p>
                  </div>
                  <div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" /> Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full gap-2">
                    <Send className="w-3 h-3" /> Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
