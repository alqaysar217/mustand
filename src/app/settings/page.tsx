
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  ShieldCheck, 
  Database,
  ChevronLeft
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in max-w-5xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-primary mb-1">الإعدادات</h1>
          <p className="text-muted-foreground">تخصيص النظام وإدارة حسابك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <Card className="p-4 border-none shadow-md rounded-2xl bg-white cursor-pointer hover:bg-primary hover:text-white transition-all group active">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-white/20">
                  <User className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold">الملف الشخصي</span>
              </div>
            </Card>
            <Card className="p-4 border-none shadow-md rounded-2xl bg-white cursor-pointer hover:bg-primary hover:text-white transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-white/20">
                  <Lock className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold">الأمان وكلمة المرور</span>
              </div>
            </Card>
            <Card className="p-4 border-none shadow-md rounded-2xl bg-white cursor-pointer hover:bg-primary hover:text-white transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-white/20">
                  <Bell className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold">التنبيهات</span>
              </div>
            </Card>
            <Card className="p-4 border-none shadow-md rounded-2xl bg-white cursor-pointer hover:bg-primary hover:text-white transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-white/20">
                  <Globe className="w-5 h-5 text-primary group-hover:text-white" />
                </div>
                <span className="font-bold">اللغة والمنطقة</span>
              </div>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-8">
            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
              <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4">معلومات الحساب</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">اسم الموظف</label>
                    <input type="text" defaultValue="محمد علي" className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-transparent focus:border-primary outline-none font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
                    <input type="email" defaultValue="m.ali@university.edu" className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-transparent focus:border-primary outline-none font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">رقم الهاتف</label>
                    <input type="text" defaultValue="+218 91 123 4567" className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-transparent focus:border-primary outline-none font-bold" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">المسمى الوظيفي</label>
                    <input type="text" defaultValue="موظف أرشفة" className="w-full h-12 px-4 rounded-xl bg-muted/30 border border-transparent focus:border-primary outline-none font-bold" />
                 </div>
              </div>
              <div className="flex justify-end">
                <Button className="rounded-xl px-10 h-12 font-bold gradient-blue shadow-lg">حفظ التعديلات</Button>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
              <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4">إعدادات النظام (للمشرفين)</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><ShieldCheck className="w-6 h-6" /></div>
                      <div>
                        <p className="font-bold text-primary">تفعيل التحليل التلقائي</p>
                        <p className="text-xs text-muted-foreground">تفعيل الذكاء الاصطناعي عند رفع كل اختبار</p>
                      </div>
                   </div>
                   <div className="w-12 h-6 bg-secondary rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                   </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-500/10 rounded-xl text-orange-600"><Database className="w-6 h-6" /></div>
                      <div>
                        <p className="font-bold text-primary">الأرشفة السحابية</p>
                        <p className="text-xs text-muted-foreground">مزامنة الملفات مع التخزين السحابي فوراً</p>
                      </div>
                   </div>
                   <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md"></div>
                   </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
