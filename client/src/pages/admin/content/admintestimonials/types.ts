import { insertTestimonialSchema, type Testimonial } from "@shared/schema";
import type { z } from "zod";

export type TestimonialFormData = z.infer<typeof insertTestimonialSchema>;

export const getEmptyTestimonialForm = (): TestimonialFormData => ({
  name: "",
  role: "",
  company: "",
  content: "",
  rating: 5,
  avatar: "",
  active: true,
});

export const mapTestimonialToFormData = (testimonial: Testimonial): TestimonialFormData => ({
  name: testimonial.name,
  role: testimonial.role || "",
  company: testimonial.company || "",
  content: testimonial.content,
  rating: testimonial.rating || 5,
  avatar: testimonial.avatar || "",
  active: testimonial.active !== false,
});

export type { Testimonial };
export { insertTestimonialSchema };
