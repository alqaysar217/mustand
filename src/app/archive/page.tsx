
"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  List, 
  Eye, 
  Filter, 
  Search,
  Calendar,
  Loader2,
  Trash2,
  BookOpen,
  X,
  Building2,
  GraduationCap,
  Fingerprint,
  Clock,
  Download,
  FileText
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { downloadFile } from "@/lib/storage-utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

export default function ArchivePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [viewingExam, setViewingExam] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  
  const firestore = useFirestore();
  
  // Queries
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: archives = [], loading } = useCollection(archivesQuery);
  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const processedResults = useMemo(() => {
    const sorted = [...archives].sort((a: any, b: any) => {
      const timeA = a.uploadedAt?.seconds || 0;
      const timeB = b.uploadedAt?.seconds || 0;
      return timeB - timeA;
    });

    return sorted.filter((item: any) => {
      const sName = (item.student_name || item.studentName || "").toLowerCase();
      const sId = (item.student_id || item.studentRegId || "").toLowerCase();
      const subName = (item.subject_name || item.subjectName || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = sName.includes(search) || sId.includes(search) || subName.includes(search);
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      const matchesDept = selectedDept === "all" || item.departmentId === selectedDept;
      const matchesLevel = selectedLevel === "all" || item.level === selectedLevel;

      return matchesSearch && matchesYear && matchesDept && matchesLevel;
    });
  }, [archives, searchTerm, selectedYear, selectedDept, selectedLevel]);

  const handleDownload = async (item: any) => {
    const fileUrl = item.file_data || item.fileUrl;
    if (!fileUrl) return;
    toast({ title: "جاري تحميل الملف..." });
    const fileName = `${item.student_name || item.studentName}_${item.subject_name || item.subjectName}`;
    const result = await downloadFile(fileUrl, fileName);
    if (!result.success) {
      toast({ variant: "destructive", title: "فشل التحميل" });
    }
  };

  const handleMoveToBin = async (item: any) => {
    if (!firestore || !item.id) return;
    try {
      const { id, ...originalData } = item;
      
      // تنقية البيانات من أي قيم undefined لأن Firestore يرفضها
      const cleanedData = Object.entries(originalData).reduce((acc: any, [key, value]) => {
        if (value !== undefined) acc[key] = value;
        return acc;
      }, {});

      await addDoc(collection(firestore, "recycleBin"), {
        type: 'archive',
        originalData: cleanedData,
        originalId: id,
        deletedAt: serverTimestamp(),
        name: item.student_name || item.studentName || "ملف بيانات ناقصة",
        identifier: item.subject_name || item.subjectName || "مادة غير محددة"
      });
      
      await deleteDoc(doc(firestore, "archives", id));
      toast({ title: "تم نقل الملف لسلة المحذوفات" });
    } catch (error) {
      console.error("Move to bin error:", error);
      toast({ variant: "destructive", title: "خطأ في النقل", description: "تعذر نقل الملف بسبب نقص في البيانات الأساسية." });
    }
  };

  const isValidImageUrl = (url: string) => {
    return typeof url === 'string' && (url.startsWith('data:image') || url.startsWith('http') || url.startsWith('/'));
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn("transition-all duration-300 p-4 md:p-10 animate-fade-in text-right", isOpen ? "mr-0 md:mr-64" : "mr-0")} dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div><h1 className="text-2xl md:text-3xl font-black text-primary mb-1">الأرشيف المركزي</h1><p className="text-muted-foreground font-bold text-sm">إدارة ومراجعة كافة الاختبارات المؤرشفة (Base64 في Firestore)</p></div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border self-end md:self-auto">
            <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setView('grid')} className={cn("rounded-xl px-4 gap-2 h-9", view === 'grid' && "gradient-blue shadow-md text-white")}><LayoutGrid className="w-4 h-4" />شبكة</Button>
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className={cn("rounded-xl px-4 gap-2 h-9", view === 'list' && "gradient-blue shadow-md text-white")}><List className="w-4 h-4" />قائمة</Button>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <Card className="p-3 md:p-4 rounded-[2rem] shadow-xl border-none bg-white flex flex-col md:flex-row items-center gap-4">
            <div className="flex-[3] relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="اسم الطالب، رقم القيد، أو اسم المادة..." 
                className="w-full h-12 md:h-14 pr-12 pl-4 rounded-2xl border-none bg-muted/20 outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-sm" 
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)} 
              className="h-12 md:h-14 w-full md:w-auto rounded-2xl px-8 border-2 font-black gap-2 text-sm"
            >
              {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              تصفية
            </Button>
          </Card>

          {showFilters && (
            <Card className="p-6 md:p-8 rounded-[2rem] shadow-lg border-none bg-white animate-slide-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" />السنة الدراسية</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر السنة" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة السنوات</SelectItem>
                    {academicYears.map((y: any) => <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary" />التخصص</label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة التخصصات</SelectItem>
                    {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-secondary" />المستوى</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="المستوى" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة المستويات</SelectItem>
                    <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                    <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                    <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                    <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          )}
        </div>

        {loading ? (
          <div className="py-40 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" /></div>
        ) : (
          <div className="animate-slide-up">
            {processedResults.length > 0 ? (
              view === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                  {processedResults.map((item) => (
                    <Card key={item.id} className="group overflow-hidden border-none shadow-lg rounded-2xl bg-white hover:-translate-y-1 transition-all flex flex-col h-full">
                      <div className="relative aspect-[3/2] bg-muted/30 overflow-hidden shrink-0">
                        {isValidImageUrl(item.file_data || item.fileUrl) ? (
                          <Image 
                            src={item.file_data || item.fileUrl} 
                            alt="Exam" 
                            fill 
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                        />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <FileText className="w-12 h-12 text-primary opacity-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                          <Button size="icon" onClick={() => setViewingExam(item)} className="rounded-lg h-8 w-8 bg-white text-primary shadow-lg hover:bg-white/90" title="معاينة"><Eye className="w-4 h-4" /></Button>
                          <Button size="icon" onClick={() => handleDownload(item)} className="rounded-lg h-8 w-8 bg-secondary text-white shadow-lg hover:bg-secondary/90" title="تنزيل"><Download className="w-4 h-4" /></Button>
                          <Button size="icon" variant="destructive" className="rounded-lg h-8 w-8 shadow-lg" onClick={() => handleMoveToBin(item)} title="حذف"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end pointer-events-none">
                          <Badge className="bg-primary/80 backdrop-blur-md text-[8px] px-1.5 py-0 rounded-md font-bold">{item.term}</Badge>
                        </div>
                      </div>
                      <div className="p-3 text-right flex-1 flex flex-col">
                        <h3 className="text-xs font-black text-primary leading-tight line-clamp-1 mb-1">{item.student_name || item.studentName}</h3>
                        <p className="text-[10px] text-secondary font-bold flex items-center justify-start gap-1 mb-3">
                          {item.subject_name || item.subjectName}
                          <BookOpen className="w-2.5 h-2.5" />
                        </p>
                        <div className="mt-auto border-t pt-2.5 flex items-center justify-between text-[8px] font-bold">
                           <div className="flex items-center gap-1 text-muted-foreground/80">
                             <Clock className="w-2.5 h-2.5" />
                             {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('ar-EG-u-nu-latn') : 'الآن'}
                           </div>
                           <div className="bg-muted px-1.5 py-0.5 rounded text-primary/70">{item.student_id || item.studentRegId}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right min-w-[700px]">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          <th className="p-5 font-black text-primary">الطالب</th>
                          <th className="p-5 font-black text-primary">رقم القيد</th>
                          <th className="p-5 font-black text-primary">المادة</th>
                          <th className="p-5 font-black text-primary">المستوى</th>
                          <th className="p-5 text-center font-black text-primary">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResults.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/10 transition-colors group">
                            <td className="p-5 font-black text-primary text-sm">{item.student_name || item.studentName}</td>
                            <td className="p-5 font-mono font-bold text-muted-foreground text-xs">{item.student_id || item.studentRegId}</td>
                            <td className="p-5"><Badge variant="outline" className="font-bold border-secondary text-secondary rounded-lg text-[10px]">{item.subject_name || item.subjectName}</Badge></td>
                            <td className="p-5 text-xs font-bold text-muted-foreground">{item.level}</td>
                            <td className="p-5 text-center">
                              <div className="flex justify-center gap-2">
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5 h-9 w-9" onClick={() => setViewingExam(item)} title="معاينة"><Eye className="w-4 h-4 text-primary" /></Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-secondary/5 h-9 w-9" onClick={() => handleDownload(item)} title="تنزيل"><Download className="w-4 h-4 text-secondary" /></Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-destructive/5 h-9 w-9" onClick={() => handleMoveToBin(item)} title="حذف"><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
              <div className="py-32 text-center bg-white rounded-[3rem] shadow-xl border-4 border-dashed border-muted/50 max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-muted-foreground opacity-30" /></div>
                <h3 className="text-2xl font-black text-primary mb-2">الأرشيف لا يحتوي نتائج</h3>
                <p className="text-muted-foreground font-bold text-sm mb-8">لم يتم العثور على أي ملفات مؤرشفة تطابق خيارات البحث الحالية.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedYear("all");
                    setSelectedDept("all");
                    setSelectedLevel("all");
                    setSearchTerm("");
                  }} 
                  className="rounded-xl border-2 font-bold px-8 h-12"
                >
                  إعادة ضبط البحث
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!viewingExam} onOpenChange={(o) => !o && setViewingExam(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl md:rounded-[2.5rem] bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>معاينة الاختبار</DialogTitle>
            <DialogDescription>عرض تفاصيل الطالب وصورة المستند الموثق</DialogDescription>
          </DialogHeader>
          {viewingExam && (
            <div className="flex flex-col md:flex-row h-full w-full relative">
              <button 
                onClick={() => setViewingExam(null)}
                className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
              <div className="w-full md:w-2/5 p-8 border-b md:border-b-0 md:border-l bg-white flex flex-col text-right">
                 <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                       <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">بيانات الطالب</Label>
                       <h3 className="text-xl md:text-2xl font-black text-primary leading-tight">{viewingExam.student_name || viewingExam.studentName}</h3>
                       <div className="flex items-center justify-end gap-2 text-secondary font-black bg-secondary/5 p-2.5 rounded-xl border border-secondary/10 text-xs">
                          <Fingerprint className="w-4 h-4" />
                          <span>رقم القيد: {viewingExam.student_id || viewingExam.studentRegId}</span>
                       </div>
                    </div>
                    <Separator className="opacity-50" />
                    <div className="grid grid-cols-1 gap-4">
                       <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-primary">
                          <Label className="text-muted-foreground text-[9px] font-black block mb-1">المادة الدراسية</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary text-base">
                             {viewingExam.subject_name || viewingExam.subjectName}
                             <BookOpen className="w-4 h-4 text-secondary" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-secondary text-right">
                             <Label className="text-muted-foreground text-[9px] font-black block mb-1">السنة</Label>
                             <div className="font-black text-primary text-xs">{viewingExam.year}</div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-secondary text-right">
                             <Label className="text-muted-foreground text-[9px] font-black block mb-1">المستوى</Label>
                             <div className="font-black text-primary text-xs">{viewingExam.level}</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="pt-8">
                    <Button onClick={() => handleDownload(viewingExam)} className="w-full h-12 rounded-xl font-black gradient-blue shadow-lg gap-2 text-sm">
                       <Download className="w-5 h-5" />
                       تنزيل المستند الأصلي
                    </Button>
                 </div>
              </div>
              <div className="flex-1 relative bg-neutral-100 flex items-center justify-center p-8 min-h-[350px]">
                 <div className="relative w-full h-full bg-white shadow-xl rounded-xl overflow-hidden border-4 border-white flex items-center justify-center">
                    {isValidImageUrl(viewingExam.file_data || viewingExam.fileUrl) ? (
                       <Image src={viewingExam.file_data || viewingExam.fileUrl} alt="Exam Preview" fill className="object-contain" />
                    ) : (
                       <div className="flex flex-col items-center gap-4 p-10 text-center">
                          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                             <FileText className="w-10 h-10 text-primary opacity-30" />
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">هذا المستند مخزن سحابياً. الرجاء الضغط على زر التنزيل لحفظه محلياً.</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
