"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  History, 
  CheckCircle2,
  Clock,
  TrendingUp,
  Database,
  Loader2,
  Sparkles,
  AlertTriangle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const { isOpen } = useSidebarToggle();
  const firestore = useFirestore();
  const { toast } = useToast();

  // استعلامات البيانات الحية مع useMemo لمنع الانهيار
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const recentQuery = useMemo(() => firestore ? query(collection(firestore, "archives"), orderBy("uploadedAt", "desc"), limit(5)) : null, [firestore]);

  const { data: students = [], loading: loadingStudents } = useCollection(studentsQuery);
  const { data: archives = [], loading: loadingArchives } = useCollection(archivesQuery);
  const { data: colleges = [] } = useCollection(collegesQuery);
  const { data: recentActivity = [] } = useCollection(recentQuery);

  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const stats = [
    { label: 'إجمالي الكليات', value: colleges.length.toString(), icon: Database, color: 'bg-orange-500', trend: 'محدث' },
    { label: 'إجمالي الملفات', value: archives.length.toString(), icon: CheckCircle2, color: 'bg-green-500', trend: 'حي' },
    { label: 'الطلاب المسجلين', value: students.length.toString(), icon: Users, color: 'bg-purple-500', trend: 'نشط' },
    { label: 'سعة التخزين', value: '1.2 GB', icon: TrendingUp, color: 'bg-blue-500', trend: 'آمن' },
  ];

  return (
    <div className="min-h-screen bg-background text-right" dir="rtl">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        
        {!firestore && (
          <Card className="mb-10 p-8 border-primary/30 border-2 rounded-[2rem] bg-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
            <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <h3 className="font-black text-2xl text-primary">تنبيه: قاعدة البيانات غير متصلة</h3>
                <p className="text-muted-foreground font-bold">يرجى إضافة إعدادات Firebase (API Key, Project ID, etc.) في الملف <code>src/firebase/config.ts</code> لكي يعمل النظام بشكل حقيقي.</p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary mb-1">لوحة التحكم</h1>
            <p className="text-muted-foreground font-bold">نظرة شاملة على قاعدة البيانات الحقيقية</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm h-11">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-primary">
              {formattedDate || 'جاري التحميل...'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-xl rounded-3xl group hover:-translate-y-1 transition-all bg-white">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold">
                  {stat.trend}
                </div>
              </div>
              <h3 className="text-muted-foreground text-xs font-bold mb-1">{stat.label}</h3>
              <p className="text-3xl font-black text-primary">{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 border-none shadow-xl rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <History className="w-5 h-5 text-secondary" />
                آخر الاختبارات المؤرشفة
              </h2>
              <Button variant="ghost" onClick={() => window.location.href='/archive'} className="font-bold text-secondary text-sm">عرض الكل</Button>
            </div>
            
            <div className="space-y-6">
              {loadingArchives ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>
              ) : recentActivity.length > 0 ? recentActivity.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-primary">{item.subjectName}: <span className="text-secondary">{item.studentName}</span></p>
                    <p className="text-[10px] text-muted-foreground font-bold">تاريخ الرفع: {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('ar-EG') : 'منذ قليل'}</p>
                  </div>
                </div>
              )) : (
                <div className="py-20 text-center text-muted-foreground font-bold flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center">
                    <FileText className="w-10 h-10 opacity-20" />
                  </div>
                  <p>لا توجد بيانات مسجلة في السحابة حالياً</p>
                </div>
              )}
            </div>
          </Card>

          <div className="space-y-8">
            <Card className="p-8 border-none shadow-xl rounded-3xl gradient-blue text-white relative overflow-hidden">
               <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4">حالة الاتصال</h2>
                <div className="flex items-center gap-2 mb-6">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    firestore ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : "bg-red-400 shadow-[0_0_10px_#f87171]"
                  )}></div>
                  <p className="text-white font-bold">{firestore ? "متصل بـ Firebase" : "غير متصل"}</p>
                </div>
                <p className="text-white/80 text-sm leading-relaxed mb-6 font-medium">
                  {firestore 
                    ? "قاعدة البيانات السحابية تعمل بنجاح. يمكنك الآن إدارة الأرشيف والطلاب حياً." 
                    : "يرجى استخدام إعدادات أي مشروع متاح لديك في Firebase لتفعيل النظام."}
                </p>
                <Button 
                  className="bg-white text-primary hover:bg-white/90 w-full rounded-xl font-bold h-12 shadow-xl" 
                  onClick={() => window.location.href='/upload'}
                  disabled={!firestore}
                >
                  بدء أرشفة جديدة
                </Button>
               </div>
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Database className="w-24 h-24" />
               </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
