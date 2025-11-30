import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Search, 
  MessageSquare, 
  HelpCircle, 
  ThumbsUp, 
  MoreHorizontal, 
  Reply, 
  Trash, 
  CheckCircle, 
  AlertTriangle,
  GripVertical,
  Edit,
  Plus
} from "lucide-react";
import { useState } from "react";

export default function AdminComments() {
  const [activeTab, setActiveTab] = useState("comments");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Interactions</h1>
            <p className="text-muted-foreground">Manage user comments, reviews, and FAQs</p>
          </div>
        </div>

        <Tabs defaultValue="comments" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="reviews">Testimonials</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          {/* Comments Tab */}
          <TabsContent value="comments" className="space-y-6 mt-6">
             <div className="flex justify-between gap-4">
               <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search comments..." className="pl-9" />
               </div>
               <div className="flex gap-2">
                  <Button variant="outline" size="icon" title="Filter Spam">
                     <AlertTriangle className="w-4 h-4" />
                  </Button>
               </div>
             </div>

             <div className="space-y-4">
                {[
                   { user: "John Doe", avatar: "J", content: "Great article! Really helped me understand React hooks better.", post: "Getting Started with React 19", status: "Approved", time: "2 hours ago" },
                   { user: "Spam Bot", avatar: "S", content: "Buy cheap followers at...", post: "Web Design Trends", status: "Spam", time: "5 hours ago" },
                   { user: "Alice Smith", avatar: "A", content: "Can you explain more about the useEffect dependency array?", post: "React Hooks Deep Dive", status: "Pending", time: "1 day ago" },
                ].map((comment, i) => (
                   <Card key={i} className={`border-l-4 ${comment.status === 'Approved' ? 'border-l-green-500' : comment.status === 'Spam' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                      <CardContent className="p-6">
                         <div className="flex items-start justify-between gap-4">
                            <div className="flex gap-4">
                               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                  {comment.avatar}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                     <span className="font-semibold">{comment.user}</span>
                                     <span className="text-xs text-muted-foreground">• {comment.time}</span>
                                     <Badge variant="outline" className="text-xs">{comment.status}</Badge>
                                  </div>
                                  <p className="text-sm mt-1 text-foreground/90">{comment.content}</p>
                                  <p className="text-xs text-primary mt-2">On: {comment.post}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button variant="ghost" size="icon" title="Reply">
                                  <Reply className="w-4 h-4" />
                               </Button>
                               <Button variant="ghost" size="icon" title="Approve/Spam">
                                  {comment.status === 'Approved' ? <AlertTriangle className="w-4 h-4 text-yellow-500" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                               </Button>
                               <Button variant="ghost" size="icon" className="text-destructive">
                                  <Trash className="w-4 h-4" />
                               </Button>
                            </div>
                         </div>
                         {/* Reply Box Mockup */}
                         {comment.status === 'Pending' && (
                            <div className="mt-4 pl-14">
                               <div className="flex gap-2">
                                  <Input placeholder="Write a reply..." className="h-9" />
                                  <Button size="sm">Reply</Button>
                               </div>
                            </div>
                         )}
                      </CardContent>
                   </Card>
                ))}
             </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6 mt-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                   { client: "TechCorp Inc.", project: "E-commerce Platform", rating: 5, review: "Loi delivered the project ahead of schedule and the code quality was exceptional." },
                   { client: "Studio Art", project: "Portfolio Site", rating: 5, review: "Amazing attention to detail. The animations are smooth and exactly what we wanted." },
                ].map((review, i) => (
                   <Card key={i}>
                      <CardHeader className="flex flex-row items-start justify-between pb-2">
                         <div>
                            <CardTitle className="text-lg">{review.client}</CardTitle>
                            <p className="text-sm text-muted-foreground">Project: {review.project}</p>
                         </div>
                         <div className="flex">
                            {[1,2,3,4,5].map(s => <ThumbsUp key={s} className="w-4 h-4 text-primary fill-primary" />)}
                         </div>
                      </CardHeader>
                      <CardContent>
                         <p className="text-sm italic">"{review.review}"</p>
                         <div className="flex justify-end gap-2 mt-4">
                            <Badge variant="secondary">Show on Homepage</Badge>
                            <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                         </div>
                      </CardContent>
                   </Card>
                ))}
             </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs" className="space-y-6 mt-6">
             <div className="flex justify-between">
                <Input placeholder="Search FAQs..." className="max-w-sm" />
                <Button><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
             </div>
             
             <div className="space-y-2">
                {[
                   { q: "What technologies do you specialize in?", a: "I specialize in the React ecosystem, Node.js, and cloud architecture." },
                   { q: "Do you offer maintenance packages?", a: "Yes, I offer monthly maintenance packages to keep your site secure and updated." },
                   { q: "What is your typical turnaround time?", a: "It depends on the project scope, but typically 2-4 weeks for a standard website." },
                ].map((faq, i) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg group">
                      <div className="cursor-grab text-muted-foreground hover:text-foreground">
                         <GripVertical className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                         <h4 className="font-semibold">{faq.q}</h4>
                         <p className="text-sm text-muted-foreground">{faq.a}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                         <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                         <Button variant="ghost" size="icon" className="text-destructive"><Trash className="w-4 h-4" /></Button>
                      </div>
                   </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}