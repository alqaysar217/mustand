
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
  Loader2,
  CloudDownload,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

const CS_CURRICULUM = [
  // المستوى الأول - الترم الأول
  { l: "المستوى الأول", t: "الفصل الأول", ar: "مقدمة في الحاسوب", en: "Introduction to Computer" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "رياضيات (1)", en: "Mathematics (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "لغة إنجليزية (1)", en: "English Language (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "لغة عربية (1)", en: "Arabic Language (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "مهارات الحاسوب", en: "Computer Skills" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "ثقافة إسلامية (1)", en: "Islamic Culture (1)" },
  // المستوى الأول - الترم الثاني
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "برمجة (1)", en: "Programming (1)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "رياضيات (2)", en: "Mathematics (2)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "لغة إنجليزية (2)", en: "English Language (2)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "لغة عربية (2)", en: "Arabic Language (2)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "فيزياء إلكترونية", en: "Electronic Physics" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "ثقافة إسلامية (2)", en: "Islamic Culture (2)" },
  // المستوى الثاني - الترم الأول
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "تكنولوجيا الويب", en: "Web Technology" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "هياكل بيانات", en: "Data Structures" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "لغة إنجليزية (3)", en: "English Language (3)" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "لغة التجميع", en: "Assembly Language" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "رياضيات (3)", en: "Mathematics (3)" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "تصميم منطقي", en: "Logic Design" },
  // المستوى الثاني - الترم الثاني
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "برمجة كائنية (1)", en: "Object Oriented Programming (1)" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "قواعد بيانات (1)", en: "Database (1)" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "لغة إنجليزية (4)", en: "English Language (4)" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "عمارة حاسوب", en: "Computer Architecture" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "احتمالات وإحصاء", en: "Probability and Statistics" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "تراكيب محددة", en: "Discrete Structures" },
  // المستوى الثالث - الترم الأول
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "هندسة برمجيات (1)", en: "Software Engineering (1)" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "نظم تشغيل", en: "Operating Systems" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "ذكاء اصطناعي", en: "Artificial Intelligence" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "رسوم حاسوب", en: "Computer Graphics" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "اتصالات وبيانات", en: "Data Communications" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "بحوث عمليات", en: "Operations Research" },
  // المستوى الثالث - الترم الثاني
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "هندسة برمجيات (2)", en: "Software Engineering (2)" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "شبكات الحاسوب", en: "Computer Networks" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "تحليل وتصميم خوارزميات", en: "Analysis and Design of Algorithms" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "نظرية احتسابية", en: "Theory of Computation" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "لغات برمجة", en: "Programming Languages" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "تفاعل إنسان وحاسوب", en: "Human-Computer Interaction" },
  // المستوى الرابع - الترم الأول
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "معالجة صور", en: "Image Processing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "أمن حاسوب", en: "Computer Security" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "حوسبة سحابية", en: "Cloud Computing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "تنقيب بيانات", en: "Data Mining" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "جودة برمجيات", en: "Software Quality" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "ندوة", en: "Seminar" },
  // المستوى الرابع - الترم الثاني
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "نظم موزعة", en: "Distributed Systems" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "شبكات لاسلكية", en: "Wireless Networks" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "واقع افتراضي", en: "Virtual Reality" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "نظم خبيرة", en: "Expert Systems" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "مواضيع مختارة", en: "Selected Topics" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "مشروع التخرج (1)", en: "Graduation Project (1)" },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const firestore = useFirestore();

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

  const handleImportCurriculum = async () => {
    if (!firestore) return;
    setImporting(true);
    try {
      // 1. التأكد من وجود تخصص علوم الحاسوب أو إنشاؤه
      const deptsRef = collection(firestore, "departments");
      const deptQuery = query(deptsRef, where("name", "==", "علوم الحاسوب"));
      const deptSnap = await getDocs(deptQuery);
      
      let deptId = "";
      if (deptSnap.empty) {
        // إنشاء التخصص إذا لم يكن موجوداً
        const newDept = await addDoc(deptsRef, {
          name: "علوم الحاسوب",
          code: "CS",
          collegeName: "كلية تقنية المعلومات",
          collegeId: "manual_import",
          createdAt: serverTimestamp()
        });
        deptId = newDept.id;
      } else {
        deptId = deptSnap.docs[0].id;
      }

      // 2. إضافة المواد
      const subjectsRef = collection(firestore, "subjects");
      let count = 0;
      
      for (const item of CS_CURRICULUM) {
        // فحص بسيط لمنع التكرار (اختياري)
        await addDoc(subjectsRef, {
          nameAr: item.ar,
          nameEn: item.en,
          level: item.l,
          term: item.t,
          departmentId: deptId,
          departmentName: "علوم الحاسوب",
          createdAt: serverTimestamp()
        });
        count++;
      }

      toast({
        title: "تم الاستيراد بنجاح",
        description: `تمت إضافة ${count} مادة دراسية إلى تخصص علوم الحاسوب.`,
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ في الاستيراد", description: "فشل إرسال البيانات إلى السحابة." });
    } finally {
      setImporting(false);
    }
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

          {/* Data Management Section */}
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white border-r-4 border-secondary">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <Database className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-primary">إدارة البيانات والمنهج</h2>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm font-bold text-muted-foreground">يمكنك استيراد البيانات الأساسية للنظام دفعة واحدة لتهيئة التخصصات والمواد الدراسية.</p>
              <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-secondary/30 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-right">
                  <h4 className="font-bold text-primary">منهج قسم علوم الحاسوب</h4>
                  <p className="text-[10px] text-muted-foreground font-bold">استيراد 48 مادة (المستوى 1 إلى 4)</p>
                </div>
                <Button 
                  disabled={importing || !firestore}
                  onClick={handleImportCurriculum}
                  className="rounded-xl h-12 font-bold bg-secondary hover:bg-secondary/90 shadow-lg gap-2"
                >
                  {importing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudDownload className="w-5 h-5" />}
                  استيراد المنهج الدراسي (CS)
                </Button>
              </div>
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
                  <span>حالة الاتصال</span>
                  <span className="flex items-center gap-1">
                    {firestore ? <CheckCircle className="w-3 h-3 text-green-400" /> : <Loader2 className="w-3 h-3 animate-spin" />}
                    {firestore ? "متصل بالسحابة" : "جاري الاتصال..."}
                  </span>
                </div>
              </div>
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
