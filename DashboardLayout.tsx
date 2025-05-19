import React from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { MobileNav } from "./MobileNav";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#121212] text-[#FAF9F8]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar with Sheet */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden absolute top-4 left-4 z-10">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-[#1E1E1E] border-[#333333] w-64">
          <Sidebar />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-16 md:pb-0">
        <AppHeader />
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
}
