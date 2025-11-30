import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Upload, FileJson, FileText, Database } from "lucide-react";

export default function AdminExportImport() {
  const exportOptions = [
    { title: "Export All Data", description: "Download complete database as JSON", icon: FileJson },
    { title: "Export as CSV", description: "Posts, projects, and user data in CSV format", icon: FileText },
    { title: "Export Database", description: "Full database dump for backup", icon: Database },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-heading font-bold">Export & Import</h1>
          <p className="text-muted-foreground">Manage data portability and backups</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Export Data</h2>
            {exportOptions.map((option, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-primary/10 rounded">
                        <option.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">{option.title}</h3>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                    <Button size="sm" className="gap-1">
                      <Download className="w-3 h-3" /> Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Import Data</h2>
            <Card>
              <CardContent className="p-6">
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <Upload className="w-12 h-12 text-muted-foreground mb-3" />
                  <h3 className="font-bold mb-1">Drop files here or click to upload</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Accepted formats: JSON, CSV, SQL (Max 50MB)
                  </p>
                </div>
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    ℹ️ Importing will add or update existing records. Enable "Merge" mode to combine with existing data.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Exports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Exports</CardTitle>
            <CardDescription>Previously exported files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "export_2024-03-20_full.json", size: "2.4 MB", date: "Mar 20, 2024" },
                { name: "posts_backup_2024-03-15.csv", size: "856 KB", date: "Mar 15, 2024" },
                { name: "database_dump_2024-03-10.sql", size: "5.2 MB", date: "Mar 10, 2024" },
              ].map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{file.date} • {file.size}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
