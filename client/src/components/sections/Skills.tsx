import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

const defaultSkills = {
  Frontend: [
    { name: "React.js", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Tailwind CSS", level: 95 },
  ],
  Backend: [
    { name: "Node.js", level: 85 },
    { name: "Express", level: 85 },
  ],
  Database: [
    { name: "PostgreSQL", level: 80 },
  ],
  DevOps: [
    { name: "Git & GitHub", level: 95 },
  ],
};

function SkillCard({ name, level, delay }: { name: string; level: number; delay: number }) {
  const getColor = (level: number) => {
    if (level >= 90) return "from-emerald-500 to-emerald-600";
    if (level >= 80) return "from-blue-500 to-blue-600";
    return "from-purple-500 to-purple-600";
  };

  const getProficiency = (level: number) => {
    if (level >= 90) return "Expert";
    if (level >= 80) return "Advanced";
    return "Intermediate";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full group">
        <div className={`absolute inset-0 bg-gradient-to-br ${getColor(level)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        
        <CardContent className="p-6 relative z-10">
          <div className="mb-4">
            <h3 className="font-semibold text-lg text-foreground mb-2">{name}</h3>
            <Badge variant="outline" className="text-xs">
              {getProficiency(level)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Proficiency</span>
              <span className="text-sm font-mono font-bold text-primary">{level}%</span>
            </div>

            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${level}%` }}
                transition={{ duration: 1.5, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true }}
                className={`h-full bg-gradient-to-r ${getColor(level)} rounded-full`}
              />
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-2 right-2 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors duration-300" />
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Skills() {
  const { data: skillsData = [] } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.getSkills(),
    staleTime: 60000,
  });

  const groupedSkills: Record<string, Array<{name: string; level: number}>> = {};

  if (Array.isArray(skillsData) && skillsData.length > 0) {
    skillsData.forEach((skill: any) => {
      const category = skill.category || 'Other';
      if (!groupedSkills[category]) {
        groupedSkills[category] = [];
      }
      groupedSkills[category].push({ name: skill.name, level: skill.level });
    });
  }

  const skills: Record<string, Array<{name: string; level: number}>> = Object.keys(groupedSkills).length > 0 ? groupedSkills : defaultSkills;
  const categories = Object.keys(skills);

  return (
    <section id="skills" className="py-24 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-center mb-4">
            Skills & <span className="bg-gradient-to-r from-primary via-purple-500 to-secondary bg-clip-text text-transparent">Technologies</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mb-6">
            Expertise built through years of hands-on development experience
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
        </motion.div>

        {/* Category Tabs */}
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue={categories[0]?.toLowerCase() || "frontend"} className="w-full">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 mb-12 h-auto p-2 bg-muted/30 backdrop-blur border border-border/50 rounded-xl">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat} 
                    value={cat.toLowerCase()} 
                    className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                    data-testid={`skill-tab-${cat.toLowerCase()}`}
                  >
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </motion.div>

            {/* Skills Grid */}
            <div className="min-h-[350px]">
              {Object.entries(skills).map(([category, items]) => (
                <TabsContent key={category} value={category.toLowerCase()} className="mt-0 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((skill, index) => (
                      <SkillCard 
                        key={skill.name} 
                        name={skill.name} 
                        level={skill.level} 
                        delay={index * 0.1} 
                      />
                    ))}
                  </div>

                  {/* Stats Summary */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    viewport={{ once: true }}
                    className="mt-8 p-4 rounded-lg bg-muted/20 border border-border/50"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{items.length}</p>
                        <p className="text-sm text-muted-foreground">Total Skills</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-emerald-500">
                          {items.filter(s => s.level >= 90).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Expert Level</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-500">
                          {items.filter(s => s.level >= 80 && s.level < 90).length}
                        </p>
                        <p className="text-sm text-muted-foreground">Advanced</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-purple-500">
                          {Math.round(items.reduce((sum, s) => sum + s.level, 0) / items.length)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Avg Proficiency</p>
                      </div>
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
