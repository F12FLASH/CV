import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { 
  Plus, 
  Search, 
  Edit,
  Trash,
  FileText,
  Eye,
  Loader2,
  BookOpen,
  Layers
} from "lucide-react";
import { type Page, type HomepageSection } from "@shared/schema";
import { PageEditor } from "@/components/admin/page-editor";

export default function AdminPages() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pages");
  const [searchTerm, setSearchTerm] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | undefined>();

  // Pages Query
  const { data: pages = [], isLoading: pagesLoading, refetch: refetchPages } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
    queryFn: async () => {
      const res = await fetch("/api/pages", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pages");
      return res.json();
    },
  });

  // Posts Query
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  // Projects Query
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  // Homepage Sections Query
  const { data: sections = [], isLoading: sectionsLoading, refetch: refetchSections } = useQuery<HomepageSection[]>({
    queryKey: ["/api/homepage/sections"],
    queryFn: async () => {
      const res = await fetch("/api/homepage/sections", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete page");
      return res.json();
    },
    onSuccess: () => {
      refetchPages();
      toast({ title: "Success", description: "Page deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update page");
      return res.json();
    },
    onSuccess: () => {
      refetchPages();
      toast({ title: "Success", description: "Page status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleSectionMutation = useMutation({
    mutationFn: async ({ name, visible }: { name: string; visible: boolean }) => {
      const res = await fetch(`/api/homepage/sections/${name}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visible }),
      });
      if (!res.ok) throw new Error("Failed to update section visibility");
      return res.json();
    },
    onSuccess: () => {
      refetchSections();
      queryClient.invalidateQueries({ queryKey: ["/api/homepage/sections"] });
      toast({ title: "Success", description: "Section visibility updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const startEdit = (id: number) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      setSelectedPage(page);
      setEditorOpen(true);
    }
  };

  const handleCreatePage = () => {
    setSelectedPage(undefined);
    setEditorOpen(true);
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPosts = posts.filter((post: any) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter((project: any) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = pagesLoading || postsLoading || projectsLoading || sectionsLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PageEditor 
        page={selectedPage}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Content Management</h1>
            <p className="text-muted-foreground">Manage pages, blog posts, and projects</p>
          </div>
          {activeTab === "pages" && (
            <Button 
              className="bg-primary" 
              data-testid="button-create-page"
              onClick={handleCreatePage}
            >
              <Plus className="w-4 h-4 mr-2" /> New Page
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pages" data-testid="tab-pages">
              <FileText className="w-4 h-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="blog" data-testid="tab-blog">
              <BookOpen className="w-4 h-4 mr-2" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="projects" data-testid="tab-projects">
              <Layers className="w-4 h-4 mr-2" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="visibility" data-testid="tab-visibility">
              <Eye className="w-4 h-4 mr-2" />
              Homepage
            </TabsTrigger>
          </TabsList>

          {/* Pages Tab */}
          <TabsContent value="pages" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pages..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-pages"
                />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {filteredPages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No pages found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Slug</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPages.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                              <FileText size={16} />
                            </div>
                            <span className="font-medium">{page.title}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={page.status === "Published" ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => toggleStatus(page.id, page.status)}
                            data-testid={`badge-status-${page.id}`}
                          >
                            {page.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {page.views}
                          </div>
                        </TableCell>
                        <TableCell>
                          {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              data-testid={`button-edit-page-${page.id}`}
                              onClick={() => startEdit(page.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDelete(page.id, page.title)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-page-${page.id}`}
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Blog Posts Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search blog posts..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-posts"
                />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {filteredPosts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No blog posts found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post: any) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <span className="font-medium">{post.title}</span>
                        </TableCell>
                        <TableCell>{post.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant={post.status === "Published" ? "default" : "secondary"}
                            data-testid={`badge-post-status-${post.id}`}
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {post.views || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  data-testid="input-search-projects"
                />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border overflow-hidden">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Layers className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No projects found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProjects.map((project: any) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <span className="font-medium">{project.title}</span>
                        </TableCell>
                        <TableCell>{project.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant={project.status === "Published" ? "default" : "secondary"}
                            data-testid={`badge-project-status-${project.id}`}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            {project.views || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Homepage Visibility Tab */}
          <TabsContent value="visibility" className="space-y-6">
            <div className="bg-card p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold mb-6">Homepage Sections Visibility</h3>
              <div className="space-y-4">
                {sections.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No sections available</p>
                ) : (
                  sections.map((section) => (
                    <Card key={section.name}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex-1">
                          <h4 className="font-medium capitalize" data-testid={`text-section-${section.name}`}>
                            {section.name.replace('-', ' ')}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {section.visible ? "Currently visible on homepage" : "Hidden from homepage"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Label htmlFor={`toggle-${section.name}`} className="cursor-pointer">
                            {section.visible ? "Visible" : "Hidden"}
                          </Label>
                          <Switch
                            id={`toggle-${section.name}`}
                            checked={section.visible}
                            onCheckedChange={(checked) => 
                              toggleSectionMutation.mutate({ 
                                name: section.name, 
                                visible: checked 
                              })
                            }
                            disabled={toggleSectionMutation.isPending}
                            data-testid={`switch-section-${section.name}`}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
