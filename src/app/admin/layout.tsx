
"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminNavbar } from "@/components/admin/AdminNavbar";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen } = useSidebarToggle();

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <AdminSidebar />
      <div className="flex flex-col">
        <AdminNavbar />
        <main className={cn(
          "transition-all duration-300 p-6 md:p-10 animate-fade-in",
          isOpen ? "mr-0 md:mr-64" : "mr-0"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
