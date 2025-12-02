import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface NewsletterSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const { data: settings } = useQuery<NewsletterSettings>({
    queryKey: ['/api/newsletter/settings'],
  });

  if (!settings?.enabled) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail("");
        toast({
          title: "Successfully subscribed!",
          description: settings.successMessage,
        });
      } else {
        const data = await response.json();
        toast({
          title: "Subscription failed",
          description: data.message || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-muted/30" id="newsletter">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-3" data-testid="newsletter-section-title">
            {settings.title}
          </h2>
          <p className="text-lg text-muted-foreground mb-2" data-testid="newsletter-section-subtitle">
            {settings.subtitle}
          </p>
          <p className="text-muted-foreground mb-8" data-testid="newsletter-section-description">
            {settings.description}
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 p-6 bg-green-500/10 rounded-lg border border-green-500/20"
            >
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium" data-testid="newsletter-section-success">
                {settings.successMessage}
              </span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder={settings.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                data-testid="input-newsletter-section-email"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="sm:w-auto"
                data-testid="button-newsletter-section-subscribe"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {settings.buttonText}
              </Button>
            </form>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
