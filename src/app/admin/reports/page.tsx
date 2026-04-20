
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileSpreadsheet, 
  FileArchive, 
  Filter, 
  BookOpen,
  Users,
  Loader2,
  TrendingUp,
  FileText
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
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection } from "firebase/firestore";

const COLORS = ['#0B3C5D', '#328CC1', '#D9E3F0', '#4ade80', '#f97316'];

export default function ReportsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  // Queries
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: students = [], loading: loadingStudents } = useCollection(studentsQuery);
  const { data: archives = [] } = useCollection(archivesQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  const [exporting, setExporting] = useState<string | null>(null);
  
  // Filters State
  const [filterYear, setFilterYear] = useState("all");
  const [filterTerm, setFilterTerm] = useState("all");
  const [filterDept, setFilterDept] = useState("all");

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return (students as any[]).filter(s => {
      const matchDept = filterDept === "all" || s.departmentId === filterDept;
      // Note: In real app, year/term might be part of student current level metadata
      return matchDept;
    });
  }, [students, filterDept]);

  // Archives for Chart (Group by Subject)
  const subjectChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    archives.forEach((item: any) => {
      counts[item.subjectName] = (counts[item.subjectName] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).slice(0, 8);
  }, [archives]);

  const handleExportCSV = () => {
    setExporting('excel');
    try {
      const headers = ["الاسم الكامل", "رقم القيد", "التخصص", "المستوى", "الحالة", "تاريخ الانضمام"];
      const rows = filteredStudents.map(s => [
        s.name,
        s.regId,
        s.departmentName,
        s.level,
        s.status === 'active' ? 'نشط' : 'موقوف',
        s.joinDate || '---'
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // Add UTF-8 BOM for Excel Arabic support
      const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `report_students_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({ title: "تم التصدير بنجاح", description: "تم تحميل ملف التقارير بصيغة CSV." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في التصدير" });
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground font-bold">تحليل بيانات الطلاب، المواد، والنشاط العام للنظام</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            disabled={exporting !== null || loadingStudents}
            className="rounded-xl h-11 border-2 gap-2 font-bold hover:bg-green-50 hover:text-green-600 hover:border-green-200"
          >
            {exporting === 'excel' ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <FileSpreadsheet className="w-4 h-4" />}
            تصدير تقارير الطلاب (CSV)
          </Button>
          <Button 
            variant="outline" 
            onClick={() => toast({ title: "تنبيه", description: "جاري العمل على تجهيز محرك ضغط الصور السحابي." })}
            className="rounded-xl h-11 border-2 gap-2 font-bold hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
          >
            <FileArchive className="w-4 h-4" />
            تنزيل الصور (ZIP)
          </Button>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <h3 className="text-sm font-bold text-muted-foreground mb-4 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          مرشحات التقرير الحالية
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary mr-1">السنة الدراسية</label>
            <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="w-full h-11 px-3 rounded-xl border bg-muted/30 outline-none text-sm font-bold text-primary focus:border-primary">
              <option value="all">جميع السنوات</option>
              {academicYears.map((year: any) => (
                <option key={year.id} value={year.label}>{year.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary mr-1">الفصل الدراسي</label>
            <select value={filterTerm} onChange={(e) => setFilterTerm(e.target.value)} className="w-full h-11 px-3 rounded-xl border bg-muted/30 outline-none text-sm font-bold text-primary focus:border-primary">
              <option value="all">جميع الفصول</option>
              <option value="الفصل الأول">الفصل الأول</option>
              <option value="الفصل الثاني">الفصل الثاني</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary mr-1">التخصص</label>
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="w-full h-11 px-3 rounded-xl border bg-muted/30 outline-none text-sm font-bold text-primary focus:border-primary">
              <option value="all">جميع التخصصات</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={() => toast({ title: "تم التحديث", description: "تم تطبيق المرشحات بنجاح." })}
              className="w-full h-11 rounded-xl font-bold gradient-blue shadow-lg"
            >
              تحديث الإحصائيات
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white border-r-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-primary" />
            <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">قاعدة البيانات</Badge>
          </div>
          <p className="text-muted-foreground text-xs font-bold">الطلاب المسجلين</p>
          <h4 className="text-2xl font-black text-primary">{students.length.toLocaleString()}</h4>
        </Card>
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white border-r-4 border-secondary">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-secondary" />
            <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">المناهج</Badge>
          </div>
          <p className="text-muted-foreground text-xs font-bold">إجمالي المواد</p>
          <h4 className="text-2xl font-black text-primary">{subjects.length.toLocaleString()}</h4>
        </Card>
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white border-r-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-orange-500" />
            <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px]">الأرشفة الرقمية</Badge>
          </div>
          <p className="text-muted-foreground text-xs font-bold">إجمالي الاختبارات</p>
          <h4 className="text-2xl font-black text-primary">{archives.length.toLocaleString()}</h4>
        </Card>
      </div>

      <Tabs defaultValue="students" className="w-full" dir="rtl">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="students" className="rounded-xl font-bold text-sm h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">تقرير الطلاب النشطين</TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-xl font-bold text-sm h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">توزيع الأرشفة</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl font-bold text-sm h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">حالة النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right font-bold text-primary">الطالب</TableHead>
                    <TableHead className="text-right font-bold text-primary">رقم القيد</TableHead>
                    <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                    <TableHead className="text-right font-bold text-primary">المستوى</TableHead>
                    <TableHead className="text-right font-bold text-primary">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingStudents ? (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
                  ) : filteredStudents.length > 0 ? filteredStudents.map((report) => (
                    <TableRow key={report.id} className="hover:bg-muted/10">
                      <TableCell className="font-bold text-primary">{report.name}</TableCell>
                      <TableCell className="font-mono text-xs font-bold text-muted-foreground">{report.regId}</TableCell>
                      <TableCell className="font-bold text-primary text-xs">{report.departmentName}</TableCell>
                      <TableCell className="text-xs text-muted-foreground font-bold">{report.level}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 border-none rounded-lg font-bold">نشط</Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">لا توجد بيانات مطابقة</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
              <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                توزيع الاختبارات حسب المادة
              </h3>
              <div className="h-[350px] w-full">
                {subjectChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#0B3C5D', fontWeight: 'bold'}} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{ fill: '#f4f7fb', radius: 10 }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {subjectChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground font-bold">لا توجد سجلات أرشفة بعد</div>
                )}
              </div>
            </Card>

            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
              <h3 className="text-lg font-bold text-primary mb-6">قائمة المواد الأكثر أرشفة</h3>
               <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right font-bold text-primary">المادة</TableHead>
                      <TableHead className="text-right font-bold text-primary text-center">عدد الملفات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjectChartData.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-primary">{s.name}</TableCell>
                        <TableCell className="font-black text-secondary text-center">{s.count}</TableCell>
                      </TableRow>
                    ))}
                    {subjectChartData.length === 0 && <TableRow><TableCell colSpan={2} className="h-40 text-center text-muted-foreground font-bold">لا توجد بيانات</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-12 text-center border-none shadow-xl rounded-3xl bg-white">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-primary opacity-30" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">تقارير نشاط النظام</h3>
            <p className="text-muted-foreground max-w-sm mx-auto font-bold">سيتم عرض سجلات الوصول وعمليات الرفع حسب المستخدمين والزمن في هذا القسم المخصص للمديرين.</p>
            <Button variant="outline" className="mt-6 rounded-xl border-2 font-bold px-8" onClick={() => window.location.href='/admin/logs'}>عرض سجل العمليات الفعلي</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
