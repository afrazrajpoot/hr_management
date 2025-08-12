import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { HRSidebar } from "./admin-sidebar";
import { HRHeader } from "./admin-header";

interface HRLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function HRLayout({ children, title, subtitle }: HRLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <HRSidebar />
        <div className="flex-1 flex flex-col">
          <HRHeader title={title} subtitle={subtitle} />
          <main className="flex-1 p-6 animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
