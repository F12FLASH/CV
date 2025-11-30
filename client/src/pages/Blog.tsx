import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { Calendar, User, Eye, Clock, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState, useMemo } from "react";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: async () => {
      const response = await fetch('/api/posts');
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories', 'post'],
    queryFn: async () => {
      const response = await fetch('/api/categories?type=post');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  const publishedPosts = posts.filter((post: any) => post.status === 'Published');

  const filteredPosts = useMemo(() => {
    return publishedPosts.filter((post: any) => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [publishedPosts, searchQuery, selectedCategory]);

  const uniqueCategories: string[] = Array.from(new Set(publishedPosts.map((p: any) => p.category))).sort() as string[];

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Blog & <span className="text-primary">Articles</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Thoughts on web development, design, and creative coding.
              </p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-12 space-y-6"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 max-w-md"
                data-testid="input-search-blog"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => setSelectedCategory(null)}
                data-testid="button-filter-all"
              >
                All Articles
              </Button>
              {uniqueCategories.map((cat: string) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  data-testid={`button-filter-${cat}`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </motion.div>

          {/* Posts List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground mb-4">No articles found</p>
              <Button variant="outline" onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }} data-testid="button-clear-filters">
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="space-y-6 max-w-4xl">
              {filteredPosts.map((post: any, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  data-testid={`card-blog-${post.id}`}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{post.category}</Badge>
                            {post.status === 'Draft' && (
                              <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                                Draft
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(post.publishedAt)}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                          {post.excerpt}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground border-t pt-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {post.content 
                                ? Math.ceil(post.content.split(/\s+/).length / 200) 
                                : 1} min read
                            </span>
                          </div>
                        </div>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.tags.slice(0, 3).map((tag: string) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
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
