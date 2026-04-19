
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Users, 
  History, 
  ArrowUpRight, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Database,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const { isOpen } = useSidebarToggle();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [seeding, setSeeding] = useState(false);

  // Fetch real stats
  const { data: students = [] } = useCollection(firestore ? collection(firestore, "students") : null);
  const { data: archives = [] } = useCollection(firestore ? collection(firestore, "archives") : null);
  const { data: colleges = [] } = useCollection(firestore ? collection(firestore, "colleges") : null);

  const { data: recentActivity = [] } = useCollection(
    firestore ? query(collection(firestore, "archives"), orderBy("uploadedAt", "desc"), limit(5)) : null
  );

  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const handleSeedData = async () => {
    if (!firestore) return;
    setSeeding(true);
    try {
      // Seed a college
      const collegeRef = await addDoc(collection(firestore, "colleges"), {
        name: "كلية تقنية المعلومات",
        code: "CIT",
        createdAt: serverTimestamp()
      });

      // Seed a department
      const deptRef = await addDoc(collection(firestore, "departments"), {
        name: "هندسة البرمجيات",
        code: "SE",
        collegeId: collegeRef.id,
        collegeName: "كلية تقنية المعلومات",
        createdAt: serverTimestamp()
      });

      // Seed a student
      await addDoc(collection(firestore, "students"), {
        name: "أحمد محمد علي",
        regId: "20210045",
        departmentId: deptRef.id,
        departmentName: "هندسة البرمجيات",
        level: "المستوى الثالث",
        admissionType: "عام",
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });

      toast({ title: "تمت التهيئة", description: "تم إضافة بيانات تجريبية بنجاح للتأكد من عمل النظام." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في التهيئة", description: "تأكد من إعدادات الـ Firebase وقواعد الحماية." });
    } finally {
      setSeeding(false);
    }
  };

  const stats = [
    { label: 'إجمالي الكليات', value: colleges.length.toString(), icon: Database, color: 'bg-orange-500', trend: 'محدث' },
    { label: 'إجمالي الملفات', value: archives.length.toString(), icon: CheckCircle2, color: 'bg-green-500', trend: 'حي' },
    { label: 'الطلاب المسجلين', value: students.length.toString(), icon: Users, color: 'bg-purple-500', trend: 'نشط' },
    { label: 'سعة التخزين', value: '1.2 GB', icon: TrendingUp, color: 'bg-blue-500', trend: 'آمن' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">الرئيسية</h1>
            <p className="text-muted-foreground">ملخص سريع لنشاط النظام وقاعدة البيانات</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={handleSeedData} 
              disabled={seeding}
              className="rounded-xl font-bold border-dashed border-2 gap-2"
            >
              {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-secondary" />}
              تهيئة بيانات تجريبية
            </Button>
            <div className="bg-primary/5 px-4 py-2 rounded-2xl flex items-center gap-2 border border-primary/10">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-primary">
                {formattedDate || '...'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-xl rounded-3xl group hover:-translate-y-1 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold">
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-primary">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 border-none shadow-xl rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <History className="w-5 h-5" />
                آخر الملفات المرفوعة
              </h2>
              <button className="text-sm text-secondary font-bold hover:underline" onClick={() => window.location.href='/archive'}>عرض الكل</button>
            </div>
            
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-primary font-bold">{item.subjectName}: <span className="text-secondary">{item.studentName}</span></p>
                    <p className="text-xs text-muted-foreground">رقم القيد: {item.studentRegId}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <p className="text-xs text-muted-foreground font-medium">
                      {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('ar-EG') : 'حديثاً'}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-muted-foreground font-bold">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  لا توجد نشاطات مسجلة حالياً في قاعدة البيانات
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8 border-none shadow-xl rounded-3xl gradient-blue text-white relative overflow-hidden">
             <div className="relative z-10">
              <h2 className="text-xl font-bold mb-4">حالة الاتصال</h2>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></div>
                <p className="text-white/90 font-bold">متصل بـ Firebase Firestore</p>
              </div>
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                قاعدة البيانات الحالية تعمل بنظام المزامنة الفورية. أي تغيير تقوم به سيظهر لجميع المستخدمين فوراً.
              </p>
              <button className="bg-white text-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl hover:scale-105 transition-transform" onClick={() => window.location.href='/upload'}>
                رفع ملف الآن
              </button>
             </div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
             <div className="absolute top-0 right-0 p-4 opacity-20">
              <Database className="w-24 h-24" />
             </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
