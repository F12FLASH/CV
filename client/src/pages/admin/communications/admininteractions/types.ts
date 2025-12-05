import type { Comment, Review, FAQ } from "@shared/schema";

export interface FAQFormData {
  question: string;
  answer: string;
  visible: boolean;
  order: number;
}

export const getEmptyFAQForm = (defaultOrder: number = 0): FAQFormData => ({
  question: "",
  answer: "",
  visible: true,
  order: defaultOrder,
});

export const mapFAQToFormData = (faq: FAQ): FAQFormData => ({
  question: faq.question,
  answer: faq.answer,
  visible: faq.visible,
  order: faq.order,
});

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Approved":
      return "border-l-green-500";
    case "Pending":
      return "border-l-yellow-500";
    case "Spam":
      return "border-l-red-500";
    default:
      return "border-l-gray-500";
  }
};

export type { Comment, Review, FAQ };
