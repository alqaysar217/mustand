
"use client";

import { useState, useEffect, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  List, 
  Eye, 
  Download, 
  Filter, 
  Search,
  MoreVertical,
  Calendar,
  X
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockArchives = [
  { id: '1', name: 'أحمد محمود علي', regId: '20210045', subject: 'رياضيات 1', year: '2023 / 2024', term: 'الفصل الأول', department: 'تقنية المعلومات', date: '2024-05-20' },
  { id: '2', name: 'سارة خالد يوسف', regId: '20220112', subject: 'فيزياء عامة', year: '2022 / 2023', term: 'الفصل الثاني', department: 'علوم الحاسوب', date: '2024-05-18' },
  { id: '3', name: 'وليد جاسم مرزوق', regId: '20210567', subject: 'برمجة 2', year: '2023 / 2024', term: 'الفصل الأول', department: 'هندسة البرمجيات', date: '2024-05-15' },
  { id: '4', name: 'مريم سعيد سالم', regId: '20230001', subject: 'اللغة الإنجليزية', year: '2023 / 2024', term: 'الفصل التكميلي', department: 'تقنية المعلومات', date: '2024-05-10' },
  { id: '5', name: 'فيصل عبدالرحمن', regId: '20210089', subject: 'كيمياء عضوية', year: '2022 / 2023', term: 'الفصل الثاني', department: 'علوم الحاسوب', date: '2024-05-08' },
  { id: '6', name: 'نورة عيسى محمد', regId: '20220334', subject: 'مقدمة حاسب', year: '2023 / 2024', term: 'الفصل الأول', department: 'تقنية المعلومات', date: '2024-05-05' },
];

export default function ArchivePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1} / ${year}`);
    }
    setAcademicYears(years);
  }, []);

  const filteredResults = useMemo(() => {
    return mockArchives.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regId.includes(searchTerm) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      const matchesTerm = selectedTerm === "all" || item.term === selectedTerm;
      const matchesDept = selectedDept === "all" || item.department === selectedDept;

      return matchesSearch && matchesYear && matchesTerm && matchesDept;
    });
  }, [searchTerm, selectedYear, selectedTerm, selectedDept]);

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSelectedYear("all");
    setSelectedTerm("all");
    setSelectedDept("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">الأرشيف الرقمي</h1>
            <p className="text-muted-foreground">استعرض وابحث في جميع الاختبارات المؤرشفة</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border">
            <Button 
              variant={view === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('grid')}
              className="rounded-xl px-4"
            >
              <LayoutGrid className="w-4 h-4 ml-2" />
              شبكة
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('list')}
              className="rounded-xl px-4"
            >
              <List className="w-4 h-4 ml-2" />
              قائمة
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-lg border-none mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب، رقم القيد، أو المادة..." 
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 rounded-xl gap-2 font-bold px-6 border-2"
          >
            {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
            تصفية النتائج
          </Button>
        </div>

        {showFilters && (
          <Card className="p-6 border-none shadow-xl rounded-3xl bg-white mb-10 animate-slide-up">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">السنة الدراسية</label>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/10 outline-none text-sm font-bold text-primary"
                >
                  <option value="all">الكل</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">الفصل الدراسي</label>
                <select 
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/10 outline-none text-sm font-bold text-primary"
                >
                  <option value="all">الكل</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                  <option value="الفصل التكميلي">الفصل التكميلي</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">التخصص</label>
                <select 
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-border bg-muted/10 outline-none text-sm font-bold text-primary"
                >
                  <option value="all">الكل</option>
                  <option value="تقنية المعلومات">تقنية المعلومات</option>
                  <option value="هندسة البرمجيات">هندسة البرمجيات</option>
                  <option value="علوم الحاسوب">علوم الحاسوب</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button 
                  onClick={handleApplyFilters}
                  className="flex-1 h-11 rounded-xl font-bold gradient-blue shadow-lg"
                >
                  تطبيق الفلاتر
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleResetFilters}
                  className="h-11 rounded-xl font-bold"
                >
                  إعادة ضبط
                </Button>
              </div>
            </div>
          </Card>
        )}

        {filteredResults.length > 0 ? (
          view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredResults.map((item) => (
                <Card key={item.id} className="group overflow-hidden border-none shadow-xl rounded-3xl bg-white hover:-translate-y-2 transition-all">
                  <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                    <Image 
                      src={PlaceHolderImages[1].imageUrl} 
                      alt="Exam Preview" 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end gap-3">
                      <Button className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-bold">
                        <Eye className="w-4 h-4 ml-2" />
                        عرض الاختبار
                      </Button>
                      <Button variant="outline" className="w-full rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold backdrop-blur-md">
                        <Download className="w-4 h-4 ml-2" />
                        تحميل PDF
                      </Button>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary/80 backdrop-blur-md border-none">{item.term}</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary truncate mb-1">{item.name}</h3>
                    <p className="text-sm text-secondary font-bold mb-4">{item.subject}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </div>
                      <div className="flex items-center gap-1 font-bold">
                        ID: {item.regId}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-muted/30 text-primary border-b">
                      <th className="p-6 font-bold">اسم الطالب</th>
                      <th className="p-6 font-bold">رقم القيد</th>
                      <th className="p-6 font-bold">المادة</th>
                      <th className="p-6 font-bold">الفصل / السنة</th>
                      <th className="p-6 font-bold">تاريخ الأرشفة</th>
                      <th className="p-6 font-bold text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredResults.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary">
                              {item.name[0]}
                            </div>
                            <span className="font-bold text-primary">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-6 font-mono text-muted-foreground">{item.regId}</td>
                        <td className="p-6 text-secondary font-bold">{item.subject}</td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-primary">{item.term}</span>
                            <span className="text-[10px] text-muted-foreground">{item.year}</span>
                          </div>
                        </td>
                        <td className="p-6 text-xs text-muted-foreground">{item.date}</td>
                        <td className="p-6">
                          <div className="flex items-center justify-center gap-2">
                             <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-primary/5"><Eye className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" className="rounded-xl text-secondary hover:bg-secondary/5"><Download className="w-4 h-4" /></Button>
                             <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-muted"><MoreVertical className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        ) : (
          <Card className="p-20 text-center border-none shadow-xl rounded-3xl bg-white">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">لا توجد نتائج مطابقة</h3>
            <p className="text-muted-foreground">جرب تغيير كلمات البحث أو المرشحات المطبقة.</p>
            <Button 
              variant="link" 
              onClick={handleResetFilters}
              className="mt-4 font-bold"
            >
              إعادة تعيين الكل
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
