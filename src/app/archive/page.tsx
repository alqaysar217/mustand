
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
  School
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
    // الترتيب البرمجي المحلي لضمان الظهور الفوري دون الحاجة لفهارس Firebase
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
      
      <main className={cn("transition-all duration-300 p-6 md:p-10 animate-fade-in text-right", isOpen ? "mr-0 md:mr-64" : "mr-0")} dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div><h1 className="text-3xl font-black text-primary mb-1">الأرشيف المركزي</h1><p className="text-muted-foreground font-bold">إدارة ومراجعة كافة الاختبارات المؤرشفة سحابياً</p></div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border">
            <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setView('grid')} className={cn("rounded-xl px-4 gap-2", view === 'grid' && "gradient-blue shadow-md")}><LayoutGrid className="w-4 h-4" />شبكة</Button>
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className={cn("rounded-xl px-4 gap-2", view === 'list' && "gradient-blue shadow-md")}><List className="w-4 h-4" />قائمة</Button>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          <Card className="p-4 rounded-[2rem] shadow-xl border-none bg-white flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 min-w-[300px] relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="ابحث باسم الطالب، رقم القيد، أو المادة..." 
                className="w-full h-14 pr-12 pl-4 rounded-2xl border-none bg-muted/20 outline-none focus:ring-2 focus:ring-primary font-bold transition-all" 
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)} 
              className="h-14 rounded-2xl px-6 border-2 font-black gap-2"
            >
              {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              تصفية النتائج
            </Button>
          </Card>

          {showFilters && (
            <Card className="p-8 rounded-[2rem] shadow-lg border-none bg-white animate-slide-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" />السنة الدراسية</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold"><SelectValue placeholder="اختر السنة" /></SelectTrigger>
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
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة التخصصات</SelectItem>
                    {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-secondary" />المستوى</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold"><SelectValue placeholder="المستوى" /></SelectTrigger>
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
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold"><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">كافة المواد</SelectItem>
                    {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-primary mr-1 flex items-center gap-2">الفصل الدراسي</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold"><SelectValue placeholder="اختر الترم" /></SelectTrigger>
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
                  إعادة ضبط الفلاتر
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {processedResults.map((item) => (
                    <Card key={item.id} className="group overflow-hidden border-none shadow-xl rounded-[2rem] bg-white hover:-translate-y-2 transition-all">
                      <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                        <Image src={item.fileUrl || PlaceHolderImages[1].imageUrl} alt="Exam" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end gap-3 backdrop-blur-[2px]">
                          <Button onClick={() => setViewingExam(item)} className="w-full rounded-xl bg-white text-primary font-black hover:bg-white/90">عرض سريع</Button>
                          <Button disabled={downloadingId === item.id} onClick={() => handleDownload(item)} variant="outline" className="w-full rounded-xl bg-white/10 text-white border-white/20 font-black backdrop-blur-md h-11">{downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Download className="w-4 h-4 ml-2" />}تحميل الملف</Button>
                        </div>
                        <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                          <Badge className="bg-primary/90 backdrop-blur-md border-none rounded-lg px-3 py-1 font-black shadow-lg">{item.term}</Badge>
                          <Badge variant="outline" className="bg-white/90 backdrop-blur-md text-primary border-none rounded-lg px-2 py-0.5 font-bold text-[10px]">{item.level}</Badge>
                        </div>
                      </div>
                      <div className="p-6 text-right">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8 hover:bg-destructive/10 rounded-lg shrink-0" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                          <h3 className="text-lg font-black text-primary leading-tight line-clamp-1 flex-1">{item.studentName}</h3>
                        </div>
                        <p className="text-sm text-secondary font-black mb-4 flex items-center justify-end gap-2">{item.subjectName}<BookOpen className="w-3 h-3" /></p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-4 font-bold">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('ar-EG-u-nu-latn') : 'الآن'}</div>
                          <div className="bg-muted/50 px-2 py-0.5 rounded-md">قيد: {item.studentRegId}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead>
                        <tr className="bg-muted/30 border-b">
                          <th className="p-6 font-black text-primary">الطالب</th>
                          <th className="p-6 font-black text-primary">رقم القيد</th>
                          <th className="p-6 font-black text-primary">المادة</th>
                          <th className="p-6 font-black text-primary">المستوى</th>
                          <th className="p-6 text-center font-black text-primary">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResults.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/10 transition-colors group">
                            <td className="p-6 font-black text-primary">{item.studentName}</td>
                            <td className="p-6 font-mono font-bold text-muted-foreground">{item.studentRegId}</td>
                            <td className="p-6"><Badge variant="outline" className="font-bold border-secondary text-secondary rounded-lg">{item.subjectName}</Badge></td>
                            <td className="p-6 text-sm font-bold text-muted-foreground">{item.level}</td>
                            <td className="p-6 text-center">
                              <div className="flex justify-center gap-2">
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5" onClick={() => setViewingExam(item)}><Eye className="w-4 h-4 text-primary" /></Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-secondary/5" onClick={() => handleDownload(item)} disabled={downloadingId === item.id}><Download className="w-4 h-4 text-secondary" /></Button>
                                <Button size="icon" variant="ghost" className="rounded-xl hover:bg-destructive/5" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
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
              <div className="py-32 text-center bg-white rounded-[3rem] shadow-xl border-4 border-dashed border-muted/50">
                <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6"><Search className="w-12 h-12 text-muted-foreground opacity-30" /></div>
                <h3 className="text-3xl font-black text-primary mb-2">الأرشيف فارغ</h3>
                <p className="text-muted-foreground font-bold">لم يتم العثور على أي ملفات مؤرشفة حالياً</p>
                <Button variant="link" onClick={() => { setSelectedYear("all"); setSelectedDept("all"); setSelectedLevel("all"); setSelectedSubject("all"); setSelectedTerm("all"); setSearchTerm(""); }} className="mt-4 font-bold text-secondary">إعادة ضبط البحث</Button>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!viewingExam} onOpenChange={(o) => !o && setViewingExam(null)}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-none shadow-2xl rounded-[3rem]">
          <DialogHeader className="sr-only"><DialogTitle>معاينة الاختبار</DialogTitle><DialogDescription>عرض تفاصيل ورقة الاختبار المؤرشفة</DialogDescription></DialogHeader>
          {viewingExam && (
            <div className="flex flex-col md:flex-row h-full w-full">
              {/* Right Side: Data (Arabic Side) */}
              <div className="w-full md:w-2/5 p-8 border-l bg-white/50 backdrop-blur-md flex flex-col text-right overflow-y-auto">
                 <div className="flex justify-between items-start mb-8">
                   <div className="p-3 rounded-2xl gradient-blue text-white shadow-lg"><FileText className="w-6 h-6" /></div>
                   <Button variant="ghost" size="icon" onClick={() => setViewingExam(null)} className="rounded-xl hover:bg-destructive/10 text-destructive"><X className="w-6 h-6" /></Button>
                 </div>

                 <div className="space-y-8 flex-1">
                    <div className="space-y-2">
                       <Label className="text-muted-foreground text-xs font-black">بيانات الطالب المركزية</Label>
                       <h3 className="text-3xl font-black text-primary leading-tight">{viewingExam.studentName}</h3>
                       <div className="flex items-center justify-end gap-2 text-secondary font-black bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                          <Fingerprint className="w-5 h-5" />
                          <span>رقم القيد: {viewingExam.studentRegId}</span>
                       </div>
                    </div>
                    
                    <Separator className="bg-primary/5" />

                    <div className="grid grid-cols-1 gap-6">
                       <div className="p-4 rounded-2xl bg-muted/20 border-r-4 border-primary">
                          <Label className="text-muted-foreground text-[10px] font-black block mb-1">المادة والمحتوى</Label>
                          <div className="flex items-center justify-end gap-3 font-black text-primary text-xl">
                             {viewingExam.subjectName}
                             <BookOpen className="w-5 h-5 text-secondary" />
                          </div>
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-muted/20 border-r-4 border-secondary">
                             <Label className="text-muted-foreground text-[10px] font-black block mb-1">السنة الدراسية</Label>
                             <div className="flex items-center justify-end gap-2 font-black text-primary">
                                {viewingExam.year}
                                <Calendar className="w-4 h-4 text-secondary opacity-50" />
                             </div>
                          </div>
                          <div className="p-4 rounded-2xl bg-muted/20 border-r-4 border-secondary">
                             <Label className="text-muted-foreground text-[10px] font-black block mb-1">المستوى</Label>
                             <div className="flex items-center justify-end gap-2 font-black text-primary">
                                {viewingExam.level}
                                <GraduationCap className="w-4 h-4 text-secondary opacity-50" />
                             </div>
                          </div>
                       </div>

                       <div className="p-4 rounded-2xl bg-muted/20 border-r-4 border-orange-500">
                          <Label className="text-muted-foreground text-[10px] font-black block mb-1">القسم والكلية</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary mb-1">
                             {viewingExam.departmentName || "تقنية المعلومات"}
                             <Building2 className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex items-center justify-end gap-2 text-xs font-bold text-muted-foreground">
                             {viewingExam.collegeName || "كلية الحاسبات"}
                             <School className="w-3 h-3" />
                          </div>
                       </div>

                       <div className="p-4 rounded-2xl bg-muted/20 border-r-4 border-blue-500">
                          <Label className="text-muted-foreground text-[10px] font-black block mb-1">الفصل والتاريخ</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary">
                             {viewingExam.term}
                             <Clock className="w-4 h-4 text-blue-500" />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 flex flex-col gap-3">
                    <Button onClick={() => handleDownload(viewingExam)} className="w-full h-14 rounded-2xl font-black gradient-blue shadow-xl gap-3 text-lg">
                       <Download className="w-6 h-6" />
                       تحميل المستند الرقمي
                    </Button>
                 </div>
              </div>

              {/* Left Side: Image Content */}
              <div className="flex-1 relative bg-neutral-100 flex items-center justify-center p-6 md:p-12 overflow-hidden">
                 <div className="relative w-full h-full bg-white shadow-2xl rounded-2xl overflow-hidden border-8 border-white group">
                    <Image 
                       src={viewingExam.fileUrl || PlaceHolderImages[1].imageUrl} 
                       alt="Exam View" 
                       fill 
                       className="object-contain transition-transform duration-500 group-hover:scale-105" 
                       priority 
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
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
