import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Wrench, Loader2 } from "lucide-react";
import { useSkills, useCreateSkill, useUpdateSkill, useDeleteSkill } from "./hooks";
import { SkillCard, SkillForm } from "./components";
import type { Skill, SkillFormData } from "./types";

export default function AdminSkillsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const { data: skills = [], isLoading } = useSkills();

  const handleFormClose = () => {
    setDialogOpen(false);
    setEditingSkill(null);
  };

  const createMutation = useCreateSkill(handleFormClose);
  const updateMutation = useUpdateSkill(handleFormClose);
  const deleteMutation = useDeleteSkill();

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setDialogOpen(true);
  };

  const handleSubmit = (data: SkillFormData, isEditing: boolean) => {
    if (isEditing && editingSkill) {
      updateMutation.mutate({ id: editingSkill.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Delete skill "${name}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      searchQuery === "" || skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeTab === "all" || skill.category.toLowerCase() === activeTab.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const availableCategories = Array.from(new Set(skills.map((s) => s.category))).filter(
    Boolean
  ) as string[];

  const isPending = createMutation.isPending || updateMutation.isPending;

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
              {availableCategories.map((cat) => (
                <TabsTrigger key={cat} value={cat.toLowerCase()}>
                  {cat} ({skills.filter((s) => s.category === cat).length})
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
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
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

        <SkillForm
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!open) handleFormClose();
            else setDialogOpen(open);
          }}
          editingSkill={editingSkill}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </div>
    </AdminLayout>
  );
}
