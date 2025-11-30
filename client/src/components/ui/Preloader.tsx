import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
const hackerTexts = [
  "Initializing system...",
  "Loading kernel modules...",
  "Connecting to secure server...",
  "Decrypting protocols...",
  "Bypassing firewalls...",
  "Access granted...",
];

function MatrixRain({ count = 20 }: { count?: number }) {
  const columns = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${(i / count) * 100}%`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 3,
      chars: Array.from({ length: 15 }, () => 
        matrixChars[Math.floor(Math.random() * matrixChars.length)]
      ),
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      {columns.map((col) => (
        <motion.div
          key={col.id}
          className="absolute top-0 text-green-500 font-mono text-xs leading-tight"
          style={{ left: col.left }}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: col.duration,
            delay: col.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {col.chars.map((char, i) => (
            <div 
              key={i} 
              className="opacity-70"
              style={{ 
                opacity: 1 - (i * 0.06),
                textShadow: i === 0 ? "0 0 10px #00ff00, 0 0 20px #00ff00" : "none"
              }}
            >
              {char}
            </div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(onComplete, 800);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % hackerTexts.length);
    }, 600);
    return () => clearInterval(textInterval);
  }, []);

  useEffect(() => {
    let charIndex = 0;
    const targetText = hackerTexts[currentTextIndex];
    setDisplayText("");
    
    const typeInterval = setInterval(() => {
      if (charIndex <= targetText.length) {
        setDisplayText(targetText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [currentTextIndex]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      <MatrixRain count={25} />

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(0, 255, 0, 0.3)",
                  "0 0 40px rgba(0, 255, 0, 0.5)",
                  "0 0 20px rgba(0, 255, 0, 0.3)",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 border-2 border-green-500 rounded-lg flex items-center justify-center bg-black/80"
            >
              <span className="text-4xl font-mono font-bold text-green-500">
                {"</>"}
              </span>
            </motion.div>
            
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-mono font-bold text-green-500 mb-2 tracking-wider"
          style={{ textShadow: "0 0 10px rgba(0, 255, 0, 0.5)" }}
        >
          LOI_DEVELOPER
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-green-400/70 font-mono text-sm mb-8"
        >
          FULL-STACK // CREATIVE CODER
        </motion.p>

        <div className="w-80 bg-black/50 border border-green-500/30 rounded p-4 font-mono">
          <div className="flex items-center gap-2 mb-3 text-xs text-green-500/70">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="ml-2">terminal@loidev:~$</span>
          </div>
          
          <div className="text-green-400 text-sm min-h-[24px]">
            <span className="text-green-500">$</span> {displayText}
            <span className={`${showCursor ? 'opacity-100' : 'opacity-0'} text-green-500`}>_</span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-xs text-green-500/70 mb-1">
              <span>Loading system...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-green-500/20 rounded overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                style={{ 
                  width: `${progress}%`,
                  boxShadow: "0 0 10px rgba(0, 255, 0, 0.5)"
                }}
              />
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex gap-4 text-xs font-mono text-green-500/50"
        >
          <span>[SECURE]</span>
          <span>[ENCRYPTED]</span>
          <span>[PROTECTED]</span>
        </motion.div>
      </div>

      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-green-500/30">
        <div>SYS.BOOT v2.0.25</div>
        <div>KERNEL: STABLE</div>
      </div>

      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-green-500/30">
        <div>MEM: 16384MB</div>
        <div>CPU: 100%</div>
      </div>
    </motion.div>
  );
}
