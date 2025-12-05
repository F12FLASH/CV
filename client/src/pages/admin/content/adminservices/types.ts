import type { Service } from "@shared/schema";

export interface ServiceFormData {
  title: string;
  description: string;
  icon: string;
  features: string[];
  price: string;
  order: number;
  active: boolean;
}

export const getEmptyServiceForm = (): ServiceFormData => ({
  title: "",
  description: "",
  icon: "code",
  features: [],
  price: "",
  order: 0,
  active: true,
});

export const mapServiceToFormData = (service: Service): ServiceFormData => ({
  title: service.title,
  description: service.description || "",
  icon: service.icon || "code",
  features: service.features || [],
  price: service.price || "",
  order: service.order,
  active: service.active,
});

export type { Service };
