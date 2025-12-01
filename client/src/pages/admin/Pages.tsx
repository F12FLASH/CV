import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit,
  Trash,
  FileText,
  Eye,
  Loader2,
  BookOpen,
  Layers,
  Home,
  User,
  Briefcase,
  MessageSquare,
  Star,
  Mail,
  Save,
  Settings,
  GripVertical,
  Image as ImageIcon
} from "lucide-react";
import { type Page, type HomepageSection } from "@shared/schema";
import { PageEditor } from "@/components/admin/page-editor";

interface SiteSettings {
  siteTitle?: string;
  tagline?: string;
  contactEmail?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroDescription?: string;
  heroStatus?: string;
  heroCTA?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutDescription?: string;
  aboutDescription2?: string;
  aboutName?: string;
  aboutEmail?: string;
  aboutLocation?: string;
  aboutFreelance?: string;
  aboutImage?: string;
  cvFileUrl?: string;
  contactTitle?: string;
  contactSubtitle?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialFacebook?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  socialLinkedin?: string;
  socialGithub?: string;
  socialYoutube?: string;
  footerText?: string;
  footerCopyright?: string;
  [key: string]: any;
}

const sectionConfig = [
  { 
    name: "hero", 
    icon: Home, 
    label: "Hero Section",
    description: "Main banner with title, subtitle and call-to-action",
    fields: ["heroTitle", "heroSubtitle", "heroDescription", "heroStatus", "heroCTA"]
  },
  { 
    name: "about", 
    icon: User, 
    label: "About Section",
    description: "Personal information and bio",
    fields: ["aboutTitle", "aboutSubtitle", "aboutDescription", "aboutDescription2", "aboutName", "aboutLocation", "aboutFreelance", "aboutImage", "cvFileUrl"]
  },
  { 
    name: "skills", 
    icon: Settings, 
    label: "Skills Section",
    description: "Technical skills and proficiencies",
    fields: []
  },
  { 
    name: "services", 
    icon: Briefcase, 
    label: "Services Section",
    description: "Services offered to clients",
    fields: []
  },
  { 
    name: "projects", 
    icon: Layers, 
    label: "Projects Section",
    description: "Portfolio of completed projects",
    fields: []
  },
  { 
    name: "testimonials", 
    icon: Star, 
    label: "Testimonials Section",
    description: "Client reviews and feedback",
    fields: []
  },
  { 
    name: "blog", 
    icon: BookOpen, 
    label: "Blog Section",
    description: "Latest blog posts",
    fields: []
  },
  { 
    name: "contact", 
    icon: Mail, 
    label: "Contact Section",
    description: "Contact form and information",
    fields: ["contactTitle", "contactSubtitle", "contactPhone", "contactAddress"]
  },
];

const fieldLabels: Record<string, string> = {
  heroTitle: "Hero Title",
  heroSubtitle: "Hero Subtitle", 
  heroDescription: "Hero Description",
  heroStatus: "Status Text",
  heroCTA: "Call-to-Action Button",
  aboutTitle: "About Title",
  aboutSubtitle: "About Subtitle",
  aboutDescription: "About Description",
  aboutDescription2: "Additional Description",
  aboutName: "Your Name",
  aboutLocation: "Location",
  aboutFreelance: "Availability Status",
  aboutImage: "Profile Image URL",
  cvFileUrl: "CV/Resume URL",
  contactTitle: "Contact Title",
  contactSubtitle: "Contact Subtitle",
  contactPhone: "Phone Number",
  contactAddress: "Address",
};

