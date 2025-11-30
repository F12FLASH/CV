import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const hackerTexts = [
  "Initializing system...",
  "Connecting to database...",
  "Loading components...",
  "Access granted...",
];

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + Math.random() * 3;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    const textTimer = setInterval(() => {
      setTextIndex((i) => (i + 1) % hackerTexts.length);
    }, 1200);
    return () => clearInterval(textTimer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="mb-8 inline-block"
        >
          <div className="w-16 h-16 border-2 border-green-500 rounded flex items-center justify-center" style={{ boxShadow: "0 0 20px rgba(0,255,0,0.3)" }}>
            <span className="text-3xl font-mono text-green-500">{"</>"}</span>
          </div>
        </motion.div>

        <h1 className="text-2xl font-mono font-bold text-green-500 mb-4" style={{ textShadow: "0 0 10px rgba(0, 255, 0, 0.5)" }}>
          LOADING
        </h1>

        <div className="w-64 bg-black/70 border border-green-500/40 rounded p-4 font-mono">
          <div className="text-green-400 text-xs mb-3 min-h-[20px]">$ {hackerTexts[textIndex]}</div>
          <div className="h-1 bg-green-500/20 rounded overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              style={{ width: `${Math.min(progress, 100)}%`, boxShadow: "0 0 8px rgba(0,255,0,0.6)" }}
            />
          </div>
          <div className="text-xs text-green-500/60 mt-2 text-right">{Math.round(progress)}%</div>
        </div>
      </div>
    </motion.div>
  );
}
