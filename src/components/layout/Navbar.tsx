
"use client";

import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 mr-0 md:mr-64 transition-all">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden rounded-xl">
          <Menu className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-bold text-primary">نظام الأرشفة الذكي</h2>
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
