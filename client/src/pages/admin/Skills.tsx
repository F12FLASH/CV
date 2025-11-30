import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit,
  Trash,
  Code,
  Database,
  Server,
  Wrench,
  Upload
} from "lucide-react";

export default function AdminSkills() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Skills & Technologies</h1>
            <p className="text-muted-foreground">Manage your technical expertise and tools</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> Add New Skill
          </Button>
        </div>

        <Tabs defaultValue="frontend" className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
             <TabsList>
               <TabsTrigger value="frontend">Frontend</TabsTrigger>
               <TabsTrigger value="backend">Backend</TabsTrigger>
               <TabsTrigger value="database">Database</TabsTrigger>
               <TabsTrigger value="tools">Tools</TabsTrigger>
             </TabsList>
             
             <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search skills..." className="pl-9" />
             </div>
          </div>

          {/* Content for all tabs (mocked similar structure) */}
          {["frontend", "backend", "database", "tools"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5].map((item) => (
                     <Card key={item} className="group hover:border-primary/50 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                 {tab === 'frontend' ? <Code className="w-6 h-6 text-blue-500" /> : 
                                  tab === 'backend' ? <Server className="w-6 h-6 text-green-500" /> :
                                  tab === 'database' ? <Database className="w-6 h-6 text-yellow-500" /> :
                                  <Wrench className="w-6 h-6 text-purple-500" />}
                              </div>
                              <div>
                                 <h3 className="font-bold">{tab === 'frontend' ? 'React.js' : 'Node.js'}</h3>
                                 <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-[10px]">Advanced</Badge>
                                    <span className="text-xs text-muted-foreground">95%</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                 <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                 <Trash className="w-4 h-4" />
                              </Button>
                           </div>
                        </CardContent>
                     </Card>
                  ))}
                  
                  {/* Add New Card Placeholder */}
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all h-full min-h-[88px]">
                     <Plus className="w-6 h-6 text-muted-foreground mb-2" />
                     <span className="text-sm font-medium text-muted-foreground">Add {tab} skill</span>
                  </div>
               </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}