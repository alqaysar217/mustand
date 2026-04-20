"use client";

import { useState, useEffect } from "react";
import { Menu, User, Settings, LogOut, LayoutDashboard, Users, GraduationCap, BookOpen, Archive, BarChart3, History, Trash2, ChevronLeft, Building2, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

const adminMenuItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'إدارة المستخدمين', icon: Users, href: '/admin/users' },
  { label: 'إدارة الطلاب', icon: GraduationCap, href: '/admin/students' },
  { label: 'إدارة المواد', icon: BookOpen, href: '/admin/subjects' },
  { label: 'إدارة التخصصات', icon: Building2, href: '/admin/departments' },
  { label: 'إدارة الأرشيف', icon: Archive, href: '/admin/archive' },
  { label: 'سلة المحذوفات', icon: Trash2, href: '/admin/recycle-bin' },
  { label: 'التقارير', icon: BarChart3, href: '/admin/reports' },
  { label: 'سجل العمليات', icon: History, href: '/admin/logs' },
  { label: 'الإعدادات', icon: Settings, href: '/admin/settings' },
];

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isOpen, toggle } = useSidebarToggle();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <header className="h-20 bg-white border-b w-full" />;
  }

  return (
    <header className={cn(
      "h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 transition-all duration-300",
      isOpen ? "mr-0 md:mr-64" : "mr-0"
    )} dir="rtl">
      {/* Right Side: Logo & Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-primary/10 overflow-hidden shadow-sm shrink-0">
            <Image src="/logo-mustand.png" alt="Logo" fill className="object-contain p-1.5" />
          </div>
          <h2 className="text-xl font-black text-primary">مستند</h2>
        </div>

        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:flex rounded-xl text-primary hover:bg-primary/5"
          onClick={toggle}
          title={isOpen ? "إخفاء القائمة" : "إظهار القائمة"}
        >
          <PanelRight className={cn("w-6 h-6 transition-transform duration-300", !isOpen && "rotate-180")} />
        </Button>
      </div>

      {/* Left Side: Mobile Menu or Profile */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger - Shown only on mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="w-7 h-7 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 bg-primary border-none w-72 text-right">
              <div className="flex flex-col h-full text-white">
                <SheetHeader className="p-8 flex flex-row items-center gap-4 border-b border-white/10 text-right space-y-0">
                  <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-white/20 overflow-hidden shadow-lg shrink-0">
                    <Image src="/logo-mustand.png" alt="Logo" fill className="object-contain p-2" />
                  </div>
                  <SheetTitle className="text-xl font-bold tracking-tight text-white m-0">مستند</SheetTitle>
                </SheetHeader>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                  {adminMenuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group",
                          isActive 
                            ? "bg-white text-primary shadow-lg font-bold" 
                            : "hover:bg-white/10 text-white/70 hover:text-white"
                        )}
                      >
                        <Icon className={cn("w-5 h-5 transition-transform", !isActive && "group-hover:scale-110")} />
                        <span className="text-sm">{item.label}</span>
                        {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                      </Link>
                    );
                  })}
                </nav>

                <div className="p-6 border-t border-white/10">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/')}
                    className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 h-9 mt-4"
                  >
                    <LogOut className="w-4 h-4 ml-2" />
                    <span className="text-xs font-bold">تسجيل الخروج</span>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Profile Dropdown - Hidden on mobile */}
        <div className="hidden md:block">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors group shadow-sm">
                  <Image src="/profile.png" alt="Profile" fill className="object-cover" />
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2" dir="rtl">
              <DropdownMenuLabel className="text-right font-bold">حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold"
                onClick={() => router.push('/admin/settings')}
              >
                الإعدادات
                <Settings className="w-4 h-4" />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl text-destructive focus:text-destructive font-bold"
                onClick={() => router.push('/')}
              >
                تسجيل الخروج
                <LogOut className="w-4 h-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
