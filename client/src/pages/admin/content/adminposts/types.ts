import type { Post, InsertPost } from "@shared/schema";

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

export interface PostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  status: "Published" | "Draft" | "Archived";
  tags: string[];
  featuredImage: string | null;
  publishedAt: Date | null;
}

export const getEmptyPostForm = (): PostFormData => ({
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  category: "",
  author: "Loi Developer",
  status: "Draft",
  tags: [],
  featuredImage: null,
  publishedAt: null,
});

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function mapPostToFormData(post: Post): { formData: PostFormData; tagsInput: string } {
  let parsedPublishedAt: Date | null = null;
  if (post.publishedAt) {
    const date = new Date(post.publishedAt);
    if (!isNaN(date.getTime())) {
      parsedPublishedAt = date;
    }
  }

  return {
    formData: {
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      category: post.category,
      author: post.author,
      status: post.status as "Published" | "Draft" | "Archived",
      tags: post.tags || [],
      featuredImage: post.featuredImage,
      publishedAt: parsedPublishedAt,
    },
    tagsInput: post.tags?.join(", ") || "",
  };
}

export const bgImages = ['/images/blog/bg-1.png', '/images/blog/bg-2.png', '/images/blog/bg-3.png'];

export type { Post, InsertPost };
