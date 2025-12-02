import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
}

export function SEOHead({
  title,
  description,
  image,
  url,
  type = "website",
  author,
  publishedTime,
  modifiedTime,
  tags,
}: SEOHeadProps) {
  useEffect(() => {
    const siteName = document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') || "Portfolio";
    const fullUrl = url || window.location.href;
    const fullImage = image?.startsWith("http") ? image : image ? `${window.location.origin}${image}` : undefined;

    document.title = title;

    const updateOrCreateMeta = (property: string, content: string | undefined, isName = false) => {
      if (!content) return;
      const attr = isName ? "name" : "property";
      let element = document.querySelector(`meta[${attr}="${property}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    updateOrCreateMeta("description", description, true);
    updateOrCreateMeta("og:title", title);
    updateOrCreateMeta("og:description", description);
    updateOrCreateMeta("og:url", fullUrl);
    updateOrCreateMeta("og:type", type);
    updateOrCreateMeta("og:site_name", siteName);
    if (fullImage) {
      updateOrCreateMeta("og:image", fullImage);
      updateOrCreateMeta("og:image:width", "1200");
      updateOrCreateMeta("og:image:height", "630");
    }

    updateOrCreateMeta("twitter:card", fullImage ? "summary_large_image" : "summary");
    updateOrCreateMeta("twitter:title", title);
    updateOrCreateMeta("twitter:description", description);
    if (fullImage) {
      updateOrCreateMeta("twitter:image", fullImage);
    }

    if (type === "article") {
      updateOrCreateMeta("article:author", author);
      updateOrCreateMeta("article:published_time", publishedTime);
      updateOrCreateMeta("article:modified_time", modifiedTime);
      tags?.forEach((tag, index) => {
        updateOrCreateMeta(`article:tag:${index}`, tag);
      });
    }

    return () => {
    };
  }, [title, description, image, url, type, author, publishedTime, modifiedTime, tags]);

  return null;
}
