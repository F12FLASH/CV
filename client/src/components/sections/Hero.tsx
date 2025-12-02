import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, Download, Terminal, Code2, Shield, Cpu, Database, Wifi, Lock, Server, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const avatarImage = "/uploads/images/futuristic_3d_developer_avatar.png";

function HexagonParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      hue: number;
    }> = [];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
        hue: Math.random() > 0.5 ? 120 : 180,
      });
    }

    const drawHexagon = (x: number, y: number, size: number, opacity: number, hue: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 255, 65, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;

        drawHexagon(p.x, p.y, p.size * 4, p.opacity, p.hue);
      });

      connectParticles();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" />;
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン<>{}[]()#@$%^&*";
    const charArray = chars.split("");
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(15, 23, 42, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        const brightness = Math.random();
        
        if (brightness > 0.98) {
          ctx.fillStyle = "#fff";
          ctx.shadowColor = "#00ff41";
          ctx.shadowBlur = 10;
        } else if (brightness > 0.9) {
          ctx.fillStyle = "#00ff41";
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = `rgba(0, 255, 65, ${0.3 + brightness * 0.4})`;
          ctx.shadowBlur = 0;
        }
        
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

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-30" />;
}

function NeonCircuit() {
  return (
    <svg className="absolute inset-0 w-full h-full z-0 opacity-20" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="neon-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ff41" />
          <stop offset="50%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      
      <motion.path
        d="M0 100 Q 100 50, 200 100 T 400 100 T 600 100 T 800 100 T 1000 100"
        stroke="url(#circuit-gradient)"
        strokeWidth="1"
        fill="none"
        filter="url(#neon-glow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
      />
      
      <motion.path
        d="M0 300 L 150 300 L 200 250 L 350 250 L 400 300 L 600 300"
        stroke="#00ff41"
        strokeWidth="1"
        fill="none"
        filter="url(#neon-glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "loop" }}
      />
      
      <motion.circle cx="200" cy="250" r="5" fill="#00ff41" filter="url(#neon-glow)"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <motion.circle cx="400" cy="300" r="5" fill="#00d4ff" filter="url(#neon-glow)"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity }}
      />
    </svg>
  );
}

function GlitchText({ children, className = "" }: { children: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  return (
    <span 
      className={`glitch-text relative inline-block ${className} ${isGlitching ? 'animate-glitch' : ''}`} 
      data-text={children}
    >
      {children}
    </span>
  );
}

function CyberTerminal({ heroName }: { heroName: string }) {
  const [lines, setLines] = useState<Array<{ text: string; type: string }>>([]);
  const [currentLine, setCurrentLine] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showBlink, setShowBlink] = useState(true);

  const username = heroName.toLowerCase().replace(/\s+/g, "_");
  const terminalLines = [
    { text: `$ ssh ${username}@portfolio.dev`, type: "command" },
    { text: "> Establishing secure connection...", type: "info" },
    { text: "> [OK] Connection established", type: "success" },
    { text: "$ cat /etc/skills.conf", type: "command" },
    { text: "> React | Node.js | TypeScript | Python", type: "data" },
    { text: "> PostgreSQL | Docker | AWS | Linux", type: "data" },
    { text: "$ ./initialize_portfolio.sh --mode=creative", type: "command" },
    { text: "> Loading modules... [████████████] 100%", type: "loading" },
    { text: "> [SUCCESS] System ready!", type: "success" },
  ];

  useEffect(() => {
    const blinkInterval = setInterval(() => setShowBlink(prev => !prev), 530);
    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    if (lineIndex >= terminalLines.length) {
      setTimeout(() => {
        setLines([]);
        setCurrentLine("");
        setLineIndex(0);
        setCharIndex(0);
      }, 4000);
      return;
    }

    const currentText = terminalLines[lineIndex].text;

    if (charIndex < currentText.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(currentText.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
      }, currentText.startsWith("$") ? 60 : 30);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setLines([...lines, { text: currentLine, type: terminalLines[lineIndex].type }]);
        setCurrentLine("");
        setLineIndex(lineIndex + 1);
        setCharIndex(0);
      }, currentText.startsWith("$") ? 800 : 400);
      return () => clearTimeout(timeout);
    }
  }, [lineIndex, charIndex, lines, terminalLines]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "command": return "text-green-400";
      case "success": return "text-cyan-400";
      case "info": return "text-yellow-400";
      case "loading": return "text-purple-400";
      case "data": return "text-blue-400";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="font-mono text-sm space-y-1 overflow-hidden">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={getLineColor(line.type)}
        >
          {line.text}
        </motion.div>
      ))}
      {currentLine && (
        <div className={getLineColor(terminalLines[lineIndex]?.type || "")}>
          {currentLine}
          {showBlink && <span className="text-green-400 ml-0.5">█</span>}
        </div>
      )}
      {!currentLine && lineIndex < terminalLines.length && showBlink && (
        <span className="text-green-400">█</span>
      )}
    </div>
  );
}

