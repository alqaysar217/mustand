
"use client";

import { Bell, Menu, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export function AdminNavbar() {
  const router = useRouter();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 mr-0 md:mr-64 transition-all">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-black text-primary">لوحة التحكم المركزية</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-muted group">
          <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
        </Button>
        
        <div className="h-10 w-px bg-border mx-2"></div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-left hidden sm:block text-right">
                <p className="text-sm font-bold text-primary">مدير النظام</p>
                <p className="text-[10px] text-muted-foreground font-bold">المسؤول الرئيسي</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border-2 border-primary/20 hover:border-primary transition-colors group-hover:bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
            <DropdownMenuLabel className="text-right font-bold">حسابي</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl">
              الإعدادات
              <Settings className="w-4 h-4" />
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl text-destructive focus:text-destructive"
              onClick={() => router.push('/')}
            >
              تسجيل الخروج
              <LogOut className="w-4 h-4" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
