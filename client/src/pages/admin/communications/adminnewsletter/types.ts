export interface NewsletterSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
  backgroundImage?: string;
}

export interface Subscriber {
  id: number;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export const getDefaultSettings = (): NewsletterSettings => ({
  enabled: false,
  title: "Subscribe to Our Newsletter",
  subtitle: "Get the latest updates",
  description: "Stay informed with our weekly newsletter",
  placeholder: "Enter your email",
  buttonText: "Subscribe",
  successMessage: "Thanks for subscribing!",
});
