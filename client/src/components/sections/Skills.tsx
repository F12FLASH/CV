import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

const skills = {
  frontend: [
    { name: "React.js", level: 90 },
    { name: "TypeScript", level: 85 },
    { name: "Tailwind CSS", level: 95 },
    { name: "Next.js", level: 80 },
    { name: "Three.js", level: 60 },
  ],
  backend: [
    { name: "Node.js", level: 85 },
    { name: "Express", level: 80 },
    { name: "PostgreSQL", level: 75 },
    { name: "GraphQL", level: 70 },
  ],
  tools: [
    { name: "Git & GitHub", level: 90 },
    { name: "Docker", level: 65 },
    { name: "Figma", level: 75 },
    { name: "VS Code", level: 95 },
  ],
};

function SkillBar({ name, level, delay }: { name: string; level: number; delay: number }) {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-sm text-muted-foreground font-mono">{level}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          transition={{ duration: 1, delay: delay, ease: "easeOut" }}
          viewport={{ once: true }}
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
        />
      </div>
    </div>
  );
}

export function Skills() {
  return (
    <section id="skills" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            Skills & <span className="text-secondary">Tech</span>
          </h2>
          <div className="w-20 h-1 bg-secondary rounded-full" />
        </div>

        <Tabs defaultValue="frontend" className="w-full max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="frontend">Front-end</TabsTrigger>
            <TabsTrigger value="backend">Back-end</TabsTrigger>
            <TabsTrigger value="tools">Tools & DevOps</TabsTrigger>
          </TabsList>
          
          {Object.entries(skills).map(([category, items]) => (
            <TabsContent key={category} value={category}>
              <Card className="border-none bg-transparent shadow-none">
                <CardContent className="grid md:grid-cols-2 gap-x-12 gap-y-4">
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
