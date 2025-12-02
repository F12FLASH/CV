import { AdminLayout } from "@/layouts/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { 
  Layout, 
  Type, 
  Image as ImageIcon, 
  Columns, 
  Plus, 
  Trash2, 
  GripVertical,
  Eye,
  Save,
  ArrowLeft,
  Settings,
  Palette,
  Code,
  FileText
} from "lucide-react";
import { Link } from "wouter";

interface PageBlock {
  id: string;
  type: "text" | "image" | "columns" | "hero" | "cta";
  content: Record<string, any>;
}

const blockTypes = [
  { id: "text", label: "Text Block", icon: Type, description: "Add a text section" },
  { id: "image", label: "Image", icon: ImageIcon, description: "Add an image" },
  { id: "columns", label: "Columns", icon: Columns, description: "Multi-column layout" },
  { id: "hero", label: "Hero Section", icon: Layout, description: "Large hero banner" },
  { id: "cta", label: "Call to Action", icon: FileText, description: "CTA button section" },
];

export default function PageBuilder() {
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [blocks, setBlocks] = useState<PageBlock[]>([]);

  const generateId = () => {
    return `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const addBlock = (type: PageBlock["type"]) => {
    const newBlock: PageBlock = {
      id: generateId(),
      type,
      content: {},
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const handleSave = () => {
    console.log("Saving page:", { title: pageTitle, slug: pageSlug, isPublished, blocks });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/admin/pages">
            <Button variant="ghost" size="sm" data-testid="button-back-to-pages">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pages
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-preview-page">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} data-testid="button-save-page">
              <Save className="w-4 h-4 mr-2" />
              Save Page
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Page Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Page Title</Label>
                    <Input
                      id="title"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="Enter page title"
                      data-testid="input-page-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={pageSlug}
                      onChange={(e) => setPageSlug(e.target.value)}
                      placeholder="page-url-slug"
                      data-testid="input-page-slug"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                    data-testid="switch-page-published"
                  />
                  <Label htmlFor="published">Publish page</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Page Content
                </CardTitle>
                <CardDescription>
                  Drag and drop blocks to build your page
                </CardDescription>
              </CardHeader>
              <CardContent>
                {blocks.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">No blocks yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add blocks from the sidebar to start building your page
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="flex items-start gap-3 p-4 border rounded-lg bg-card"
                        data-testid={`block-${block.type}-${index}`}
                      >
                        <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab mt-1" />
                        <div className="flex-1">
                          <div className="font-medium capitalize">{block.type} Block</div>
                          <div className="text-sm text-muted-foreground">
                            Configure this block in the settings panel
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeBlock(block.id)}
                          data-testid={`button-remove-block-${index}`}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Blocks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {blockTypes.map((block) => (
                      <Button
                        key={block.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => addBlock(block.id as PageBlock["type"])}
                        data-testid={`button-add-${block.id}`}
                      >
                        <block.icon className="w-4 h-4 mr-2" />
                        {block.label}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
