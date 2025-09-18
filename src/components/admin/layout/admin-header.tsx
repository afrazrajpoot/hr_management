"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react"; // Add this import
import { Search, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HRHeaderProps {
  title: string;
  subtitle?: string;
}

export function HRHeader({ title, subtitle }: HRHeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession(); // Get session data

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: "/auth/sign-in" });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Handle loading state
  if (status === "loading") {
    return (
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-6">
        <SidebarTrigger className="h-8 w-8" />
        <div className="flex-1">
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        {/* Show skeleton or loading indicator */}
        <div className="animate-pulse bg-muted rounded-full h-8 w-8" />
        <Button
          variant="ghost"
          size="icon"
          disabled
          className="animate-pulse bg-muted rounded-full"
        >
          <div className="h-4 w-4 bg-muted-foreground/50 rounded-full" />
        </Button>
      </header>
    );
  }

  // Handle unauthenticated state
  if (!session || !session.user) {
    return null; // Or redirect to login
  }

  const user = session.user;
  const displayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.name || "User";

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
      : user.name
      ? `${user.name.charAt(0)}${user.name.charAt(1) || user.name.charAt(0)}`
      : "U";

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-sm px-6">
      <SidebarTrigger className="h-8 w-8" />

      <div className="flex-1">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="w-64 pl-9 bg-muted/50 border-border"
        />
      </div>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              3
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="p-2">
            <h4 className="font-medium mb-2">Notifications</h4>
            <div className="space-y-2">
              <div className="p-2 rounded-md bg-muted/50 text-sm">
                <p className="font-medium text-hr-risk-high">High Risk Alert</p>
                <p className="text-muted-foreground">
                  3 employees showing risk indicators
                </p>
              </div>
              <div className="p-2 rounded-md bg-muted/50 text-sm">
                <p className="font-medium">New Assessment</p>
                <p className="text-muted-foreground">
                  5 assessments completed today
                </p>
              </div>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      {/* <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </Button> */}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user.image || "/placeholder.svg"}
                alt={displayName}
              />
              <AvatarFallback className="bg-gradient-primary text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex flex-col space-y-1 p-2">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || user.role}
            </p>
            {user.role && (
              <Badge variant="secondary" className="mt-1">
                {user.role}
              </Badge>
            )}
          </div>
          <DropdownMenuSeparator />
          {/* <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem> */}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
