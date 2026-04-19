
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
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

const SHARED_LEVELS_1_2 = [
  { l: "المستوى الأول", t: "الفصل الأول", ar: "مقدمة في الحاسوب", en: "Introduction to Computer" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "رياضيات (1)", en: "Mathematics (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "لغة إنجليزية (1)", en: "English Language (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "لغة عربية (1)", en: "Arabic Language (1)" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "مهارات الحاسوب", en: "Computer Skills" },
  { l: "المستوى الأول", t: "الفصل الأول", ar: "ثقافة إسلامية (1)", en: "Islamic Culture (1)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "برمجة (1)", en: "Programming (1)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "رياضيات (2)", en: "Mathematics (2)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "لغة إنجليزية (2)", en: "English Language (2)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "لغة عربية (2)", en: "Arabic Language (2)" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "فيزياء إلكترونية", en: "Electronic Physics" },
  { l: "المستوى الأول", t: "الفصل الثاني", ar: "ثقافة إسلامية (2)", en: "Islamic Culture (2)" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "تكنولوجيا الويب", en: "Web Technology" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "هياكل بيانات", en: "Data Structures" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "لغة إنجليزية (3)", en: "English Language (3)" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "لغة التجميع", en: "Assembly Language" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "رياضيات (3)", en: "Mathematics (3)" },
  { l: "المستوى الثاني", t: "الفصل الأول", ar: "تصميم منطقي", en: "Logic Design" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "برمجة كائنية (1)", en: "Object Oriented Programming (1)" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "قواعد بيانات (1)", en: "Database (1)" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "لغة إنجليزية (4)", en: "English Language (4)" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "عمارة حاسوب", en: "Computer Architecture" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "احتمالات وإحصاء", en: "Probability and Statistics" },
  { l: "المستوى الثاني", t: "الفصل الثاني", ar: "تراكيب محددة", en: "Discrete Structures" },
];

const CS_LEVELS_3_4 = [
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "هندسة برمجيات (1)", en: "Software Engineering (1)" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "نظم تشغيل", en: "Operating Systems" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "ذكاء اصطناعي", en: "Artificial Intelligence" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "رسوم حاسوب", en: "Computer Graphics" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "اتصالات وبيانات", en: "Data Communications" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "بحوث عمليات", en: "Operations Research" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "هندسة برمجيات (2)", en: "Software Engineering (2)" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "شبكات الحاسوب", en: "Computer Networks" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "تحليل وتصميم خوارزميات", en: "Analysis and Design of Algorithms" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "نظرية احتسابية", en: "Theory of Computation" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "لغات برمجة", en: "Programming Languages" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "تفاعل إنسان وحاسوب", en: "Human-Computer Interaction" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "معالجة صور", en: "Image Processing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "أمن حاسوب", en: "Computer Security" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "حوسبة سحابية", en: "Cloud Computing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "تنقيب بيانات", en: "Data Mining" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "جودة برمجيات", en: "Software Quality" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "ندوة", en: "Seminar" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "نظم موزعة", en: "Distributed Systems" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "شبكات لاسلكية", en: "Wireless Networks" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "واقع افتراضي", en: "Virtual Reality" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "نظم خبيرة", en: "Expert Systems" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "مواضيع مختارة", en: "Selected Topics" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "مشروع التخرج (1)", en: "Graduation Project (1)" },
];

