import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Testimonial, TestimonialFormData } from "../types";
import { insertTestimonialSchema, getEmptyTestimonialForm } from "../types";

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTestimonial: Testimonial | null;
  onSubmit: (data: TestimonialFormData, isEditing: boolean) => void;
  isPending: boolean;
}

export function TestimonialForm({
  open,
  onOpenChange,
  editingTestimonial,
  onSubmit,
  isPending,
}: TestimonialFormProps) {
  const { toast } = useToast();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<TestimonialFormData>({
    resolver: zodResolver(insertTestimonialSchema),
    defaultValues: getEmptyTestimonialForm(),
  });

  useEffect(() => {
    if (open) {
      if (editingTestimonial) {
        form.reset({
          name: editingTestimonial.name,
          role: editingTestimonial.role || "",
          company: editingTestimonial.company || "",
          content: editingTestimonial.content,
          rating: editingTestimonial.rating || 5,
          avatar: editingTestimonial.avatar || "",
          active: editingTestimonial.active !== false,
        });
        setAvatarPreview(editingTestimonial.avatar || null);
      } else {
        form.reset(getEmptyTestimonialForm());
        setAvatarPreview(null);
      }
    }
  }, [open, editingTestimonial, form]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ description: "Please select an image file", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      form.setValue("avatar", base64);
      setAvatarPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClearAvatar = () => {
    form.setValue("avatar", "");
    setAvatarPreview(null);
  };

  const handleFormSubmit = (data: TestimonialFormData) => {
    onSubmit(data, !!editingTestimonial);
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setAvatarPreview(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
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
                        <Input
                          placeholder="CEO"
                          {...field}
                          value={field.value ?? ""}
                          data-testid="input-testimonial-role"
                        />
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
                      <Input
                        placeholder="TechCorp Inc"
                        {...field}
                        value={field.value ?? ""}
                        data-testid="input-testimonial-company"
                      />
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
                      <Select
                        value={(field.value ?? 5).toString()}
                        onValueChange={(v) => field.onChange(parseInt(v))}
                      >
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
                      <Select
                        value={field.value ? "active" : "inactive"}
                        onValueChange={(v) => field.onChange(v === "active")}
                      >
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
                    <FormLabel>Avatar Image (Optional)</FormLabel>

                    {avatarPreview && (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleClearAvatar}
                          className="absolute top-1 right-1 bg-destructive/90 text-white p-1 rounded hover:bg-destructive"
                          data-testid="button-clear-avatar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                          <Upload className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Click to upload image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            className="hidden"
                            data-testid="input-upload-avatar"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG, GIF, WebP (Max 5MB)
                        </p>
                      </div>

                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">
                          Or paste image URL
                        </label>
                        <Input
                          placeholder="https://example.com/avatar.jpg"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value && !e.target.value.includes("data:")) {
                              setAvatarPreview(e.target.value);
                            }
                          }}
                          data-testid="input-testimonial-avatar-url"
                        />
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-border mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            data-testid="button-submit-testimonial"
            onClick={() => form.handleSubmit(handleFormSubmit)()}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              <>{editingTestimonial ? "Update" : "Add"} Testimonial</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
