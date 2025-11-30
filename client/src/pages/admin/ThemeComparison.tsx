import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface ThemeComparisonProps {
  currentTheme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    headingFont: string;
    borderRadius: string;
  };
}

export function ThemeComparison({ currentTheme }: ThemeComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);

  const defaultTheme = {
    primaryColor: "#7c3aed",
    secondaryColor: "#ec4899",
    accentColor: "#f59e0b",
    headingFont: "Inter",
    borderRadius: "8",
  };

  const theme = currentTheme || defaultTheme;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Before/After Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
          {/* Before - Default Theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Before</p>
              <div className="space-y-2">
                <div className="w-40 h-10 bg-slate-300 dark:bg-slate-600 rounded" />
                <div className="w-40 h-10 bg-slate-300 dark:bg-slate-600 rounded" />
              </div>
              <button className="px-4 py-2 mt-4 text-white rounded" style={{ backgroundColor: defaultTheme.primaryColor }}>
                Learn More
              </button>
            </div>
          </div>

          {/* After - Current Theme */}
          <div
            className="absolute inset-0 bg-gradient-to-br overflow-hidden"
            style={{ 
              width: `${sliderPosition}%`,
              backgroundImage: `linear-gradient(to bottom right, ${theme.primaryColor}10, ${theme.secondaryColor}10)`
            }}
          >
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <p className="text-sm font-medium" style={{ color: theme.primaryColor }}>
                After
              </p>
              <div className="space-y-2">
                <div 
                  className="w-40 h-10 rounded" 
                  style={{ backgroundColor: `${theme.primaryColor}30` }} 
                />
                <div 
                  className="w-40 h-10 rounded" 
                  style={{ backgroundColor: `${theme.secondaryColor}30` }} 
                />
              </div>
              <button 
                className="px-4 py-2 mt-4 text-white rounded"
                style={{ backgroundColor: theme.primaryColor }}
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize shadow-lg"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={(e) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (!rect) return;

              const handleMouseMove = (moveEvent: MouseEvent) => {
                const newPosition = ((moveEvent.clientX - rect.left) / rect.width) * 100;
                setSliderPosition(Math.max(0, Math.min(100, newPosition)));
              };

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
              };

              document.addEventListener("mousemove", handleMouseMove);
              document.addEventListener("mouseup", handleMouseUp);
            }}
          >
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <div className="text-xs font-bold text-slate-600">⟨⟩</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Drag the slider to compare theme changes</p>
      </CardContent>
    </Card>
  );
}
