
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  User, 
  GraduationCap, 
  Building, 
  Briefcase, 
  Calendar, 
  Lock, 
  Save, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [studentInfo] = useState({
    name: 'أحمد محمد علي محمود',
    regId: '20210045',
    department: 'تقنية المعلومات',
    level: 'المستوى الثالث',
    admissionType: 'عام',
    joinDate: '2021-09-12'
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "تم تغيير كلمة المرور",
        description: "تم تحديث كلمة المرور بنجاح، يرجى تذكرها للدخول القادم.",
      });
    }, 1500);
  };

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-black text-primary mb-1">ملفي الشخصي</h1>
        <p className="text-muted-foreground font-bold">إدارة بياناتك الأكاديمية وإعدادات الأمان</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info Card */}
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white overflow-hidden relative">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-32 h-32 rounded-3xl gradient-blue flex items-center justify-center text-white text-5xl font-black shadow-xl">
                أ
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div className="border-b pb-4">
                  <h2 className="text-2xl font-black text-primary mb-1">{studentInfo.name}</h2>
                  <p className="text-secondary font-bold flex items-center justify-end gap-2">
                    {studentInfo.regId}
                    <User className="w-4 h-4" />
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                      التخصص الدراسي
                      <Building className="w-3 h-3" />
                    </p>
                    <p className="font-bold text-primary">{studentInfo.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                      المستوى الحالي
                      <GraduationCap className="w-3 h-3" />
                    </p>
                    <p className="font-bold text-primary">{studentInfo.level}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                      نوع القبول
                      <Briefcase className="w-3 h-3" />
                    </p>
                    <p className="font-bold text-primary">{studentInfo.admissionType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                      تاريخ الالتحاق
                      <Calendar className="w-3 h-3" />
                    </p>
                    <p className="font-bold text-primary">{studentInfo.joinDate}</p>
                  </div>
                </div>
              </div>
            </div>
            <User className="absolute -bottom-10 -left-10 w-40 h-40 opacity-5 text-primary" />
          </Card>

          {/* Account Status */}
          <Card className="p-6 border-none shadow-lg bg-green-50 border-r-4 border-green-500 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
             </div>
             <div className="text-right">
                <h4 className="font-bold text-green-800">حالة الحساب: نشط</h4>
                <p className="text-xs text-green-700 font-medium">حسابك مسجل في النظام المركزي، يمكنك الوصول لكافة اختباراتك المؤرشفة.</p>
             </div>
          </Card>
        </div>

        <div className="space-y-8">
           {/* Change Password Card */}
           <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
             <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2 border-b pb-3">
               <Lock className="w-5 h-5 text-secondary" />
               تغيير كلمة المرور
             </h3>
             <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-primary font-bold mr-1">كلمة المرور الحالية</Label>
                  <Input type="password" required className="rounded-xl h-11 border-muted bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold mr-1">كلمة المرور الجديدة</Label>
                  <Input type="password" required className="rounded-xl h-11 border-muted bg-muted/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold mr-1">تأكيد كلمة المرور</Label>
                  <Input type="password" required className="rounded-xl h-11 border-muted bg-muted/20" />
                </div>
                <Button 
                  disabled={loading}
                  className="w-full h-12 rounded-xl font-bold gradient-blue shadow-lg gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  تحديث كلمة المرور
                </Button>
             </form>
           </Card>

           <Card className="p-6 border-none shadow-xl rounded-3xl bg-primary text-white text-center">
             <h4 className="font-bold mb-2">الدعم الفني</h4>
             <p className="text-[10px] text-white/70 mb-4 font-bold">في حال وجود أي خطأ في بياناتك الأكاديمية، يرجى مراجعة قسم شؤون الطلاب.</p>
             <Button variant="outline" className="w-full rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold h-10">
               تواصل معنا
             </Button>
           </Card>
        </div>
      </div>
    </div>
  );
}
