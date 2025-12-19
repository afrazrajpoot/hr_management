"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Moon,
  Sun,
  Settings,
  User,
  LogOut,
  HelpCircle,
  AlertTriangle,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HRHeaderProps {
  title: string;
  subtitle?: string;
}

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export function HRHeader({ title, subtitle }: HRHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const user = session?.user as User | undefined;

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email || "User";
  }, [user]);

  const initials = useMemo(() => {
    if (!displayName) return "U";
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [displayName]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/sign-in" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }, []);

  const fetchSuggestions = useCallback(async () => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [fetchSuggestions]);

  const handleSuggestionClick = useCallback((suggestion: any) => {
    setSearchQuery(`${suggestion.firstName} ${suggestion.lastName}`);
    setShowSuggestions(false);
    router.push(`/dashboard/companies?search=${encodeURIComponent(suggestion.firstName + " " + suggestion.lastName)}`);
  }, [router]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      router.push(`/dashboard/companies?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchQuery, router]);

  // Handle loading state
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-6">
        <SidebarTrigger className="h-8 w-8 text-muted-foreground" />
        <div className="flex-1">
          <div className="flex flex-col">
            <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            {subtitle && (
              <div className="h-4 w-32 bg-muted rounded animate-pulse mt-1"></div>
            )}
          </div>
        </div>
        <div className="animate-pulse bg-muted rounded-full h-8 w-8"></div>
      </header>
    );
  }

  if (!session || !user) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-sm px-6">
      {/* Sidebar Trigger */}
      <SidebarTrigger className="h-9 w-9 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors" />

      {/* Page Title */}
      <div className="flex-1">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="hidden lg:block relative">
        <form onSubmit={handleSearchSubmit}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search HR users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            className="w-72 pl-9 bg-muted/50 border-border focus:border-primary"
          />
        </form>

        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions.length > 0 || isSearching) && (
          <div className="absolute top-full left-0 w-full mt-2 bg-card border border-border rounded-lg shadow-xl z-[60] overflow-hidden">
            {isSearching ? (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary" />
              </div>
            ) : (
              <div className="py-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex flex-col"
                  >
                    <span className="text-sm font-medium text-foreground">
                      {suggestion.firstName} {suggestion.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {suggestion.email}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 hover:bg-muted"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full h-9 w-9 hover:bg-muted"
            >
              <Bell className="h-4 w-4" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs border-2 border-background"
              >
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 shadow-xl">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-foreground">Notifications</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                >
                  Mark all as read
                </Button>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="icon-wrapper-amber p-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        High Risk Alert
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        3 employees showing critical risk indicators
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        5 min ago
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="icon-wrapper-blue p-2">
                      <ClipboardList className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">
                        New Assessments
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        5 assessments completed today
                      </p>
                      <span className="text-xs text-muted-foreground mt-1 block">
                        2 hours ago
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 hover:bg-muted"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 pl-2 pr-3 rounded-full border border-transparent hover:border-border hover:bg-muted/50 transition-all"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user.image || "/placeholder.svg"}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-primary text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="ml-2 hidden md:block">
                <p className="text-sm font-medium text-foreground text-left">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.role || "Administrator"}
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 shadow-xl"
            align="end"
            forceMount
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="h-4 w-4 mr-2" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
