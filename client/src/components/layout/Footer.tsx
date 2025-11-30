import { ArrowUp, Github, Linkedin, Twitter, LayoutDashboard } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  return (
    <footer className="py-8 bg-background border-t border-border/50 relative overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground flex flex-col md:flex-row items-center gap-4">
          <span className="font-mono">Crafted with ❤️ & countless cups of coffee</span>
          <div className="mt-1 md:mt-0">© 2024 Loi Developer. All rights reserved.</div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors" title="Admin Login">
             <LayoutDashboard size={18} />
          </Link>
          <div className="h-4 w-px bg-border mx-2 hidden md:block" />
          {[Github, Linkedin, Twitter].map((Icon, i) => (
            <a
              key={i}
              href="#"
              className="p-2 text-muted-foreground hover:text-primary transition-colors hover:scale-110 transform duration-300"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary/80 transition-all duration-300 z-40 animate-in fade-in zoom-in"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </footer>
  );
}
