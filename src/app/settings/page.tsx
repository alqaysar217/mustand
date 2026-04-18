
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Lock,
  Globe,
  Bell,
  ShieldCheck,
  Database,
  ChevronLeft,
  Save,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

type SettingsTab = 'profile' | 'security' | 'notifications' | 'language';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const { isOpen } = useSidebarToggle();
  const { toast } = useToast();

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'الملف الشخصي', icon: User },
    { id: 'security' as SettingsTab, label: 'الأمان وكلمة المرور', icon: Lock },
    { id: 'notifications' as SettingsTab, label: 'التنبيهات', icon: Bell },
    { id: 'language' as SettingsTab, label: 'اللغة والمنطقة', icon: Globe },
  ];

  const handleSaveSettings = async () => {
    setIsSaving(true);
    // محاكاة عملية حفظ البيانات
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث إعدادات حسابك بنجاح في النظام.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "عذراً، حدث خطأ أثناء محاولة حفظ الإعدادات. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      <Sidebar />
      <Navbar />

      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in max-w-6xl mx-auto",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        <div className="mb-10 text-right">
          <h1 className="text-3xl font-bold text-primary mb-1">الإعدادات</h1>
          <p className="text-muted-foreground">تخصيص النظام وإدارة حسابك الشخصي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            {tabs.map((tab) => (
              <Card
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "p-4 border-none shadow-md rounded-2xl cursor-pointer transition-all group flex items-center justify-between",
                  activeTab === tab.id
                    ? "bg-primary text-white scale-105 shadow-primary/20"
                    : "bg-white hover:bg-muted/50 text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    activeTab === tab.id ? "bg-white/20" : "bg-primary/5"
                  )}>
                    <tab.icon className={cn(
                      "w-5 h-5",
                      activeTab === tab.id ? "text-white" : "text-primary"
                    )} />
                  </div>
                  <span className="font-bold">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronLeft className="w-4 h-4" />}
              </Card>
            ))}
          </div>

          <div className="md:col-span-3 space-y-8 animate-slide-up">
            {activeTab === 'profile' && (
              <>
                <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
                  <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4 flex items-center gap-2 justify-start">
                    <User className="w-5 h-5 text-secondary" />
                    معلومات الحساب
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-muted-foreground">اسم الموظف</label>
                      <input type="text" defaultValue="محمد علي" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right" />
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
                      <input type="email" defaultValue="m.ali@university.edu" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-left" />
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-muted-foreground">رقم الهاتف</label>
                      <input type="text" defaultValue="+218 91 123 4567" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-left" />
                    </div>
                    <div className="space-y-2 text-right">
                      <label className="text-xs font-bold text-muted-foreground">المسمى الوظيفي</label>
                      <input type="text" defaultValue="موظف أرشفة" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="rounded-xl px-10 h-12 font-bold gradient-blue shadow-lg gap-2"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {isSaving ? "جاري الحفظ..." : "حفظ التعديلات"}
                    </Button>
                  </div>
                </Card>

                <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
                  <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4 flex items-center gap-2 justify-start">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                    إعدادات النظام (للمشرفين)
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors group">
                      <div className="text-right">
                        <p className="font-bold text-primary">تفعيل التحليل التلقائي</p>
                        <p className="text-xs text-muted-foreground">استخدام الذكاء الاصطناعي لاستخراج بيانات الطلاب تلقائياً</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 transition-colors group">
                      <div className="text-right">
                        <p className="font-bold text-primary">الأرشفة السحابية</p>
                        <p className="text-xs text-muted-foreground">مزامنة الملفات مع التخزين السحابي الآمن</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === 'security' && (
              <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
                <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4 flex items-center gap-2 justify-start">
                  <Lock className="w-5 h-5 text-secondary" />
                  تغيير كلمة المرور
                </h2>
                <div className="space-y-6 max-w-md mr-0 ml-auto">
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-primary">كلمة المرور الحالية</label>
                    <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-primary">كلمة المرور الجديدة</label>
                    <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right" />
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-primary">تأكيد كلمة المرور</label>
                    <input type="password" placeholder="••••••••" className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right" />
                  </div>
                  <Button
                    onClick={handleSaveSettings}
                    disabled={isSaving}
                    className="w-full h-12 rounded-xl font-bold bg-primary shadow-lg mt-4 text-white"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    {isSaving ? "جاري التحديث..." : "تحديث كلمة المرور"}
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === 'notifications' && (
              <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
                <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4 flex items-center gap-2 justify-start">
                  <Bell className="w-5 h-5 text-secondary" />
                  تفضيلات التنبيهات
                </h2>
                <div className="space-y-4">
                  {[
                    { title: "تنبيهات البريد الإلكتروني", desc: "استلام تقارير دورية عبر البريد" },
                    { title: "إشعارات المتصفح", desc: "تنبيهات فورية عند رفع ملفات جديدة" },
                    { title: "تنبيهات النظام", desc: "إشعارات حول تحديثات النظام والأمان" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/10">
                      <div className="text-right">
                        <p className="font-bold text-primary">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeTab === 'language' && (
              <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
                <h2 className="text-xl font-bold text-primary mb-8 border-b pb-4 flex items-center gap-2 justify-start">
                  <Globe className="w-5 h-5 text-secondary" />
                  إعدادات اللغة والمنطقة
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-primary">لغة النظام الأساسية</label>
                    <select className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right appearance-none cursor-pointer">
                      <option value="ar">العربية (اللغة الافتراضية)</option>
                      <option value="en">English (الإنجليزية)</option>
                    </select>
                  </div>
                  <div className="space-y-2 text-right">
                    <label className="text-sm font-bold text-primary">المنطقة الزمنية</label>
                    <select className="w-full h-12 px-4 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary focus:bg-white outline-none font-bold transition-all text-right appearance-none cursor-pointer">
                      <option value="libya">طرابلس، ليبيا (GMT+2)</option>
                      <option value="cairo">القاهرة، مصر (GMT+3)</option>
                      <option value="riyadh">الرياض، السعودية (GMT+3)</option>
                    </select>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={isSaving}
                      className="w-full h-12 rounded-xl font-bold gradient-blue shadow-lg"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                      {isSaving ? "جاري الحفظ..." : "حفظ إعدادات المنطقة"}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
