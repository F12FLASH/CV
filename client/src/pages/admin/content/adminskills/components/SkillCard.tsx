import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Code, Database, Server, Wrench } from "lucide-react";
import type { Skill } from "../types";
import { getLevelLabel, getLevelColor } from "../types";

interface SkillCardProps {
  skill: Skill;
  onEdit: (skill: Skill) => void;
  onDelete: (id: number, name: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "frontend":
      return <Code className="w-6 h-6 text-blue-500" />;
    case "backend":
      return <Server className="w-6 h-6 text-green-500" />;
    case "database":
      return <Database className="w-6 h-6 text-yellow-500" />;
    case "devops":
    case "tools":
    default:
      return <Wrench className="w-6 h-6 text-purple-500" />;
  }
};

export function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  return (
    <Card
      className="group hover:border-primary/50 transition-colors"
      data-testid={`card-skill-${skill.id}`}
    >
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
            {getCategoryIcon(skill.category)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold truncate">{skill.name}</h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant="secondary"
                className={`text-[10px] ${getLevelColor(skill.level)}`}
              >
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
            onClick={() => onEdit(skill)}
            data-testid={`button-edit-skill-${skill.id}`}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => onDelete(skill.id, skill.name)}
            data-testid={`button-delete-skill-${skill.id}`}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
