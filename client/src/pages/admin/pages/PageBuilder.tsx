
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Layout, 
  Type, 
  Image as ImageIcon,
  Square,
  Columns,
  Plus,
  Trash2,
  Eye,
  Save,
  GripVertical
} from "lucide-react";

export default function AdminPageBuilder() {
  const components = [
    { icon: Type, name: "Text Block", color: "text-blue-500" },
    { icon: ImageIcon, name: "Image", color: "text-green-500" },
    { icon: Square, name: "Button", color: "text-purple-500" },
    { icon: Columns, name: "2 Columns", color: "text-yellow-500" },
    { icon: Layout, name: "Hero Section", color: "text-red-500" },
  ];

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 bg-card border-b">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Page Builder</h1>
            <Badge>Homepage</Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button size="sm">
              <Save className="w-4 h-4 mr-2" /> Save Page
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Components Sidebar */}
          <div className="w-64 bg-card border-r p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Components</h3>
            <div className="space-y-2">
              {components.map((comp, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg cursor-move hover:border-primary hover:bg-primary/5 transition-colors"
                  draggable
                >
                  <div className="flex items-center gap-3">
                    <comp.icon className={`w-5 h-5 ${comp.color}`} />
                    <span className="text-sm font-medium">{comp.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-muted/20 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto bg-background rounded-lg shadow-lg min-h-full p-8">
              <div className="space-y-4">
                {/* Example blocks */}
                <div className="group relative border-2 border-dashed border-transparent hover:border-primary p-4 rounded-lg">
                  <div className="absolute -top-3 left-2 bg-background px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <GripVertical className="w-3 h-3" />
                      </Button>
                      <Badge variant="secondary" className="text-xs">Hero Section</Badge>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Welcome to My Portfolio</h1>
                  <p className="text-muted-foreground">This is an editable hero section.</p>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5">
                  <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drop component here or click to add</p>
                </div>
              </div>
            </div>
          </div>

          {/* Properties Panel */}
          <div className="w-80 bg-card border-l p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Properties</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Content</label>
                <textarea className="w-full p-2 border rounded-md text-sm" rows={3} defaultValue="Welcome to My Portfolio" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <select className="w-full p-2 border rounded-md text-sm bg-background">
                  <option>Large (4xl)</option>
                  <option>Extra Large (5xl)</option>
                  <option>Huge (6xl)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Text Color</label>
                <input type="color" className="w-full h-10 rounded border" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