function FloatingIcon({ icon: Icon, delay, x, y, color = "primary" }: { icon: any; delay: number; x: string; y: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    primary: "text-green-400 border-green-500/30 bg-green-500/10",
    secondary: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    accent: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.8, type: "spring" }}
      className={`absolute ${x} ${y} hidden lg:block`}
    >
      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, 5, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ duration: 5, repeat: Infinity, delay }}
        className={`p-4 rounded-xl border backdrop-blur-md shadow-lg ${colorClasses[color]}`}
      >
        <Icon className="w-6 h-6" />
      </motion.div>
    </motion.div>
  );
}

function CyberGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="cyber-grid absolute inset-0 opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-50" />
    </div>
  );
}

function ScanLine() {
  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-500/70 to-transparent"
        style={{ boxShadow: "0 0 20px 5px rgba(0, 255, 65, 0.3)" }}
        animate={{ top: ["-2px", "100%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}

function HolographicBorder() {
  return (
    <motion.div
      className="absolute -inset-1 rounded-2xl opacity-70"
      style={{
        background: "linear-gradient(90deg, #00ff41, #00d4ff, #7c3aed, #00ff41)",
        backgroundSize: "300% 100%",
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  );
}

function StatsDisplay() {
  const stats = [
    { label: "PROJECTS", value: "50+", icon: Code2 },
    { label: "EXPERIENCE", value: "5Y+", icon: Zap },
    { label: "CLIENTS", value: "30+", icon: Globe },
  ];

  return (
    <div className="flex gap-6 mt-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 + index * 0.2 }}
          className="flex items-center gap-2"
        >
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/20">
            <stat.icon className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-green-400 font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground font-mono">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function Hero() {
  const [showCursor, setShowCursor] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
      <MatrixRain />
      <HexagonParticles />
      <CyberGrid />
      <NeonCircuit />
      <ScanLine />

      <FloatingIcon icon={Terminal} delay={0.5} x="left-[5%]" y="top-[15%]" color="primary" />
      <FloatingIcon icon={Code2} delay={0.7} x="right-[8%]" y="top-[20%]" color="secondary" />
      <FloatingIcon icon={Shield} delay={0.9} x="left-[8%]" y="bottom-[25%]" color="accent" />
      <FloatingIcon icon={Cpu} delay={1.1} x="right-[5%]" y="bottom-[30%]" color="primary" />
      <FloatingIcon icon={Database} delay={1.3} x="left-[15%]" y="top-[40%]" color="secondary" />
      <FloatingIcon icon={Server} delay={1.5} x="right-[15%]" y="bottom-[45%]" color="accent" />

      <div className="container mx-auto px-4 z-20 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, type: "spring" }}
          className="text-center lg:text-left"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full border border-green-500/40 bg-green-500/10 backdrop-blur-sm mb-8"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-green-400 font-mono text-sm tracking-wider">{heroStatus}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-4"
          >
            <div className="text-lg md:text-xl font-mono text-green-400 flex items-center justify-center lg:justify-start gap-2 mb-2">
              <span className="text-muted-foreground">root@portfolio</span>
              <span className="text-cyan-400">:</span>
              <span className="text-purple-400">~</span>
              <span className="text-muted-foreground">$</span>
              <span className="ml-2">./introduce.sh</span>
              {showCursor && <span className="text-green-400 animate-pulse">█</span>}
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-6 tracking-tighter"
          >
            <GlitchText className="text-gradient block leading-tight">{firstName}</GlitchText>
            <motion.span 
              className="text-foreground block"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              {lastName}
            </motion.span>
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-2xl font-mono text-muted-foreground mb-8 flex items-center justify-center lg:justify-start gap-2"
          >
            <span className="text-green-400">&gt;</span>
            <span className="text-cyan-400">{heroSubtitle.split(" & ")[0] || "Full-stack"}</span>
            <span className="text-muted-foreground/50">&</span>
            <span className="text-purple-400">{heroSubtitle.split(" & ")[1] || "Security Enthusiast"}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative max-w-lg mx-auto lg:mx-0 mb-10"
          >
            <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 via-cyan-500 to-purple-500 rounded-full" />
            <p className="text-lg text-muted-foreground leading-relaxed font-mono pl-4">
              <span className="text-green-400">{"/**"}</span>
              <br />
              <span className="text-foreground/80 ml-2">* {heroDescription}</span>
              <br />
              <span className="text-green-400">{" */"}</span>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
          >
            <Button 
              size="lg" 
              onClick={handleDownloadCV}
              className="relative overflow-hidden bg-green-500 hover:bg-green-400 text-black font-mono font-bold gap-2 shadow-lg shadow-green-500/30 group border-2 border-green-400 px-8"
              data-testid="button-download-cv"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              />
              <Download size={20} className="group-hover:-translate-y-1 transition-transform relative z-10" /> 
              <span className="relative z-10">DOWNLOAD_CV.exe</span>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 font-mono font-bold gap-2 group px-8 backdrop-blur-sm"
              onClick={() => window.location.href = "/projects"}
              data-testid="button-view-projects"
            >
              {heroCTA}
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Button>
          </motion.div>

          <StatsDisplay />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="relative flex items-center justify-center perspective-1000"
        >
          <div className="relative">
            <motion.div 
              className="absolute -inset-6 rounded-3xl opacity-60"
              style={{
                background: "conic-gradient(from 0deg, #00ff41, #00d4ff, #7c3aed, #00ff41)",
                filter: "blur(30px)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            
            <div className="relative">
              <HolographicBorder />
              
              <div className="relative bg-black/90 border border-green-500/40 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center gap-2 mb-4 border-b border-green-500/30 pb-4">
                  <div className="flex gap-2">
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-red-500"
                      whileHover={{ scale: 1.2 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-yellow-500"
                      whileHover={{ scale: 1.2 }}
                    />
                    <motion.div 
                      className="w-3 h-3 rounded-full bg-green-500"
                      whileHover={{ scale: 1.2 }}
                    />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs font-mono text-muted-foreground">
                      terminal@{heroTitle.toLowerCase().replace(/\s+/g, "-").slice(0, 12)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-500 font-mono">SSH</span>
                  </div>
                </div>

                <div className="w-72 md:w-96 h-52 md:h-64 overflow-hidden">
                  <CyberTerminal heroName={heroTitle} />
                </div>

                <div className="mt-4 pt-4 border-t border-green-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="w-14 h-14 rounded-full overflow-hidden border-2 border-green-500/60 shadow-lg shadow-green-500/20"
                        whileHover={{ scale: 1.1, borderColor: "rgba(0, 255, 65, 1)" }}
                      >
                        <img 
                          src={avatarImage} 
                          alt="Developer Avatar" 
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                      <div>
                        <p className="font-mono text-sm text-green-400">
                          @{heroTitle.toLowerCase().replace(/\s+/g, "_").slice(0, 12)}
                        </p>
                        <div className="flex items-center gap-1">
                          <Wifi className="w-3 h-3 text-cyan-400" />
                          <p className="font-mono text-xs text-cyan-400">online</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-green-400 mb-1">UPTIME</p>
                      <p className="font-mono text-lg text-foreground font-bold">99.9%</p>
                    </div>
                  </div>
                </div>
              </div>

              <motion.div
                className="absolute -top-3 -right-3 px-4 py-2 bg-gradient-to-r from-green-500 to-cyan-500 text-black font-mono text-xs font-bold rounded-lg shadow-lg"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(0, 255, 65, 0.5)",
                    "0 0 40px rgba(0, 255, 65, 0.8)",
                    "0 0 20px rgba(0, 255, 65, 0.5)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                VERIFIED DEV
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-green-400 font-mono text-sm"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs tracking-widest opacity-70">SCROLL_DOWN</span>
          <div className="w-6 h-10 border-2 border-green-500/50 rounded-full flex justify-center p-1.5 backdrop-blur-sm">
            <motion.div 
              className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-lg shadow-green-500/50"
              animate={{ y: [0, 18, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
