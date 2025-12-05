import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye, Star, ExternalLink, Github, Image as ImageIcon } from "lucide-react";
import type { Project, Category } from "../types";

interface ProjectCardProps {
  project: Project;
  categories: Category[];
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onToggleFeatured: (id: number, featured: boolean) => void;
}

export function ProjectCard({
  project,
  categories,
  onEdit,
  onDelete,
  onToggleFeatured,
}: ProjectCardProps) {
  return (
    <Card className="overflow-hidden group" data-testid={`card-project-${project.id}`}>
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
          <span>
            {categories.find((c) => c.slug === project.category)?.name || project.category}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={project.featured}
              onCheckedChange={(checked) => onToggleFeatured(project.id, checked)}
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
              onClick={() => onEdit(project)}
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
                    onClick={() => onDelete(project.id)}
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
  );
}
