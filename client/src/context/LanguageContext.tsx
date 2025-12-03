import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LanguageCode = "en" | "vi" | string;

export interface TranslationData {
  [key: string]: string;
}

export interface LanguageData {
  code: string;
  name: string;
  nativeName: string;
  translations: TranslationData;
}

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  languages: LanguageData[];
  addLanguage: (language: LanguageData) => void;
  removeLanguage: (code: string) => void;
  updateTranslations: (code: string, translations: TranslationData) => void;
  t: (key: string, fallback?: string) => string;
  exportLanguage: (code: string) => string;
  importLanguage: (jsonData: string) => boolean;
}

const defaultLanguages: LanguageData[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    translations: {
      "site.title": "Loi Developer",
      "site.tagline": "Building digital experiences with code.",
      "nav.home": "Home",
      "nav.about": "About",
      "nav.skills": "Skills",
      "nav.services": "Services",
      "nav.projects": "Projects",
      "nav.testimonials": "Testimonials",
      "nav.blog": "Blog",
      "nav.contact": "Contact",
      "hero.greeting": "Hey there, I'm",
      "hero.role": "Full-stack Developer",
      "hero.role2": "Security Enthusiast",
      "hero.description": "Crafting secure & performant digital experiences with code",
      "hero.downloadCV": "Download CV",
      "hero.viewProjects": "View Projects",
      "hero.scrollDown": "Scroll Down",
      "about.title": "About Me",
      "about.subtitle": "Get to know me better",
      "skills.title": "Skills",
      "skills.subtitle": "Technologies I work with",
      "services.title": "Services",
      "services.subtitle": "What I can do for you",
      "projects.title": "Projects",
      "projects.subtitle": "Recent works",
      "testimonials.title": "Testimonials",
      "testimonials.subtitle": "What clients say",
      "blog.title": "Blog",
      "blog.subtitle": "Latest articles",
      "contact.title": "Contact",
      "contact.subtitle": "Get in touch",
      "contact.name": "Name",
      "contact.email": "Email",
      "contact.message": "Message",
      "contact.send": "Send Message",
      "footer.copyright": "All rights reserved",
      "admin.dashboard": "Dashboard",
      "admin.settings": "Settings",
      "admin.posts": "Posts",
      "admin.projects": "Projects",
      "admin.services": "Services",
      "admin.media": "Media",
      "admin.users": "Users",
      "admin.logout": "Logout",
      "nav.pages": "Pages",
      "nav.faqs": "FAQs",
    },
  },
  {
    code: "vi",
    name: "Vietnamese",
    nativeName: "Tiếng Việt",
    translations: {
      "site.title": "Loi Developer",
      "site.tagline": "Xây dựng trải nghiệm số với code.",
      "nav.home": "Trang chủ",
      "nav.about": "Giới thiệu",
      "nav.skills": "Kỹ năng",
      "nav.services": "Dịch vụ",
      "nav.projects": "Dự án",
      "nav.testimonials": "Đánh giá",
      "nav.blog": "Blog",
      "nav.contact": "Liên hệ",
      "hero.greeting": "Xin chào, tôi là",
      "hero.role": "Lập trình viên Full-stack",
      "hero.role2": "Chuyên gia Bảo mật",
      "hero.description": "Tạo ra những trải nghiệm số an toàn và hiệu suất cao với code",
      "hero.downloadCV": "Tải CV",
      "hero.viewProjects": "Xem Dự án",
      "hero.scrollDown": "Cuộn xuống",
      "about.title": "Về tôi",
      "about.subtitle": "Tìm hiểu thêm về tôi",
      "skills.title": "Kỹ năng",
      "skills.subtitle": "Công nghệ tôi sử dụng",
      "services.title": "Dịch vụ",
      "services.subtitle": "Những gì tôi có thể làm cho bạn",
      "projects.title": "Dự án",
      "projects.subtitle": "Các công việc gần đây",
      "testimonials.title": "Đánh giá",
      "testimonials.subtitle": "Khách hàng nói gì",
      "blog.title": "Blog",
      "blog.subtitle": "Bài viết mới nhất",
      "contact.title": "Liên hệ",
      "contact.subtitle": "Kết nối với tôi",
      "contact.name": "Họ tên",
      "contact.email": "Email",
      "contact.message": "Tin nhắn",
      "contact.send": "Gửi tin nhắn",
      "footer.copyright": "Đã đăng ký bản quyền",
      "admin.dashboard": "Bảng điều khiển",
      "admin.settings": "Cài đặt",
      "admin.posts": "Bài viết",
      "admin.projects": "Dự án",
      "admin.services": "Dịch vụ",
      "admin.media": "Media",
      "admin.users": "Người dùng",
      "admin.logout": "Đăng xuất",
      "nav.pages": "Trang",
      "nav.faqs": "Câu hỏi thường gặp",
    },
  },
];

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>("en");
  const [languages, setLanguages] = useState<LanguageData[]>(defaultLanguages);

  useEffect(() => {
    const storedLang = localStorage.getItem("currentLanguage");
    if (storedLang) {
      setCurrentLanguage(storedLang);
    }

    const storedLanguages = localStorage.getItem("languages");
    if (storedLanguages) {
      try {
        setLanguages(JSON.parse(storedLanguages));
      } catch (e) {
        console.error("Failed to parse languages:", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("currentLanguage", currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem("languages", JSON.stringify(languages));
  }, [languages]);

  const addLanguage = (language: LanguageData) => {
    setLanguages((prev) => {
      const existing = prev.findIndex((l) => l.code === language.code);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = language;
        return updated;
      }
      return [...prev, language];
    });
  };

  const removeLanguage = (code: string) => {
    if (code === "en") return;
    setLanguages((prev) => prev.filter((l) => l.code !== code));
    if (currentLanguage === code) {
      setCurrentLanguage("en");
    }
  };

  const updateTranslations = (code: string, translations: TranslationData) => {
    setLanguages((prev) =>
      prev.map((lang) =>
        lang.code === code
          ? { ...lang, translations: { ...lang.translations, ...translations } }
          : lang
      )
    );
  };

  const t = (key: string, fallback?: string): string => {
    const lang = languages.find((l) => l.code === currentLanguage);
    if (lang && lang.translations[key]) {
      return lang.translations[key];
    }
    const enLang = languages.find((l) => l.code === "en");
    if (enLang && enLang.translations[key]) {
      return enLang.translations[key];
    }
    return fallback || key;
  };

  const exportLanguage = (code: string): string => {
    const lang = languages.find((l) => l.code === code);
    if (!lang) return "";
    return JSON.stringify(lang, null, 2);
  };

  const importLanguage = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData) as LanguageData;
      if (!data.code || !data.name || !data.translations) {
        return false;
      }
      addLanguage(data);
      return true;
    } catch (e) {
      console.error("Failed to import language:", e);
      return false;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setCurrentLanguage,
        languages,
        addLanguage,
        removeLanguage,
        updateTranslations,
        t,
        exportLanguage,
        importLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
