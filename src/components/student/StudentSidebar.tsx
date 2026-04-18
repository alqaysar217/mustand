
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  User, 
  Settings, 
  LogOut,
  Archive,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const menuItems = [
  { label: 'الرئيسية', icon: LayoutDashboard, href: '/student/dashboard' },
  { label: 'اختباراتي', icon: FileText, href: '/student/exams' },
  { label: 'البحث', icon: Search, href: '/student/search' },
  { label: 'الملف الشخصي', icon: User, href: '/student/profile' },
  { label: 'الإعدادات', icon: Settings, href: '/student/settings' },
];

export function StudentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 h-screen bg-primary text-white hidden md:flex flex-col fixed right-0 top-0 z-40 border-l border-white/10 shadow-2xl">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
          <Archive className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight">أرشيفا سمارت</span>
          <span className="text-[10px] text-white/50">بوابة الطالب</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
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

      <div className="p-6 mt-auto">
        <div className="bg-white/5 rounded-3xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">أ م</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">أحمد محمد علي</p>
              <p className="text-[10px] text-white/50 truncate">20210045</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 h-9"
          >
            <LogOut className="w-4 h-4 ml-2" />
            <span className="text-xs font-bold">تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
