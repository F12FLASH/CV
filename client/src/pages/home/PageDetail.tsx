import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PageDetail() {
  const [match, params] = useRoute("/page/:slug");
  const [, setLocation] = useLocation();

  const { data: page, isLoading } = useQuery({
    queryKey: ["/api/pages", params?.slug],
    queryFn: async () => {
      const response = await fetch(`/api/pages/${params?.slug}`);
      if (!response.ok) throw new Error("Page not found");
      return response.json();
    },
    enabled: !!params?.slug,
  });

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-16 text-center container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/pages")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-24 pb-16"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-8"
            onClick={() => setLocation("/pages")}
            data-testid="button-back-to-pages"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pages
          </Button>

          {page.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden h-96">
              <img
                src={page.featuredImage}
                alt={page.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{page.title}</h1>
            {page.excerpt && (
              <p className="text-xl text-muted-foreground mb-4">{page.excerpt}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
              <span>{page.views} views</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            <div
              dangerouslySetInnerHTML={{ __html: page.content || "" }}
              className="
                [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-4
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-3
                [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2
                [&_p]:mb-4 [&_p]:leading-relaxed
                [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4
                [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4
                [&_li]:my-2
                [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground [&_blockquote]:italic
                [&_code]:bg-muted [&_code]:px-2 [&_code]:py-1 [&_code]:rounded [&_code]:font-mono
                [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
                [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary/80
                [&_img]:rounded-lg [&_img]:my-4 [&_img]:max-w-full [&_img]:h-auto
                [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
                [&_th]:bg-muted [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold
                [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2
              "
            />
          </motion.div>
        </div>
      </motion.article>

      <Footer />
    </div>
  );
}
