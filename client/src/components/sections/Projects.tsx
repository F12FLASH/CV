import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Github, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMockData } from "@/context/MockContext";
import { api } from "@/lib/api";
import { ReviewSection } from "@/components/ReviewSection";

const useSafeMockData = () => {
  try {
    return useMockData();
  } catch (e) {
    return { projects: [] };
  }
};

export function Projects() {
  const [filter, setFilter] = useState("all");
  const [categories, setCategories] = useState<Array<{ id: string; label: string }>>([
    { id: "all", label: "All" }
  ]);
  const mockData = useSafeMockData();
  const allProjects = mockData?.projects || [];
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await api.getCategories("project");
        setCategories([
          { id: "all", label: "All" },
          ...cats.map((cat: any) => ({ id: cat.slug, label: cat.name }))
        ]);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const featuredProjects = allProjects
    .filter(p => p.status === "Published" && p.featured === true)
    .slice(0, 6);

  const filteredProjects = featuredProjects.filter(
    (p) => {
      if (filter === "all") return true;
      return p.category.toLowerCase().includes(filter.toLowerCase()) || filter.toLowerCase().includes(p.category.toLowerCase());
    }
  );

  return (
    <section id="projects" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            Featured <span className="text-primary">Projects</span>
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mb-8" />
          
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  filter === cat.id
                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredProjects.map((project) => (
              <motion.div
                layout
                key={project.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-xl overflow-hidden bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="aspect-video overflow-hidden bg-muted">
                  <img
                    src={project.image || '/placeholder.jpg'}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-white mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {project.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center mb-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                    {project.tech.map((t: string) => (
                      <span key={t} className="text-xs px-2 py-1 bg-white/10 text-white rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-200">
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors" onClick={() => setSelectedProject(project)}>
                       <Plus size={20} />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors">
                       <ExternalLink size={20} />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-white/20 text-white hover:bg-white hover:text-black transition-colors">
                       <Github size={20} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Details Modal */}
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
                      <img src={selectedProject.image} alt={selectedProject.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-bold mb-2">Challenge & Solution</h4>
                        <p className="text-muted-foreground text-sm">
                          {selectedProject.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold mb-2">Technologies</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tech.map((t: string) => (
                            <span key={t} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <ReviewSection projectId={selectedProject.id} title="Project Reviews" />
                    
                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={() => setSelectedProject(null)}>Close</Button>
                      <Button>View Live Project</Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
