import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteContext";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      if (location === "/") {
        const sections = ["home", "about", "skills", "projects", "contact"];
        const current = sections.find((section) => {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            return rect.top <= 100 && rect.bottom >= 100;
          }
          return false;
        });
        if (current) setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const navLinks = [
    { name: t("nav.home"), href: "#home" },
    { name: t("nav.about"), href: "#about" },
    { name: t("nav.skills"), href: "#skills" },
    { name: t("nav.projects"), href: "#projects" },
    { name: t("nav.blog"), href: "#blog" },
    { name: t("nav.contact"), href: "#contact" },
  ];

  const scrollToSection = (id: string) => {
    const sectionId = id.replace("#", "");

    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (location !== "/") {
      setLocation("/");
    } else {
      scrollToSection("home");
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-md h-16"
          : "bg-transparent h-20"
      }`}
    >
      <div className="container mx-auto h-full flex items-center justify-between px-4 md:px-8">
        <div className="group cursor-pointer" onClick={handleLogoClick}>
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Logo"
              className="h-10 w-auto"
              data-testid="img-logo"
            />
          ) : (
            <div className="relative w-10 h-10 flex items-center justify-center border-2 border-foreground rounded hover:bg-primary hover:border-primary transition-all duration-500 group-hover:rotate-90">
              <span className="font-heading font-bold text-xl group-hover:text-white transition-colors">
                L
              </span>
            </div>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => scrollToSection(link.href)}
              className={`group relative text-sm font-medium transition-colors ${
                location === "/" && activeSection === link.href.replace("#", "")
                  ? "text-primary"
                  : "text-foreground/80 hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-primary hover:to-secondary"
              }`}
              data-testid={`nav-${link.href.replace("#", "")}`}
            >
              {link.name}
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-primary to-secondary transition-all duration-300 group-hover:w-full" />
              {location === "/" &&
                activeSection === link.href.replace("#", "") && (
                  <motion.div
                    layoutId="activeSection"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <LanguageSwitcher />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary/10 transition-colors"
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Button
            variant="outline"
            className="hidden lg:flex gap-2 border-primary text-primary relative overflow-hidden group transition-all hover:text-white hover:border-transparent"
            data-testid="button-download-cv"
            onClick={() => {
              if (settings.cvFileUrl) {
                const link = document.createElement("a");
                link.href = settings.cvFileUrl;
                link.download = settings.cvFileUrl.split("/").pop() || "CV.pdf";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } else {
                alert("CV file not available. Please contact the site owner.");
              }
            }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-primary to-secondary translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out" />
            <span className="relative z-10 flex items-center gap-2">
              <Download size={16} /> {t("Download CV") || "Download CV"}
            </span>
          </Button>
        </div>

        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          data-testid="button-mobile-menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 top-16 z-30 bg-background flex flex-col items-center justify-center gap-8 md:hidden"
          >
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => scrollToSection(link.href)}
                className="text-2xl font-heading font-bold text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </button>
            ))}
            <div className="flex gap-6 mt-8 items-center">
              <LanguageSwitcher />
              <button
                onClick={toggleTheme}
                className="p-4 bg-muted rounded-full"
              >
                {theme === "dark" ? <Moon size={24} /> : <Sun size={24} />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
