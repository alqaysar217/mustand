
"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Archive, 
  Clock, 
  ArrowUpRight, 
  GraduationCap,
  Loader2,
  TrendingUp,
  School,
  Building2,
  PieChart as PieChartIcon
} from "lucide-react";
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
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

const COLORS = ['#0B3C5D', '#328CC1', '#D9E3F0', '#4ade80'];

export default function AdminDashboard() {
  const firestore = useFirestore();

  // استعلامات البيانات الحية
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const recentQuery = useMemo(() => firestore ? query(collection(firestore, "archives"), orderBy("uploadedAt", "desc"), limit(4)) : null, [firestore]);

  const { data: students = [] } = useCollection(studentsQuery);
  const { data: archives = [], loading: loadingArchives } = useCollection(archivesQuery);
  const { data: colleges = [] } = useCollection(collegesQuery);
  const { data: recentActivity = [] } = useCollection(recentQuery);

  const stats = [
    { label: 'إجمالي الطلاب', value: students.length, icon: GraduationCap, trend: '+12%' },
    { label: 'إجمالي الاختبارات', value: archives.length, icon: FileText, trend: '+8%' },
    { label: 'الكليات المسجلة', value: colleges.length, icon: School, trend: 'ثابت' },
    { label: 'مستخدمي النظام', value: '32', icon: Users, trend: '-2%' },
  ];

  const examData = [
    { name: 'يناير', value: 400 },
    { name: 'فبراير', value: 600 },
    { name: 'مارس', value: 800 },
    { name: 'أبريل', value: 700 },
    { name: 'مايو', value: archives.length > 0 ? archives.length : 500 },
  ];

  const deptData = [
    { name: 'تقنية معلومات', value: 45 },
    { name: 'علوم حاسوب', value: 30 },
    { name: 'هندسة برمجيات', value: 25 },
  ];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-primary mb-1">لوحة الإدارة المركزية</h1>
          <p className="text-muted-foreground font-bold text-lg">تحكم كامل ومراقبة شاملة لكافة موارد المؤسسة</p>
        </div>
        <Button onClick={() => window.location.href='/upload'} className="rounded-2xl h-12 px-8 font-black gradient-blue shadow-lg gap-2">
          <Archive className="w-5 h-5" />
          بدء أرشفة فورية
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-xl rounded-3xl bg-white hover:-translate-y-2 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-4 rounded-xl text-white shadow-lg shadow-black/10 gradient-blue group-hover:scale-110 transition-transform">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black bg-green-50 text-green-600">
                <ArrowUpRight className="w-3 h-3" />
                {stat.trend}
              </div>
            </div>
            <h3 className="text-muted-foreground text-xs font-bold mb-1">{stat.label}</h3>
            <p className="text-4xl font-black text-primary">{stat.value.toLocaleString('ar-EG')}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8 border-none shadow-2xl rounded-3xl bg-white">
          <h2 className="text-xl font-black text-primary mb-8 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-secondary" />
            معدل نمو البيانات (شهرياً)
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="value" stroke="#328CC1" strokeWidth={5} dot={{ r: 6, fill: '#328CC1', strokeWidth: 0 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white flex flex-col items-center justify-center">
          <h2 className="text-xl font-black text-primary mb-8 w-full text-right flex items-center gap-3">
            <PieChartIcon className="w-6 h-6 text-orange-500" />
            توزيع التخصصات
          </h2>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deptData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {deptData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                <span className="text-[10px] font-black text-primary">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-primary flex items-center gap-3">
              <Archive className="w-6 h-6 text-secondary" />
              آخر العمليات الإدارية
            </h2>
            <Button variant="ghost" className="text-secondary font-black rounded-xl hover:bg-secondary/5" onClick={() => window.location.href='/admin/logs'}>عرض السجل بالكامل</Button>
          </div>
          <div className="space-y-4">
            {loadingArchives ? (
              <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>
            ) : recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border group">
                <div className={cn(
                  "w-1.5 h-12 rounded-full",
                  i % 2 === 0 ? "bg-green-500" : "bg-blue-500"
                )}></div>
                <div className="flex-1 text-right">
                  <p className="text-primary font-black text-lg">
                    {item.studentName} <span className="text-muted-foreground font-bold text-sm mx-2">أرشفة:</span> {item.subjectName}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold flex items-center justify-end gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('ar-EG') : 'منذ قليل'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground font-black py-10 text-xl">لا توجد عمليات حديثة مسجلة</p>
            )}
          </div>
        </Card>

        <Card className="p-8 border-none shadow-2xl rounded-3xl gradient-blue text-white overflow-hidden relative">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <h2 className="text-2xl font-black mb-4">تقارير الذكاء الاصطناعي</h2>
              <p className="text-white/80 font-bold leading-relaxed mb-8">
                يقوم النظام بتحليل أكثر من 500 ورقة امتحان شهرياً بدقة تصل إلى 98.5%. يمكنك استخراج تقارير الأداء التفصيلية بنقرة واحدة.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
                <span className="font-bold">دقة استخراج البيانات (OCR)</span>
                <span className="font-black text-xl">98%</span>
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 h-14 rounded-2xl font-black text-lg shadow-xl">
                توليد تقرير الأداء الشامل
              </Button>
            </div>
          </div>
          <Building2 className="absolute -bottom-10 -left-10 w-48 h-48 opacity-10 rotate-12" />
        </Card>
      </div>
    </div>
  );
}
