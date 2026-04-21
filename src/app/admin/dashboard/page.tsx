
"use client";

import { useMemo, useEffect, useState } from "react";
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
  PieChart as PieChartIcon,
  Activity,
  ShieldCheck,
  Zap,
  ArrowDownRight,
  MoreVertical
} from "lucide-react";
import { 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";

const COLORS = ['#0B3C5D', '#328CC1', '#4ade80', '#fbbf24'];

export default function AdminDashboard() {
  const firestore = useFirestore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    { label: 'إجمالي الطلاب', value: students.length, icon: GraduationCap, trend: '+12.5%', isUp: true, color: 'blue' },
    { label: 'إجمالي الاختبارات', value: archives.length, icon: FileText, trend: '+8.2%', isUp: true, color: 'emerald' },
    { label: 'الكليات المسجلة', value: colleges.length, icon: School, trend: 'مستقر', isUp: true, color: 'indigo' },
    { label: 'نشاط النظام', value: '94%', icon: Activity, trend: '-2.1%', isUp: false, color: 'orange' },
  ];

  const chartData = [
    { name: 'يناير', value: 400 },
    { name: 'فبراير', value: 550 },
    { name: 'مارس', value: 800 },
    { name: 'أبريل', value: 720 },
    { name: 'مايو', value: archives.length > 0 ? (archives.length * 10) + 400 : 900 },
  ];

  const distributionData = [
    { name: 'تقنية معلومات', value: 45 },
    { name: 'علوم حاسوب', value: 30 },
    { name: 'هندسة برمجيات', value: 25 },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-10 text-right animate-fade-in" dir="rtl">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-muted/50">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-8 rounded-full gradient-blue"></div>
            <h1 className="text-4xl font-black text-primary tracking-tight">الرؤية الاستراتيجية</h1>
          </div>
          <p className="text-muted-foreground font-bold text-lg pr-5">المركز القيادي لإدارة ومراقبة كافة العمليات الأكاديمية</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="rounded-2xl h-12 px-6 border-2 font-black text-primary gap-2">
             <Clock className="w-5 h-5 text-secondary" />
             تحديث مباشر
           </Button>
           <Button className="rounded-2xl h-12 px-8 font-black gradient-blue shadow-xl shadow-blue-500/20 gap-2">
             <Zap className="w-5 h-5" />
             إجراء سريع
           </Button>
        </div>
      </div>

      {/* High-Impact Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="relative p-6 border-none shadow-2xl rounded-[2.5rem] bg-white hover:shadow-blue-100 transition-all duration-500 group overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex items-start justify-between mb-6">
              <div className={cn(
                "p-4 rounded-[1.5rem] text-white shadow-lg group-hover:scale-110 transition-transform duration-500",
                i === 0 ? "bg-blue-600 shadow-blue-200" : 
                i === 1 ? "bg-emerald-600 shadow-emerald-200" :
                i === 2 ? "bg-indigo-600 shadow-indigo-200" : "bg-orange-600 shadow-orange-200"
              )}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-2xl text-[11px] font-black",
                stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-red-600"
              )}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <h3 className="text-muted-foreground text-xs font-black uppercase tracking-wider mb-1">{stat.label}</h3>
              <p className="text-4xl font-black text-primary tracking-tighter">
                {typeof stat.value === 'number' ? stat.value.toLocaleString('en-US') : stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-10 border-none shadow-2xl rounded-[3rem] bg-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-secondary" />
                تحليلات الأداء السنوي
              </h2>
              <p className="text-muted-foreground font-bold text-sm">معدل نمو الأرشفة الرقمية وتدفق البيانات</p>
            </div>
            <select className="bg-muted/30 border-none rounded-xl h-10 px-4 font-black text-xs text-primary outline-none">
              <option>عام 2024</option>
              <option>عام 2023</option>
            </select>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#328CC1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#328CC1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 'bold'}} 
                  dy={15}
                />
                <YAxis 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{fill: '#94a3b8', fontWeight: 'bold'}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', direction: 'rtl', textAlign: 'right' }}
                  labelStyle={{ fontWeight: '900', color: '#0B3C5D', marginBottom: '4px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#328CC1" 
                  strokeWidth={6} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 10, fill: '#0B3C5D', stroke: '#fff', strokeWidth: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white flex flex-col items-center group">
          <div className="w-full text-right mb-8">
            <h2 className="text-2xl font-black text-primary flex items-center gap-3">
              <PieChartIcon className="w-8 h-8 text-orange-500" />
              توزيع الموارد
            </h2>
            <p className="text-muted-foreground font-bold text-sm">حجم البيانات الموزعة حسب التخصص</p>
          </div>
          <div className="relative h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={85}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={12} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-primary">100%</span>
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">إجمالي التوزيع</span>
            </div>
          </div>
          <div className="w-full space-y-3 mt-8">
            {distributionData.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors border border-transparent hover:border-muted cursor-default">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }}></span>
                  <span className="text-xs font-black text-primary">{d.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Operational Pulse Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white group">
          <div className="flex items-center justify-between mb-10 border-b border-muted/50 pb-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                <Activity className="w-8 h-8 text-secondary" />
                نبض النظام المباشر
              </h2>
              <p className="text-muted-foreground font-bold text-sm">آخر العمليات الإدارية المنفذة في الوقت الحقيقي</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted/50"><MoreVertical className="w-5 h-5 text-muted-foreground" /></Button>
          </div>
          <div className="space-y-6">
            {loadingArchives ? (
              <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" /></div>
            ) : recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-6 p-5 rounded-[2rem] hover:bg-muted/20 transition-all border border-transparent hover:border-muted group/item">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover/item:scale-110",
                  i % 2 === 0 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  <Archive className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <p className="text-primary font-black text-xl leading-tight">
                    {item.studentName} <span className="text-muted-foreground font-bold text-sm mx-1">تم أرشفة:</span> {item.subjectName}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-black text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleTimeString('ar-EG-u-nu-latn') : 'الآن'}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                    <span className="flex items-center gap-1 text-secondary"><ShieldCheck className="w-3.5 h-3.5" />موظف أرشفة</span>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity bg-white shadow-sm border">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                </Button>
              </div>
            )) : (
              <div className="text-center py-20 bg-muted/10 rounded-[3rem] border-2 border-dashed">
                 <Archive className="w-12 h-12 mx-auto text-muted-foreground/20 mb-4" />
                 <p className="text-muted-foreground font-black text-xl">لا توجد عمليات نشطة حالياً</p>
              </div>
            )}
          </div>
          <Button className="w-full mt-10 h-14 rounded-2xl font-black bg-muted/20 text-primary hover:bg-muted/40 transition-colors" onClick={() => window.location.href='/admin/logs'}>
            مراجعة سجل الأنشطة الكامل
          </Button>
        </Card>

        <Card className="p-0 border-none shadow-2xl rounded-[3rem] gradient-blue text-white overflow-hidden relative group">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
          <div className="p-12 relative z-10 flex flex-col h-full">
            <div className="mb-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-2xl group-hover:rotate-12 transition-transform duration-700">
                <Zap className="w-9 h-9 text-yellow-300" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">الذكاء الاصطناعي (Mustand AI)</h2>
              <p className="text-white/80 font-bold text-lg leading-relaxed max-w-md">
                يعمل المحرك الذكي على تحليل الوثائق بدقة تتجاوز المعايير البشرية، مما يقلل هامش الخطأ ويوفر الوقت بنسبة 80% في عمليات الأرشفة.
              </p>
            </div>
            
            <div className="mt-auto space-y-6">
               <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white/60 uppercase tracking-widest">دقة استخراج البيانات</p>
                    <p className="text-4xl font-black text-white">99.2%</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin"></div>
                  </div>
               </div>
               <Button className="w-full bg-white text-primary hover:bg-blue-50 h-16 rounded-[2rem] font-black text-xl shadow-2xl transition-all hover:scale-[1.02]" onClick={() => window.location.href='/admin/reports'}>
                 استعراض التقارير التحليلية المتقدمة
               </Button>
            </div>
          </div>
          <Building2 className="absolute -bottom-20 -left-20 w-80 h-80 opacity-5 rotate-12 pointer-events-none" />
        </Card>
      </div>
    </div>
  );
}

