import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Layout, 
  Type, 
  Monitor, 
  Smartphone, 
  Save, 
  RotateCcw,
  Check
} from "lucide-react";
import { useState } from "react";

export default function AdminTheme() {
  const [primaryColor, setPrimaryColor] = useState("#7c3aed");
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold">Theme Customization</h1>
            <p className="text-muted-foreground">Customize the look and feel of your website</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
             </Button>
             <Button className="bg-primary gap-2">
                <Save className="w-4 h-4" /> Save Changes
             </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Settings Panel */}
           <div className="lg:col-span-1 space-y-6">
              {/* Colors */}
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Palette className="w-5 h-5" /> Color Scheme
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Primary Color</label>
                       <div className="flex gap-2 flex-wrap">
                          {["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"].map((color) => (
                             <button
                                key={color}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === color ? 'border-foreground scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                onClick={() => setPrimaryColor(color)}
                             />
                          ))}
                          <div className="relative">
                             <Input type="color" className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-medium">Dark Mode Default</label>
                       <Switch defaultChecked />
                    </div>
                 </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Type className="w-5 h-5" /> Typography
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Heading Font</label>
                       <select className="w-full p-2 rounded-md border border-input bg-background">
                          <option>Inter</option>
                          <option>Space Grotesk</option>
                          <option>Outfit</option>
                          <option>Plus Jakarta Sans</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium">Body Font</label>
                       <select className="w-full p-2 rounded-md border border-input bg-background">
                          <option>Inter</option>
                          <option>Roboto</option>
                          <option>Open Sans</option>
                       </select>
                    </div>
                 </CardContent>
              </Card>

              {/* Layout */}
              <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Layout className="w-5 h-5" /> Layout
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-medium">Container Width</label>
                       <select className="p-1 rounded border bg-background text-sm">
                          <option>Boxed (1200px)</option>
                          <option>Wide (1440px)</option>
                          <option>Full Width</option>
                       </select>
                    </div>
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-medium">Sticky Header</label>
                       <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                       <label className="text-sm font-medium">Show Footer</label>
                       <Switch defaultChecked />
                    </div>
                 </CardContent>
              </Card>
           </div>

           {/* Live Preview */}
           <div className="lg:col-span-2">
              <Card className="h-full flex flex-col overflow-hidden border-2 border-primary/20">
                 <div className="bg-muted border-b p-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">Live Preview</span>
                    <div className="flex gap-2">
                       <Button variant="ghost" size="icon" className="h-6 w-6"><Monitor className="w-4 h-4" /></Button>
                       <Button variant="ghost" size="icon" className="h-6 w-6"><Smartphone className="w-4 h-4" /></Button>
                    </div>
                 </div>
                 <div className="flex-1 bg-background p-8 relative overflow-hidden">
                    {/* Mockup of the site using selected settings */}
                    <div className="border border-border rounded-lg shadow-lg overflow-hidden max-w-3xl mx-auto bg-card">
                       {/* Mock Header */}
                       <div className="h-12 border-b flex items-center justify-between px-4" style={{ borderColor: `${primaryColor}20` }}>
                          <div className="font-bold" style={{ color: primaryColor }}>LOI</div>
                          <div className="flex gap-4 text-xs">
                             <span>Home</span>
                             <span>About</span>
                             <span>Contact</span>
                          </div>
                       </div>
                       
                       {/* Mock Hero */}
                       <div className="p-8 text-center space-y-4">
                          <h1 className="text-2xl font-bold">Building Digital Experiences</h1>
                          <p className="text-sm text-muted-foreground">This is how your website content will appear with the selected typography and colors.</p>
                          <Button size="sm" style={{ backgroundColor: primaryColor }}>Get Started</Button>
                       </div>

                       {/* Mock Grid */}
                       <div className="grid grid-cols-3 gap-4 p-4 bg-muted/20">
                          {[1,2,3].map(i => (
                             <div key={i} className="bg-background p-4 rounded border shadow-sm">
                                <div className="w-8 h-8 rounded mb-2" style={{ backgroundColor: `${primaryColor}20` }} />
                                <div className="h-2 w-20 bg-muted rounded mb-2" />
                                <div className="h-2 w-full bg-muted rounded" />
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="absolute bottom-4 right-4">
                       <Badge className="bg-background text-foreground border shadow-lg pointer-events-none">
                          Preview Mode
                       </Badge>
                    </div>
                 </div>
              </Card>
           </div>
        </div>
      </div>
    </AdminLayout>
  );
}