const IT_LEVELS_3_4 = [
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "هندسة برمجيات (1)", en: "Software Engineering (1)" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "نظم تشغيل", en: "Operating Systems" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "ذكاء اصطناعي", en: "Artificial Intelligence" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "إدارة مشاريع", en: "Project Management" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "اتصالات وبيانات", en: "Data Communications" },
  { l: "المستوى الثالث", t: "الفصل الأول", ar: "بحوث عمليات", en: "Operations Research" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "هندسة برمجيات (2)", en: "Software Engineering (2)" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "شبكات الحاسوب", en: "Computer Networks" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "برمجة مرئية", en: "Visual Programming" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "تكنولوجيا الوسائط المتعددة", en: "Multimedia Technology" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "أمن الشبكات", en: "Network Security" },
  { l: "المستوى الثالث", t: "الفصل الثاني", ar: "نظم المعلومات الإدارية", en: "Management Information Systems" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "معالجة صور", en: "Image Processing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "أمن معلومات", en: "Information Security" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "حوسبة سحابية", en: "Cloud Computing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "تجارة إلكترونية", en: "E-Commerce" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "حوسبة متنقلة", en: "Mobile Computing" },
  { l: "المستوى الرابع", t: "الفصل الأول", ar: "ندوة", en: "Seminar" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "نظم موزعة", en: "Distributed Systems" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "إدارة شبكات", en: "Network Administration" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "نظم المعلومات الجغرافية", en: "Geographic Information Systems" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "التنقيب في الويب", en: "Web Mining" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "الحوسبة في كل مكان", en: "Ubiquitous Computing" },
  { l: "المستوى الرابع", t: "الفصل الثاني", ar: "مشروع التخرج (1)", en: "Graduation Project (1)" },
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
  { n: "أحمد فؤاد أحمد بامهدي", r: "221011118", d: "علوم الحاسوب" },
  { n: "سعيد كرامة مبارك بن مخاشن", r: "221011522", d: "تقنية المعلومات" },
  { n: "محمد عبدالله محمد باوزير", r: "221011516", d: "تقنية المعلومات" },
  { n: "علي عبدالقادر علي بارجاء", r: "221011112", d: "علوم الحاسوب" },
  { n: "رامي رشيد عبدالله السعدي", r: "221011117", d: "علوم الحاسوب" },
  { n: "صقر عبدالله صالح باجبار", r: "221011514", d: "تقنية المعلومات" },
  { n: "صهيب صالح علي بن شهاب", r: "221011513", d: "تقنية المعلومات" },
  { n: "محمد فائز مبروك بن ماضي", r: "221011114", d: "علوم الحاسوب" },
  { n: "سالم عوض سالمين بلعجم", r: "221011504", d: "تقنية المعلومات" },
  { n: "عبدالرحمن محمد عمر باعباد", r: "221011122", d: "علوم الحاسوب" },
  { n: "يوسف عوض خميس بن حصن", r: "221011103", d: "علوم الحاسوب" },
  { n: "عبدالله سعيد عبدالله باحكيم", r: "221011120", d: "علوم الحاسوب" },
  { n: "عمر كرامة سالمين باظريس", r: "221011508", d: "تقنية المعلومات" },
  { n: "معاذ محفوظ صالح باربيع", r: "221011106", d: "علوم الحاسوب" },
  { n: "عبدالله صالح عمر بن مخاشن", r: "221011121", d: "علوم الحاسوب" },
  { n: "محمد عمر عوض بايعشوت", r: "221011515", d: "تقنية المعلومات" },
  { n: "عمر سالم عمر باداود", r: "221011507", d: "تقنية المعلومات" },
  { n: "أسامة كمال محفوظ باوزير", r: "221011125", d: "علوم الحاسوب" },
  { n: "أحمد محمد عبدالله بن عروة", r: "221011111", d: "علوم الحاسوب" },
  { n: "عبدالله سالم عوض بريك", r: "221011123", d: "علوم الحاسوب" },
  { n: "عبدالله صالح مبارك بن ثعلب", r: "221011107", d: "علوم الحاسوب" },
  { n: "عبدالعزيز فضل ناصر العفيفي", r: "221011126", d: "علوم الحاسوب" },
  { n: "أنس أحمد سعيد بن اسحاق", r: "221011127", d: "علوم الحاسوب" },
  { n: "فكري فؤاد فكري باضاوي", r: "221011510", d: "تقنية المعلومات" },
  { n: "محمد عبدالله أبوبكر الحامد", r: "221011517", d: "تقنية المعلومات" },
  { n: "سالم مبروك سالمين بن نجار", r: "221011505", d: "تقنية المعلومات" },
  { n: "صالح يسلم صالح باجبر", r: "221011512", d: "تقنية المعلومات" },
];

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [importingCS, setImportingCS] = useState(false);
  const [importingIT, setImportingIT] = useState(false);
  const [importingStudents, setImportingStudents] = useState(false);
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

  const importCurriculum = async (deptName: string, deptCode: string, curriculum: any[], setStatus: any) => {
    if (!firestore) return;
    setStatus(true);
    try {
      const deptsRef = collection(firestore, "departments");
      const deptQuery = query(deptsRef, where("name", "==", deptName));
      const deptSnap = await getDocs(deptQuery);
      
      let deptId = "";
      if (deptSnap.empty) {
        const newDept = await addDoc(deptsRef, {
          name: deptName,
          code: deptCode,
          collegeName: "كلية الحاسبات وتكنولوجيا المعلومات",
          collegeId: "central_college_id",
          createdAt: serverTimestamp()
        });
        deptId = newDept.id;
      } else {
        deptId = deptSnap.docs[0].id;
      }

      const subjectsRef = collection(firestore, "subjects");
      let count = 0;
      
      for (const item of curriculum) {
        const subQuery = query(subjectsRef, 
          where("nameAr", "==", item.ar), 
          where("departmentId", "==", deptId)
        );
        const subSnap = await getDocs(subQuery);
        
        if (subSnap.empty) {
          await addDoc(subjectsRef, {
            nameAr: item.ar,
            nameEn: item.en,
            level: item.l,
            term: item.t,
            departmentId: deptId,
            departmentName: deptName,
            createdAt: serverTimestamp()
          });
          count++;
        }
      }

      toast({
        title: `تم استيراد منهج ${deptName} بنجاح`,
        description: `تمت إضافة ${count} مادة دراسية جديدة إلى النظام.`,
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "خطأ في الاستيراد", description: "فشل إرسال البيانات إلى السحابة." });
    } finally {
      setStatus(false);
    }
  };

  const handleImportStudents = async () => {
    if (!firestore) return;
    setImportingStudents(true);
    try {
      const deptsRef = collection(firestore, "departments");
      const studentsRef = collection(firestore, "students");
      const collegesRef = collection(firestore, "colleges");

      // 1. التأكد من وجود الكلية الموحدة
      const collegeName = "كلية الحاسبات وتكنولوجيا المعلومات";
      const collegeQuery = query(collegesRef, where("name", "==", collegeName));
      const collegeSnap = await getDocs(collegeQuery);
      let collegeId = "central_college_id";
      
      if (collegeSnap.empty) {
        const newCol = await addDoc(collegesRef, {
          name: collegeName,
          code: "CIT",
          createdAt: serverTimestamp()
        });
        collegeId = newCol.id;
      } else {
        collegeId = collegeSnap.docs[0].id;
      }

      let count = 0;
      for (const std of STUDENTS_IMPORT_LIST) {
        // التحقق من وجود الطالب مسبقاً
        const q = query(studentsRef, where("regId", "==", std.r));
        const snap = await getDocs(q);
        
        if (snap.empty) {
          // البحث عن معرف القسم
          const dQuery = query(deptsRef, where("name", "==", std.d));
          const dSnap = await getDocs(dQuery);
          let dId = std.d === "علوم الحاسوب" ? "cs_default" : "it_default";
          if (!dSnap.empty) dId = dSnap.docs[0].id;

          await addDoc(studentsRef, {
            name: std.n,
            regId: std.r,
            departmentId: dId,
            departmentName: std.d,
            level: "المستوى الثاني",
            admissionType: "عام",
            status: "active",
            joinDate: "2022-09-01",
            createdAt: serverTimestamp()
          });
          count++;
        }
      }

      toast({
        title: "تم استيراد الطلاب",
        description: `تمت إضافة ${count} طالب جديد بنجاح وتوحيد بيانات الكلية.`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل استيراد بيانات الطلاب." });
    } finally {
      setImportingStudents(false);
    }
  };

  const handleImportCS = () => importCurriculum(
    "علوم الحاسوب", 
    "CS", 
    [...SHARED_LEVELS_1_2, ...CS_LEVELS_3_4], 
    setImportingCS
  );

  const handleImportIT = () => importCurriculum(
    "تقنية المعلومات", 
    "IT", 
    [...SHARED_LEVELS_1_2, ...IT_LEVELS_3_4], 
    setImportingIT
  );

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

          <Card className="p-8 border-none shadow-xl rounded-3xl bg-white border-r-4 border-secondary">
            <div className="flex items-center gap-3 mb-8 border-b pb-4">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <Database className="w-6 h-6 text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-primary">إدارة البيانات والمنهج</h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-sm font-bold text-muted-foreground">يمكنك استيراد البيانات الأساسية للنظام دفعة واحدة لتهيئة التخصصات والمواد والطلاب.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-primary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CloudDownload className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">منهج علوم الحاسوب</h4>
                    <p className="text-[10px] text-muted-foreground font-bold">48 مادة (المستوى 1 - 4)</p>
                  </div>
                  <Button 
                    disabled={importingCS || !firestore}
                    onClick={handleImportCS}
                    className="rounded-xl h-10 w-full font-bold gradient-blue shadow-lg gap-2"
                  >
                    {importingCS ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    استيراد (CS)
                  </Button>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border border-dashed border-secondary/30 flex flex-col items-center text-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CloudDownload className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary">منهج تقنية المعلومات</h4>
                    <p className="text-[10px] text-muted-foreground font-bold">48 مادة (المستوى 1 - 4)</p>
                  </div>
                  <Button 
                    disabled={importingIT || !firestore}
                    onClick={handleImportIT}
                    className="rounded-xl h-10 w-full font-bold bg-secondary hover:bg-secondary/90 shadow-lg gap-2"
                  >
                    {importingIT ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    استيراد (IT)
                  </Button>
                </div>

                <div className="md:col-span-2 p-6 bg-green-50 rounded-2xl border border-dashed border-green-300 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-green-800">سجلات الطلاب الأساسية</h4>
                      <p className="text-[10px] text-green-600 font-bold">37 طالب (تكنولوجيا الويب - المستوى 2)</p>
                    </div>
                  </div>
                  <Button 
                    disabled={importingStudents || !firestore}
                    onClick={handleImportStudents}
                    className="rounded-xl h-11 px-8 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg gap-2"
                  >
                    {importingStudents ? <Loader2 className="w-4 h-4 animate-spin" /> : <CloudDownload className="w-4 h-4" />}
                    استيراد سجلات الطلاب
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-8">
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
