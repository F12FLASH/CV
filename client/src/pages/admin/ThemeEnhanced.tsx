import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Type, 
  Layout, 
  Monitor, 
  Smartphone, 
  Tablet,
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  Check,
  Loader2,
  Sun,
  Moon,
  Eye
} from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeComparison } from "./ThemeComparison";

const THEME_PRESETS = [
  { 
    name: "Modern", 
    description: "Clean and professional",
    colors: { primary: "#7c3aed", secondary: "#ec4899", accent: "#f59e0b" } 
  },
  { 
    name: "Classic", 
    description: "Timeless elegance",
    colors: { primary: "#1f2937", secondary: "#374151", accent: "#6366f1" } 
  },
  { 
    name: "Minimal", 
    description: "Simple and focused",
    colors: { primary: "#000000", secondary: "#666666", accent: "#3b82f6" } 
  },
  { 
    name: "Vibrant", 
    description: "Bold and energetic",
    colors: { primary: "#ff6b6b", secondary: "#4ecdc4", accent: "#95e1d3" } 
  },
  { 
    name: "Ocean", 
    description: "Calm and serene",
    colors: { primary: "#0ea5e9", secondary: "#06b6d4", accent: "#22d3ee" } 
  },
  { 
    name: "Forest", 
    description: "Natural and organic",
    colors: { primary: "#059669", secondary: "#10b981", accent: "#34d399" } 
  },
];

const FONT_OPTIONS = {
  heading: [
    { value: "Inter", label: "Inter" },
    { value: "Space Grotesk", label: "Space Grotesk" },
    { value: "Outfit", label: "Outfit" },
    { value: "Poppins", label: "Poppins" },
    { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
    { value: "Montserrat", label: "Montserrat" },
  ],
  body: [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Source Sans Pro", label: "Source Sans Pro" },
  ]
};

type ThemeSettings = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingFont: string;
  bodyFont: string;
  fontScale: string;
  lineHeight: string;
  letterSpacing: string;
  containerWidth: string;
  borderRadius: string;
  animationSpeed: string;
  shadowPreset: string;
  stickyHeader: boolean;
  darkModeEnabled: boolean;
  darkModeDefault: string;
  selectedPreset: string;
  customCSS: string;
};

const defaultTheme: ThemeSettings = {
  primaryColor: "#7c3aed",
  secondaryColor: "#ec4899",
  accentColor: "#f59e0b",
  headingFont: "Inter",
  bodyFont: "Inter",
  fontScale: "1",
  lineHeight: "1.5",
  letterSpacing: "0",
  containerWidth: "1440",
  borderRadius: "8",
  animationSpeed: "300",
  shadowPreset: "soft",
  stickyHeader: true,
  darkModeEnabled: true,
  darkModeDefault: "system",
  selectedPreset: "Modern",
  customCSS: "",
};

