import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const skills = {
  frontend: [
    { name: "React.js", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Tailwind CSS", level: 95 },
    { name: "Next.js", level: 85 },
    { name: "Three.js", level: 70 },
    { name: "Framer Motion", level: 85 },
  ],
  backend: [
    { name: "Node.js", level: 85 },
    { name: "Express", level: 85 },
    { name: "Python", level: 70 },
    { name: "Go", level: 60 },
  ],
  database: [
    { name: "PostgreSQL", level: 80 },
    { name: "MongoDB", level: 85 },
    { name: "Redis", level: 60 },
    { name: "Supabase", level: 90 },
  ],
  devops: [
    { name: "Git & GitHub", level: 95 },
    { name: "Docker", level: 70 },
    { name: "AWS", level: 60 },
    { name: "CI/CD", level: 75 },
    { name: "Figma", level: 80 },
  ],
};

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  return (
    <div className="mb-6 group">
      <div className="flex justify-between mb-2">
        <span className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">{name}</span>
        <span className="text-sm text-muted-foreground font-mono">{level}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          transition={{ duration: 1.5, delay: delay, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-full relative overflow-hidden"
        >
            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] skew-x-12" />
        </motion.div>
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="py-24 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            Skills & <span className="text-primary">Technologies</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
        </div>

        <Tabs defaultValue="frontend" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-12 h-auto p-1 bg-background/50 backdrop-blur border border-border/50 rounded-xl">
            <TabsTrigger value="frontend" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Front-end</TabsTrigger>
            <TabsTrigger value="backend" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Back-end</TabsTrigger>
            <TabsTrigger value="database" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">Database</TabsTrigger>
            <TabsTrigger value="devops" className="py-3 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-300">DevOps & Tools</TabsTrigger>
          </TabsList>
          
          <div className="min-h-[400px]">
            {Object.entries(skills).map(([category, items]) => (
              <TabsContent key={category} value={category} className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
                    <CardContent className="grid md:grid-cols-2 gap-x-16 gap-y-6 p-8">
                      {items.map((skill, index) => (
                        <SkillBar 
                          key={skill.name} 
                          name={skill.name} 
                          level={skill.level} 
                          delay={index * 0.1} 
                        />
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
}