export default function AdminPages() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("homepage");
  const [searchTerm, setSearchTerm] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | undefined>();
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [localSettings, setLocalSettings] = useState<SiteSettings>({});

  const { data: pages = [], isLoading: pagesLoading, refetch: refetchPages } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
    queryFn: async () => {
      const res = await fetch("/api/pages", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pages");
      return res.json();
    },
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  const { data: sections = [], isLoading: sectionsLoading, refetch: refetchSections } = useQuery<HomepageSection[]>({
    queryKey: ["/api/homepage/sections"],
    queryFn: async () => {
      const res = await fetch("/api/homepage/sections", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch sections");
      return res.json();
    },
  });

  const { data: settings, isLoading: settingsLoading, refetch: refetchSettings } = useQuery<SiteSettings>({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

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

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      refetchSettings();
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Success", description: "Content updated successfully" });
      setEditingSection(null);
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

  const handleSaveSection = (sectionName: string) => {
    const section = sectionConfig.find(s => s.name === sectionName);
    if (!section) return;

    const updates: Record<string, string> = {};
    section.fields.forEach(field => {
      const value = localSettings[field];
      if (value !== undefined && value !== null) {
        const trimmedValue = typeof value === 'string' ? value.trim() : value;
        if (trimmedValue !== '') {
          updates[field] = trimmedValue;
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      toast({ title: "No changes", description: "Please fill in at least one field", variant: "default" });
      return;
    }

    updateSettingsMutation.mutate(updates);
  };

  const updateLocalSetting = (key: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
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

  const getSectionVisibility = (sectionName: string) => {
    const section = sections.find(s => s.name === sectionName);
    return section?.visible ?? true;
  };

  const isLoading = pagesLoading || postsLoading || projectsLoading || sectionsLoading || settingsLoading;

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
            <p className="text-muted-foreground">Manage homepage sections, pages, and content</p>
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
            <TabsTrigger value="homepage" data-testid="tab-homepage">
              <Home className="w-4 h-4 mr-2" />
              Homepage
            </TabsTrigger>
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
          </TabsList>

          {/* Homepage Content Management Tab */}
          <TabsContent value="homepage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Homepage Sections
                </CardTitle>
                <CardDescription>
                  Manage visibility and content of each section on your homepage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {sectionConfig.map((section) => {
                    const Icon = section.icon;
                    const isVisible = getSectionVisibility(section.name);
                    const hasContent = section.fields.length > 0;
                    
                    return (
                      <AccordionItem key={section.name} value={section.name}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${isVisible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium">{section.label}</p>
                                <p className="text-xs text-muted-foreground">{section.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                              <Badge variant={isVisible ? "default" : "secondary"} className="text-xs">
                                {isVisible ? "Visible" : "Hidden"}
                              </Badge>
                              <Switch
                                checked={isVisible}
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
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pt-4 space-y-4">
                            {hasContent ? (
                              <>
                                <div className="grid gap-4">
                                  {section.fields.map(field => (
                                    <div key={field} className="space-y-2">
                                      <Label htmlFor={field}>{fieldLabels[field] || field}</Label>
                                      {field.includes("Description") ? (
                                        <Textarea
                                          id={field}
                                          value={localSettings[field] || ""}
                                          onChange={(e) => updateLocalSetting(field, e.target.value)}
                                          rows={3}
                                          data-testid={`input-${field}`}
                                        />
                                      ) : (
                                        <Input
                                          id={field}
                                          value={localSettings[field] || ""}
                                          onChange={(e) => updateLocalSetting(field, e.target.value)}
                                          data-testid={`input-${field}`}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-end pt-4">
                                  <Button 
                                    onClick={() => handleSaveSection(section.name)}
                                    disabled={updateSettingsMutation.isPending}
                                    data-testid={`button-save-${section.name}`}
                                  >
                                    {updateSettingsMutation.isPending ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Changes
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm mb-2">Content for this section is managed separately.</p>
                                <Button variant="outline" size="sm" asChild>
                                  <a href={`/admin/${section.name}`}>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage {section.label.replace(" Section", "")}
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sections.filter(s => s.visible).length}</p>
                      <p className="text-xs text-muted-foreground">Visible Sections</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Layers className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{projects.length}</p>
                      <p className="text-xs text-muted-foreground">Total Projects</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <BookOpen className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{posts.length}</p>
                      <p className="text-xs text-muted-foreground">Blog Posts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <FileText className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{pages.length}</p>
                      <p className="text-xs text-muted-foreground">Static Pages</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
              <Button asChild>
                <a href="/admin/posts">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Posts
                </a>
              </Button>
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
              <Button asChild>
                <a href="/admin/projects">
                  <Plus className="w-4 h-4 mr-2" />
                  Manage Projects
                </a>
              </Button>
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
