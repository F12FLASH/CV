
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  GripVertical,
  Edit,
  Trash,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown
} from "lucide-react";
import { useState } from "react";

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([
    { id: 1, question: "What technologies do you specialize in?", answer: "I specialize in the React ecosystem, Node.js, and cloud architecture.", visible: true, order: 1 },
    { id: 2, question: "Do you offer maintenance packages?", answer: "Yes, I offer monthly maintenance packages to keep your site secure and updated.", visible: true, order: 2 },
    { id: 3, question: "What is your typical turnaround time?", answer: "It depends on the project scope, but typically 2-4 weeks for a standard website.", visible: true, order: 3 },
    { id: 4, question: "Do you work with international clients?", answer: "Absolutely! I have experience working with clients across different time zones.", visible: false, order: 4 },
  ]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">FAQs Management</h1>
            <p className="text-muted-foreground">Manage frequently asked questions for your visitors</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> Add New FAQ
          </Button>
        </div>

        <div className="flex gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search FAQs..." className="pl-9" />
          </div>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={faq.id} className="group hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="cursor-grab text-muted-foreground hover:text-foreground transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-lg">{faq.question}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={faq.visible ? "default" : "secondary"}>
                          {faq.visible ? "Visible" : "Hidden"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Order: {faq.order}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                    <Button variant="ghost" size="icon" title="Move Up">
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Move Down">
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title={faq.visible ? "Hide" : "Show"}>
                      {faq.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" title="Delete">
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Form */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Add New FAQ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question</label>
              <Input placeholder="Enter your question here..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Answer</label>
              <Textarea 
                placeholder="Provide a detailed answer..." 
                className="min-h-[120px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline">Cancel</Button>
              <Button>Save FAQ</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
