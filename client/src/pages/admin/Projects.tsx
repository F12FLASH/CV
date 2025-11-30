import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMockData } from "@/context/MockContext";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit,
  Trash,
  Globe,
  Github,
  Calendar,
  ExternalLink,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminProjects() {
  const { projects, deleteProject, addProject, updateProject } = useMockData();
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      toast({
        title: "Project deleted",
        description: "The project has been removed successfully.",
      });
    }
  };

  const handleAddDummy = () => {
    addProject({
      title: "New Awesome Project",
      category: "Full-stack",
      status: "Draft",
      tech: ["React", "Node.js"],
      image: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=800&q=80",
      description: "A new project added from admin panel",
      link: "#",
      github: "#"
    });
    toast({
      title: "Project created",
      description: "New project has been added to your portfolio.",
    });
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    updateProject(id, { status: newStatus });
    toast({
      title: "Status updated",
      description: `Project is now ${newStatus}`,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Projects & Portfolio</h1>
            <p className="text-muted-foreground">Manage your portfolio showcase with detailed rich data.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={handleAddDummy}>
            <Plus className="w-4 h-4 mr-2" /> Add New Project
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects by name, client, or tech..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" /> Category
            </Button>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" /> Date
            </Button>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden group">
               <div className="flex flex-col md:flex-row">
                  {/* Image Thumbnail */}
                  <div className="w-full md:w-48 h-32 md:h-auto relative bg-muted">
                     <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="secondary" size="sm">Edit Gallery</Button>
                     </div>
                  </div>

                  {/* Content */}
                  <CardContent className="flex-1 p-6">
                     <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2">
                           <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold">{project.title}</h3>
                              <Badge 
                                variant={project.status === "Published" ? "default" : "outline"}
                                className={`cursor-pointer ${project.status === "Published" ? "bg-green-500 hover:bg-green-600" : "hover:bg-muted"}`}
                                onClick={() => toggleStatus(project.id, project.status)}
                              >
                                {project.status}
                              </Badge>
                           </div>
                           
                           <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                 <Globe className="w-4 h-4" /> Client: <span className="text-foreground font-medium">TechCorp</span>
                              </div>
                              <div className="flex items-center gap-1">
                                 <Calendar className="w-4 h-4" /> Date: <span className="text-foreground font-medium">{project.date}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                 <Layers className="w-4 h-4" /> Category: <span className="text-foreground font-medium">{project.category}</span>
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-2 mt-2">
                              {project.tech.map(t => (
                                 <Badge key={t} variant="secondary" className="text-xs font-mono">
                                    {t}
                                 </Badge>
                              ))}
                           </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                           <div className="flex gap-2">
                              <Button variant="outline" size="icon" title="View Live">
                                 <ExternalLink className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="icon" title="View Code">
                                 <Github className="w-4 h-4" />
                              </Button>
                              <Button variant="default" size="icon" title="Edit Details">
                                 <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="destructive" size="icon" title="Delete" onClick={() => handleDelete(project.id)}>
                                 <Trash className="w-4 h-4" />
                              </Button>
                           </div>
                           <div className="text-xs text-muted-foreground mt-2">
                              <span className="font-medium text-foreground">{project.views}</span> views
                           </div>
                        </div>
                     </div>
                     
                     <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="font-semibold block mb-1">Challenges:</span>
                           <p className="text-muted-foreground line-clamp-2">Implementing real-time updates with WebSocket scaling...</p>
                        </div>
                        <div>
                           <span className="font-semibold block mb-1">Solution:</span>
                           <p className="text-muted-foreground line-clamp-2">Used Redis Pub/Sub for horizontal scaling...</p>
                        </div>
                     </div>
                  </CardContent>
               </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}