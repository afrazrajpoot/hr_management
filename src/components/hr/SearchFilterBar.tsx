import React, { ReactNode } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge"; // Import Badge component

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  type: "select";
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  placeholder: string;
  className?: string;
}

interface SearchFilterBarProps {
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  children?: ReactNode;
  onSearchClick?: () => void;
  showSearchButton?: boolean;
  filters?: FilterConfig[];
  dropdownBackground?: string;
}

const SearchFilterBar = ({
  title,
  description,
  searchValue,
  onSearchChange,
  placeholder = "Search...",
  children,
  onSearchClick,
  showSearchButton = true,
  filters = [],
  dropdownBackground = "bg-card", // Changed to match your card background
}: SearchFilterBarProps) => {
  return (
    <Card className="card-purple card-hover border-0 shadow-xl lg:col-span-2 bg-gradient-to-br from-white to-gray-50 dark:from-matte-gray-medium dark:to-matte-gray-light">
      <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent border-b border-matte dark:border-matte">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Search className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          {filters.length > 0 && (
            <div className="text-sm text-subtle dark:text-subtle-dark flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></span>
              <span>{filters.length} active filters</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch">
          {/* Search Input - Using your theme colors */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-subtle dark:text-subtle-dark" />
            <Input
              placeholder={placeholder}
              value={searchValue}
              onChange={onSearchChange}
              className="pl-10 h-12 border-matte dark:border-matte focus:border-purple-accent w-full bg-white dark:bg-matte-gray-subtle text-on-matte dark:text-on-matte shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && onSearchClick) {
                  onSearchClick();
                }
              }}
            />
          </div>

          {/* Filters - Using your theme colors */}
          {filters.map((filter, index) => (
            <div key={index} className={filter.className || "w-full lg:w-auto"}>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger
                  className="h-12 border-matte dark:border-matte min-w-[160px] bg-white dark:bg-matte-gray-subtle text-on-matte dark:text-on-matte hover:bg-gray-50 dark:hover:bg-matte-gray-subtle/80 shadow-sm"
                >
                  <SelectValue placeholder={filter.placeholder} />
                </SelectTrigger>
                <SelectContent className="bg-card border border-border shadow-lg max-h-[300px] overflow-y-auto">
                  {filter.options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-card-foreground hover:bg-gradient-to-r hover:from-primary hover:to-purple-600 hover:text-white focus:bg-gradient-to-r focus:from-primary focus:to-purple-600 focus:text-white cursor-pointer transition-all duration-200"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {/* Additional Children */}
          {children}

          {/* Search Button - Using your btn-gradient-primary class */}
          {showSearchButton && (
            <button
              onClick={onSearchClick}
              className="btn-purple px-6 h-12 rounded-lg text-white font-medium flex items-center justify-center gap-2 whitespace-nowrap w-full lg:w-auto hover:shadow-lg transition-all duration-300"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          )}
        </div>

        {/* Active Filters Summary */}
        {filters.some(f => f.value !== "" && f.value !== "all") && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {filters
                .filter(f => f.value !== "" && f.value !== "all")
                .map((filter, index) => {
                  const option = filter.options.find(opt => opt.value === filter.value);
                  return option ? (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {option.label}
                    </Badge>
                  ) : null;
                })}
              <button
                onClick={() => filters.forEach(f => f.onChange("all"))}
                className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilterBar;