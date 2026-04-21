
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Settings, 
  Database, 
  Sparkles,
  Save,
  UserCog,
  Loader2,
  CloudDownload,
  CheckCircle,
  Users,
  Layers,
  Zap,
  Trash2,
  Wrench,
  AlertTriangle,
  RefreshCcw,
  ShieldAlert
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, doc, writeBatch } from "firebase/firestore";

const SHARED_LEVELS_1_2 = [
  { l: "المستوى الأول", t: "الفصل الأول", ar: "مقدمة في الحاسوب", en: "Introduction to Computer" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "رياضيات (1)", en: "Mathematics (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "لغة إنجليزية (1)", en: "English Language (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "لغة عربية (1)", en: "Arabic Language (1)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "برمجة (1)", en: "Programming (1)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "فيزياء إلكترونية", en: "Electronic Physics" },
];

const CS_LEVELS_3_4 = [
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "هندسة برمجيات (1)", en: "Software Engineering (1)" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "ذكاء اصطناعي", en: "Artificial Intelligence" },
];

const IT_LEVELS_3_4 = [
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "إدارة مشاريع", en: "Project Management" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "اتصالات وبيانات", en: "Data Communications" },
];

// القائمة الجديدة التي زود بها المستخدم
const STUDENTS_2025_LIST = [
  { r: "221011506", n: "عمار صالح سالم عون", d: "تقنية معلومات" },
  { r: "221011110", n: "علي عبدالله أبوبكر الحامد", d: "علوم حاسوب" },
  { r: "221011113", n: "صالح محمد صالح السعدي", d: "علوم حاسوب" },
  { r: "221011503", n: "سالم محمد سالم باوزير", d: "تقنية معلومات" },
  { r: "221011116", n: "ريان رشيد عبدالله السعدي", d: "علوم حاسوب" },
  { r: "221011105", n: "الحسن علي سعيد بن اسحاق", d: "علوم حاسوب" },
  { r: "221011124", n: "أسامة مبارك سالمين بن نجار", d: "علوم حاسوب" },
  { r: "221011520", n: "أسعد نبيل أبوبكر الجفري", d: "تقنية معلومات" },
  { r: "221011119", n: "عبدالله مبارك علي بن شملان", d: "علوم حاسوب" },
  { r: "221011115", n: "محمد عبدالله صالح المحمدي", d: "علوم حاسوب" },
  { r: "221011118", n: "أحمد فؤاد أحمد بامهدي", d: "علوم حاسوب" },
  { r: "221011522", n: "سعيد كرامة مبارك بن مخاشن", d: "تقنية معلومات" },
  { r: "221011516", n: "محمد عبدالله محمد باوزير", d: "تقنية معلومات" },
  { r: "221011112", n: "علي عبدالقادر علي بارجاء", d: "علوم حاسوب" },
  { r: "221011117", n: "رامي رشيد عبدالله السعدي", d: "علوم حاسوب" },
  { r: "221011514", n: "صقر عبدالله صالح باجبار", d: "تقنية معلومات" },
  { r: "221011513", n: "صهيب صالح علي بن شهاب", d: "تقنية معلومات" },
  { r: "221011114", n: "محمد فائز مبروك بن ماضي", d: "علوم حاسوب" },
  { r: "221011504", n: "سالم عوض سالمين بلعجم", d: "تقنية معلومات" },
  { r: "221011122", n: "عبدالرحمن محمد عمر باعباد", d: "علوم حاسوب" },
  { r: "221011103", n: "يوسف عوض خميس بن حصن", d: "علوم حاسوب" },
  { r: "221011120", n: "عبدالله سعيد عبدالله باحكيم", d: "علوم حاسوب" },
  { r: "221011508", n: "عمر كرامة سالمين باظريس", d: "تقنية معلومات" },
  { r: "221011106", n: "معاذ محفوظ صالح باربيع", d: "علوم حاسوب" },
  { r: "221011121", n: "عبدالله صالح عمر بن مخاشن", d: "علوم حاسوب" },
  { r: "221011515", n: "محمد عمر عوض بايعشوت", d: "تقنية معلومات" },
  { r: "221011507", n: "عمر سالم عمر باداود", d: "تقنية معلومات" },
  { r: "221011125", n: "أسامة كمال محفوظ باوزير", d: "علوم حاسوب" },
  { r: "221011111", n: "أحمد محمد عبدالله بن عروة", d: "علوم حاسوب" },
  { r: "221011123", n: "عبدالله سالم عوض بريك", d: "علوم حاسوب" },
  { r: "221011107", n: "عبدالله صالح مبارك بن ثعلب", d: "علوم حاسوب" },
  { r: "221011126", n: "عبدالعزيز فضل ناصر العفيفي", d: "علوم حاسوب" },
  { r: "221011127", n: "أنس أحمد سعيد بن اسحاق", d: "علوم حاسوب" },
  { r: "221011510", n: "فكري فؤاد فكري باضاوي", d: "تقنية معلومات" },
  { r: "221011517", n: "محمد عبدالله أبوبكر الحامد", d: "تقنية معلومات" },
  { r: "221011505", n: "سالم مبروك سالمين بن نجار", d: "تقنية معلومات" },
  { r: "221011512", n: "صالح يسلم صالح باجبر", d: "تقنية معلومات" },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [resetting, setReseting] = useState(false);
  const firestore = useFirestore();

  const handleSave = (section: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "تم الحفظ بنجاح", description: `تم تحديث إعدادات ${section} بنجاح.` });
    }, 1000);
  };

  // أداة مسح واستيراد الطلاب الحقيقيين (2025/2026)
  const handleHardResetStudents = async () => {
    if (!firestore) return;
    setReseting(true);
    try {
      const batch = writeBatch(firestore);
      
      // 1. مسح الطلاب القدامى
      const studentsSnap = await getDocs(collection(firestore, "students"));
      studentsSnap.docs.forEach((d) => batch.delete(d.ref));

      // 2. جلب معرفات الأقسام لربطها (اختياري، سنستخدم الأسماء حالياً)
      const deptsSnap = await getDocs(collection(firestore, "departments"));
      const depts = deptsSnap.docs.map(d => ({ id: d.id, nameAr: d.data().nameAr }));

      // 3. إضافة القائمة الجديدة
      const studentsRef = collection(firestore, "students");
      STUDENTS_2025_LIST.forEach((std) => {
        const matchedDept = depts.find(d => d.nameAr === std.d);
        const newStudentDoc = doc(studentsRef);
        batch.set(newStudentDoc, {
          name: std.n,
          regId: std.r,
          collegeId: "central_college_id",
          collegeName: "كلية الحاسبات وتقنية المعلومات",
          departmentId: matchedDept?.id || "default_id",
          departmentName: std.d,
          level: "المستوى الثاني",
          academicYear: "2025 / 2026",
          admissionType: "عام",
          status: "active",
          joinDate: "2024-09-01",
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();

      // تسجيل العملية في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "تطهير واستيراد شامل للطلاب (2025/2026)",
        target: `إجمالي: ${STUDENTS_2025_LIST.length} طالب`,
        type: 'system',
        timestamp: serverTimestamp()
      });

      toast({ 
        title: "اكتملت العملية بنجاح", 
        description: `تم حذف السجلات القديمة وإضافة ${STUDENTS_2025_LIST.length} طالباً جديداً لعام 2025/2026.` 
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل الاستيراد الشامل" });
    } finally {
      setReseting(false);
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
          
          {/* قسم التطهير والاستيراد الشامل - 2025/2026 */}
          <Card className="p-8 border-none shadow-xl rounded-[10px] bg-rose-50 border-r-4 border-rose-500 overflow-hidden relative">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-rose-500 rounded-xl text-white shadow-lg"><ShieldAlert className="w-6 h-6" /></div>
                 <div>
                   <h2 className="text-xl font-black text-rose-900">تطهير واستيراد البيانات (2025/2026)</h2>
                   <p className="text-xs font-bold text-rose-700">هذا الإجراء سيحذف كافة الطلاب الحاليين ويستبدلهم بالقائمة الرسمية المعتمدة</p>
                 </div>
               </div>
               <div className="space-y-6">
                 <div className="bg-white/60 p-4 rounded-xl border border-rose-100 space-y-3">
                   <p className="text-sm font-bold text-rose-800 leading-relaxed">
                     سيقوم النظام الآن بتنفيذ "مسح شامل" لكافة سجلات الطلاب القديمة غير الصحيحة، ثم سيقوم بحقن القائمة المكونة من <span className="underline decoration-2">37 طالباً</span> لعام 2025/2026 مع ربطهم تلقائياً بكلية الحاسبات وتقنية المعلومات.
                   </p>
                   <ul className="grid grid-cols-2 gap-2 text-[10px] font-black text-rose-600 opacity-70">
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> حذف السجلات القديمة</li>
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> عام 2025 / 2026</li>
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> المستوى الثاني</li>
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> نوع القبول: عام</li>
                   </ul>
                 </div>
                 <Button 
                  disabled={resetting} 
                  onClick={handleHardResetStudents}
                  className="w-full h-14 rounded-xl font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xl gap-3 text-lg transition-all active:scale-95 border-b-4 border-rose-900"
                 >
                   {resetting ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6" />}
                   {resetting ? "جاري التطهير وإعادة الاستيراد..." : "تحديث كافة الطلاب للقائمة الجديدة (2025)"}
                 </Button>
               </div>
             </div>
             <Trash2 className="absolute -bottom-6 -left-6 w-32 h-32 text-rose-900/5 rotate-12" />
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-[10px] bg-white">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-primary/5 rounded-xl"><UserCog className="w-6 h-6 text-primary" /></div>
              <h2 className="text-xl font-bold text-primary">المعلومات الشخصية</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2"><Label className="font-bold text-primary mr-1">الاسم الكامل</Label><Input defaultValue="المدير العام" className="rounded-xl h-12 bg-muted/20 font-bold" /></div>
              <div className="space-y-2"><Label className="font-bold text-primary mr-1">اسم المستخدم</Label><Input defaultValue="admin_central" className="rounded-xl h-12 bg-muted/20 font-bold" /></div>
            </div>
            <div className="flex justify-end"><Button onClick={() => handleSave('الحساب')} disabled={loading} className="rounded-xl px-8 h-12 font-bold gradient-blue shadow-lg gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}حفظ التغييرات</Button></div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-[10px] bg-white border-r-4 border-secondary">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-secondary/10 rounded-xl"><Database className="w-6 h-6 text-secondary" /></div>
              <h2 className="text-xl font-bold text-primary">إدارة المنهج والبيانات الأساسية</h2>
            </div>
            <div className="space-y-6">
              <p className="text-sm font-bold text-muted-foreground mb-4">استيراد المناهج الدراسية الافتراضية للكليات لملء قاعدة البيانات بشكل سريع.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-primary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><CloudDownload className="w-6 h-6 text-primary" /></div>
                  <h4 className="font-bold text-primary">منهج علوم الحاسوب</h4>
                  <Button onClick={() => handleSave('المنهج')} className="rounded-xl h-10 w-full font-bold gradient-blue shadow-lg">تفعيل منهج (CS)</Button>
                </div>
                <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-secondary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><CloudDownload className="w-6 h-6 text-secondary" /></div>
                  <h4 className="font-bold text-primary">منهج تقنية المعلومات</h4>
                  <Button onClick={() => handleSave('المنهج')} className="rounded-xl h-10 w-full font-bold bg-secondary hover:bg-secondary/90 shadow-lg text-white">تفعيل منهج (IT)</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 border-none shadow-xl rounded-[10px] bg-white">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-primary/5 rounded-xl"><Settings className="w-6 h-6 text-primary" /></div>
              <h2 className="text-xl font-bold text-primary">تفضيلات النظام</h2>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/10 border border-transparent hover:border-primary/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg text-secondary"><Sparkles className="w-5 h-5" /></div>
                  <div><p className="font-bold text-primary text-sm">التحليل الذكي (OCR)</p><p className="text-[10px] text-muted-foreground font-bold">استخراج البيانات تلقائياً</p></div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
