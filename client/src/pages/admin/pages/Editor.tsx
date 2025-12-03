import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, Play, Save, Loader2, Check, RotateCcw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_CSS = `/* Add your custom CSS here */

.custom-hero-title {
  background: linear-gradient(to right, #ff00cc, #333399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.custom-section {
  padding: 2rem;
}`;

const DEFAULT_JS = `// Add your custom JS here

document.addEventListener('DOMContentLoaded', () => {
  // Your code here
});`;

const DEFAULT_HEADER = `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-XXXXX-Y');
</script>`;

export default function AdminEditor() {
  const { toast } = useToast();
  const [customCSS, setCustomCSS] = useState(DEFAULT_CSS);
  const [customJS, setCustomJS] = useState(DEFAULT_JS);
  const [headerScripts, setHeaderScripts] = useState(DEFAULT_HEADER);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: settings, isLoading } = useQuery<Record<string, any>>({
    queryKey: ['/api/settings'],
  });

  useEffect(() => {
    if (settings) {
      if (settings.customCSS !== undefined) setCustomCSS(settings.customCSS || DEFAULT_CSS);
      if (settings.customJS !== undefined) setCustomJS(settings.customJS || DEFAULT_JS);
      if (settings.headerScripts !== undefined) setHeaderScripts(settings.headerScripts || DEFAULT_HEADER);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      return api.updateSettings({
        customCSS,
        customJS,
        headerScripts,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      setHasChanges(false);
      toast({
        title: "Saved",
        description: "Custom code saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save custom code",
        variant: "destructive",
      });
    },
  });

  const handleCSSChange = (value: string) => {
    setCustomCSS(value);
    setHasChanges(true);
  };

  const handleJSChange = (value: string) => {
    setCustomJS(value);
    setHasChanges(true);
  };

  const handleHeaderChange = (value: string) => {
    setHeaderScripts(value);
    setHasChanges(true);
  };

  const handleReset = (type: 'css' | 'js' | 'header') => {
    switch (type) {
      case 'css':
        setCustomCSS(DEFAULT_CSS);
        break;
      case 'js':
        setCustomJS(DEFAULT_JS);
        break;
      case 'header':
        setHeaderScripts(DEFAULT_HEADER);
        break;
    }
    setHasChanges(true);
  };

  const handlePreview = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Preview</title>
          ${headerScripts}
          <style>
            body { font-family: system-ui, sans-serif; padding: 2rem; background: #1a1a2e; color: #fff; }
            ${customCSS}
          </style>
        </head>
        <body>
          <h1 class="custom-hero-title">Custom CSS Preview</h1>
          <div class="custom-section">
            <p>This is a preview of your custom styles.</p>
          </div>
          <script>
            ${customJS}
          </script>
        </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-heading font-bold" data-testid="text-editor-title">Code Editor</h1>
            <p className="text-muted-foreground">Customize your site's code directly</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePreview} data-testid="button-preview">
              <Play className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button 
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !hasChanges}
              data-testid="button-save"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : hasChanges ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              {saveMutation.isPending ? "Saving..." : hasChanges ? "Save Changes" : "Saved"}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="css" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="css" data-testid="tab-css">Custom CSS</TabsTrigger>
            <TabsTrigger value="js" data-testid="tab-js">Custom JS</TabsTrigger>
            <TabsTrigger value="header" data-testid="tab-header">Header Scripts</TabsTrigger>
          </TabsList>

          <TabsContent value="css" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 border-b border-border flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-mono">style.css</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleReset('css')}
                  data-testid="button-reset-css"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
                <textarea 
                  className="w-full h-full min-h-[400px] bg-transparent text-white font-mono text-sm p-4 focus:outline-none resize-none"
                  value={customCSS}
                  onChange={(e) => handleCSSChange(e.target.value)}
                  placeholder="/* Enter your custom CSS here */"
                  spellCheck={false}
                  data-testid="textarea-css"
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="js" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 border-b border-border flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-sm font-mono">script.js</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleReset('js')}
                  data-testid="button-reset-js"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
                <textarea 
                  className="w-full h-full min-h-[400px] bg-transparent text-white font-mono text-sm p-4 focus:outline-none resize-none"
                  value={customJS}
                  onChange={(e) => handleJSChange(e.target.value)}
                  placeholder="// Enter your custom JavaScript here"
                  spellCheck={false}
                  data-testid="textarea-js"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header" className="flex-1 mt-4">
             <Card className="h-full flex flex-col">
              <CardHeader className="py-3 border-b border-border flex flex-row items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-mono">head-scripts.html</CardTitle>
                  <CardDescription>Google Analytics, Meta Tags, etc.</CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleReset('header')}
                  data-testid="button-reset-header"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
                <textarea 
                  className="w-full h-full min-h-[400px] bg-transparent text-white font-mono text-sm p-4 focus:outline-none resize-none"
                  value={headerScripts}
                  onChange={(e) => handleHeaderChange(e.target.value)}
                  placeholder="<!-- Enter your header scripts here -->"
                  spellCheck={false}
                  data-testid="textarea-header"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
