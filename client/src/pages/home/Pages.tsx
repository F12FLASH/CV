import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, Eye, Loader2, FileText } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Pages() {
  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["/api/pages"],
    queryFn: async () => {
      const response = await fetch("/api/pages?published=true");
      if (!response.ok) throw new Error("Failed to fetch pages");
      return response.json();
    },
  });

  const publishedPages = pages.filter((page: any) => page.status === "Published");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Pages & <span className="text-primary">Resources</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Explore our custom pages and resources
              </p>
            </div>
          </motion.div>

          {publishedPages.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground text-lg">No published pages available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publishedPages.map((page: any, index: number) => (
                <motion.div
                  key={page.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    {page.featuredImage && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={page.featuredImage}
                          alt={page.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <Link href={`/page/${page.slug}`}>
                        <div className="cursor-pointer group">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                            {page.title}
                          </h3>
                        </div>
                      </Link>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {page.excerpt && (
                        <p className="text-muted-foreground line-clamp-3">
                          {page.excerpt}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {page.views}
                          </div>
                        </div>
                      </div>

                      <Link href={`/page/${page.slug}`}>
                        <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium mt-4">
                          Read More
                        </button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
