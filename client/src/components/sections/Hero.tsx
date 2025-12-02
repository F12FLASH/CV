import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ArrowRight, Download, Terminal, Code2, Shield, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const avatarImage = "/uploads/images/futuristic_3d_developer_avatar.png";

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
    const charArray = chars.split("");
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff41";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillStyle = Math.random() > 0.98 ? "#fff" : "#00ff41";
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 opacity-20"
    />
  );
}

function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`glitch-text relative inline-block ${className}`} data-text={children}>
      {children}
    </span>
  );
}

function TerminalTyping({ heroName }: { heroName: string }) {
  const [lines, setLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const username = heroName.toLowerCase().replace(/\s+/g, "_");
  const terminalLines = [
    "$ whoami",
    `> ${username}`,
    "$ cat skills.txt",
    "> React, Node.js, TypeScript, Python...",
    "$ ./run_portfolio.sh",
    "> Initializing creative mode...",
    "> [SUCCESS] Portfolio loaded!",
  ];

  useEffect(() => {
    if (lineIndex >= terminalLines.length) {
      setTimeout(() => {
        setLines([]);
        setCurrentLine("");
        setLineIndex(0);
        setCharIndex(0);
      }, 3000);
      return;
    }

    const currentText = terminalLines[lineIndex];

    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, currentText.startsWith("$") ? 80 : 40);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setLines([...lines, currentLine]);
        setCurrentLine("");
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }, currentText.startsWith(">") ? 500 : 800);
      return () => clearTimeout(timeout);
    }
  }, [lineIndex, charIndex, lines, terminalLines]);

  return (
    <div className="font-mono text-sm">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`${
            line.startsWith("$") ? "text-green-400" : 
            line.includes("SUCCESS") ? "text-cyan-400" : "text-muted-foreground"
          }`}
        >
          {line}
        </div>
      ))}
      {currentLine && (
        <div className={`${currentLine.startsWith("$") ? "text-green-400" : "text-muted-foreground"}`}>
          {currentLine}
          <span className="animate-pulse">█</span>
        </div>
      )}
    </div>
  );
}

function FloatingIcon({ icon: Icon, delay, x, y }: { icon: any; delay: number; x: string; y: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className={`absolute ${x} ${y} hidden md:block`}
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, delay }}
        className="p-3 rounded-xl bg-primary/10 border border-primary/20 backdrop-blur-sm"
      >
        <Icon className="w-6 h-6 text-primary" />
      </motion.div>
    </motion.div>
  );
}

function CyberGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden opacity-10">
      <div className="cyber-grid absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
}

function ScanLine() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent"
        animate={{ top: ["-2px", "100%"] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

export function Hero() {
  const [showCursor, setShowCursor] = useState(true);

  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5,
  });

  const heroTitle = settings?.heroTitle || "NGUYEN THANH LOI";
  const heroSubtitle = settings?.heroSubtitle || "Full-stack Developer & Security Enthusiast";
  const heroDescription = settings?.heroDescription || "Crafting secure & performant digital experiences with code";
  const heroStatus = settings?.heroStatus || "SYSTEM ONLINE";
  const heroCTA = settings?.heroCTA || "View My Work";

  const cvFileUrl = settings?.cvFileUrl || "";

  const handleDownloadCV = () => {
    if (!cvFileUrl) {
      alert("CV file not configured. Please upload a CV in Settings → General → Hero Section → CV File Management");
      return;
    }
    const link = document.createElement("a");
    link.href = cvFileUrl;
    link.download = cvFileUrl.split("/").pop() || "CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const nameParts = heroTitle.split(" ");
  const firstName = nameParts[0] || "NGUYEN";
  const lastName = nameParts.slice(1).join(" ") || "THANH LOI";

  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <MatrixRain />
      <CyberGrid />
      <ScanLine />

      <FloatingIcon icon={Terminal} delay={0.5} x="left-[10%]" y="top-[20%]" />
      <FloatingIcon icon={Code2} delay={0.7} x="right-[15%]" y="top-[25%]" />
      <FloatingIcon icon={Shield} delay={0.9} x="left-[15%]" y="bottom-[30%]" />
      <FloatingIcon icon={Cpu} delay={1.1} x="right-[10%]" y="bottom-[25%]" />

      <div className="container mx-auto px-4 z-20 grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/30 bg-green-500/10 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-400 font-mono text-sm">{heroStatus}</span>
          </motion.div>

          <h2 className="text-xl md:text-2xl font-mono text-green-400 mb-4 flex items-center justify-center md:justify-start gap-2">
            <span className="text-muted-foreground">root@portfolio:~$</span>
            <span>./introduce.sh</span>
            {showCursor && <span className="text-green-400">█</span>}
          </h2>
          
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 tracking-tight">
            <GlitchText className="text-gradient block">{firstName}</GlitchText>
            <span className="text-foreground">{lastName}</span>
          </h1>

          <div className="text-xl md:text-2xl font-mono text-muted-foreground mb-8 h-10 flex items-center justify-center md:justify-start">
            <span className="text-green-400 mr-2">&gt;</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="hacker-typewriter"
            >
              <span className="text-cyan-400">{heroSubtitle.split(" & ")[0] || "Full-stack"}</span>
              <span className="text-muted-foreground"> & </span>
              <span className="text-purple-400">{heroSubtitle.split(" & ")[1] || "Security Enthusiast"}</span>
            </motion.span>
          </div>

          <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0 mb-10 leading-relaxed font-mono">
            <span className="text-green-400">/**</span><br/>
            <span className="ml-4">* {heroDescription}</span><br/>
            <span className="text-green-400">*/</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button 
              size="lg" 
              onClick={handleDownloadCV}
              className="bg-green-500 hover:bg-green-600 text-black font-mono gap-2 shadow-lg shadow-green-500/25 group border border-green-400"
              data-testid="button-download-cv"
            >
              <Download size={20} className="group-hover:-translate-y-1 transition-transform" /> 
              DOWNLOAD_CV.exe
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-green-500/50 text-green-400 hover:bg-green-500/10 font-mono gap-2 group"
              onClick={() => window.location.href = "/projects"}
              data-testid="button-view-projects"
            >
              {heroCTA}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
            
            <div className="relative bg-black/80 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-green-500/20 pb-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-xs font-mono text-muted-foreground ml-2">terminal@portfolio ~ </span>
              </div>

              <div className="w-64 md:w-80 h-48 md:h-56">
                <TerminalTyping heroName={heroTitle} />
              </div>

              <div className="mt-4 pt-4 border-t border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-500/50">
                      <img 
                        src={avatarImage} 
                        alt="Developer Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-green-400">@{heroTitle.toLowerCase().replace(/\s+/g, "_").slice(0, 10)}</p>
                      <p className="font-mono text-xs text-muted-foreground">status: coding...</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-green-400">UPTIME</p>
                    <p className="font-mono text-sm text-muted-foreground">99.9%</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-black font-mono text-xs rounded"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              VERIFIED
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-green-400 font-mono text-sm"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="opacity-70">SCROLL_DOWN</span>
          <div className="w-6 h-10 border-2 border-green-500/50 rounded-full flex justify-center p-1">
            <motion.div 
              className="w-1.5 h-1.5 bg-green-400 rounded-full"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
