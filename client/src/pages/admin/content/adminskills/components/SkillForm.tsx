import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Skill, SkillFormData } from "../types";
import { skillCategories, getEmptySkillForm, mapSkillToFormData, getLevelLabel, getLevelColor } from "../types";

interface SkillFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSkill: Skill | null;
  onSubmit: (data: SkillFormData, isEditing: boolean) => void;
  isPending: boolean;
}

export function SkillForm({
  open,
  onOpenChange,
  editingSkill,
  onSubmit,
  isPending,
}: SkillFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SkillFormData>(getEmptySkillForm());

  useEffect(() => {
    if (open) {
      if (editingSkill) {
        setFormData(mapSkillToFormData(editingSkill));
      } else {
        setFormData(getEmptySkillForm());
      }
    }
  }, [open, editingSkill]);

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Skill name is required", variant: "destructive" });
      return;
    }
    onSubmit(formData, !!editingSkill);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                {skillCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending} data-testid="button-save-skill">
            {isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {editingSkill ? "Update" : "Create"} Skill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
