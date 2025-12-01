import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  Edit,
  Trash,
  FileText,
  Eye,
  Loader2
} from "lucide-react";
import { type Page } from "@shared/schema";

export default function AdminPages() {
  const { toast } = useToast();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: pages = [], isLoading, refetch } = useQuery<Page[]>({
    queryKey: ["/api/pages"],
    queryFn: async () => {
      const res = await fetch("/api/pages", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pages");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/pages/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete page");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Success", description: "Page deleted successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update page");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      toast({ title: "Success", description: "Page status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const toggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "Published" ? "Draft" : "Published";
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const startEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
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
            <h1 className="text-3xl font-heading font-bold">Pages</h1>
            <p className="text-muted-foreground">Manage custom pages on your website</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-page">
            <Plus className="w-4 h-4 mr-2" /> New Page
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-lg border border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages by title or slug..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-pages"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" data-testid="button-filter-pages">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {filteredPages.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pages found. Create your first custom page!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-primary">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium">{page.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">/{page.slug}</code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={page.status === "Published" ? "default" : "secondary"}
                        className={`cursor-pointer ${
                          page.status === "Published" ? "bg-green-500 hover:bg-green-600" : ""
                        }`}
                        onClick={() => toggleStatus(page.id, page.status)}
                        data-testid={`badge-status-${page.id}`}
                      >
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        {page.views}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`button-edit-page-${page.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(page.id, page.title)}
                          disabled={deleteMutation.isPending}
                          data-testid={`button-delete-page-${page.id}`}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
