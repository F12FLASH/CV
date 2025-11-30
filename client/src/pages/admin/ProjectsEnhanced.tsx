import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, Star, ExternalLink, Github, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { ProjectEditor } from "@/components/admin/project-editor";

interface Project {
  id: number;
  title: string;
  category: string;
  image: string | null;
  description: string | null;
  tech: string[];
  link: string | null;
  github: string | null;
  status: string;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

const emptyProject = {
  title: "",
  category: "full-stack",
  image: "",
  description: "",
  tech: [] as string[],
  link: "",
  github: "",
  status: "Draft",
  featured: false,
};

const defaultCategory = "full-stack";

export default function AdminProjectsEnhanced() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState(emptyProject);
  const [techInput, setTechInput] = useState("");
  const [filter, setFilter] = useState("all");
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: () => api.getProjects(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories", "project"],
    queryFn: () =>
      fetch("/api/categories?type=project", { credentials: "include" })
        .then(res => res.json() as Promise<Category[]>)
        .catch(() => []),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Project created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof formData> }) => 
      api.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Success", description: "Project updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ title: "Success", description: "Project deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) =>
      api.updateProject(id, { featured }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateProject(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData(emptyProject);
    setEditingProject(null);
    setTechInput("");
  };

  const openCreateDialog = () => {
    resetForm();
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
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }

    if (editingProject) {
      updateMutation.mutate({ id: editingProject.id, data: formData });
    } else {
      createMutation.mutate(formData);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image size must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const result = await api.uploadImage(base64, file.name);
          setFormData({ ...formData, image: result.url });
          toast({ title: "Success", description: "Image uploaded successfully" });
        } catch (error: any) {
          toast({ title: "Error", description: error.message || "Failed to upload image", variant: "destructive" });
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadingImage(false);
      toast({ title: "Error", description: "Failed to read image file", variant: "destructive" });
    }
  };

  const filteredProjects = projects.filter((project: Project) => {
    if (filter === "all") return true;
    if (filter === "featured") return project.featured;
    if (filter === "published") return project.status === "Published";
    if (filter === "draft") return project.status === "Draft";
    return project.category === filter;
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="page-title">Projects</h1>
            <p className="text-muted-foreground">Manage your portfolio projects</p>
          </div>
          <Button onClick={openCreateDialog} data-testid="button-create-project">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "featured", "published", "draft", ...categories.map(c => c.slug)].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
            >
              {f === "all" ? "All" : 
               f === "featured" ? "Featured" :
               f === "published" ? "Published" :
               f === "draft" ? "Draft" :
               categories.find(c => c.slug === f)?.name || f}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No projects found</p>
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" /> Create your first project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project: Project) => (
              <Card key={project.id} className="overflow-hidden group" data-testid={`card-project-${project.id}`}>
                <div className="aspect-video relative bg-muted overflow-hidden">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge variant={project.status === "Published" ? "default" : "secondary"}>
                      {project.status}
                    </Badge>
                    {project.featured && (
                      <Badge variant="default" className="bg-yellow-500">
                        <Star className="w-3 h-3 mr-1" /> Featured
                      </Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-1">{project.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {(project.tech || []).slice(0, 4).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                    {(project.tech || []).length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tech.length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" /> {project.views}
                    </span>
                    <span>{categories.find(c => c.slug === project.category)?.name || project.category}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={project.featured}
                        onCheckedChange={(checked) => 
                          toggleFeaturedMutation.mutate({ id: project.id, featured: checked })
                        }
                        data-testid={`switch-featured-${project.id}`}
                      />
                      <span className="text-sm text-muted-foreground">Featured</span>
                    </div>
                    <div className="flex gap-1">
                      {project.link && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={project.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {project.github && (
                        <Button size="icon" variant="ghost" asChild>
                          <a href={project.github} target="_blank" rel="noopener noreferrer">
                            <Github className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => openEditDialog(project)}
                        data-testid={`button-edit-${project.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" data-testid={`button-delete-${project.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Project</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{project.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
            <DialogDescription>
              {editingProject ? "Update your project details" : "Add a new project to your portfolio"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Project title"
                data-testid="input-title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map((cat: Category) => (
                        <SelectItem key={cat.id} value={cat.slug} data-testid={`option-${cat.slug}`}>
                          {cat.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="default" disabled>No categories available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Project Description</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add detailed information about your project with rich formatting support
              </p>
              <ProjectEditor
                value={formData.description}
                onChange={(html) => setFormData({ ...formData, description: html })}
                placeholder="Describe your project with details, features, and technologies..."
              />
            </div>

            <div className="space-y-2">
              <Label>Project Image</Label>
              <div className="flex items-center gap-4">
                {formData.image ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden bg-muted">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => setFormData({ ...formData, image: "" })}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    data-testid="input-image"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max 5MB. Recommended: 1200x630px</p>
                </div>
                {uploadingImage && <Loader2 className="w-5 h-5 animate-spin" />}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Or enter URL:</span>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="flex-1"
                  data-testid="input-image-url"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Technologies</Label>
              <div className="flex gap-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="Add technology (e.g., React)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
                  data-testid="input-tech"
                />
                <Button type="button" onClick={addTech} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tech.map((tech) => (
                  <Badge key={tech} variant="secondary" className="gap-1">
                    {tech}
                    <button onClick={() => removeTech(tech)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="link">Live URL</Label>
                <Input
                  id="link"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                  data-testid="input-link"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github">GitHub URL</Label>
                <Input
                  id="github"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  placeholder="https://github.com/..."
                  data-testid="input-github"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                data-testid="switch-featured-form"
              />
              <Label htmlFor="featured">Featured on homepage</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending} data-testid="button-submit">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
