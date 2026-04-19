
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
  FileText,
  Building2,
  School,
  ArrowUpRight,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { 
  Bar, 
  BarChart, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from "recharts";

const COLORS = ['#0B3C5D', '#328CC1', '#D9E3F0', '#4ade80'];

export default function Dashboard() {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const { isOpen } = useSidebarToggle();
  const firestore = useFirestore();

  // استعلامات البيانات الحية
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const recentQuery = useMemo(() => firestore ? query(collection(firestore, "archives"), orderBy("uploadedAt", "desc"), limit(5)) : null, [firestore]);

  const { data: students = [] } = useCollection(studentsQuery);
  const { data: archives = [], loading: loadingArchives } = useCollection(archivesQuery);
  const { data: colleges = [] } = useCollection(collegesQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);
  const { data: recentActivity = [] } = useCollection(recentQuery);

  useEffect(() => {
    setFormattedDate(new Date().toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  // بيانات افتراضية للرسومات البيانية بناءً على الأرقام الحقيقية
  const chartData = [
    { name: 'يناير', value: 45 },
    { name: 'فبراير', value: 120 },
    { name: 'مارس', value: 85 },
    { name: 'أبريل', value: 190 },
    { name: 'مايو', value: archives.length },
  ];

  const distributionData = [
    { name: 'تقنية معلومات', value: 45 },
    { name: 'علوم حاسوب', value: 35 },
    { name: 'هندسة برمجيات', value: 20 },
  ];

  const stats = [
    { label: 'إجمالي الكليات', value: colleges.length, icon: School, trend: '+1' },
    { label: 'إجمالي الطلاب', value: students.length, icon: Users, trend: '+12' },
    { label: 'الملفات المؤرشفة', value: archives.length, icon: FileText, trend: '+5' },
    { label: 'المواد الدراسية', value: subjects.length, icon: Database, trend: 'محدث' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-right" dir="rtl">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-primary mb-2">لوحة التحكم المركزية</h1>
            <p className="text-muted-foreground font-bold text-lg">أهلاً بك مجدداً، إليك نظرة على أداء النظام اليوم</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl flex items-center gap-3 border shadow-sm h-14">
            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-black text-primary">
              {formattedDate || 'جاري التحميل...'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <Card key={i} className="p-6 border-none shadow-xl rounded-3xl bg-white group hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="p-4 rounded-xl text-white shadow-lg shadow-black/10 gradient-blue">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black">
                  <ArrowUpRight className="w-3 h-3" />
                  {stat.trend}
                </div>
              </div>
              <div className="relative z-10">
                <h3 className="text-muted-foreground text-sm font-bold mb-1">{stat.label}</h3>
                <p className="text-4xl font-black text-primary tracking-tight">{stat.value.toLocaleString('ar-EG')}</p>
              </div>
              {/* Background Decor */}
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full opacity-5 gradient-blue"></div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <Card className="lg:col-span-2 p-8 border-none shadow-2xl rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-primary flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-secondary" />
                وتيرة أرشفة الاختبارات (سنوياً)
              </h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <span className="w-3 h-3 rounded-full bg-secondary"></span>
                  الملفات
                </div>
              </div>
            </div>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
                    itemStyle={{ fontWeight: 'bold', color: '#0B3C5D' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#328CC1" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#328CC1', strokeWidth: 0 }} 
                    activeDot={{ r: 10, shadow: '0 0 20px rgba(50, 140, 193, 0.5)' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white flex flex-col">
            <h2 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
              <PieChartIcon className="w-6 h-6 text-orange-500" />
              توزيع الطلاب حسب القسم
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-4 w-full mt-6">
                {distributionData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 p-2 rounded-xl">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }}></span>
                    <span className="text-[10px] font-black text-primary truncate">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-primary flex items-center gap-3">
                <History className="w-6 h-6 text-secondary" />
                آخر عمليات الأرشفة
              </h2>
              <Button 
                variant="ghost" 
                onClick={() => window.location.href='/archive'} 
                className="font-black text-secondary hover:bg-secondary/5 rounded-xl h-10"
              >
                عرض الأرشيف الكامل
              </Button>
            </div>
            
            <div className="space-y-4">
              {loadingArchives ? (
                <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin opacity-20 text-primary" /></div>
              ) : recentActivity.length > 0 ? recentActivity.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border group">
                  <div className="w-14 h-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-primary text-lg">{item.studentName}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">{item.subjectName}</span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleTimeString('ar-EG') : 'الآن'}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                  </Button>
                </div>
              )) : (
                <div className="py-20 text-center text-muted-foreground font-bold flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center">
                    <FileText className="w-12 h-12 opacity-20" />
                  </div>
                  <p className="text-xl">لا توجد أرشفة حديثة مسجلة</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white">
            <h2 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-green-500" />
              أداء النظام وسعة التخزين
            </h2>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">سعة التخزين السحابي</p>
                    <p className="text-2xl font-black text-primary">1.2 GB <span className="text-xs text-muted-foreground">من 5 GB</span></p>
                  </div>
                  <span className="text-secondary font-black">24%</span>
                </div>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-green-50 border border-green-100">
                  <p className="text-xs font-bold text-green-700 mb-1">حالة الاتصال</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-lg font-black text-green-900">متصل الآن</span>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 mb-1">سرعة المعالجة</p>
                  <p className="text-lg font-black text-blue-900">0.8 ثانية</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl gradient-blue text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h4 className="font-black text-lg mb-2">تحديثات النظام</h4>
                  <p className="text-xs text-white/80 font-bold leading-relaxed">تمت ترقية محرك البحث الذكي وزيادة سرعة استخراج البيانات بنسبة 30% في الإصدار الأخير.</p>
                </div>
                <TrendingUp className="absolute -bottom-4 -left-4 w-24 h-24 opacity-10" />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
