
"use client";

import { Bell, Menu, User, LayoutDashboard, UploadCloud, Archive, Search, Settings, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const menuItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'رفع اختبار', icon: UploadCloud, href: '/upload' },
  { label: 'الأرشيف', icon: Archive, href: '/archive' },
  { label: 'البحث', icon: Search, href: '/search' },
  { label: 'الإعدادات', icon: Settings, href: '/settings' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 mr-0 md:mr-64 transition-all">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 bg-primary border-none w-72">
            <div className="flex flex-col h-full text-white">
              <SheetHeader className="p-8 flex items-center gap-3 border-b border-white/10 text-right space-y-0">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                  <Archive className="w-6 h-6" />
                </div>
                <SheetTitle className="text-xl font-bold tracking-tight text-white">مستند</SheetTitle>
              </SheetHeader>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
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
                      <span>{item.label}</span>
                      {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
                    </Link>
                  );
                })}
              </nav>

              <div className="p-6 border-t border-white/10">
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">م ع</div>
                  <div>
                    <p className="text-sm font-bold">محمد علي</p>
                    <p className="text-xs text-white/50">موظف أرشيف</p>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-xl font-bold text-primary">مستند</h2>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-10 w-px bg-border mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-left hidden sm:block">
            <p className="text-sm font-bold text-primary">أ. محمد علي</p>
            <p className="text-[10px] text-muted-foreground">موظف (قسم الاختبارات)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer group">
            <User className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>
    </header>
  );
}
