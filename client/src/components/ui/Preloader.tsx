import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  
  const text = "Loi Developer - Full-stack - Creative Coder ";
  const characters = text.split("");

  useEffect(() => {
    // Faster preloader for better UX
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1; // Smooth increment
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(onComplete, 1000);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white overflow-hidden"
    >
      {/* 3D Text Spiral Effect */}
      <div className="relative w-full h-full flex items-center justify-center perspective-1000">
        <div className="relative w-[600px] h-[600px] flex items-center justify-center">
           <motion.div 
             className="absolute inset-0 flex items-center justify-center"
             animate={{ rotate: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
           >
             {characters.map((char, i) => {
               const angle = (i / characters.length) * 360;
               const radius = 120 + (i * 2); // Spiral out
               return (
                 <motion.span
                   key={i}
                   className="absolute text-2xl font-bold font-mono text-primary/80 uppercase tracking-widest"
                   style={{
                     transform: `rotate(${angle}deg) translate(${radius}px) rotate(90deg)`,
                     transformOrigin: "center center",
                   }}
                   animate={{
                     opacity: [0.2, 1, 0.2],
                     scale: [0.8, 1.2, 0.8],
                     color: ["#7c3aed", "#ffffff", "#7c3aed"]
                   }}
                   transition={{
                     duration: 3,
                     repeat: Infinity,
                     delay: i * 0.05,
                   }}
                 >
                   {char}
                 </motion.span>
               );
             })}
           </motion.div>
           
           {/* Center pulsing text */}
           <motion.div
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 1, delay: 0.5 }}
             className="absolute z-10 text-center"
           >
              <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-primary to-white animate-gradient-x">
                 LOI
              </h1>
           </motion.div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-purple-400 to-white shadow-[0_0_15px_rgba(124,58,237,1)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="absolute bottom-8 right-8 font-mono text-2xl font-bold text-white/20">
        {progress}%
      </div>
    </motion.div>
  );
}
