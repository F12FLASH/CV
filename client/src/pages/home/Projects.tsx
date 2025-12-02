import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReviewSection } from "@/components/sections/ReviewSection";
import { useState, useMemo } from "react";

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [, setLocation] = useLocation();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return response.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories', 'project'],
    queryFn: async () => {
      const response = await fetch('/api/categories?type=project');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((project: any) => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || 
        project.category.toLowerCase() === filterCategory.toLowerCase();
      return matchesSearch && matchesCategory && project.status === 'Published';
    });
  }, [projects, searchQuery, filterCategory]);

  const categoryOptions = [
    { id: 'all', name: 'All Projects' },
    ...categories.map((cat: any) => ({ id: cat.slug, name: cat.name }))
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Featured <span className="text-primary">Projects</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Explore my portfolio of web applications, designs, and creative solutions.
              </p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 space-y-6"
          >
            {/* Search */}
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
              data-testid="input-search-projects"
            />

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
                <Button
                  key={cat.id}
                  variant={filterCategory === cat.id ? "default" : "outline"}
                  onClick={() => setFilterCategory(cat.id)}
                  data-testid={`button-filter-${cat.id}`}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No projects found</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setFilterCategory("all");
              }} data-testid="button-clear-filters">
                Clear filters
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {filteredProjects.map((project: any) => (
                  <motion.div
                    layout
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300"
                    data-testid={`card-project-${project.id}`}
                  >
                    {/* Image */}
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img
                        src={project.image || '/placeholder.jpg'}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold line-clamp-2">{project.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {/* Tech Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(project.tech || []).slice(0, 3).map((t: string) => (
                          <Badge key={t} variant="secondary" className="text-xs">
                            {t}
                          </Badge>
                        ))}
                        {(project.tech || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{(project.tech || []).length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={() => setSelectedProject(project)}
                          data-testid={`button-view-details-${project.id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-external-link-${project.id}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          data-testid={`button-github-${project.id}`}
                        >
                          <Github className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Project Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <ScrollArea className="max-h-[85vh]">
            <div className="p-6">
              <DialogHeader>
                <DialogTitle>{selectedProject?.title}</DialogTitle>
                <DialogDescription>{selectedProject?.description}</DialogDescription>
              </DialogHeader>
              {selectedProject && (
                <div className="space-y-6 mt-4">
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold mb-2">Challenge & Solution</h4>
                      <p className="text-muted-foreground text-sm">
                        {selectedProject.description || "Comprehensive project solution with modern technologies and best practices."}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-bold mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tech.map((t: string) => (
                          <Badge key={t} variant="secondary">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ReviewSection projectId={selectedProject.id} title="Project Reviews" />

                  <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button variant="outline" onClick={() => setSelectedProject(null)} data-testid="button-close-modal">
                      Close
                    </Button>
                    <Button data-testid="button-view-live">View Live Project</Button>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
