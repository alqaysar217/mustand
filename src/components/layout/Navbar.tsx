
"use client";

import { Bell, Menu, User, LayoutDashboard, UploadCloud, Archive, Search, Settings, ChevronLeft, GraduationCap, BookOpen, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'رفع اختبار', icon: UploadCloud, href: '/upload' },
  { label: 'الأرشيف', icon: Archive, href: '/archive' },
  { label: 'إدارة الطلاب', icon: GraduationCap, href: '/students' },
  { label: 'إدارة المواد', icon: BookOpen, href: '/subjects' },
  { label: 'البحث', icon: Search, href: '/search' },
  { label: 'الإعدادات', icon: Settings, href: '/settings' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

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
              <SheetHeader className="p-8 flex items-center gap-4 border-b border-white/10 text-right space-y-0">
                <div className="relative w-12 h-12 bg-white rounded-[10px] flex items-center justify-center border border-white/20 overflow-hidden shadow-lg p-0">
                  <Image src="/logo-sand.png" alt="Logo" fill className="object-cover" />
                </div>
                <SheetTitle className="text-xl font-black tracking-tight text-white">مستند</SheetTitle>
              </SheetHeader>
              
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon as any;
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
                      <span className="font-bold">{item.label}</span>
                      {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-white/10">
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-white">م ع</div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">محمد علي</p>
                    <p className="text-[10px] text-white/50 font-bold">موظف أرشيف</p>
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
        <h2 className="text-xl font-black text-primary">مستند</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-10 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-primary">أ. محمد علي</p>
            <p className="text-[10px] text-muted-foreground font-bold">موظف (قسم الاختبارات)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/20 hover:border-primary transition-colors group">
            <User className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
}
