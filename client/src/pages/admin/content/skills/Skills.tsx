import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  Search, 
  Edit,
  Trash,
  Code,
  Database,
  Server,
  Wrench,
  Loader2,
  Save,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
  createdAt: Date | null;
}

const skillCategories = ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"];

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'frontend':
      return <Code className="w-6 h-6 text-blue-500" />;
    case 'backend':
      return <Server className="w-6 h-6 text-green-500" />;
    case 'database':
      return <Database className="w-6 h-6 text-yellow-500" />;
    case 'devops':
    case 'tools':
    default:
      return <Wrench className="w-6 h-6 text-purple-500" />;
  }
};

const getLevelLabel = (level: number) => {
  if (level >= 90) return "Expert";
  if (level >= 70) return "Advanced";
  if (level >= 50) return "Intermediate";
  if (level >= 30) return "Beginner";
  return "Learning";
};

const getLevelColor = (level: number) => {
  if (level >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (level >= 70) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (level >= 50) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  return "bg-gray-500/10 text-gray-500 border-gray-500/20";
};

export default function AdminSkills() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Frontend",
    level: 50,
    icon: "",
    order: 0,
  });

  const { data: skills = [], isLoading, refetch } = useQuery<Skill[]>({
    queryKey: ['/api/skills'],
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof formData) => api.createSkill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: "Success", description: "Skill created successfully" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof formData }) => api.updateSkill(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: "Success", description: "Skill updated successfully" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteSkill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/skills'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast({ title: "Success", description: "Skill deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", category: "Frontend", level: 50, icon: "", order: 0 });
    setEditingSkill(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      level: skill.level,
      icon: skill.icon || "",
      order: skill.order,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Skill name is required", variant: "destructive" });
      return;
    }

    if (editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete skill "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = searchQuery === "" || 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeTab === "all" || 
      skill.category.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const groupedSkills: Record<string, Skill[]> = {};
  filteredSkills.forEach(skill => {
    const cat = skill.category || 'Other';
    if (!groupedSkills[cat]) groupedSkills[cat] = [];
    groupedSkills[cat].push(skill);
  });

  const availableCategories = Array.from(new Set(skills.map(s => s.category))).filter(Boolean) as string[];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Skills & Technologies</h1>
            <p className="text-muted-foreground">
              Manage your technical expertise ({skills.length} skills)
            </p>
          </div>
          <Button onClick={handleOpenCreate} data-testid="button-add-skill">
            <Plus className="w-4 h-4 mr-2" /> Add New Skill
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <TabsList className="flex-wrap h-auto">
              <TabsTrigger value="all">All ({skills.length})</TabsTrigger>
              {availableCategories.map(cat => (
                <TabsTrigger key={cat} value={cat.toLowerCase()}>
                  {cat} ({skills.filter(s => s.category === cat).length})
                </TabsTrigger>
              ))}
            </TabsList>
             
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search skills..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="input-search-skills"
              />
            </div>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            {filteredSkills.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Wrench className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No skills found</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {searchQuery ? "Try adjusting your search" : "Start by adding your first skill"}
                  </p>
                  <Button onClick={handleOpenCreate}>
                    <Plus className="w-4 h-4 mr-2" /> Add Skill
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                  <Card key={skill.id} className="group hover:border-primary/50 transition-colors" data-testid={`card-skill-${skill.id}`}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          {getCategoryIcon(skill.category)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold truncate">{skill.name}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="secondary" className={`text-[10px] ${getLevelColor(skill.level)}`}>
                              {getLevelLabel(skill.level)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{skill.level}%</span>
                          </div>
                        </div>
                      </div>
                       
                      <div className="flex gap-1 invisible group-hover:visible transition-all flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleOpenEdit(skill)}
                          data-testid={`button-edit-skill-${skill.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => handleDelete(skill.id, skill.name)}
                          data-testid={`button-delete-skill-${skill.id}`}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                 
                <div 
                  onClick={handleOpenCreate}
                  className="border-2 border-dashed border-muted-foreground/20 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all h-full min-h-[88px]"
                  data-testid="button-add-skill-card"
                >
                  <Plus className="w-6 h-6 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">Add new skill</span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
              <DialogDescription>
                {editingSkill ? "Update the skill details below" : "Fill in the details for your new skill"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name *</Label>
                <Input
                  id="skill-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., React.js, Node.js, PostgreSQL"
                  data-testid="input-skill-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger data-testid="select-skill-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Proficiency Level</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getLevelColor(formData.level)}>
                      {getLevelLabel(formData.level)}
                    </Badge>
                    <span className="text-sm font-mono text-muted-foreground">{formData.level}%</span>
                  </div>
                </div>
                <Slider
                  value={[formData.level]}
                  onValueChange={(value) => setFormData({ ...formData, level: value[0] })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                  data-testid="slider-skill-level"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Beginner</span>
                  <span>Intermediate</span>
                  <span>Expert</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-icon">Icon (optional)</Label>
                <Input
                  id="skill-icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Icon name or URL"
                  data-testid="input-skill-icon"
                />
                <p className="text-xs text-muted-foreground">Leave empty to use default category icon</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-order">Display Order</Label>
                <Input
                  id="skill-order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  data-testid="input-skill-order"
                />
                <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="w-4 h-4 mr-2" /> Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-skill"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {editingSkill ? "Update" : "Create"} Skill
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
