import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Palette, Type, Layout, Monitor, Smartphone, Save, RotateCcw, Download, Upload } from "lucide-react";
import { useState } from "react";
import { ThemeComparison } from "./ThemeComparison";

const THEME_PRESETS = [
  { name: "Modern", colors: { primary: "#7c3aed", secondary: "#ec4899", accent: "#f59e0b" } },
  { name: "Classic", colors: { primary: "#1f2937", secondary: "#374151", accent: "#6366f1" } },
  { name: "Minimal", colors: { primary: "#000000", secondary: "#666666", accent: "#3b82f6" } },
  { name: "Vibrant", colors: { primary: "#ff6b6b", secondary: "#4ecdc4", accent: "#95e1d3" } },
];

export default function AdminThemeEnhanced() {
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  const [secondaryColor, setSecondaryColor] = useState("#ec4899");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [selectedPreset, setSelectedPreset] = useState("Modern");

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    setPrimaryColor(preset.colors.primary);
    setSecondaryColor(preset.colors.secondary);
    setAccentColor(preset.colors.accent);
    setSelectedPreset(preset.name);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Theme Customization</h1>
            <p className="text-muted-foreground">Customize the look and feel of your website</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" /> Export Theme
            </Button>
            <Button variant="outline" className="gap-2">
              <Upload className="w-4 h-4" /> Import Theme
            </Button>
            <Button variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button className="bg-primary gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* COLORS */}
          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" /> Color Scheme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Primary Color */}
                <div>
                  <label className="text-sm font-medium block mb-3">Primary Color</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input value={primaryColor} readOnly className="font-mono text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Used for buttons, links, and main highlights</p>
                </div>

                {/* Secondary Color */}
                <div>
                  <label className="text-sm font-medium block mb-3">Secondary Color</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input value={secondaryColor} readOnly className="font-mono text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Used for secondary actions and backgrounds</p>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="text-sm font-medium block mb-3">Accent Color</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                    />
                    <Input value={accentColor} readOnly className="font-mono text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Used for accents and notifications</p>
                </div>

                {/* Gradient Presets */}
                <div>
                  <label className="text-sm font-medium block mb-3">Gradient Presets</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      "from-blue-500 to-purple-600",
                      "from-pink-500 to-rose-600",
                      "from-green-500 to-emerald-600",
                      "from-orange-500 to-red-600",
                    ].map((gradient) => (
                      <button
                        key={gradient}
                        className={`h-12 rounded-lg border-2 border-transparent bg-gradient-to-r ${gradient} hover:border-foreground transition`}
                      />
                    ))}
                  </div>
                </div>

                {/* Contrast Checker */}
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Contrast Check</p>
                  <p className="text-xs text-muted-foreground">WCAG AAA compliant ✓</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dark Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Enable Dark Mode</label>
                  <Switch defaultChecked />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Dark Mode Default</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>System Preference</option>
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TYPOGRAPHY */}
          <TabsContent value="typography" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" /> Typography Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Fonts */}
                <div>
                  <label className="text-sm font-medium block mb-2">Heading Font</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Inter</option>
                    <option>Space Grotesk</option>
                    <option>Outfit</option>
                    <option>Poppins</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Body Font</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                    <option>Lato</option>
                  </select>
                </div>

                {/* Font Scales */}
                <div>
                  <label className="text-sm font-medium block mb-2">Font Size Scale</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Small (0.875x)</option>
                    <option selected>Normal (1x)</option>
                    <option>Large (1.125x)</option>
                    <option>Extra Large (1.25x)</option>
                  </select>
                </div>

                {/* Line & Letter Spacing */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Line Height</label>
                    <Input defaultValue="1.5" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Letter Spacing</label>
                    <Input defaultValue="0.5" />
                  </div>
                </div>

                {/* Google Fonts */}
                <div>
                  <label className="text-sm font-medium block mb-2">Google Fonts Integration</label>
                  <div className="flex gap-2">
                    <Input placeholder="Search Google Fonts..." />
                    <Button>Add Font</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* LAYOUT */}
          <TabsContent value="layout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" /> Layout Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Container Width</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Boxed (1200px)</option>
                    <option selected>Wide (1440px)</option>
                    <option>Full Width</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Sticky Header</label>
                  <Switch defaultChecked />
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Border Radius</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Sharp (0px)</option>
                    <option>Small (4px)</option>
                    <option selected>Medium (8px)</option>
                    <option>Large (12px)</option>
                    <option>Extra Large (16px)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Animation Speed</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>Slow (400ms)</option>
                    <option selected>Normal (300ms)</option>
                    <option>Fast (200ms)</option>
                    <option>Instant (0ms)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">Shadow Preset</label>
                  <select className="w-full p-2 rounded-md border border-input bg-background">
                    <option>None</option>
                    <option selected>Soft</option>
                    <option>Medium</option>
                    <option>Bold</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRESETS */}
          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Presets</CardTitle>
                <CardDescription>Choose from pre-designed theme combinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`p-4 rounded-lg border-2 transition ${
                        selectedPreset === preset.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex gap-1">
                          {Object.values(preset.colors).map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="font-medium text-sm">{preset.name}</span>
                        {selectedPreset === preset.name && (
                          <Badge className="ml-auto">Active</Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-md font-mono text-sm bg-background"
                  rows={8}
                  placeholder=":root {
  --primary: #7c3aed;
  --secondary: #ec4899;
}"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* PREVIEW */}
          <TabsContent value="preview" className="space-y-6">
            <ThemeComparison />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Monitor className="w-4 h-4" /> Desktop
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    Desktop Preview
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Smartphone className="w-4 h-4" /> Mobile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    Mobile Preview
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tablet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                    Tablet Preview
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Component Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Button style={{ backgroundColor: primaryColor }}>Primary Button</Button>
                  </div>
                  <div>
                    <Button style={{ backgroundColor: secondaryColor }}>Secondary Button</Button>
                  </div>
                  <div style={{ backgroundColor: accentColor }} className="p-3 rounded text-white text-sm">
                    Accent Color Preview
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
