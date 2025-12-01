import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, FileJson, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Exportable {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  icon: React.ReactNode;
}

export default function AdminExportImport() {
  const { toast } = useToast();
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [recentExports, setRecentExports] = useState<any[]>([]);

  const exportables: Exportable[] = [
    {
      id: "posts",
      name: "Posts",
      description: "All blog posts and articles",
      endpoint: "/api/posts",
      icon: <FileJson className="w-5 h-5" />,
    },
    {
      id: "projects",
      name: "Projects",
      description: "All portfolio projects",
      endpoint: "/api/projects",
      icon: <FileJson className="w-5 h-5" />,
    },
    {
      id: "skills",
      name: "Skills",
      description: "All technical skills",
      endpoint: "/api/skills",
      icon: <FileJson className="w-5 h-5" />,
    },
    {
      id: "services",
      name: "Services",
      description: "All offered services",
      endpoint: "/api/services",
      icon: <FileJson className="w-5 h-5" />,
    },
    {
      id: "testimonials",
      name: "Testimonials",
      description: "All client testimonials",
      endpoint: "/api/testimonials",
      icon: <FileJson className="w-5 h-5" />,
    },
    {
      id: "settings",
      name: "Settings",
      description: "Site configuration and settings",
      endpoint: "/api/settings",
      icon: <FileJson className="w-5 h-5" />,
    },
  ];

  const handleExport = async (exportable: Exportable) => {
    setExportLoading(exportable.id);
    try {
      const res = await fetch(exportable.endpoint, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportable.id}_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      const newExport = {
        name: a.download,
        size: (blob.size / 1024).toFixed(2) + " KB",
        date: new Date().toLocaleDateString(),
        timestamp: new Date(),
      };

      setRecentExports((prev) => [newExport, ...prev].slice(0, 10));
      toast({
        title: "Success",
        description: `Exported ${exportable.name} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to export",
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImportLoading(true);
    try {
      const fileContent = await file.text();
      const data = JSON.parse(fileContent);

      const fileName = file.name.toLowerCase();
      let endpoint = "/api/posts";

      if (fileName.includes("project")) endpoint = "/api/projects";
      else if (fileName.includes("skill")) endpoint = "/api/skills";
      else if (fileName.includes("service")) endpoint = "/api/services";
      else if (fileName.includes("testimonial")) endpoint = "/api/testimonials";
      else if (fileName.includes("setting")) endpoint = "/api/settings";

      if (Array.isArray(data)) {
        let successCount = 0;
        for (const item of data) {
          try {
            const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(item),
            });
            if (res.ok) successCount++;
          } catch (e) {
            console.error("Failed to import item:", e);
          }
        }
        toast({
          title: "Import Complete",
          description: `Successfully imported ${successCount} out of ${data.length} items`,
        });
      } else {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        if (res.ok) {
          toast({
            title: "Success",
            description: "Data imported successfully",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import file",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".json")) {
        toast({
          title: "Error",
          description: "Please upload a JSON file",
          variant: "destructive",
        });
        return;
      }
      handleImport(file);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Export & Import Data</h1>
          <p className="text-muted-foreground">
            Backup and restore your content data
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Export Data</h2>
            <div className="space-y-3">
              {exportables.map((exportable) => (
                <Card key={exportable.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-primary/10 rounded flex-shrink-0">
                          {exportable.icon}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm">{exportable.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {exportable.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={exportLoading === exportable.id}
                        onClick={() => handleExport(exportable)}
                        data-testid={`button-export-${exportable.id}`}
                        className="flex-shrink-0 gap-1"
                      >
                        {exportLoading === exportable.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Import Data</h2>
            <Card>
              <CardContent className="p-6">
                <label className="cursor-pointer block">
                  <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 flex flex-col items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all">
                    {importLoading ? (
                      <>
                        <Loader2 className="w-12 h-12 text-primary mb-3 animate-spin" />
                        <h3 className="font-semibold mb-1">Importing...</h3>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                        <h3 className="font-semibold mb-1">Drop JSON file or click</h3>
                        <p className="text-xs text-muted-foreground text-center">
                          Supported: JSON files from posts, projects, skills, services, or testimonials
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    disabled={importLoading}
                    className="hidden"
                    data-testid="input-file-import"
                  />
                </label>
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    💡 Export files automatically detect the data type and import to the correct location.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Exports */}
        {recentExports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Exports</CardTitle>
              <CardDescription>
                Last {recentExports.length} exported files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentExports.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.date} • {file.size}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Section */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              Export & Import Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              • Export your data as JSON format for backup or migration purposes
            </p>
            <p>• Import JSON files to add or update your content data</p>
            <p>• Files are detected by name - use original export names when possible</p>
            <p>
              • Each export includes a timestamp for easy version control
            </p>
            <p>• All imports are validated before processing</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
