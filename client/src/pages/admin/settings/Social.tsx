import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Github, 
  Youtube,
  Share2,
  BarChart2,
  Calendar,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";

export default function AdminSocial() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Social Media</h1>
            <p className="text-muted-foreground">Manage integrations and auto-posting</p>
          </div>
          <Button className="bg-primary gap-2">
             <Share2 className="w-4 h-4" /> Create New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Connected Accounts */}
           <div className="lg:col-span-1 space-y-6">
              <h2 className="text-xl font-bold">Connected Accounts</h2>
              <div className="space-y-4">
                 {[
                    { name: "Facebook", icon: Facebook, connected: true, handle: "@loideveloper" },
                    { name: "Twitter / X", icon: Twitter, connected: true, handle: "@loicode" },
                    { name: "LinkedIn", icon: Linkedin, connected: false, handle: "" },
                    { name: "Instagram", icon: Instagram, connected: true, handle: "@loi.dev" },
                    { name: "GitHub", icon: Github, connected: true, handle: "@loigit" },
                 ].map((platform, i) => (
                    <Card key={i} className="overflow-hidden">
                       <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="p-2 bg-muted rounded-full">
                                <platform.icon className="w-5 h-5" />
                             </div>
                             <div>
                                <h4 className="font-medium">{platform.name}</h4>
                                {platform.connected ? (
                                   <span className="text-xs text-green-500 flex items-center gap-1">
                                      ● Connected as {platform.handle}
                                   </span>
                                ) : (
                                   <span className="text-xs text-muted-foreground">Not connected</span>
                                )}
                             </div>
                          </div>
                          <Switch checked={platform.connected} />
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>

           {/* Post Scheduler & Analytics */}
           <div className="lg:col-span-2 space-y-6">
              <Card>
                 <CardHeader>
                    <CardTitle>Auto-Post Settings</CardTitle>
                    <CardDescription>Configure automatic sharing when new content is published</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                       <div className="space-y-0.5">
                          <h4 className="font-medium">Share New Blog Posts</h4>
                          <p className="text-sm text-muted-foreground">Automatically tweet and post to LinkedIn when a new blog is published</p>
                       </div>
                       <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                       <div className="space-y-0.5">
                          <h4 className="font-medium">Share New Projects</h4>
                          <p className="text-sm text-muted-foreground">Post to Instagram and Facebook when a portfolio item is added</p>
                       </div>
                       <Switch defaultChecked />
                    </div>
                 </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                          <BarChart2 className="w-5 h-5" /> Engagement
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="text-3xl font-bold mb-2">12.5K</div>
                       <p className="text-sm text-muted-foreground">Total interactions this month</p>
                       <div className="mt-4 h-24 flex items-end gap-1">
                          {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                             <div key={i} className="flex-1 bg-primary/20 rounded-t hover:bg-primary/50 transition-colors" style={{ height: `${h}%` }} />
                          ))}
                       </div>
                    </CardContent>
                 </Card>

                 <Card>
                    <CardHeader>
                       <CardTitle className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" /> Scheduled Posts
                       </CardTitle>
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-4">
                          {[
                             { title: "React 19 Feature Breakdown", time: "Tomorrow, 10:00 AM", platforms: [Twitter, Linkedin] },
                             { title: "Project Showcase: E-commerce", time: "Fri, 2:00 PM", platforms: [Instagram, Facebook] },
                          ].map((post, i) => (
                             <div key={i} className="flex items-center justify-between border-b last:border-0 pb-2 last:pb-0">
                                <div>
                                   <p className="font-medium text-sm truncate max-w-[150px]">{post.title}</p>
                                   <p className="text-xs text-muted-foreground">{post.time}</p>
                                </div>
                                <div className="flex gap-1">
                                   {post.platforms.map((Icon, idx) => (
                                      <Icon key={idx} className="w-3 h-3 text-muted-foreground" />
                                   ))}
                                </div>
                             </div>
                          ))}
                       </div>
                       <Button variant="outline" size="sm" className="w-full mt-4">View Calendar</Button>
                    </CardContent>
                 </Card>
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}