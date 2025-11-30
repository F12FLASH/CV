import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageGallery } from "@/components/admin/image-gallery";
import { Plus, Edit, Trash, Eye, Share2 } from "lucide-react";
import { useState } from "react";

export default function AdminProjectsEnhanced() {
  const [selectedProject, setSelectedProject] = useState(1);

  const projects = [
    {
      id: 1,
      title: "E-commerce Platform",
      category: "Full-stack",
      images: [
        { id: 1, url: "/img1.jpg", alt: "Hero" },
        { id: 2, url: "/img2.jpg", alt: "Dashboard" },
        { id: 3, url: "/img3.jpg", alt: "Products" },
      ],
      tech: ["React", "Node.js", "MongoDB"],
      status: "Published",
      stats: { views: 2543, likes: 156 },
      testimonial:
        "Great work! The platform exceeded our expectations.",
      client: "TechCorp Inc",
    },
  ];

  const project = projects.find((p) => p.id === selectedProject)!;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage your portfolio projects</p>
          </div>
          <Button className="bg-primary gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        </div>

        {project && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gallery */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery
                    images={project.images}
                    onAddImage={() => {}}
                    onDeleteImage={() => {}}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Project Details */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Category
                    </p>
                    <Badge>{project.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Tech Stack
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.tech.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="font-bold">{project.stats.views}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Likes</p>
                      <p className="font-bold">{project.stats.likes}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Client</p>
                    <p className="font-medium">{project.client}</p>
                    <p className="text-xs text-muted-foreground mt-2 italic">
                      "{project.testimonial}"
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Edit className="w-3 h-3" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Trash className="w-3 h-3" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full gap-2">
                    <Eye className="w-4 h-4" /> View Live
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
