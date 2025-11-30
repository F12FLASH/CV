import { ArrowUp, Github, Linkedin, Twitter, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    staleTime: 1000 * 60 * 5,
  });

  const footerText = settings?.footerText || "Crafted with love & countless cups of coffee";
  const footerCopyright = settings?.footerCopyright || "2024 Loi Developer. All rights reserved.";
  const socialGithub = settings?.socialGithub || "";
  const socialLinkedin = settings?.socialLinkedin || "";
  const socialTwitter = settings?.socialTwitter || "";

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socialLinks = [
    { url: socialGithub, icon: Github, name: "GitHub" },
    { url: socialLinkedin, icon: Linkedin, name: "LinkedIn" },
    { url: socialTwitter, icon: Twitter, name: "Twitter" },
  ].filter(s => s.url);

  return (
    <footer className="py-8 bg-background border-t border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground flex flex-col md:flex-row items-center gap-4">
          <span className="font-mono">{footerText}</span>
          <div className="mt-1 md:mt-0">{footerCopyright}</div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors" title="Admin Login">
             <LayoutDashboard size={18} />
          </Link>
          {socialLinks.length > 0 && (
            <>
              <div className="h-4 w-px bg-border mx-2 hidden md:block" />
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-300"
                  data-testid={`link-footer-${social.name.toLowerCase()}`}
                >
                  <social.icon size={20} />
                </a>
              ))}
            </>
          )}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition-all duration-300 z-40 animate-in fade-in zoom-in"
          data-testid="button-scroll-top"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </footer>
  );
}
