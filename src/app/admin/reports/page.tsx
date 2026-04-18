
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  FileDown, 
  FileSpreadsheet, 
  FileArchive, 
  Filter, 
  Calendar,
  BookOpen,
  Users,
  Search,
  ChevronLeft,
  Loader2,
  TrendingUp,
  Download
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

const MOCK_STUDENT_REPORTS = [
  { id: '1', name: 'أحمد محمود علي', regId: '20210045', exams: 12, lastUpload: '2024-05-20', status: 'active' },
  { id: '2', name: 'سارة خالد يوسف', regId: '20220112', exams: 8, lastUpload: '2024-05-18', status: 'active' },
  { id: '3', name: 'وليد جاسم مرزوق', regId: '20210567', exams: 15, lastUpload: '2024-05-15', status: 'active' },
  { id: '4', name: 'مريم سعيد سالم', regId: '20230001', exams: 4, lastUpload: '2024-05-10', status: 'active' },
];

const MOCK_SUBJECT_REPORTS = [
  { id: '1', name: 'برمجة 1', dept: 'تقنية المعلومات', exams: 145, avgPages: 4.2 },
  { id: '2', name: 'رياضيات متقدمة', dept: 'علوم الحاسوب', exams: 98, avgPages: 6.1 },
  { id: '3', name: 'هندسة برمجيات', dept: 'هندسة البرمجيات', exams: 72, avgPages: 5.5 },
];

const COLORS = ['#0B3C5D', '#328CC1', '#D9E3F0', '#000000'];

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1} / ${year}`);
    }
    setAcademicYears(years);
  }, []);

  const handleExport = (format: 'pdf' | 'excel' | 'zip') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "تم التصدير بنجاح",
        description: `تم تجهيز وتحميل ملف التقرير بصيغة ${format.toUpperCase()}`,
      });
    }, 1500);
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
            onClick={() => handleExport('pdf')}
            className="rounded-xl h-11 border-2 gap-2 font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          >
            <FileDown className="w-4 h-4" />
            تصدير PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('excel')}
            className="rounded-xl h-11 border-2 gap-2 font-bold hover:bg-green-50 hover:text-green-600 hover:border-green-200"
          >
            <FileSpreadsheet className="w-4 h-4" />
            تصدير Excel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExport('zip')}
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
          مرشحات التقرير
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary mr-1">السنة الدراسية</label>
            <select className="w-full h-11 px-3 rounded-xl border bg-muted/30 outline-none text-sm font-bold text-primary focus:border-primary">
              <option value="all">جميع السنوات</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary mr-1">الفصل الدراسي</label>
            <select className="w-full h-11 px-3 rounded-xl border bg-muted/30 outline-none text-sm font-bold text-primary focus:border-primary">
              <option value="all">جميع الفصول</option>
              <option value="1">الفصل الأول</option>
              <option value="2">الفصل الثاني</option>
              <option value="3">الفصل التكميلي</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-primary mr-1">التخصص</label>
            <select className="w-full h-11 px-3 rounded-xl border bg-muted/30 outline-none text-sm font-bold text-primary focus:border-primary">
              <option value="all">جميع التخصصات</option>
              <option value="it">تقنية المعلومات</option>
              <option value="cs">علوم الحاسوب</option>
              <option value="se">هندسة البرمجيات</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button className="w-full h-11 rounded-xl font-bold gradient-blue shadow-lg">تحديث البيانات</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white border-r-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-primary" />
            <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">+5% نمو</Badge>
          </div>
          <p className="text-muted-foreground text-xs font-bold">الطلاب المسجلين</p>
          <h4 className="text-2xl font-black text-primary">4,520</h4>
        </Card>
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white border-r-4 border-secondary">
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-secondary" />
            <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px]">12 مادة جديدة</Badge>
          </div>
          <p className="text-muted-foreground text-xs font-bold">إجمالي المواد</p>
          <h4 className="text-2xl font-black text-primary">128</h4>
        </Card>
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white border-r-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px]">نشاط مرتفع</Badge>
          </div>
          <p className="text-muted-foreground text-xs font-bold">إجمالي الأرشفة</p>
          <h4 className="text-2xl font-black text-primary">12,840</h4>
        </Card>
      </div>

      <Tabs defaultValue="students" className="w-full" dir="rtl">
        <TabsList className="bg-muted/50 p-1 rounded-2xl h-14 mb-8">
          <TabsTrigger value="students" className="rounded-xl font-bold text-sm h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">تقارير الطلاب</TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-xl font-bold text-sm h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">تقارير المواد</TabsTrigger>
          <TabsTrigger value="activity" className="rounded-xl font-bold text-sm h-12 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">نشاط النظام</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
            <div className="rounded-2xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="text-right font-bold">الطالب</TableHead>
                    <TableHead className="text-right font-bold">رقم القيد</TableHead>
                    <TableHead className="text-right font-bold">عدد الاختبارات</TableHead>
                    <TableHead className="text-right font-bold">آخر تحديث</TableHead>
                    <TableHead className="text-right font-bold">الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_STUDENT_REPORTS.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-bold text-primary">{report.name}</TableCell>
                      <TableCell className="font-mono text-xs">{report.regId}</TableCell>
                      <TableCell className="font-black text-secondary">{report.exams}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{report.lastUpload}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-700 border-none rounded-lg">نشط</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
              <h3 className="text-lg font-bold text-primary mb-6">توزيع الاختبارات حسب المادة</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_SUBJECT_REPORTS}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f4f7fb', radius: 10 }}
                    />
                    <Bar dataKey="exams" radius={[8, 8, 0, 0]}>
                      {MOCK_SUBJECT_REPORTS.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-xl rounded-3xl bg-white">
               <div className="rounded-2xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-right font-bold">المادة</TableHead>
                      <TableHead className="text-right font-bold">القسم</TableHead>
                      <TableHead className="text-right font-bold">متوسط الصفحات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_SUBJECT_REPORTS.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-bold text-primary">{s.name}</TableCell>
                        <TableCell className="text-xs font-bold text-muted-foreground">{s.dept}</TableCell>
                        <TableCell className="font-black text-secondary">{s.avgPages}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-12 text-center border-none shadow-xl rounded-3xl bg-white">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">تقارير نشاط النظام</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">سيتم عرض سجلات الوصول وعمليات الرفع حسب المستخدمين والزمن في هذا القسم.</p>
            <Button variant="outline" className="mt-6 rounded-xl border-2 font-bold px-8">بدء التحليل المتقدم</Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
