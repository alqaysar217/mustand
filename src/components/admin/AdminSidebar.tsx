
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Archive, 
  BarChart3, 
  History, 
  Settings, 
  LogOut,
  Trash2,
  ChevronLeft,
  Building2,
  School
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

const adminMenuItems = [
  { label: 'لوحة التحكم', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'إدارة المستخدمين', icon: Users, href: '/admin/users' },
  { label: 'إدارة الكليات', icon: School, href: '/admin/colleges' },
  { label: 'إدارة التخصصات', icon: Building2, href: '/admin/departments' },
  { label: 'إدارة الطلاب', icon: GraduationCap, href: '/admin/students' },
  { label: 'إدارة المواد', icon: BookOpen, href: '/admin/subjects' },
  { label: 'إدارة الأرشيف', icon: Archive, href: '/admin/archive' },
  { label: 'سلة المحذوفات', icon: Trash2, href: '/admin/recycle-bin' },
  { label: 'التقارير', icon: BarChart3, href: '/admin/reports' },
  { label: 'سجل العمليات', icon: History, href: '/admin/logs' },
  { label: 'الإعدادات', icon: Settings, href: '/admin/settings' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen } = useSidebarToggle();

  return (
    <aside className={cn(
      "w-64 h-screen bg-primary text-white hidden md:flex flex-col fixed right-0 top-0 z-40 border-l border-white/10 shadow-2xl transition-all duration-300 transform",
      isOpen ? "translate-x-0" : "translate-x-full"
    )}>
      <div className="p-8 flex items-center gap-4">
        <div className="relative w-12 h-12 bg-white/10 rounded-[10px] flex items-center justify-center border border-white/20 overflow-hidden shadow-lg shrink-0">
          <Image src="/logo-sand.png" alt="Logo" fill className="object-cover" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tight">مستند</span>
          <span className="text-[10px] text-white/50 font-bold">لوحة تحكم المدير</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group",
                isActive 
                  ? "bg-white text-primary shadow-lg font-bold" 
                  : "hover:bg-white/10 text-white/70 hover:text-white"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform", !isActive && "group-hover:scale-110")} />
              <span className="text-sm font-bold">{item.label}</span>
              {isActive && <ChevronLeft className="w-4 h-4 mr-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-white/5 rounded-3xl p-4 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm text-white">أد</div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">المدير العام</p>
              <p className="text-[10px] text-white/50 truncate font-bold">صلاحيات كاملة</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => router.push('/')}
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10 rounded-xl px-2 h-9 font-bold transition-colors"
          >
            <LogOut className="w-4 h-4 ml-2" />
            <span className="text-xs">تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
