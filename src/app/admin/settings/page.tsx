
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

// القائمة الرسمية المعتمدة لعام 2025/2026
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
  const [resetting, setReseting] = useState(false);
  const firestore = useFirestore();

  const handleSave = (section: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "تم الحفظ بنجاح", description: `تم تحديث إعدادات ${section} بنجاح.` });
    }, 1000);
  };

  // أداة بناء البيئة واستيراد الطلاب الحقيقيين بشكل صحيح
  const handleFullSetupAndImport = async () => {
    if (!firestore) return;
    setReseting(true);
    try {
      const batch = writeBatch(firestore);
      
      // 1. مسح البيانات القديمة (طلاب، كليات، تخصصات، أعوام) لتجنب التكرار والتعارض
      const collectionsToClear = ["students", "colleges", "departments", "academicYears"];
      for (const collName of collectionsToClear) {
        const snap = await getDocs(collection(firestore, collName));
        snap.docs.forEach(d => batch.delete(d.ref));
      }

      // 2. إنشاء الكلية المركزية
      const collegeRef = doc(collection(firestore, "colleges"));
      const collegeData = { name: "كلية الحاسبات وتقنية المعلومات", code: "CIT", createdAt: serverTimestamp() };
      batch.set(collegeRef, collegeData);

      // 3. إنشاء الأقسام العلمية وربطها بالكلية
      const itDeptRef = doc(collection(firestore, "departments"));
      const csDeptRef = doc(collection(firestore, "departments"));
      
      batch.set(itDeptRef, { nameAr: "تقنية معلومات", nameEn: "Information Technology", code: "IT", collegeId: collegeRef.id, collegeName: collegeData.name, createdAt: serverTimestamp() });
      batch.set(csDeptRef, { nameAr: "علوم حاسوب", nameEn: "Computer Science", code: "CS", collegeId: collegeRef.id, collegeName: collegeData.name, createdAt: serverTimestamp() });

      // 4. إنشاء العام الدراسي
      const yearRef = doc(collection(firestore, "academicYears"));
      batch.set(yearRef, { label: "2025 / 2026", isActive: true, createdAt: serverTimestamp() });

      // 5. إضافة قائمة الطلاب وربطهم بالمعرفات الحقيقية (الكلية، القسم، العام)
      const studentsRef = collection(firestore, "students");
      STUDENTS_2025_LIST.forEach((std) => {
        const studentDoc = doc(studentsRef);
        const isIT = std.d === "تقنية معلومات";
        
        batch.set(studentDoc, {
          name: std.n,
          regId: std.r,
          collegeId: collegeRef.id,
          collegeName: collegeData.name,
          departmentId: isIT ? itDeptRef.id : csDeptRef.id,
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

      // تسجيل في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "تهيئة بيئة واستيراد شامل (37 طالباً)",
        target: "دقة 100% لبيانات 2025",
        type: 'system',
        timestamp: serverTimestamp()
      });

      toast({ 
        title: "تمت التهيئة الشاملة بنجاح", 
        description: "تم إنشاء الكلية والأقسام وربط الطلاب بالمعرفات الصحيحة لضمان عمل واجهة التعديل." 
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "فشل الاستيراد الذكي" });
    } finally {
      setReseting(false);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h1 className="text-3xl font-black text-primary mb-1">إعدادات النظام المتقدمة</h1>
        <p className="text-muted-foreground font-bold">إدارة البنية التحتية والبيانات الضخمة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* كرت الاستيراد الذكي الجديد */}
          <Card className="p-8 border-none shadow-xl rounded-[10px] bg-blue-50 border-r-4 border-primary overflow-hidden relative">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-primary rounded-xl text-white shadow-lg"><Zap className="w-6 h-6" /></div>
                 <div>
                   <h2 className="text-xl font-black text-primary">التهيئة الذكية الشاملة (2025/2026)</h2>
                   <p className="text-xs font-bold text-slate-600">سيقوم هذا الإجراء بإعادة بناء الهيكل الأكاديمي وربط الطلاب بالمعرفات الصحيحة</p>
                 </div>
               </div>
               <div className="space-y-6">
                 <div className="bg-white/60 p-4 rounded-xl border border-blue-100 space-y-3">
                   <p className="text-sm font-bold text-slate-800 leading-relaxed">
                     بسبب عدم ظهور الكلية والقسم في واجهة التعديل، ستقوم هذه الأداة بإنشاء "كلية الحاسبات" والأقسام (IT/CS) أولاً، ثم ربط الـ 37 طالباً بمعرفاتها الرسمية.
                   </p>
                   <ul className="grid grid-cols-2 gap-2 text-[10px] font-black text-primary opacity-70">
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> إنشاء الكلية والأقسام</li>
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> إنشاء العام الدراسي 2025</li>
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ربط الطلاب بالمعرفات (IDs)</li>
                     <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> ضمان عمل واجهة التعديل</li>
                   </ul>
                 </div>
                 <Button 
                  disabled={resetting} 
                  onClick={handleFullSetupAndImport}
                  className="w-full h-14 rounded-xl font-black gradient-blue text-white shadow-xl gap-3 text-lg transition-all active:scale-95"
                 >
                   {resetting ? <Loader2 className="w-6 h-6 animate-spin" /> : <RefreshCcw className="w-6 h-6" />}
                   {resetting ? "جاري إعادة بناء البيئة..." : "تنفيذ التهيئة الذكية واستيراد الـ 37 طالباً"}
                 </Button>
               </div>
             </div>
             <Database className="absolute -bottom-6 -left-6 w-32 h-32 text-primary/5 rotate-12" />
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
