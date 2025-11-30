import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Faster preloader for better UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // Increased increment speed
      });
    }, 20);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(onComplete, 800);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(20px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* 3D Text Spiral Effect Simulation - Enhanced */}
      <div className="relative w-full h-full flex items-center justify-center perspective-1000 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background">
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
           <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
           {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                rotateZ: [0, 360],
                scale: [1, 1.5, 1],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: i * 1,
              }}
              className={`absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full border border-primary/30`}
              style={{
                borderStyle: i % 2 === 0 ? "solid" : "dashed",
                borderWidth: "1px"
              }}
            />
          ))}
          
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-2 backdrop-blur-sm p-8 rounded-full bg-black/30 border border-white/5"
          >
             <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">
                LOI
             </h1>
             <div className="text-xs md:text-sm font-mono text-primary tracking-[0.5em] uppercase">
                Developer
             </div>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar - Enhanced */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-secondary shadow-[0_0_20px_rgba(124,58,237,0.8)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="absolute bottom-8 right-8 font-mono text-4xl font-bold text-white/10 select-none">
        {progress < 10 ? `0${progress}` : progress}
      </div>
    </motion.div>
  );
}
