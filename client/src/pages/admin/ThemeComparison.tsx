import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function ThemeComparison() {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Before/After Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
          {/* Before */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-white text-sm mb-2">Before</p>
              <div className="space-y-2">
                <div className="w-40 h-10 bg-slate-700 rounded" />
                <div className="w-40 h-10 bg-slate-700 rounded" />
              </div>
            </div>
          </div>

          {/* After */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 overflow-hidden"
            style={{ width: `${sliderPosition}%` }}
          >
            <div className="h-full flex flex-col items-center justify-center">
              <p className="text-white text-sm mb-2">After</p>
              <div className="space-y-2">
                <div className="w-40 h-10 bg-purple-400 rounded" />
                <div className="w-40 h-10 bg-purple-400 rounded" />
              </div>
            </div>
          </div>

          {/* Slider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize"
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
              <div className="text-xs font-bold text-purple-600">⟨⟩</div>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">Drag the slider to compare theme changes</p>
      </CardContent>
    </Card>
  );
}
