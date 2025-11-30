import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import avatarImage from "@assets/generated_images/futuristic_3d_developer_avatar.png";

export function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 opacity-30 bg-gradient-to-br from-primary/10 via-background to-secondary/10"></div>

      <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column: Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left"
        >
          <h2 className="text-2xl md:text-3xl font-mono text-primary mb-4">
            <TypeAnimation
              sequence={[
                "Hey there, I'm",
                1000,
                "Xin chào, tôi là",
                1000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
            />
          </h2>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight">
            <span className="text-gradient block">NGUYEN</span>
            <span className="text-foreground">THANH LOI</span>
          </h1>

          <div className="text-xl md:text-2xl font-medium text-muted-foreground mb-8 h-10">
             &gt; <TypeAnimation
              sequence={[
                "Full-stack Developer",
                2000,
                "UI/UX Enthusiast",
                2000,
                "Problem Solver",
                2000,
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="text-secondary"
            />
          </div>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 mb-10 leading-relaxed">
            Crafting digital experiences with code and creativity. I build accessible, pixel-perfect, and performant web applications.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 shadow-lg shadow-primary/25 group">
              <Download size={20} className="group-hover:-translate-y-1 transition-transform" /> 
              Download CV
            </Button>
            <Button size="lg" variant="outline" className="border-foreground/20 hover:bg-foreground/5 gap-2 group">
              View My Work
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Right Column: 3D Interactive Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[500px] w-full flex items-center justify-center perspective-1000"
        >
          {/* Simulated 3D Effect with CSS since we have a static image */}
          <div className="relative w-80 h-80 md:w-96 md:h-96 group preserve-3d hover:rotate-y-12 transition-transform duration-500 ease-out cursor-pointer">
             {/* Glow effect */}
             <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-full blur-[80px] opacity-40 animate-pulse" />
             
             {/* Avatar Image Container */}
             <div className="relative w-full h-full rounded-full border-4 border-white/10 bg-black/20 backdrop-blur-sm overflow-hidden shadow-2xl transform transition-transform hover:scale-105">
               <img 
                 src={avatarImage} 
                 alt="3D Avatar" 
                 className="w-full h-full object-cover"
               />
               
               {/* Floating elements */}
               <div className="absolute top-10 right-10 w-12 h-12 bg-secondary/20 rounded-full blur-xl animate-bounce" />
               <div className="absolute bottom-20 left-10 w-8 h-8 bg-primary/30 rounded-full blur-lg animate-ping" />
             </div>

             {/* Orbiting Elements (CSS Animation) */}
             <div className="absolute inset-[-20px] border border-white/10 rounded-full animate-spin-slow" style={{ animationDuration: '10s' }} />
             <div className="absolute inset-[-40px] border border-white/5 rounded-full animate-spin-slow-reverse" style={{ animationDuration: '15s' }} />
          </div>
        </motion.div>
      </div>

      {/* Scroll Down Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted-foreground"
      >
        <div className="w-6 h-10 border-2 border-current rounded-full flex justify-center p-1">
          <div className="w-1 h-1 bg-current rounded-full animate-scroll-down" />
        </div>
      </motion.div>
    </section>
  );
}
