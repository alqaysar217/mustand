
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  BookOpen, 
  Calendar, 
  FileText,
  X,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const ALL_EXAMS = [
  { id: '1', subject: 'برمجة 2', year: '2023 / 2024', term: 'الفصل الأول', pages: 5, date: '2024-05-15', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '2', subject: 'رياضيات 1', year: '2023 / 2024', term: 'الفصل الأول', pages: 4, date: '2024-05-20', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '3', subject: 'فيزياء عامة', year: '2022 / 2023', term: 'الفصل الثاني', pages: 6, date: '2024-05-18', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '4', subject: 'اللغة الإنجليزية', year: '2023 / 2024', term: 'الفصل التكميلي', pages: 3, date: '2024-05-10', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '5', subject: 'برمجة 1', year: '2021 / 2022', term: 'الفصل الأول', pages: 4, date: '2022-01-15', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '6', subject: 'قواعد بيانات', year: '2022 / 2023', term: 'الفصل الأول', pages: 5, date: '2023-01-20', fileUrl: PlaceHolderImages[1].imageUrl },
];

export default function ExamsListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("all");
  const [filterTerm, setFilterTerm] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredExams = useMemo(() => {
    return ALL_EXAMS.filter(exam => {
      const matchesSearch = exam.subject.includes(searchTerm);
      const matchesYear = filterYear === "all" || exam.year === filterYear;
      const matchesTerm = filterTerm === "all" || exam.term === filterTerm;
      return matchesSearch && matchesYear && matchesTerm;
    });
  }, [searchTerm, filterYear, filterTerm]);

  const handleDownload = async (exam: any) => {
    if (!exam?.fileUrl) return;
    
    setDownloadingId(exam.id);
    try {
      toast({
        title: "جاري التحميل",
        description: `يتم الآن معالجة ملف: ${exam.subject}`,
      });

      const response = await fetch(exam.fileUrl);
      if (!response.ok) throw new Error('تعذر الوصول إلى مصدر الملف');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Determine extension based on mime type
      let extension = 'jpg';
      if (blob.type.includes('pdf')) {
        extension = 'pdf';
      } else if (blob.type.includes('image')) {
        extension = blob.type.split('/')[1] || 'jpg';
      }

      const cleanSubject = exam.subject.trim().replace(/\s+/g, '_');
      const cleanYear = exam.year.trim().replace(/\s+/g, '_').replace(/\//g, '-');
      a.download = `${cleanSubject}_${cleanYear}.${extension}`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "تم التحميل بنجاح",
        description: "تم حفظ الاختبار على جهازك بنجاح.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "فشل التحميل",
        description: "عذراً، حدث خطأ أثناء محاولة تحميل الملف.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 text-right">
      <div>
        <h1 className="text-3xl font-black text-primary mb-1">اختباراتي المؤرشفة</h1>
        <p className="text-muted-foreground font-bold">استعرض وحمل جميع اختباراتك السابقة بسهولة</p>
      </div>

      <Card className="p-4 border-none shadow-xl rounded-3xl bg-white flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="ابحث باسم المادة..."
            className="w-full h-12 pr-12 pl-4 rounded-2xl bg-muted/30 outline-none border-2 border-transparent focus:border-primary/10 font-bold transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 rounded-2xl px-6 gap-2 border-2 font-bold transition-all"
        >
          {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
          تصفية
        </Button>
      </Card>

      {showFilters && (
        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white animate-slide-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary mr-1">السنة الدراسية</label>
              <select 
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border bg-muted/30 outline-none font-bold text-primary"
              >
                <option value="all">جميع السنوات</option>
                <option value="2023 / 2024">2023 / 2024</option>
                <option value="2022 / 2023">2022 / 2023</option>
                <option value="2021 / 2022">2021 / 2022</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-primary mr-1">الفصل الدراسي</label>
              <select 
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border bg-muted/30 outline-none font-bold text-primary"
              >
                <option value="all">جميع الفصول</option>
                <option value="الفصل الأول">الفصل الأول</option>
                <option value="الفصل الثاني">الفصل الثاني</option>
                <option value="الفصل التكميلي">الفصل التكميلي</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredExams.length > 0 ? filteredExams.map((exam) => (
          <Card key={exam.id} className="group overflow-hidden border-none shadow-xl rounded-3xl bg-white hover:-translate-y-2 transition-all">
            <div className="relative aspect-[3/4] bg-muted overflow-hidden">
              <Image src={exam.fileUrl} alt={exam.subject} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end gap-3">
                <Button className="rounded-xl gradient-blue font-bold h-11" onClick={() => router.push(`/student/viewer/${exam.id}`)}>
                  <Eye className="w-4 h-4 ml-2" />
                  عرض الاختبار
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold backdrop-blur-md h-11"
                  onClick={() => handleDownload(exam)}
                  disabled={downloadingId === exam.id}
                >
                  {downloadingId === exam.id ? (
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 ml-2" />
                  )}
                  {downloadingId === exam.id ? "جاري المعالجة..." : "تحميل الملف"}
                </Button>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary/80 backdrop-blur-md border-none rounded-lg px-3 py-1 font-bold">{exam.term}</Badge>
              </div>
            </div>
            <div className="p-6 text-right">
              <h3 className="text-xl font-bold text-primary mb-1 truncate">{exam.subject}</h3>
              <p className="text-sm text-secondary font-bold mb-4">{exam.year}</p>
              <div className="flex items-center justify-between border-t pt-4 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1 font-bold">
                  <FileText className="w-3 h-3" />
                  {exam.pages} صفحات
                </div>
                <div className="flex items-center gap-1 font-bold">
                  <Calendar className="w-3 h-3" />
                  {exam.date}
                </div>
              </div>
            </div>
          </Card>
        )) : (
          <div className="col-span-full py-20 text-center text-muted-foreground font-bold bg-white rounded-3xl shadow-sm border border-dashed">
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
            لا توجد اختبارات تطابق البحث
          </div>
        )}
      </div>
    </div>
  );
}
