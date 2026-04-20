
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
  Download, 
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
  School,
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
import { collection, deleteDoc, doc } from "firebase/firestore";

export default function ArchivePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [viewingExam, setViewingExam] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  
  const firestore = useFirestore();
  
  // Queries
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: archives = [], loading } = useCollection(archivesQuery);
  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const processedResults = useMemo(() => {
    const sorted = [...archives].sort((a: any, b: any) => {
      const timeA = a.uploadedAt?.seconds || 0;
      const timeB = b.uploadedAt?.seconds || 0;
      return timeB - timeA;
    });

    return sorted.filter((item: any) => {
      const sName = (item.studentName || "").toLowerCase();
      const sId = (item.studentRegId || "").toLowerCase();
      const subName = (item.subjectName || "").toLowerCase();
      const search = searchTerm.toLowerCase();

      const matchesSearch = sName.includes(search) || sId.includes(search) || subName.includes(search);
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      const matchesTerm = selectedTerm === "all" || item.term === selectedTerm;
      const matchesDept = selectedDept === "all" || item.departmentId === selectedDept;
      const matchesLevel = selectedLevel === "all" || item.level === selectedLevel;
      const matchesSubject = selectedSubject === "all" || item.subjectId === selectedSubject;

      return matchesSearch && matchesYear && matchesTerm && matchesDept && matchesLevel && matchesSubject;
    });
  }, [archives, searchTerm, selectedYear, selectedTerm, selectedDept, selectedLevel, selectedSubject]);

  const handleDownload = async (item: any) => {
    if (!item?.fileUrl) return;
    setDownloadingId(item.id);
    try {
      toast({ title: "جاري التحميل", description: `يتم معالجة ملف: ${item.studentName}` });
      const result = await downloadFile(item.fileUrl, `${item.studentName}_${item.subjectName}`);
      if (result.success) toast({ title: "تم التحميل بنجاح" });
      else throw result.error;
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحميل" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "archives", id));
      toast({ title: "تم الحذف", description: "تمت إزالة الملف من الأرشيف بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف الملف." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn("transition-all duration-300 p-4 md:p-10 animate-fade-in text-right", isOpen ? "mr-0 md:mr-64" : "mr-0")} dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div><h1 className="text-2xl md:text-3xl font-black text-primary mb-1">الأرشيف المركزي</h1><p className="text-muted-foreground font-bold text-sm">إدارة ومراجعة كافة الاختبارات المؤرشفة سحابياً</p></div>
          <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border self-end md:self-auto">
            <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setView('grid')} className={cn("rounded-xl px-4 gap-2 h-9", view === 'grid' && "gradient-blue shadow-md text-white")}><LayoutGrid className="w-4 h-4" />شبكة</Button>
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className={cn("rounded-xl px-4 gap-2 h-9", view === 'list' && "gradient-blue shadow-md text-white")}><List className="w-4 h-4" />قائمة</Button>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <Card className="p-3 md:p-4 rounded-[2rem] shadow-xl border-none bg-white flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="اسم الطالب، القيد، المادة..." 
                className="w-full h-12 md:h-14 pr-12 pl-4 rounded-2xl border-none bg-muted/20 outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-sm" 
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)} 
              className="h-12 md:h-14 w-full md:w-auto rounded-2xl px-6 border-2 font-black gap-2 text-sm"
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
                    {academicYears.map((y: any) => (
                      <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary" />التخصص</label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة التخصصات</SelectItem>
                    {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
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

              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" />المادة</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة المواد</SelectItem>
                    {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2">الفصل الدراسي</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر الترم" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة الفصول</SelectItem>
                    <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                    <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                    <SelectItem value="الفصل التكميلي">الفصل التكميلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full h-11 rounded-xl font-bold border-2 border-primary/20 text-primary"
                  onClick={() => {
                    setSelectedYear("all");
                    setSelectedDept("all");
                    setSelectedLevel("all");
                    setSelectedSubject("all");
                    setSelectedTerm("all");
                    setSearchTerm("");
                  }}
                >
                  إعادة ضبط البحث
                </Button>
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
                        <Image 
                          src={item.fileUrl || PlaceHolderImages[1].imageUrl} 
                          alt="Exam" 
                          fill 
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[1px]">
                          <Button size="icon" onClick={() => setViewingExam(item)} className="rounded-lg h-8 w-8 bg-white text-primary shadow-lg hover:bg-white/90"><Eye className="w-4 h-4" /></Button>
                          <Button size="icon" disabled={downloadingId === item.id} onClick={() => handleDownload(item)} className="rounded-lg h-8 w-8 bg-secondary text-white shadow-lg hover:bg-secondary/90">{downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}</Button>
                          <Button size="icon" variant="destructive" className="rounded-lg h-8 w-8 shadow-lg" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end pointer-events-none">
                          <Badge className="bg-primary/80 backdrop-blur-md text-[8px] px-1.5 py-0 rounded-md font-bold">{item.term}</Badge>
                        </div>
                      </div>
                      
                      <div className="p-3 text-right flex-1 flex flex-col">
                        <h3 className="text-xs font-black text-primary leading-tight line-clamp-1 mb-1">{item.studentName}</h3>
                        <p className="text-[10px] text-secondary font-bold flex items-center justify-start gap-1 mb-3">
                          {item.subjectName}
                          <BookOpen className="w-2.5 h-2.5" />
                        </p>
                        
                        <div className="mt-auto border-t pt-2.5 flex items-center justify-between text-[8px] font-bold">
                           <div className="flex items-center gap-1 text-muted-foreground/80">
                             <Clock className="w-2.5 h-2.5" />
                             {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('ar-EG-u-nu-latn') : 'الآن'}
                           </div>
                           <div className="bg-muted px-1.5 py-0.5 rounded text-primary/70">{item.studentRegId}</div>
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
                            <td className="p-5 font-black text-primary text-sm">{item.studentName}</td>
                            <td className="p-5 font-mono font-bold text-muted-foreground text-xs">{item.studentRegId}</td>
                            <td className="p-5"><Badge variant="outline" className="font-bold border-secondary text-secondary rounded-lg text-[10px]">{item.subjectName}</Badge></td>
                            <td className="p-5 text-xs font-bold text-muted-foreground">{item.level}</td>
                            <td className="p-5 text-center">
                              <div className="flex justify-center gap-2">
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5 h-9 w-9" onClick={() => setViewingExam(item)}><Eye className="w-4 h-4 text-primary" /></Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-secondary/5 h-9 w-9" onClick={() => handleDownload(item)} disabled={downloadingId === item.id}><Download className="w-4 h-4 text-secondary" /></Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-destructive/5 h-9 w-9" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
                <h3 className="text-2xl font-black text-primary mb-2">الأرشيف فارغ</h3>
                <p className="text-muted-foreground font-bold text-sm mb-6">لم يتم العثور على أي ملفات مؤرشفة حالياً</p>
                <Button variant="outline" onClick={() => {
                   setSelectedYear("all");
                   setSelectedDept("all");
                   setSelectedLevel("all");
                   setSelectedSubject("all");
                   setSelectedTerm("all");
                   setSearchTerm("");
                }} className="rounded-xl border-2 font-bold px-8">إعادة ضبط البحث</Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!viewingExam} onOpenChange={(o) => !o && setViewingExam(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl md:rounded-[2.5rem] bg-background">
          <DialogHeader className="sr-only"><DialogTitle>معاينة الاختبار</DialogTitle><DialogDescription>عرض تفاصيل ورقة الاختبار المؤرشفة</DialogDescription></DialogHeader>
          {viewingExam && (
            <div className="flex flex-col md:flex-row h-full w-full relative">
              {/* Floating Close Button */}
              <button 
                onClick={() => setViewingExam(null)}
                className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors border border-primary/5"
              >
                <X className="w-5 h-5 text-primary" />
              </button>

              {/* Right Side: Professional Data Distribution */}
              <div className="w-full md:w-2/5 p-6 md:p-8 border-b md:border-b-0 md:border-l bg-white flex flex-col text-right order-2 md:order-1">
                 <div className="space-y-6 flex-1 pt-4 md:pt-0">
                    <div className="space-y-2">
                       <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">بيانات الطالب المركزية</Label>
                       <h3 className="text-xl md:text-2xl font-black text-primary leading-tight">{viewingExam.studentName}</h3>
                       <div className="flex items-center justify-end gap-2 text-secondary font-black bg-secondary/5 p-2.5 rounded-xl border border-secondary/10 text-xs md:text-sm">
                          <Fingerprint className="w-4 h-4 md:w-5 md:h-5" />
                          <span>رقم القيد: {viewingExam.studentRegId}</span>
                       </div>
                    </div>
                    
                    <Separator className="opacity-50" />

                    <div className="grid grid-cols-1 gap-4">
                       <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-primary">
                          <Label className="text-muted-foreground text-[9px] font-black block mb-1">المادة الدراسية</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary text-base md:text-lg">
                             {viewingExam.subjectName}
                             <BookOpen className="w-4 h-4 text-secondary" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-secondary">
                             <Label className="text-muted-foreground text-[9px] font-black block mb-1">السنة الدراسية</Label>
                             <div className="flex items-center justify-end gap-2 font-black text-primary text-xs md:text-sm">
                                {viewingExam.year}
                                <Calendar className="w-3.5 h-3.5 text-secondary opacity-50" />
                             </div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-secondary">
                             <Label className="text-muted-foreground text-[9px] font-black block mb-1">المستوى</Label>
                             <div className="flex items-center justify-end gap-2 font-black text-primary text-xs md:text-sm">
                                {viewingExam.level}
                                <GraduationCap className="w-3.5 h-3.5 text-secondary opacity-50" />
                             </div>
                          </div>
                       </div>

                       <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-orange-500">
                          <Label className="text-muted-foreground text-[9px] font-black block mb-1">القسم والكلية</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary text-xs md:text-sm mb-0.5">
                             {viewingExam.departmentName || "تقنية المعلومات"}
                             <Building2 className="w-3.5 h-3.5 text-orange-500" />
                          </div>
                          <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-muted-foreground">
                             {viewingExam.collegeName || "كلية الحاسبات"}
                             <School className="w-3 h-3" />
                          </div>
                       </div>

                       <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-blue-500">
                          <Label className="text-muted-foreground text-[9px] font-black block mb-1">الفصل (الترم)</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary text-xs md:text-sm">
                             {viewingExam.term}
                             <Clock className="w-3.5 h-3.5 text-blue-500" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-8 mt-auto pb-4 md:pb-0">
                    <Button onClick={() => handleDownload(viewingExam)} className="w-full h-12 rounded-xl font-black gradient-blue shadow-lg gap-2 text-sm">
                       <Download className="w-5 h-5" />
                       تحميل المستند
                    </Button>
                 </div>
              </div>

              {/* Left Side: Exam Image View */}
              <div className="flex-1 relative bg-neutral-100 flex items-center justify-center p-4 md:p-8 min-h-[350px] md:min-h-0 order-1 md:order-2">
                 <div className="relative w-full h-full bg-white shadow-xl rounded-xl overflow-hidden border-4 border-white group">
                    <Image 
                       src={viewingExam.fileUrl || PlaceHolderImages[1].imageUrl} 
                       alt="Exam Original Preview" 
                       fill 
                       className="object-contain" 
                       priority 
                    />
                    <div className="absolute bottom-4 right-4 bg-primary/90 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                       المعاينة الأصلية
                    </div>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
