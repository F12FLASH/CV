import { AdminLayout } from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Plus, Edit, Trash, Search, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertTestimonialSchema, type Testimonial } from "@shared/schema";
import type { z } from "zod";

type TestimonialFormData = z.infer<typeof insertTestimonialSchema>;

export default function AdminTestimonials() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ["/api/testimonials"],
    queryFn: () => api.getTestimonials(),
  });

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(insertTestimonialSchema),
    defaultValues: {
      name: "",
      role: "",
      company: "",
      content: "",
      rating: 5,
      avatar: "",
      active: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TestimonialFormData) => api.createTestimonial(data),
    onSuccess: () => {
      toast({ description: "Testimonial added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      form.reset();
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : "Failed to add testimonial",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; data: Partial<TestimonialFormData> }) =>
      api.updateTestimonial(data.id, data.data),
    onSuccess: () => {
      toast({ description: "Testimonial updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
      form.reset();
      setEditingId(null);
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : "Failed to update testimonial",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteTestimonial(id),
    onSuccess: () => {
      toast({ description: "Testimonial deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/testimonials"] });
    },
    onError: (error) => {
      toast({
        description: error instanceof Error ? error.message : "Failed to delete testimonial",
        variant: "destructive",
      });
    },
  });

  const handleOpenDialog = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingId(testimonial.id);
      form.reset({
        name: testimonial.name,
        role: testimonial.role || "",
        company: testimonial.company || "",
        content: testimonial.content,
        rating: testimonial.rating || 5,
        avatar: testimonial.avatar || "",
        active: testimonial.active !== false,
      });
    } else {
      setEditingId(null);
      form.reset();
    }
    setIsOpen(true);
  };

  const onSubmit = (data: TestimonialFormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
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

        {/* Search & Filter */}
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Testimonials Grid */}
        {!isLoading && (
          <>
            {filteredTestimonials.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    {searchTerm ? "No testimonials found matching your search" : "No testimonials yet. Add one to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTestimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={testimonial.avatar} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.role} {testimonial.company && `at ${testimonial.company}`}
                          </p>
                          <div className="flex gap-1 mt-2">
                            {[...Array(testimonial.rating || 5)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-yellow-500 text-yellow-500"
                                data-testid={`star-${i}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground italic">"{testimonial.content}"</p>
                      <div className="flex items-center justify-between mt-4 gap-2">
                        <Badge variant={testimonial.active ? "default" : "secondary"}>
                          {testimonial.active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(testimonial)}
                            data-testid={`button-edit-testimonial-${testimonial.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(testimonial.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-testimonial-${testimonial.id}`}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Smith" {...field} data-testid="input-testimonial-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title / Role</FormLabel>
                      <FormControl>
                        <Input placeholder="CEO" {...field} value={field.value ?? ""} data-testid="input-testimonial-role" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="TechCorp Inc" {...field} value={field.value ?? ""} data-testid="input-testimonial-company" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Testimonial Text</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did the client say about your work?"
                        className="resize-none"
                        rows={4}
                        {...field}
                        data-testid="input-testimonial-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (Stars)</FormLabel>
                      <Select value={(field.value ?? 5).toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                        <FormControl>
                          <SelectTrigger data-testid="select-testimonial-rating">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[5, 4, 3, 2, 1].map((star) => (
                            <SelectItem key={star} value={star.toString()}>
                              {star} stars
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value ? "active" : "inactive"} onValueChange={(v) => field.onChange(v === "active")}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value ?? ""} data-testid="input-testimonial-avatar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-testimonial"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>{editingId ? "Update" : "Add"} Testimonial</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
