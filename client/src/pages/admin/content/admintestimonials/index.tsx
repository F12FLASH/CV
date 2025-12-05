import { useState } from "react";
import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, AlertCircle, Loader2 } from "lucide-react";
import { useTestimonials, useCreateTestimonial, useUpdateTestimonial, useDeleteTestimonial } from "./hooks";
import { TestimonialCard, TestimonialForm } from "./components";
import type { Testimonial, TestimonialFormData } from "./types";

export default function AdminTestimonialsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: testimonials = [], isLoading } = useTestimonials();

  const handleFormClose = () => {
    setIsOpen(false);
    setEditingTestimonial(null);
  };

  const createMutation = useCreateTestimonial(handleFormClose);
  const updateMutation = useUpdateTestimonial(handleFormClose);
  const deleteMutation = useDeleteTestimonial();

  const handleOpenDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
    } else {
      setEditingTestimonial(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = (data: TestimonialFormData, isEditing: boolean) => {
    if (isEditing && editingTestimonial) {
      updateMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this testimonial?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredTestimonials = testimonials.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Testimonials</h1>
            <p className="text-muted-foreground">Manage customer reviews and feedback</p>
          </div>
          <Button
            className="bg-primary gap-2"
            onClick={() => handleOpenDialog()}
            data-testid="button-add-testimonial-admin"
          >
            <Plus className="w-4 h-4" /> Add Testimonial
          </Button>
        </div>

        <div className="flex gap-4 bg-card p-4 rounded-lg border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search testimonials..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-testimonials"
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && (
          <>
            {filteredTestimonials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? "No testimonials found matching your search"
                      : "No testimonials yet. Add one to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTestimonials.map((testimonial) => (
                  <TestimonialCard
                    key={testimonial.id}
                    testimonial={testimonial}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                    isDeleting={deleteMutation.isPending}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <TestimonialForm
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose();
          else setIsOpen(open);
        }}
        editingTestimonial={editingTestimonial}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </AdminLayout>
  );
}
