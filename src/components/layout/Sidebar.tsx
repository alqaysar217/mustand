
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  UploadCloud, 
  Archive, 
  Search, 
  Settings, 
  LogOut,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'رفع اختبار', icon: UploadCloud, href: '/upload' },
  { label: 'الأرشيف', icon: Archive, href: '/archive' },
  { label: 'البحث', icon: Search, href: '/search' },
  { label: 'الإعدادات', icon: Settings, href: '/settings' },
];

// Reference for the logo
const LogoIcon = Archive;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // In a real app, you would clear session/cookies here
    router.push('/');
  };

  return (
    <aside className="w-64 h-screen bg-primary text-white hidden md:flex flex-col fixed right-0 top-0 z-40 border-l border-white/10 shadow-2xl">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
          <LogoIcon className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight">أرشيفا سمارت</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
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

      <div className="p-6 mt-auto">
        <div className="bg-white/5 rounded-3xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">م ع</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">محمد علي</p>
              <p className="text-xs text-white/50 truncate">موظف أرشيف</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 h-9"
          >
            <LogOut className="w-4 h-4 ml-2" />
            <span className="text-xs">تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
