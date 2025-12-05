import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { ProjectEditor } from "@/components/admin/project-editor";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Project, Category, ProjectFormData } from "../types";
import { getEmptyProjectForm, mapProjectToFormData } from "../types";

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProject: Project | null;
  categories: Category[];
  onSubmit: (data: ProjectFormData, isEditing: boolean) => void;
  isPending: boolean;
}

export function ProjectForm({
  open,
  onOpenChange,
  editingProject,
  categories,
  onSubmit,
  isPending,
}: ProjectFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProjectFormData>(getEmptyProjectForm());
  const [techInput, setTechInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingProject) {
        setFormData(mapProjectToFormData(editingProject));
      } else {
        setFormData(getEmptyProjectForm());
      }
      setTechInput("");
    }
  }, [open, editingProject]);

  const addTech = () => {
    if (techInput.trim() && !formData.tech.includes(techInput.trim())) {
      setFormData({ ...formData, tech: [...formData.tech, techInput.trim()] });
      setTechInput("");
    }
  };

  const removeTech = (tech: string) => {
    setFormData({ ...formData, tech: formData.tech.filter((t) => t !== tech) });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
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
          toast({
            title: "Error",
            description: error.message || "Failed to upload image",
            variant: "destructive",
          });
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

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" });
      return;
    }
    onSubmit(formData, !!editingProject);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                      <SelectItem
                        key={cat.id}
                        value={cat.slug}
                        data-testid={`option-${cat.slug}`}
                      >
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="default" disabled>
                      No categories available
                    </SelectItem>
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
            <Label htmlFor="shortDescription">Short Description</Label>
            <p className="text-sm text-muted-foreground">
              A brief summary shown in featured project cards (max 150 characters)
            </p>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief project summary for featured display..."
              maxLength={150}
              data-testid="input-short-description"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.shortDescription.length}/150
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
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
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
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
                <p className="text-xs text-muted-foreground mt-1">
                  Max 5MB. Recommended: 1200x630px
                </p>
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
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              data-testid="switch-featured"
            />
            <Label>Featured project</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-project">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : editingProject ? (
              "Update Project"
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
