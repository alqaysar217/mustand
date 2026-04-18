
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Bell, 
  ShieldCheck, 
  LogOut, 
  Moon, 
  Globe, 
  ChevronLeft,
  Smartphone
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentSettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-black text-primary mb-1">الإعدادات</h1>
        <p className="text-muted-foreground font-bold">تخصيص تجربتك في بوابة الطالب</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
          <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 border-b pb-4">
            <Settings className="w-6 h-6 text-secondary" />
            التفضيلات العامة
          </h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">الإشعارات</p>
                    <p className="text-[10px] text-muted-foreground font-bold">تنبيه عند إضافة اختبار جديد</p>
                  </div>
               </div>
               <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">الوضع الليلي</p>
                    <p className="text-[10px] text-muted-foreground font-bold">تغيير مظهر التطبيق للوضع المظلم</p>
                  </div>
               </div>
               <Switch />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-primary/10 cursor-pointer">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">اللغة</p>
                    <p className="text-[10px] text-muted-foreground font-bold">العربية</p>
                  </div>
               </div>
               <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
          <h3 className="text-lg font-bold text-primary mb-8 flex items-center gap-2 border-b pb-4">
            <ShieldCheck className="w-6 h-6 text-green-600" />
            الأمان والجلسة
          </h3>
          
          <div className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl justify-between border-2 font-bold px-6"
              onClick={() => router.push('/student/profile')}
            >
              <ChevronLeft className="w-4 h-4" />
              تغيير كلمة المرور
            </Button>

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl justify-between border-2 font-bold px-6 text-destructive hover:bg-destructive/5 hover:text-destructive"
              onClick={() => router.push('/')}
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج من كافة الأجهزة
            </Button>
          </div>
        </Card>

        <div className="flex flex-col items-center gap-4 pt-10 pb-6 opacity-50">
           <Smartphone className="w-12 h-12 text-muted-foreground" />
           <div className="text-center">
             <p className="text-xs font-bold text-muted-foreground">ArchivaSmart v2.4.0</p>
             <p className="text-[10px] font-bold text-muted-foreground">نظام الأرشفة الذكي - بوابة الطالب</p>
           </div>
        </div>
      </div>
    </div>
  );
}
