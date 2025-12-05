import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  createdAt: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  type: string;
  description: string;
}

const getEmptyCategory = (): CategoryFormData => ({
  name: "",
  slug: "",
  type: "project",
  description: "",
});

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useProjectCategoriesCRUD() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categoriesQuery = useQuery({
    queryKey: ["/api/categories", "project"],
    queryFn: () => 
      fetch("/api/categories?type=project", { credentials: "include" }).then(res => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to create category");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories", "project"] });
      toast({ title: "Success", description: "Category created" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create category", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryFormData }) =>
      fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error("Failed to update category");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories", "project"] });
      toast({ title: "Success", description: "Category updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/categories/${id}`, { 
        method: "DELETE",
        credentials: "include"
      }).then(res => {
        if (!res.ok) throw new Error("Failed to delete category");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories", "project"] });
      toast({ title: "Success", description: "Category deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    },
  });

  return {
    categories: categoriesQuery.data || [],
    isLoading: categoriesQuery.isLoading,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}

function CategoryList({ 
  categories, 
  isLoading, 
  onEdit, 
  onDelete 
}: { 
  categories: Category[]; 
  isLoading: boolean; 
  onEdit: (category: Category) => void; 
  onDelete: (id: number) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories yet. Create your first one!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className="flex items-center justify-between p-4 border rounded-lg hover-elevate transition-colors"
          data-testid={`category-item-${category.id}`}
        >
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground">{category.name}</h3>
            <p className="text-sm text-muted-foreground">/{category.slug}</p>
            {category.description && (
              <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(category)}
              data-testid={`button-edit-category-${category.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(category.id)}
              data-testid={`button-delete-category-${category.id}`}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryForm({
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  isEditing,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: CategoryFormData;
  setFormData: (data: CategoryFormData) => void;
  onSubmit: () => void;
  isEditing: boolean;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => {
                const newName = e.target.value;
                const newSlug = generateSlug(newName);
                setFormData({ ...formData, name: newName, slug: newSlug });
              }}
              placeholder="e.g., Full Stack"
              data-testid="input-category-name"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="e.g., full-stack"
              data-testid="input-category-slug"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Category description (optional)"
              data-testid="textarea-category-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isPending}
            data-testid="button-save-category"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Are you sure you want to delete this category?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            data-testid="button-confirm-delete"
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function ProjectCategoriesPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>(getEmptyCategory());

  const { categories, isLoading, createMutation, updateMutation, deleteMutation } = useProjectCategoriesCRUD();

  const resetForm = () => {
    setFormData(getEmptyCategory());
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        type: category.type,
        description: category.description || "",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          resetForm();
        }
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null)
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Project Categories</h1>
            <p className="text-muted-foreground mt-1">Manage your portfolio project categories</p>
          </div>
          <Button onClick={() => handleOpenDialog()} data-testid="button-new-category">
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList
              categories={categories}
              isLoading={isLoading}
              onEdit={handleOpenDialog}
              onDelete={setDeleteId}
            />
          </CardContent>
        </Card>
      </div>

      <CategoryForm
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingCategory}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteCategoryDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </AdminLayout>
  );
}
