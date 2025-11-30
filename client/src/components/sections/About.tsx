import { motion } from "framer-motion";
import { Code, Music, Gamepad, Camera, Plane } from "lucide-react";
import avatarImage from "@assets/generated_images/futuristic_3d_developer_avatar.png"; // Using the same avatar for now or a placeholder

export function About() {
  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-4">
            About <span className="text-primary">Me</span>
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left: Image with Parallax feel */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl rotate-6 opacity-20" />
              <div className="absolute inset-0 bg-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden rotate-0 hover:-rotate-2 transition-transform duration-300">
                <img 
                  src={avatarImage} 
                  alt="Portrait" 
                  className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" 
                />
              </div>
            </div>
          </motion.div>

          {/* Right: Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-foreground">
              Full-stack Developer based in Vietnam 🇻🇳
            </h3>
            <div className="space-y-4 text-muted-foreground text-lg mb-8">
              <p>
                I started my coding journey with a curiosity for how things work on the web. 
                Now, I specialize in building modern, scalable, and user-friendly applications using the latest technologies.
              </p>
              <p>
                My philosophy is simple: <span className="text-primary font-semibold">Code with passion, build with purpose.</span>
                Whether it's a complex backend system or a pixel-perfect frontend interface, I strive for excellence in every line of code.
              </p>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              {[
                { label: "Name", value: "Nguyen Thanh Loi" },
                { label: "Email", value: "loideveloper@example.com" },
                { label: "From", value: "Ho Chi Minh City" },
                { label: "Freelance", value: "Available" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col">
                  <span className="text-sm text-muted-foreground font-mono">{item.label}:</span>
                  <span className="text-foreground font-medium text-lg">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Interests */}
            <div>
              <h4 className="font-bold mb-4 text-foreground">My Interests</h4>
              <div className="flex flex-wrap gap-4">
                {[
                  { icon: Code, label: "Coding" },
                  { icon: Music, label: "Music" },
                  { icon: Gamepad, label: "Gaming" },
                  { icon: Camera, label: "Photo" },
                  { icon: Plane, label: "Travel" },
                ].map((interest, i) => (
                  <div
                    key={i}
                    className="group relative p-3 bg-card border border-border rounded-xl hover:border-primary transition-colors cursor-default"
                  >
                    <interest.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {interest.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