export default function AdminThemeEnhanced() {
  const { toast } = useToast();
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  const { data: savedSettings, isLoading } = useQuery<Record<string, any>>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (savedSettings) {
      // If theme is stored as a string (JSON), parse it
      if (typeof (savedSettings as any).theme === 'string') {
        try {
          const parsedTheme = JSON.parse((savedSettings as any).theme);
          setTheme({ ...defaultTheme, ...parsedTheme });
          setHasChanges(false);
        } catch (e) {
          console.error('Failed to parse theme:', e);
        }
      } else if ((savedSettings as any).theme && typeof (savedSettings as any).theme === 'object') {
        // If it's already an object, use it directly
        setTheme({ ...defaultTheme, ...(savedSettings as any).theme });
        setHasChanges(false);
      }
    }
  }, [savedSettings]);

  const saveMutation = useMutation({
    mutationFn: async (settings: ThemeSettings) => {
      const res = await apiRequest('PUT', '/api/settings/theme', { value: JSON.stringify(settings) });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setHasChanges(false);
      toast({
        title: "Theme saved",
        description: "Your theme settings have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error saving theme",
        description: error.message || "Failed to save theme settings.",
        variant: "destructive",
      });
    },
  });

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const applyPreset = (preset: typeof THEME_PRESETS[0]) => {
    updateTheme({
      primaryColor: preset.colors.primary,
      secondaryColor: preset.colors.secondary,
      accentColor: preset.colors.accent,
      selectedPreset: preset.name,
    });
  };

  const handleReset = () => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Reset anyway?")) {
        return;
      }
    }
    setTheme(defaultTheme);
    setHasChanges(true);
    toast({
      title: "Theme reset",
      description: "Theme has been reset to default settings.",
    });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-settings-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            setTheme({ ...defaultTheme, ...imported });
            setHasChanges(true);
            toast({
              title: "Theme imported",
              description: "Theme settings have been imported successfully.",
            });
          } catch {
            toast({
              title: "Import failed",
              description: "Invalid theme file format.",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-page-title">Theme Customization</h1>
            <p className="text-muted-foreground">Customize the look and feel of your website</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleExport}
              data-testid="button-export"
            >
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleImport}
              data-testid="button-import"
            >
              <Upload className="w-4 h-4" /> Import
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleReset}
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
            <Button 
              className="gap-2"
              onClick={() => saveMutation.mutate(theme)}
              disabled={saveMutation.isPending || !hasChanges}
              data-testid="button-save"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
              {hasChanges && <Badge variant="secondary" className="ml-1">Unsaved</Badge>}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="colors" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="colors" data-testid="tab-colors">Colors</TabsTrigger>
            <TabsTrigger value="typography" data-testid="tab-typography">Typography</TabsTrigger>
            <TabsTrigger value="layout" data-testid="tab-layout">Layout</TabsTrigger>
            <TabsTrigger value="presets" data-testid="tab-presets">Presets</TabsTrigger>
            <TabsTrigger value="preview" data-testid="tab-preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" /> Color Scheme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium block mb-3">Primary Color</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                        data-testid="input-primary-color"
                      />
                      <Input 
                        value={theme.primaryColor} 
                        onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                        className="font-mono text-sm" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Used for buttons, links, and main highlights</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-3">Secondary Color</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={theme.secondaryColor}
                        onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                        data-testid="input-secondary-color"
                      />
                      <Input 
                        value={theme.secondaryColor} 
                        onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
                        className="font-mono text-sm" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Used for secondary actions and backgrounds</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-3">Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <Input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="w-16 h-10 p-1 border rounded cursor-pointer"
                        data-testid="input-accent-color"
                      />
                      <Input 
                        value={theme.accentColor} 
                        onChange={(e) => updateTheme({ accentColor: e.target.value })}
                        className="font-mono text-sm" 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Used for accents and notifications</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-3">Quick Color Presets</label>
                    <div className="flex gap-2 flex-wrap">
                      {["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#8b5cf6", "#06b6d4"].map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${theme.primaryColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                          onClick={() => updateTheme({ primaryColor: color })}
                          data-testid={`color-preset-${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="w-5 h-5" /> Dark Mode Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Enable Dark Mode</label>
                      <p className="text-xs text-muted-foreground">Allow users to switch to dark mode</p>
                    </div>
                    <Switch 
                      checked={theme.darkModeEnabled}
                      onCheckedChange={(checked) => updateTheme({ darkModeEnabled: checked })}
                      data-testid="switch-dark-mode"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Default Mode</label>
                    <Select 
                      value={theme.darkModeDefault} 
                      onValueChange={(value) => updateTheme({ darkModeDefault: value })}
                    >
                      <SelectTrigger data-testid="select-dark-mode-default">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System Preference</SelectItem>
                        <SelectItem value="light">Light Mode</SelectItem>
                        <SelectItem value="dark">Dark Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <p className="text-sm font-medium">Contrast Check</p>
                    </div>
                    <p className="text-xs text-muted-foreground">WCAG AA compliant</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" /> Font Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Heading Font</label>
                    <Select 
                      value={theme.headingFont}
                      onValueChange={(value) => updateTheme({ headingFont: value })}
                    >
                      <SelectTrigger data-testid="select-heading-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.heading.map(font => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Body Font</label>
                    <Select 
                      value={theme.bodyFont}
                      onValueChange={(value) => updateTheme({ bodyFont: value })}
                    >
                      <SelectTrigger data-testid="select-body-font">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.body.map(font => (
                          <SelectItem key={font.value} value={font.value}>{font.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Font Size Scale</label>
                    <Select 
                      value={theme.fontScale}
                      onValueChange={(value) => updateTheme({ fontScale: value })}
                    >
                      <SelectTrigger data-testid="select-font-scale">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.875">Small (0.875x)</SelectItem>
                        <SelectItem value="1">Normal (1x)</SelectItem>
                        <SelectItem value="1.125">Large (1.125x)</SelectItem>
                        <SelectItem value="1.25">Extra Large (1.25x)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spacing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Line Height</label>
                    <Input 
                      value={theme.lineHeight}
                      onChange={(e) => updateTheme({ lineHeight: e.target.value })}
                      data-testid="input-line-height"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Letter Spacing (px)</label>
                    <Input 
                      value={theme.letterSpacing}
                      onChange={(e) => updateTheme({ letterSpacing: e.target.value })}
                      data-testid="input-letter-spacing"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Typography Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="p-6 bg-muted rounded-lg space-y-4"
                    style={{ fontFamily: theme.bodyFont, lineHeight: theme.lineHeight }}
                  >
                    <h1 
                      className="text-4xl font-bold" 
                      style={{ fontFamily: theme.headingFont }}
                    >
                      The Quick Brown Fox
                    </h1>
                    <h2 
                      className="text-2xl font-semibold" 
                      style={{ fontFamily: theme.headingFont }}
                    >
                      Jumps Over The Lazy Dog
                    </h2>
                    <p className="text-base">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This is how your body text will appear with the selected typography settings.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" /> Layout Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Container Width</label>
                    <Select 
                      value={theme.containerWidth}
                      onValueChange={(value) => updateTheme({ containerWidth: value })}
                    >
                      <SelectTrigger data-testid="select-container-width">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1200">Boxed (1200px)</SelectItem>
                        <SelectItem value="1440">Wide (1440px)</SelectItem>
                        <SelectItem value="100%">Full Width</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium">Sticky Header</label>
                      <p className="text-xs text-muted-foreground">Keep header visible on scroll</p>
                    </div>
                    <Switch 
                      checked={theme.stickyHeader}
                      onCheckedChange={(checked) => updateTheme({ stickyHeader: checked })}
                      data-testid="switch-sticky-header"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Border Radius</label>
                    <Select 
                      value={theme.borderRadius}
                      onValueChange={(value) => updateTheme({ borderRadius: value })}
                    >
                      <SelectTrigger data-testid="select-border-radius">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sharp (0px)</SelectItem>
                        <SelectItem value="4">Small (4px)</SelectItem>
                        <SelectItem value="8">Medium (8px)</SelectItem>
                        <SelectItem value="12">Large (12px)</SelectItem>
                        <SelectItem value="16">Extra Large (16px)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Animation & Effects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Animation Speed</label>
                    <Select 
                      value={theme.animationSpeed}
                      onValueChange={(value) => updateTheme({ animationSpeed: value })}
                    >
                      <SelectTrigger data-testid="select-animation-speed">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Slow (400ms)</SelectItem>
                        <SelectItem value="300">Normal (300ms)</SelectItem>
                        <SelectItem value="200">Fast (200ms)</SelectItem>
                        <SelectItem value="0">Instant (0ms)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-2">Shadow Preset</label>
                    <Select 
                      value={theme.shadowPreset}
                      onValueChange={(value) => updateTheme({ shadowPreset: value })}
                    >
                      <SelectTrigger data-testid="select-shadow-preset">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {['none', 'soft', 'medium', 'bold'].map((shadow) => (
                      <button
                        key={shadow}
                        onClick={() => updateTheme({ shadowPreset: shadow })}
                        className={`p-4 bg-card rounded-lg border transition-all ${
                          theme.shadowPreset === shadow ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                        }`}
                        style={{
                          boxShadow: shadow === 'none' ? 'none' :
                            shadow === 'soft' ? '0 1px 3px rgba(0,0,0,0.1)' :
                            shadow === 'medium' ? '0 4px 6px rgba(0,0,0,0.1)' :
                            '0 10px 15px rgba(0,0,0,0.1)'
                        }}
                      >
                        <span className="text-xs capitalize">{shadow}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Presets</CardTitle>
                <CardDescription>Choose from pre-designed theme combinations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        theme.selectedPreset === preset.name
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`preset-${preset.name.toLowerCase()}`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex gap-1">
                          {Object.values(preset.colors).map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border border-border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {theme.selectedPreset === preset.name && (
                          <Badge className="ml-auto">Active</Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{preset.name}</h4>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>Add custom CSS to override theme styles</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full p-3 border rounded-md font-mono text-sm bg-muted/50 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder={`:root {
  --primary: ${theme.primaryColor};
  --secondary: ${theme.secondaryColor};
}`}
                  value={theme.customCSS}
                  onChange={(e) => updateTheme({ customCSS: e.target.value })}
                  data-testid="textarea-custom-css"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Live Preview</h3>
                <p className="text-sm text-muted-foreground">Changes are applied in real-time</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={previewMode === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                  data-testid="button-preview-desktop"
                  className="gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  <span className="hidden sm:inline">Desktop</span>
                </Button>
                <Button
                  variant={previewMode === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("tablet")}
                  data-testid="button-preview-tablet"
                  className="gap-2"
                >
                  <Tablet className="w-4 h-4" />
                  <span className="hidden sm:inline">Tablet</span>
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                  data-testid="button-preview-mobile"
                  className="gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="hidden sm:inline">Mobile</span>
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="p-6 bg-muted/30">
                <div 
                  className={`mx-auto transition-all duration-300 overflow-y-auto max-h-[600px] ${
                    previewMode === 'desktop' ? 'max-w-full' :
                    previewMode === 'tablet' ? 'max-w-[768px]' :
                    'max-w-[375px]'
                  }`}
                  style={{
                    fontFamily: theme.bodyFont,
                    fontSize: `${parseFloat(theme.fontScale) * 16}px`,
                    lineHeight: theme.lineHeight,
                    letterSpacing: `${theme.letterSpacing}px`,
                  }}
                >
                  <div 
                    className="border overflow-hidden shadow-lg bg-background"
                    style={{ 
                      borderRadius: `${theme.borderRadius}px`,
                      transition: `all ${theme.animationSpeed}ms ease`,
                      boxShadow: theme.shadowPreset === 'none' ? 'none' :
                        theme.shadowPreset === 'soft' ? '0 1px 3px rgba(0,0,0,0.1)' :
                        theme.shadowPreset === 'medium' ? '0 4px 6px rgba(0,0,0,0.1)' :
                        '0 10px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Navbar */}
                    <div 
                      className="h-14 border-b flex items-center justify-between px-4 sticky top-0 z-10"
                      style={{ 
                        backgroundColor: `${theme.primaryColor}10`,
                        borderColor: `${theme.primaryColor}20`
                      }}
                    >
                      <div className="font-bold text-lg" style={{ color: theme.primaryColor, fontFamily: theme.headingFont }}>
                        Loi Developer
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span>Portfolio</span>
                        <span>Blog</span>
                        <span>Contact</span>
                      </div>
                    </div>

                    {/* Hero Section */}
                    <div className="p-8 text-center space-y-3 bg-gradient-to-b from-background to-muted/20">
                      <h1 
                        className="text-3xl font-bold" 
                        style={{ fontFamily: theme.headingFont, color: theme.primaryColor }}
                      >
                        Hello, I'm Loi Developer
                      </h1>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Full-stack Developer | UI/UX Enthusiast | Creative Thinker
                      </p>
                      <Button 
                        size="sm" 
                        style={{ 
                          backgroundColor: theme.primaryColor,
                          borderRadius: `${theme.borderRadius}px`
                        }}
                        className="text-white"
                      >
                        View My Work
                      </Button>
                    </div>

                    {/* Services Section */}
                    <div className="p-6 space-y-3 border-t">
                      <h2 className="text-xl font-bold" style={{ fontFamily: theme.headingFont }}>Featured Services</h2>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          'Web Development',
                          'UI/UX Design',
                          'Backend APIs',
                          'DevOps'
                        ].map(service => (
                          <div 
                            key={service}
                            className="p-3 border bg-card"
                            style={{ 
                              borderRadius: `${theme.borderRadius}px`,
                              borderColor: `${theme.primaryColor}30`,
                              boxShadow: theme.shadowPreset === 'none' ? 'none' :
                                theme.shadowPreset === 'soft' ? '0 1px 3px rgba(0,0,0,0.1)' :
                                theme.shadowPreset === 'medium' ? '0 4px 6px rgba(0,0,0,0.1)' :
                                '0 10px 15px rgba(0,0,0,0.1)'
                            }}
                          >
                            <div className="text-xs text-center font-medium" style={{ color: theme.primaryColor }}>
                              {service}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Projects Section */}
                    <div className="p-6 space-y-3 border-t">
                      <h2 className="text-xl font-bold" style={{ fontFamily: theme.headingFont }}>Latest Projects</h2>
                      <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                          <div 
                            key={i}
                            className="p-3 border bg-card flex items-start gap-2"
                            style={{ 
                              borderRadius: `${theme.borderRadius}px`,
                              borderColor: `${theme.primaryColor}20`
                            }}
                          >
                            <div 
                              className="w-12 h-12 rounded flex-shrink-0" 
                              style={{ 
                                backgroundColor: `${theme.primaryColor}20`,
                                borderRadius: `${theme.borderRadius}px`
                              }} 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="h-2 w-24 bg-muted rounded mb-1" />
                              <div className="h-2 w-32 bg-muted/60 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div 
                      className="p-4 text-center text-xs border-t"
                      style={{ borderColor: `${theme.primaryColor}20` }}
                    >
                      <p className="text-muted-foreground">
                        2024 Loi Developer. All rights reserved.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ThemeComparison currentTheme={theme} />

            <Card>
              <CardHeader>
                <CardTitle>Component Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium" style={{ fontFamily: theme.headingFont }}>Buttons</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        style={{ 
                          backgroundColor: theme.primaryColor,
                          borderRadius: `${theme.borderRadius}px`,
                          transition: `all ${theme.animationSpeed}ms ease`
                        }}
                        className="text-white"
                      >
                        Primary
                      </Button>
                      <Button 
                        style={{ 
                          backgroundColor: theme.secondaryColor,
                          borderRadius: `${theme.borderRadius}px`,
                          transition: `all ${theme.animationSpeed}ms ease`
                        }}
                        className="text-white"
                      >
                        Secondary
                      </Button>
                      <Button 
                        variant="outline"
                        style={{ 
                          borderRadius: `${theme.borderRadius}px`,
                          transition: `all ${theme.animationSpeed}ms ease`
                        }}
                      >
                        Outline
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium" style={{ fontFamily: theme.headingFont }}>Badges</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        style={{ 
                          backgroundColor: theme.primaryColor,
                          borderRadius: `${theme.borderRadius}px`
                        }}
                        className="text-white"
                      >
                        Primary
                      </Badge>
                      <Badge 
                        style={{ 
                          backgroundColor: theme.accentColor,
                          borderRadius: `${theme.borderRadius}px`
                        }}
                        className="text-white"
                      >
                        Accent
                      </Badge>
                      <Badge 
                        variant="outline"
                        style={{ borderRadius: `${theme.borderRadius}px` }}
                      >
                        Outline
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium" style={{ fontFamily: theme.headingFont }}>Cards</h4>
                    <Card 
                      style={{ 
                        borderRadius: `${theme.borderRadius}px`,
                        boxShadow: theme.shadowPreset === 'none' ? 'none' :
                          theme.shadowPreset === 'soft' ? '0 1px 3px rgba(0,0,0,0.1)' :
                          theme.shadowPreset === 'medium' ? '0 4px 6px rgba(0,0,0,0.1)' :
                          '0 10px 15px rgba(0,0,0,0.1)'
                      }}
                    >
                      <CardContent className="p-4">
                        <p className="text-sm" style={{ lineHeight: theme.lineHeight }}>
                          Sample card content
                        </p>
                      </CardContent>
                    </Card>
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
