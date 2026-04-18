
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Lock, 
  Settings, 
  Bell, 
  ShieldCheck, 
  Database,
  Sparkles,
  Save,
  UserCog,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSave = (section: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "تم الحفظ بنجاح",
        description: `تم تحديث إعدادات ${section} بنجاح.`,
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-primary mb-1">إعدادات النظام</h1>
        <p className="text-muted-foreground font-bold">إدارة حسابك الشخصي والتحكم في تفضيلات الأرشفة الذكية</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Account Information */}
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-primary/5 rounded-xl">
                <UserCog className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-primary">المعلومات الشخصية</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">الاسم الكامل</Label>
                <Input defaultValue="المدير العام" className="rounded-xl h-12 border-muted bg-muted/20 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">اسم المستخدم</Label>
                <Input defaultValue="admin_central" className="rounded-xl h-12 border-muted bg-muted/20 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">البريد الإلكتروني</Label>
                <Input defaultValue="admin@archiva.smart" className="rounded-xl h-12 border-muted bg-muted/20 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">رقم الهاتف</Label>
                <Input defaultValue="+218 90 000 0000" className="rounded-xl h-12 border-muted bg-muted/20 font-bold" />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => handleSave('الحساب')}
                disabled={loading}
                className="rounded-xl px-8 h-12 font-bold gradient-blue shadow-lg gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                حفظ التغييرات
              </Button>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-primary/5 rounded-xl">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-primary">الأمان وكلمة المرور</h2>
            </div>
            
            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">كلمة المرور الحالية</Label>
                <Input type="password" placeholder="••••••••" className="rounded-xl h-12 border-muted bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">كلمة المرور الجديدة</Label>
                <Input type="password" placeholder="••••••••" className="rounded-xl h-12 border-muted bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">تأكيد كلمة المرور</Label>
                <Input type="password" placeholder="••••••••" className="rounded-xl h-12 border-muted bg-muted/20" />
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button 
                onClick={() => handleSave('الأمان')}
                disabled={loading}
                className="rounded-xl px-8 h-12 font-bold gradient-blue shadow-lg gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                تحديث كلمة المرور
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          {/* System Toggles */}
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-primary/5 rounded-xl">
                <Settings className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-primary">تفضيلات النظام</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">التحليل الذكي (OCR)</p>
                    <p className="text-[10px] text-muted-foreground font-bold">استخراج البيانات تلقائياً</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">الأرشفة السحابية</p>
                    <p className="text-[10px] text-muted-foreground font-bold">نسخ احتياطي فوري</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">التنبيهات البريدية</p>
                    <p className="text-[10px] text-muted-foreground font-bold">تقارير العمليات اليومية</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">التحقق بخطوتين</p>
                    <p className="text-[10px] text-muted-foreground font-bold">حماية إضافية للحساب</p>
                  </div>
                </div>
                <Switch />
              </div>
            </div>
          </Card>

          {/* System Info Card */}
          <Card className="p-8 border-none shadow-xl rounded-3xl gradient-blue text-white overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-black mb-2">معلومات النظام</h3>
              <div className="space-y-2 text-xs font-bold text-white/80">
                <div className="flex justify-between">
                  <span>الإصدار</span>
                  <span>v2.4.0 (مستقر)</span>
                </div>
                <div className="flex justify-between">
                  <span>آخر تحديث</span>
                  <span>منذ 3 أيام</span>
                </div>
                <div className="flex justify-between">
                  <span>المساحة المستخدمة</span>
                  <span>14.2 GB / 50 GB</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-6 bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-xl font-bold h-10">
                تحقق من التحديثات
              </Button>
            </div>
            <div className="absolute -bottom-6 -left-6 opacity-10">
              <Settings className="w-32 h-32" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
