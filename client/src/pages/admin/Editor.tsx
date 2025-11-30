import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Code, Play, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminEditor() {
  return (
    <AdminLayout>
      <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Code Editor</h1>
            <p className="text-muted-foreground">Customize your site's code directly</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Play className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button className="bg-primary hover:bg-primary/90">
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="css" className="flex-1 flex flex-col">
          <TabsList>
            <TabsTrigger value="css">Custom CSS</TabsTrigger>
            <TabsTrigger value="js">Custom JS</TabsTrigger>
            <TabsTrigger value="header">Header Scripts</TabsTrigger>
          </TabsList>

          <TabsContent value="css" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 border-b border-border">
                <CardTitle className="text-sm font-mono">style.css</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
                <textarea 
                  className="w-full h-full bg-transparent text-white font-mono text-sm p-4 focus:outline-none resize-none"
                  defaultValue={`/* Add your custom CSS here */

.custom-hero-title {
  background: linear-gradient(to right, #ff00cc, #333399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.admin-panel-override {
  border: 2px solid red;
}`}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="js" className="flex-1 mt-4">
            <Card className="h-full flex flex-col">
              <CardHeader className="py-3 border-b border-border">
                <CardTitle className="text-sm font-mono">script.js</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
                <textarea 
                  className="w-full h-full bg-transparent text-white font-mono text-sm p-4 focus:outline-none resize-none"
                  defaultValue={`// Add your custom JS here

console.log('Custom script loaded');

document.addEventListener('DOMContentLoaded', () => {
  // Your code
});`}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header" className="flex-1 mt-4">
             <Card className="h-full flex flex-col">
              <CardHeader className="py-3 border-b border-border">
                <CardTitle className="text-sm font-mono">head-scripts.html</CardTitle>
                <CardDescription>Google Analytics, Meta Tags, etc.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 bg-[#1e1e1e]">
                <textarea 
                  className="w-full h-full bg-transparent text-white font-mono text-sm p-4 focus:outline-none resize-none"
                  defaultValue={`<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-XXXXX-Y');
</script>`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
