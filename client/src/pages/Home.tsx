import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Testimonials } from "@/components/sections/Testimonials";
import { Blog } from "@/components/sections/Blog";
import { Contact } from "@/components/sections/Contact";
import { Preloader } from "@/components/ui/Preloader";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Mail } from "lucide-react";
import type { HomepageSection } from "@shared/schema";

interface NewsletterSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  placeholder: string;
  buttonText: string;
  successMessage: string;
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [showNewsletter, setShowNewsletter] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: newsletterSettings } = useQuery<NewsletterSettings>({
    queryKey: ['/api/newsletter/settings'],
    enabled: !loading,
  });

  const { data: sections = [] } = useQuery<HomepageSection[]>({
    queryKey: ['/api/homepage/sections'],
    enabled: !loading,
  });

  const isSectionVisible = (sectionName: string): boolean => {
    const section = sections.find((s) => s.name === sectionName);
    return section ? section.visible : true;
  };

  // Lock scroll during loading
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [loading]);

  // Show newsletter popup on page load if enabled
  useEffect(() => {
    if (!loading && newsletterSettings?.enabled) {
      const dismissed = localStorage.getItem('newsletter-dismissed');
      if (!dismissed) {
        setShowNewsletter(true);
      }
    }
  }, [loading, newsletterSettings?.enabled]);

  const handleCloseNewsletter = () => {
    setShowNewsletter(false);
    localStorage.setItem('newsletter-dismissed', 'true');
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    try {
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
      setTimeout(() => {
        handleCloseNewsletter();
        setEmail("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      <div className={loading ? "opacity-0" : "opacity-100 transition-opacity duration-1000"}>
        <Navbar />
        <main>
          <Hero />
          <About />
          <Skills />
          <Services />
          {isSectionVisible('projects') && <Projects />}
          {isSectionVisible('testimonials') && <Testimonials />}
          {isSectionVisible('blog') && <Blog />}
          <Contact />
        </main>
        <Footer />

        {/* Newsletter Popup */}
        {showNewsletter && newsletterSettings?.enabled && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="newsletter-popup-overlay">
            <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-8 relative animate-in fade-in zoom-in-95 duration-300" data-testid="newsletter-popup">
              {/* Close Button */}
              <button
                onClick={handleCloseNewsletter}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-md transition-colors"
                data-testid="button-close-newsletter"
              >
                <X className="w-5 h-5" />
              </button>

              {!submitted ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg" data-testid="newsletter-title">{newsletterSettings.title}</h2>
                      <p className="text-sm text-muted-foreground" data-testid="newsletter-subtitle">{newsletterSettings.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6" data-testid="newsletter-description">
                    {newsletterSettings.description}
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <input
                      type="email"
                      placeholder={newsletterSettings.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      data-testid="input-newsletter-email"
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      data-testid="button-newsletter-subscribe"
                    >
                      {newsletterSettings.buttonText}
                    </Button>
                  </form>

                  <p className="text-xs text-center text-muted-foreground mt-4">
                    We respect your privacy. Unsubscribe at any time.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="font-medium" data-testid="newsletter-success-message">{newsletterSettings.successMessage}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
