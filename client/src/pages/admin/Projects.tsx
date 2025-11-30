import { useState, useEffect } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash,
  Globe,
  Github,
  Calendar,
  ExternalLink,
  Layers,
  Star
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

type Project = {
  id: number;
  title: string;
  category: string;
  image: string | null;
  description: string | null;
  tech: string[];
  link: string | null;
  github: string | null;
  status: "Published" | "Draft" | "Archived";
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

type ProjectFormData = {
  title: string;
  category: string;
  image: string;
  description: string;
  tech: string[];
  link: string;
  github: string;
  status: "Published" | "Draft" | "Archived";
  featured: boolean;
};

const defaultFormData: ProjectFormData = {
  title: "",
  category: "full-stack",
  image: "",
  description: "",
  tech: [],
  link: "",
  github: "",
  status: "Draft",
  featured: false,
};

const categories = [
  { value: "full-stack", label: "Full-stack" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "mobile", label: "Mobile" },
  { value: "design", label: "Design" },
];

export default function AdminProjects() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(defaultFormData);
  const [techInput, setTechInput] = useState("");

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await api.getProjects();
      setProjects(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.tech.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this project?")) {
      return;
    }
    
    try {
      await api.deleteProject(id);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingProject(null);
    setFormData(defaultFormData);
    setTechInput("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      category: project.category,
      image: project.image || "",
      description: project.description || "",
      tech: project.tech || [],
      link: project.link || "",
      github: project.github || "",
      status: project.status,
      featured: project.featured,
    });
    setTechInput("");
    setIsDialogOpen(true);
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Project title is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const projectData = {
        ...formData,
        image: formData.image || null,
        description: formData.description || null,
        link: formData.link || null,
        github: formData.github || null,
      };

      if (editingProject) {
        await api.updateProject(editingProject.id, projectData);
        toast({
          title: "Success",
          description: "Project updated successfully",
        });
      } else {
        await api.createProject(projectData);
        toast({
          title: "Success",
          description: "Project created successfully",
        });
      }
      
      setIsDialogOpen(false);
      setFormData(defaultFormData);
      setTechInput("");
      setEditingProject(null);
      await loadProjects();
    } catch (error: any) {
      console.error("Error saving project:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to save project. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addTech = () => {
    if (techInput.trim() && !formData.tech.includes(techInput.trim())) {
      setFormData({ ...formData, tech: [...formData.tech, techInput.trim()] });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData({ ...formData, tech: formData.tech.filter(t => t !== tech) });
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Published" ? "Draft" : "Published";
      await api.updateProject(id, { status: newStatus });
      toast({
        title: "Success",
        description: `Project ${newStatus === "Published" ? "published" : "unpublished"}`,
      });
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: number, currentFeatured: boolean) => {
    try {
      await api.updateProject(id, { featured: !currentFeatured });
      toast({
        title: currentFeatured ? "Removed from featured" : "Added to featured",
        description: currentFeatured 
          ? "Project will no longer appear in featured section" 
          : "Project will now appear in featured section",
      });
      await loadProjects();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update featured status",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Projects & Portfolio</h1>
            <p className="text-muted-foreground">Manage your portfolio showcase with detailed rich data.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" onClick={openAddDialog}>
            <Plus className="w-4 h-4 mr-2" /> Add New Project
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search projects by name, category, or tech..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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

        <div className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading projects...</p>
              </CardContent>
            </Card>
          ) : filteredProjects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try a different search term" : "Add your first project to get started"}
                </p>
                {!searchQuery && (
                  <Button onClick={openAddDialog}>
                    <Plus className="w-4 h-4 mr-2" /> Add Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card key={project.id} className="overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto relative bg-muted">
                    <img 
                      src={project.image || '/placeholder.jpg'} 
                      alt={project.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Button variant="secondary" size="sm" onClick={() => openEditDialog(project)}>
                        Edit Image
                      </Button>
                    </div>
                    {project.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-black">
                          <Star className="w-3 h-3 mr-1" /> Featured
                        </Badge>
                      </div>
                    )}
                  </div>

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
                            <Layers className="w-4 h-4" /> Category: <span className="text-foreground font-medium">{project.category}</span>
                          </div>
                          {project.createdAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" /> Created: <span className="text-foreground font-medium">
                                {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.tech.map(t => (
                            <Badge key={t} variant="secondary" className="text-xs font-mono">
                              {t}
                            </Badge>
                          ))}
                        </div>

                        {project.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {project.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            title="Toggle Featured"
                            onClick={() => toggleFeatured(project.id, project.featured)}
                            className={project.featured ? "text-yellow-500" : ""}
                          >
                            <Star className="w-4 h-4" />
                          </Button>
                          {project.link && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              title="View Live"
                              onClick={() => window.open(project.link!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          {project.github && (
                            <Button 
                              variant="outline" 
                              size="icon" 
                              title="View Code"
                              onClick={() => window.open(project.github!, '_blank')}
                            >
                              <Github className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="default" 
                            size="icon" 
                            title="Edit Details"
                            onClick={() => openEditDialog(project)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            title="Delete" 
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          <span className="font-medium text-foreground">{project.views}</span> views
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update the project details below." : "Fill in the details for your new project."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "Published" | "Draft" | "Archived") => 
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your project..."
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Label>Technologies</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    placeholder="Add technology (e.g., React)"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTech} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tech.map((tech) => (
                    <Badge key={tech} variant="secondary" className="gap-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="link">Live Demo URL</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="featured" className="font-medium">Featured Project</Label>
                  <p className="text-sm text-muted-foreground">
                    Show this project in the featured section on the homepage
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : (editingProject ? "Save Changes" : "Create Project")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
