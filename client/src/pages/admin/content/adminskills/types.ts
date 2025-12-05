export interface Skill {
  id: number;
  name: string;
  category: string;
  level: number;
  icon: string | null;
  order: number;
  createdAt: Date | null;
}

export interface SkillFormData {
  name: string;
  category: string;
  level: number;
  icon: string;
  order: number;
}

export const skillCategories = ["Frontend", "Backend", "Database", "DevOps", "Tools", "Other"];

export const getEmptySkillForm = (): SkillFormData => ({
  name: "",
  category: "Frontend",
  level: 50,
  icon: "",
  order: 0,
});

export const mapSkillToFormData = (skill: Skill): SkillFormData => ({
  name: skill.name,
  category: skill.category,
  level: skill.level,
  icon: skill.icon || "",
  order: skill.order,
});

export const getLevelLabel = (level: number): string => {
  if (level >= 90) return "Expert";
  if (level >= 70) return "Advanced";
  if (level >= 50) return "Intermediate";
  if (level >= 30) return "Beginner";
  return "Learning";
};

export const getLevelColor = (level: number): string => {
  if (level >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (level >= 70) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (level >= 50) return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
  return "bg-gray-500/10 text-gray-500 border-gray-500/20";
};
