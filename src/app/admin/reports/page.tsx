
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileSpreadsheet, 
  Filter, 
  BookOpen,
  Users,
  Loader2,
  TrendingUp,
  FileText,
  ShieldCheck,
  Building2,
  GraduationCap,
  School,
  UserCheck
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

const COLORS = ['#0B3C5D', '#328CC1', '#D9E3F0', '#4ade80', '#f97316'];

export default function ReportsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("students");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Queries
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const usersQuery = useMemo(() => firestore ? collection(firestore, "users") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);

  const { data: students = [], loading: loadingStudents } = useCollection(studentsQuery);
  const { data: archives = [] } = useCollection(archivesQuery);
  const { data: staff = [] } = useCollection(usersQuery);
  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: colleges = [] } = useCollection(collegesQuery);

  const [exporting, setExporting] = useState(false);
  
  // Filters State
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

  // Filtered Students Logic
  const filteredStudents = useMemo(() => {
    return (students as any[]).filter(s => {
      const matchCollege = filterCollege === "all" || s.collegeId === filterCollege;
      const matchDept = filterDept === "all" || s.departmentId === filterDept;
      const matchLevel = filterLevel === "all" || s.level === filterLevel;
      return matchCollege && matchDept && matchLevel;
    });
  }, [students, filterCollege, filterDept, filterLevel]);

  // Archive distribution for chart
  const archiveChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    archives.forEach((item: any) => {
      const key = item.departmentName || "غير محدد";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 5);
  }, [archives]);

  const formatNumber = (num: number) => {
    if (!mounted) return "0";
    return num.toLocaleString();
  };

  const handleExportCSV = (reportType: 'students' | 'staff' | 'archives') => {
    setExporting(true);
    try {
      let headers: string[] = [];
      let rows: any[][] = [];
      let fileName = "";

      if (reportType === 'students') {
        headers = ["الاسم الكامل", "رقم القيد", "الكلية", "التخصص", "المستوى", "تاريخ الانضمام"];
        rows = filteredStudents.map(s => [s.name, s.regId, s.collegeName || '---', s.departmentName, s.level, s.joinDate]);
        fileName = `تقرير_الطلاب_${new Date().toLocaleDateString('ar-EG')}.csv`;
      } else if (reportType === 'staff') {
        headers = ["الاسم", "اسم المستخدم", "الدور", "الحالة", "تاريخ التسجيل"];
        rows = (staff as any[]).map(u => [u.name, u.username, u.role === 'manager' ? 'مدير' : 'موظف', u.status === 'active' ? 'نشط' : 'موظف', u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : '---']);
        fileName = `تقرير_العاملين_${new Date().toLocaleDateString('ar-EG')}.csv`;
      } else {
        headers = ["الطالب", "المادة", "الترم", "السنة", "تاريخ الرفع"];
        rows = (archives as any[]).map(a => [a.studentName, a.subjectName, a.term, a.year, a.uploadedAt?.toDate ? a.uploadedAt.toDate().toLocaleString() : '---']);
        fileName = `تقرير_الأرشفة_${new Date().toLocaleDateString('ar-EG')}.csv`;
      }

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);

      toast({ title: "تم التصدير بنجاح", description: "تم تحميل التقرير بصيغة CSV المنظمة." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في التصدير" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">المركز التحليلي المتقدم</h1>
          <p className="text-muted-foreground font-bold">تقارير شاملة عن الموارد البشرية والبيانات الأكاديمية</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={() => handleExportCSV('students')}
            disabled={exporting || loadingStudents}
            className="rounded-xl h-12 border-2 gap-2 font-black text-primary hover:bg-primary/5"
          >
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            تصدير بيانات الطلاب
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportCSV('archives')}
            disabled={exporting}
            className="rounded-xl h-12 border-2 gap-2 font-black text-primary hover:bg-primary/5"
          >
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            تصدير سجل الأرشفة
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white border-r-8 border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Users className="w-6 h-6" /></div>
            <Badge className="bg-green-50 text-green-700 border-none font-black">قاعدة البيانات</Badge>
          </div>
          <p className="text-muted-foreground text-sm font-bold">إجمالي الطلاب</p>
          <h4 className="text-3xl font-black text-primary">{formatNumber(students.length)}</h4>
        </Card>
        
        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white border-r-8 border-secondary">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-secondary/10 rounded-2xl text-secondary"><UserCheck className="w-6 h-6" /></div>
            <Badge className="bg-blue-50 text-blue-700 border-none font-black">القوى العاملة</Badge>
          </div>
          <p className="text-muted-foreground text-sm font-bold">إجمالي العاملين</p>
          <h4 className="text-3xl font-black text-primary">{formatNumber(staff.length)}</h4>
        </Card>

        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white border-r-8 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-2xl text-orange-600"><FileText className="w-6 h-6" /></div>
            <Badge className="bg-orange-50 text-orange-700 border-none font-black">الأرشفة السحابية</Badge>
          </div>
          <p className="text-muted-foreground text-sm font-bold">إجمالي الاختبارات</p>
          <h4 className="text-3xl font-black text-primary">{formatNumber(archives.length)}</h4>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-16 shadow-lg border mb-10 flex w-full max-w-2xl mx-auto overflow-hidden">
          <TabsTrigger 
            value="students" 
            className={cn(
              "flex-1 rounded-xl font-black text-sm transition-all duration-300",
              activeTab === "students" ? "gradient-blue text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            تحليل الطلاب
          </TabsTrigger>
          <TabsTrigger 
            value="staff" 
            className={cn(
              "flex-1 rounded-xl font-black text-sm transition-all duration-300",
              activeTab === "staff" ? "gradient-blue text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            تقارير العاملين
          </TabsTrigger>
          <TabsTrigger 
            value="archives" 
            className={cn(
              "flex-1 rounded-xl font-black text-sm transition-all duration-300",
              activeTab === "archives" ? "gradient-blue text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            إحصائيات الأرشيف
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6 animate-slide-up">
          <Card className="p-6 border-none shadow-xl rounded-3xl bg-white mb-6">
            <div className="flex items-center gap-3 mb-6"><Filter className="w-5 h-5 text-secondary" /><h3 className="text-lg font-black text-primary">تصفية نتائج الطلاب</h3></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-xs mr-1">الكلية</Label>
                <select value={filterCollege} onChange={(e) => setFilterCollege(e.target.value)} className="w-full h-11 px-4 rounded-xl border-2 bg-muted/20 font-bold outline-none focus:border-primary">
                  <option value="all">كل الكليات</option>
                  {colleges.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs mr-1">التخصص</Label>
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="w-full h-11 px-4 rounded-xl border-2 bg-muted/20 font-bold outline-none focus:border-primary">
                  <option value="all">كل التخصصات</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs mr-1">المستوى</Label>
                <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="w-full h-11 px-4 rounded-xl border-2 bg-muted/20 font-bold outline-none focus:border-primary">
                  <option value="all">كل المستويات</option>
                  <option value="المستوى الأول">المستوى الأول</option>
                  <option value="المستوى الثاني">المستوى الثاني</option>
                  <option value="المستوى الثالث">المستوى الثالث</option>
                  <option value="المستوى الرابع">المستوى الرابع</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button variant="secondary" onClick={() => { setFilterCollege('all'); setFilterDept('all'); setFilterLevel('all'); }} className="w-full h-11 rounded-xl font-bold">إعادة تعيين</Button>
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
            <div className="p-6 border-b bg-muted/10 flex items-center justify-between">
              <h3 className="font-black text-primary flex items-center gap-2"><GraduationCap className="w-5 h-5 text-secondary" />قائمة الطلاب المطابقة ({filteredStudents.length})</h3>
            </div>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right font-black text-primary">الطالب</TableHead>
                  <TableHead className="text-right font-black text-primary">رقم القيد</TableHead>
                  <TableHead className="text-right font-black text-primary">التخصص</TableHead>
                  <TableHead className="text-right font-black text-primary">المستوى</TableHead>
                  <TableHead className="text-right font-black text-primary">تاريخ الانضمام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((s) => (
                  <TableRow key={s.id} className="hover:bg-muted/10">
                    <TableCell className="font-bold text-primary">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{s.regId}</TableCell>
                    <TableCell className="font-bold text-xs text-secondary">{s.departmentName}</TableCell>
                    <TableCell className="text-xs font-black text-primary">{s.level}</TableCell>
                    <TableCell className="text-[10px] font-bold text-muted-foreground">{s.joinDate}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">لا توجد بيانات مطابقة للفلترة الحالية</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6 animate-slide-up">
           <Card className="border-none shadow-2xl rounded-3xl bg-white overflow-hidden">
            <div className="p-6 border-b bg-muted/10 flex items-center justify-between">
              <h3 className="font-black text-primary flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-secondary" />تقرير الموظفين النشطين</h3>
              <Button size="sm" variant="ghost" onClick={() => handleExportCSV('staff')} className="text-green-600 font-bold gap-2"><FileSpreadsheet className="w-4 h-4" />تصدير القائمة</Button>
            </div>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right font-black text-primary">الاسم</TableHead>
                  <TableHead className="text-right font-black text-primary">الدور الوظيفي</TableHead>
                  <TableHead className="text-right font-black text-primary">اسم المستخدم</TableHead>
                  <TableHead className="text-right font-black text-primary">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-muted/10">
                    <TableCell className="font-bold text-primary">{u.name}</TableCell>
                    <TableCell>
                      <Badge className={u.role === 'manager' ? "bg-primary text-white border-none rounded-lg" : "bg-secondary text-white border-none rounded-lg"}>
                        {u.role === 'manager' ? 'مدير نظام' : 'موظف أرشفة'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">@{u.username}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-bold">{u.status === 'active' ? 'متصل/نشط' : 'موقوف'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="archives" className="space-y-8 animate-slide-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
              <h3 className="text-lg font-black text-primary mb-8 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-secondary" />توزيع الاختبارات حسب التخصص</h3>
              <div className="h-[350px] w-full">
                {archiveChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={archiveChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0B3C5D', fontWeight: 'bold'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', direction: 'rtl' }}
                        cursor={{ fill: '#f4f7fb', radius: 10 }}
                      />
                      <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                        {archiveChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground font-bold">لا توجد سجلات أرشفة بعد لتمثيلها</div>
                )}
              </div>
            </Card>

            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-black text-primary">أحدث سجلات الأرشفة المنفذة</h3>
               </div>
               <div className="space-y-4">
                 {archives.slice(0, 5).map((a: any, i: number) => (
                   <div key={i} className="flex items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><FileText className="w-5 h-5 text-secondary" /></div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-primary">{a.studentName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground">{a.subjectName} • {a.year}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] font-bold border-secondary text-secondary">{a.term}</Badge>
                   </div>
                 ))}
                 {archives.length === 0 && <p className="text-center py-10 text-muted-foreground font-bold">لا توجد عمليات مؤرشفة بعد</p>}
               </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Footer Info */}
      <Card className="p-6 border-none shadow-lg bg-primary/5 border-r-4 border-primary rounded-2xl">
        <div className="flex gap-4">
          <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
          <div className="text-right">
            <h4 className="font-bold text-primary">ملاحظة الخصوصية والأمان</h4>
            <p className="text-sm text-muted-foreground font-medium">كافة التقارير المصدرة تحتوي على بيانات حساسة، يرجى تداولها فقط مع الأشخاص المخولين بالوصول إلى قاعدة بيانات الجامعة.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
