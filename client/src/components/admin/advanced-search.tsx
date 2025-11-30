import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, X, Filter } from "lucide-react";
import { useState } from "react";

interface SearchFilter {
  label: string;
  key: string;
  options: string[];
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, string>) => void;
  filters: SearchFilter[];
}

export function AdvancedSearch({ onSearch, filters }: AdvancedSearchProps) {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch(query, activeFilters);
  };

  const toggleFilter = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value,
    }));
  };

  const clearAll = () => {
    setQuery("");
    setActiveFilters({});
    onSearch("", {});
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} className="gap-2">
          <Search className="w-4 h-4" /> Search
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4 space-y-3">
          {filters.map((filter) => (
            <div key={filter.key}>
              <p className="text-sm font-medium mb-2">{filter.label}</p>
              <div className="flex flex-wrap gap-2">
                {filter.options.map((option) => (
                  <Button
                    key={option}
                    variant={
                      activeFilters[filter.key] === option
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleFilter(filter.key, option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="w-full gap-2 text-destructive hover:text-destructive"
          >
            <X className="w-4 h-4" /> Clear All
          </Button>
        </Card>
      )}
    </div>
  );
}
