import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Folder, Globe, Briefcase, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchResult {
  type: 'post' | 'project' | 'page' | 'service';
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  thumbnail?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data, isLoading } = useQuery<SearchResponse>({
    queryKey: ['/api/search', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { results: [], total: 0, query: "" };
      }
      const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}&limit=8`);
      if (!response.ok) throw new Error("Search failed");
      return response.json();
    },
    enabled: debouncedQuery.length >= 2,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4" />;
      case 'project':
        return <Folder className="w-4 h-4" />;
      case 'page':
        return <Globe className="w-4 h-4" />;
      case 'service':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getLink = (result: SearchResult) => {
    switch (result.type) {
      case 'post':
        return `/blog/${result.slug}`;
      case 'project':
        return `/projects#project-${result.id}`;
      case 'page':
        return `/page/${result.slug}`;
      case 'service':
        return `/#services`;
      default:
        return "/";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'post':
        return 'Blog Post';
      case 'project':
        return 'Project';
      case 'page':
        return 'Page';
      case 'service':
        return 'Service';
      default:
        return type;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="relative"
        data-testid="button-global-search"
      >
        <Search className="w-5 h-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search posts, projects, pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
                autoFocus
                data-testid="input-global-search"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setQuery("")}
                  data-testid="button-clear-search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {isLoading && debouncedQuery.length >= 2 && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && debouncedQuery.length >= 2 && data?.results.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No results found for "{debouncedQuery}"</p>
              </div>
            )}

            {!isLoading && debouncedQuery.length < 2 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Type at least 2 characters to search</p>
                <p className="text-xs mt-2">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-xs">K</kbd> to open search
                </p>
              </div>
            )}

            <AnimatePresence>
              {data?.results && data.results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2"
                >
                  {data.results.map((result, index) => (
                    <motion.div
                      key={`${result.type}-${result.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={getLink(result)} onClick={() => setIsOpen(false)}>
                        <div 
                          className="flex items-start gap-3 p-3 rounded-lg hover-elevate cursor-pointer"
                          data-testid={`search-result-${result.type}-${result.id}`}
                        >
                          <div className="flex-shrink-0 p-2 bg-muted rounded-md">
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{result.title}</h4>
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                {getTypeLabel(result.type)}
                              </Badge>
                            </div>
                            {result.excerpt && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.excerpt}
                              </p>
                            )}
                          </div>
                          {result.thumbnail && (
                            <img
                              src={result.thumbnail}
                              alt=""
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                  
                  {data.total > data.results.length && (
                    <p className="text-center text-sm text-muted-foreground pt-2">
                      Showing {data.results.length} of {data.total} results
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
