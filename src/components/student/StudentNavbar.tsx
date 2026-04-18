
"use client";

import { Bell, Menu, User, LogOut, LayoutDashboard, FileText, Search, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/student/dashboard' },
  { label: 'اختباراتي', icon: FileText, href: '/student/exams' },
  { label: 'البحث', icon: Search, href: '/student/search' },
  { label: 'الملف الشخصي', icon: User, href: '/student/profile' },
  { label: 'الإعدادات', icon: Settings, href: '/student/settings' },
];

export function StudentNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 mr-0 md:mr-64 transition-all" dir="rtl">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
              <Menu className="w-6 h-6 text-primary" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 bg-primary border-none w-72 text-right">
            <div className="flex flex-col h-full text-white">
              <SheetHeader className="p-8 flex flex-row items-center gap-4 border-b border-white/10 text-right space-y-0">
                <div className="relative w-12 h-12 bg-white rounded-[10px] flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
                  <Image src="/logo-sand.png" alt="Logo" fill className="object-cover" />
                </div>
                <SheetTitle className="text-xl font-bold tracking-tight text-white m-0">بوابة الطالب</SheetTitle>
              </SheetHeader>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
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
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">أ م</div>
                  <div className="text-right">
                    <p className="text-sm font-bold">أحمد محمد علي</p>
                    <p className="text-[10px] text-white/50">20210045</p>
                  </div>
                </div>
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
        <h2 className="text-xl font-black text-primary hidden sm:block">بوابة الطالب</h2>
        <h2 className="text-lg font-black text-primary sm:hidden">الرئيسية</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-10 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/student/profile')}>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-primary">أحمد محمد علي</p>
            <p className="text-[10px] text-muted-foreground font-bold">20210045</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/20 hover:border-primary transition-colors group-hover:bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </header>
  );
}
