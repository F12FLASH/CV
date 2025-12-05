import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import {
  useProjects,
  useProjectCategories,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useToggleFeatured,
} from "./hooks";
import { ProjectCard, ProjectForm } from "./components";
import type { Project, ProjectFormData } from "./types";

export default function AdminProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filter, setFilter] = useState("all");

  const { data: projects = [], isLoading } = useProjects();
  const { data: categories = [] } = useProjectCategories();

  const handleFormClose = () => {
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const createMutation = useCreateProject(handleFormClose);
  const updateMutation = useUpdateProject(handleFormClose);
  const deleteMutation = useDeleteProject();
  const toggleFeaturedMutation = useToggleFeatured();

  const openCreateDialog = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ProjectFormData, isEditing: boolean) => {
    if (isEditing && editingProject) {
      updateMutation.mutate({ id: editingProject.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleToggleFeatured = (id: number, featured: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured });
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
            <h1 className="text-3xl font-heading font-bold" data-testid="page-title">
              Projects
            </h1>
            <p className="text-muted-foreground">Manage your portfolio projects</p>
          </div>
          <Button onClick={openCreateDialog} data-testid="button-create-project">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "featured", "published", "draft", ...categories.map((c) => c.slug)].map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
            >
              {f === "all"
                ? "All"
                : f === "featured"
                  ? "Featured"
                  : f === "published"
                    ? "Published"
                    : f === "draft"
                      ? "Draft"
                      : categories.find((c) => c.slug === f)?.name || f}
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
              <ProjectCard
                key={project.id}
                project={project}
                categories={categories}
                onEdit={openEditDialog}
                onDelete={handleDelete}
                onToggleFeatured={handleToggleFeatured}
              />
            ))}
          </div>
        )}
      </div>

      <ProjectForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose();
          else setIsDialogOpen(open);
        }}
        editingProject={editingProject}
        categories={categories}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </AdminLayout>
  );
}
