import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Users, 
  Mail, 
  Send, 
  BarChart, 
  Plus,
  MoreVertical,
  Calendar,
  MousePointerClick,
  UserCheck,
  Edit
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminNewsletter() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Newsletter</h1>
            <p className="text-muted-foreground">Manage subscribers and email campaigns</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Create Campaign
          </Button>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {[
             { label: "Total Subscribers", value: "2,543", change: "+12%", icon: Users, color: "text-blue-500" },
             { label: "Avg. Open Rate", value: "45.2%", change: "+2.4%", icon: Mail, color: "text-green-500" },
             { label: "Click Rate", value: "12.8%", change: "-0.5%", icon: MousePointerClick, color: "text-purple-500" },
             { label: "Active Subs", value: "2,100", change: "+5%", icon: UserCheck, color: "text-yellow-500" },
           ].map((stat, i) => (
             <Card key={i}>
               <CardContent className="p-6 flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                   <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                   <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                     {stat.change} from last month
                   </span>
                 </div>
                 <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                   <stat.icon className="w-5 h-5" />
                 </div>
               </CardContent>
             </Card>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Recent Campaigns */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold">Recent Campaigns</h2>
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                 <Table>
                    <TableHeader>
                       <TableRow>
                          <TableHead>Campaign Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Sent Date</TableHead>
                          <TableHead>Open Rate</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                       </TableRow>
                    </TableHeader>
                    <TableBody>
                       {[
                          { name: "March Newsletter", status: "Sent", date: "Mar 15, 2024", open: "48%" },
                          { name: "Product Update v2.0", status: "Sent", date: "Mar 01, 2024", open: "52%" },
                          { name: "Weekly Digest", status: "Draft", date: "-", open: "-" },
                          { name: "Special Offer", status: "Scheduled", date: "Mar 25, 2024", open: "-" },
                       ].map((row, i) => (
                          <TableRow key={i}>
                             <TableCell className="font-medium">{row.name}</TableCell>
                             <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                   row.status === 'Sent' ? 'bg-green-500/10 text-green-500' :
                                   row.status === 'Draft' ? 'bg-gray-500/10 text-gray-500' :
                                   'bg-blue-500/10 text-blue-500'
                                }`}>
                                   {row.status}
                                </span>
                             </TableCell>
                             <TableCell>{row.date}</TableCell>
                             <TableCell>{row.open}</TableCell>
                             <TableCell className="text-right">
                                <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                             </TableCell>
                          </TableRow>
                       ))}
                    </TableBody>
                 </Table>
              </div>
           </div>

           {/* Quick Actions / Templates */}
           <div className="space-y-6">
              <h2 className="text-xl font-bold">Email Templates</h2>
              <div className="space-y-4">
                 {["Welcome Email", "Monthly Newsletter", "Product Launch", "Simple Text"].map((template, i) => (
                    <Card key={i} className="cursor-pointer hover:border-primary transition-colors group">
                       <CardContent className="p-4 flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center text-primary">
                             <Mail className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-medium">{template}</h4>
                             <p className="text-xs text-muted-foreground">Last edited 2 days ago</p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                             <Edit className="w-4 h-4" />
                          </Button>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}