export interface Project {
  id: number;
  title: string;
  category: string;
  image: string | null;
  shortDescription: string | null;
  description: string | null;
  tech: string[];
  link: string | null;
  github: string | null;
  status: string;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
}

export interface ProjectFormData {
  title: string;
  category: string;
  image: string;
  shortDescription: string;
  description: string;
  tech: string[];
  link: string;
  github: string;
  status: string;
  featured: boolean;
}

export const getEmptyProjectForm = (): ProjectFormData => ({
  title: "",
  category: "full-stack",
  image: "",
  shortDescription: "",
  description: "",
  tech: [],
  link: "",
  github: "",
  status: "Draft",
  featured: false,
});

export const mapProjectToFormData = (project: Project): ProjectFormData => ({
  title: project.title,
  category: project.category,
  image: project.image || "",
  shortDescription: project.shortDescription || "",
  description: project.description || "",
  tech: project.tech || [],
  link: project.link || "",
  github: project.github || "",
  status: project.status,
  featured: project.featured,
});
