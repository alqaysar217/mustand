
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
  Trash2
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

const STUDENTS_IMPORT_LIST = [
  { n: "عمار صالح سالم عون", r: "221011506", d: "تقنية المعلومات" },
  { n: "علي عبدالله أبوبكر الحامد", r: "221011110", d: "علوم الحاسوب" },
  { n: "صالح محمد صالح السعدي", r: "221011113", d: "علوم الحاسوب" },
  { n: "سالم محمد سالم باوزير", r: "221011503", d: "تقنية المعلومات" },
  { n: "ريان رشيد عبدالله السعدي", r: "221011116", d: "علوم الحاسوب" },
  { n: "الحسن علي سعيد بن اسحاق", r: "221011105", d: "علوم الحاسوب" },
  { n: "أسامة مبارك سالمين بن نجار", r: "221011124", d: "علوم الحاسوب" },
  { n: "أسعد نبيل أبوبكر الجفري", r: "221011520", d: "تقنية المعلومات" },
  { n: "عبدالله مبارك علي بن شملان", r: "221011119", d: "علوم الحاسوب" },
  { n: "محمد عبدالله صالح المحمدي", r: "221011115", d: "علوم الحاسوب" },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importingCS, setImportingCS] = useState(false);
  const [importingIT, setImportingIT] = useState(false);
  const [importingStudents, setImportingStudents] = useState(false);
  const [injectingArchives, setInjectingArchives] = useState(false);
  const [clearingArchives, setClearingArchives] = useState(false);
  const firestore = useFirestore();

  const handleSave = (section: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "تم الحفظ بنجاح", description: `تم تحديث إعدادات ${section} بنجاح.` });
    }, 1000);
  };

  const handleClearArchives = async () => {
    if (!firestore) return;
    setClearingArchives(true);
    try {
      const archivesRef = collection(firestore, "archives");
      const snap = await getDocs(archivesRef);
      const batch = writeBatch(firestore);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      toast({ title: "تم مسح الأرشيف", description: "تم حذف كافة السجلات بنجاح." });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في المسح" });
    } finally {
      setClearingArchives(false);
    }
  };

  const handleInjectMockArchives = async () => {
    if (!firestore) return;
    setInjectingArchives(true);
    try {
      const archivesRef = collection(firestore, "archives");
      const subjectsRef = collection(firestore, "subjects");
      
      const subSnap = await getDocs(subjectsRef);
      const subs = subSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      let count = 0;
      // الحقن بـ 10 سجلات باستخدام صور exam-1.png إلى exam-10.png من مجلد public
      for (let i = 1; i <= 10; i++) {
        const student = STUDENTS_IMPORT_LIST[(i - 1) % STUDENTS_IMPORT_LIST.length];
        const subject = subs.length > 0 ? subs[(i - 1) % subs.length] : { nameAr: "مادة تجريبية " + i, id: "mock_" + i, level: "المستوى الأول", departmentId: "central_dept", departmentName: "تقنية المعلومات", collegeName: "كلية الحاسبات" };
        
        await addDoc(archivesRef, {
          studentName: student.n,
          studentRegId: student.r,
          subjectName: (subject as any).nameAr || "مادة مجهولة",
          subjectId: subject.id,
          year: "2023 / 2024",
          term: i % 2 === 0 ? "الفصل الأول" : "الفصل الثاني",
          departmentId: (subject as any).departmentId || "central_dept_id",
          departmentName: (subject as any).departmentName || "تقنية المعلومات",
          collegeName: (subject as any).collegeName || "كلية الحاسبات",
          level: (subject as any).level || "المستوى الأول",
          fileUrl: `/exam-${i}.png`, // الإشارة للصور في مجلد public
          pages: 1,
          uploadedAt: serverTimestamp()
        });
        count++;
      }

      toast({
        title: "تم حقن البيانات",
        description: `تمت إضافة ${count} سجلات مؤرشفة بنجاح مع كافة بيانات التصفية من الصور الحقيقية.`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في الحقن", description: "فشل تزويد الأرشيف بالبيانات." });
    } finally {
      setInjectingArchives(false);
    }
  };

  const importCurriculum = async (deptName: string, deptCode: string, curriculum: any[], setStatus: any) => {
    if (!firestore) return;
    setStatus(true);
    try {
      const deptsRef = collection(firestore, "departments");
      const deptQuery = query(deptsRef, where("name", "==", deptName));
      const deptSnap = await getDocs(deptQuery);
      
      let deptId = "";
      let collegeName = "كلية الحاسبات وتكنولوجيا المعلومات";
      if (deptSnap.empty) {
        const newDept = await addDoc(deptsRef, {
          name: deptName,
          code: deptCode,
          collegeName: collegeName,
          collegeId: "central_college_id",
          createdAt: serverTimestamp()
        });
        deptId = newDept.id;
      } else {
        deptId = deptSnap.docs[0].id;
        collegeName = deptSnap.docs[0].data().collegeName;
      }

      const subjectsRef = collection(firestore, "subjects");
      let count = 0;
      for (const item of curriculum) {
        const subQuery = query(subjectsRef, where("nameAr", "==", item.ar), where("departmentId", "==", deptId));
        const subSnap = await getDocs(subQuery);
        if (subSnap.empty) {
          await addDoc(subjectsRef, {
            nameAr: item.ar,
            nameEn: item.en,
            level: item.l,
            term: item.t,
            departmentId: deptId,
            departmentName: deptName,
            collegeName: collegeName,
            createdAt: serverTimestamp()
          });
          count++;
        }
      }
      toast({ title: `تم استيراد منهج ${deptName} بنجاح`, description: `تمت إضافة ${count} مادة دراسية.` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setStatus(false);
    }
  };

  const handleImportStudents = async () => {
    if (!firestore) return;
    setImportingStudents(true);
    try {
      const studentsRef = collection(firestore, "students");
      let count = 0;
      for (const std of STUDENTS_IMPORT_LIST) {
        const q = query(studentsRef, where("regId", "==", std.r));
        const snap = await getDocs(q);
        if (snap.empty) {
          await addDoc(studentsRef, {
            name: std.n,
            regId: std.r,
            departmentId: "default_id",
            departmentName: std.d,
            level: "المستوى الثاني",
            status: "active",
            joinDate: "2022-09-01",
            createdAt: serverTimestamp()
          });
          count++;
        }
      }
      toast({ title: "تم استيراد الطلاب", description: `تمت إضافة ${count} طالب بنجاح.` });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ" });
    } finally {
      setImportingStudents(false);
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
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
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

          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white border-r-4 border-secondary">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-secondary/10 rounded-xl"><Database className="w-6 h-6 text-secondary" /></div>
              <h2 className="text-xl font-bold text-primary">إدارة البيانات والمنهج</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-primary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><CloudDownload className="w-6 h-6 text-primary" /></div>
                  <h4 className="font-bold text-primary">منهج علوم الحاسوب</h4>
                  <Button disabled={importingCS} onClick={() => importCurriculum("علوم الحاسوب", "CS", [...SHARED_LEVELS_1_2, ...CS_LEVELS_3_4], setImportingCS)} className="rounded-xl h-10 w-full font-bold gradient-blue shadow-lg">استيراد (CS)</Button>
                </div>
                <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-secondary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><CloudDownload className="w-6 h-6 text-secondary" /></div>
                  <h4 className="font-bold text-primary">منهج تقنية المعلومات</h4>
                  <Button disabled={importingIT} onClick={() => importCurriculum("تقنية المعلومات", "IT", [...SHARED_LEVELS_1_2, ...IT_LEVELS_3_4], setImportingIT)} className="rounded-xl h-10 w-full font-bold bg-secondary hover:bg-secondary/90 shadow-lg text-white">استيراد (IT)</Button>
                </div>
              </div>
              <Button disabled={importingStudents} onClick={handleImportStudents} className="w-full rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg gap-2">{importingStudents ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}استيراد سجلات الطلاب الحقيقيين</Button>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-3xl bg-primary/5 border-r-4 border-orange-500">
             <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-orange-500 rounded-xl text-white shadow-lg"><Zap className="w-6 h-6" /></div>
               <h2 className="text-xl font-bold text-primary">أدوات تطوير الأرشيف</h2>
             </div>
             <div className="space-y-4">
               <p className="text-sm font-bold text-muted-foreground">أداة لحقن الأرشيف بـ 10 اختبارات مؤرشفة حقيقية باستخدام الصور الموجودة في النظام لغرض التجربة الفورية، مع خيار لتفريغ الأرشيف الحالي.</p>
               <div className="flex flex-col sm:flex-row gap-4">
                 <Button 
                  disabled={injectingArchives} 
                  onClick={handleInjectMockArchives}
                  className="flex-1 h-14 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xl gap-3 text-lg"
                 >
                   {injectingArchives ? <Loader2 className="w-6 h-6 animate-spin" /> : <Layers className="w-6 h-6" />}
                   حقن 10 سجلات كاملة (صور حقيقية)
                 </Button>
                 <Button 
                  variant="destructive"
                  disabled={clearingArchives} 
                  onClick={handleClearArchives}
                  className="flex-1 h-14 rounded-2xl font-black shadow-xl gap-3 text-lg"
                 >
                   {clearingArchives ? <Loader2 className="w-6 h-6 animate-spin" /> : <Trash2 className="w-6 h-6" />}
                   مسح كافة السجلات الحالية
                 </Button>
               </div>
             </div>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
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
