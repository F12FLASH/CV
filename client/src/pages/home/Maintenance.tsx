import { useSiteSettings } from "@/context/SiteContext";
import { AlertTriangle, Cpu, Terminal, Shield } from "lucide-react";
import { useEffect, useState } from "react";

export default function Maintenance() {
  const { settings } = useSiteSettings();
  const [progress, setProgress] = useState(0);
  const [glitchText, setGlitchText] = useState("");

  const maintenanceTitle =
    settings.maintenanceTitle || "SYSTEM_UPGRADE_IN_PROGRESS";
  const maintenanceMessage =
    settings.maintenanceMessage ||
    "// Critical infrastructure maintenance underway";
  const maintenanceEstimate = settings.maintenanceEstimate || "ETA: 00:23:17";

  // Glitch effect for title
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_$#@!%^&*";
    let interval: NodeJS.Timeout;

    if (Math.random() > 0.7) {
      interval = setInterval(() => {
        const length = maintenanceTitle.length;
        const positions = Array.from({ length: 2 }, () =>
          Math.floor(Math.random() * length),
        );

        let newText = maintenanceTitle;
        positions.forEach((pos) => {
          newText =
            newText.substring(0, pos) +
            chars[Math.floor(Math.random() * chars.length)] +
            newText.substring(pos + 1);
        });

        setGlitchText(newText);

        setTimeout(() => setGlitchText(""), 100);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [maintenanceTitle]);

  // Progress simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 87 ? 87 : prev + Math.random() * 3));
    }, 800);

    return () => clearInterval(timer);
  }, []);

  // SVG background as constant
  const gridSvg = `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h60v60H0z' fill='none'/%3E%3Cpath d='M30 2l4 8 9 1-6 6 1 9-8-4-8 4 1-9-6-6 9-1z' fill='%2300ff0020' fill-rule='evenodd'/%3E%3C/svg%3E")`;

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono overflow-hidden relative">
      {/* Animated background elements */}
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: gridSvg }}
      ></div>

      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-scan pointer-events-none"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-green-900/[0.02] bg-[size:20px_20px]"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header with status bars */}
          <div className="flex items-center justify-between mb-8 p-4 border border-green-500/30 bg-black/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-900/30 border border-green-500/50">
                <Cpu className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <div className="text-xs text-green-300 uppercase tracking-wider">
                  System Status
                </div>
                <div className="text-green-400 font-bold">MAINTENANCE_MODE</div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-xs text-green-300">Uptime</div>
                <div className="text-green-400 font-bold">99.87%</div>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* Main content */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Left panel - System info */}
            <div className="md:col-span-2 border border-green-500/30 bg-black/70 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <AlertTriangle className="w-8 h-8 text-yellow-500 animate-pulse" />
                <h1 className="text-2xl font-bold text-green-300 tracking-wider">
                  {glitchText || maintenanceTitle}
                </h1>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <Terminal className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <p className="text-green-400 font-medium">
                    {maintenanceMessage}
                  </p>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <p className="text-blue-300 text-sm">{maintenanceEstimate}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs text-green-300 mb-2">
                  <span>System Rebuild Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-green-900/30 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-y-0 left-0 w-4 bg-white/30 animate-shimmer"></div>
                  </div>
                </div>
              </div>

              {/* Status indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Database", status: "Upgrading", color: "yellow" },
                  { label: "API Layer", status: "Rebuilding", color: "blue" },
                  { label: "Security", status: "Active", color: "green" },
                  { label: "Cache", status: "Clearing", color: "purple" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-3 border border-green-500/20 bg-black/50"
                  >
                    <div className="text-xs text-green-300 mb-1">
                      {item.label}
                    </div>
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          item.color === "yellow"
                            ? "bg-yellow-500"
                            : item.color === "blue"
                              ? "bg-blue-500"
                              : item.color === "green"
                                ? "bg-green-500"
                                : "bg-purple-500"
                        } animate-pulse`}
                      ></div>
                      <div
                        className={`text-sm font-bold ${
                          item.color === "yellow"
                            ? "text-yellow-400"
                            : item.color === "blue"
                              ? "text-blue-400"
                              : item.color === "green"
                                ? "text-green-400"
                                : "text-purple-400"
                        }`}
                      >
                        {item.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel - Logs */}
            <div className="border border-green-500/30 bg-black/70 p-6">
              <div className="text-green-300 font-bold mb-4 flex items-center">
                <Terminal className="w-5 h-5 mr-2" />
                SYSTEM LOGS
              </div>
              <div className="space-y-2 text-sm font-mono">
                {[
                  "> Initializing maintenance protocol...",
                  "> Securing active connections... ✓",
                  "> Backing up database tables... ✓",
                  "> Deploying security patches...",
                  "> Optimizing query performance...",
                  "> Testing failover systems...",
                  "> Cleaning temporary files...",
                  "> Preparing restart sequence...",
                ].map((log, index) => (
                  <div
                    key={index}
                    className="text-green-400/80 animate-pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-green-500/30 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm">
              <div className="text-green-500/60 mb-4 md:mb-0">
                <div className="flex items-center space-x-4">
                  <span>Contact:</span>
                  <a
                    href={`mailto:${settings.contactEmail || "sysadmin@domain.com"}`}
                    className="text-green-400 hover:text-green-300 transition-colors underline"
                  >
                    {settings.contactEmail || "sysadmin@domain.com"}
                  </a>
                </div>
              </div>

              <div className="text-green-500/40 text-xs tracking-wider">
                {settings.footerCopyright ||
                  `[${new Date().getFullYear()}] All systems reserved.`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Glitch overlay effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
      </div>

      <style>{`
        @keyframes scan {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100vh);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-scan {
          animation: scan 3s linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .bg-grid-green-900 {
          background-image:
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px);
        }
      `}</style>
    </div>
  );
}
