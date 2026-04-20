
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  Search, 
  Eye, 
  Trash2, 
  FileText, 
  Edit2, 
  Loader2, 
  Save,
  X,
  BookOpen,
  Calendar,
  GraduationCap,
  Fingerprint,
  User,
  LayoutGrid,
  List,
  Filter,
  Building2,
  Clock,
  Download,
  ChevronLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { downloadFile } from "@/lib/storage-utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function AdminArchivePage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  // Queries
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: archives = [], loading } = useCollection(archivesQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  // States
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const [viewingArchive, setViewingArchive] = useState<any>(null);
  const [editingArchive, setEditingArchive] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter Logic
  const filteredArchives = useMemo(() => {
    return (archives as any[]).filter(item => {
      const matchesSearch = 
        item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.studentRegId?.includes(searchTerm) || 
        item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      const matchesDept = selectedDept === "all" || item.departmentId === selectedDept;
      const matchesLevel = selectedLevel === "all" || item.level === selectedLevel;

      return matchesSearch && matchesYear && matchesDept && matchesLevel;
    });
  }, [archives, searchTerm, selectedYear, selectedDept, selectedLevel]);

  const handleUpdateArchive = async () => {
    if (!firestore || !editingArchive) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(firestore, "archives", editingArchive.id);
      const { id, ...updateData } = editingArchive;
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // تسجيل في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "تعديل بيانات ملف مؤرشف",
        target: `${editingArchive.studentName} - ${editingArchive.subjectName}`,
        type: 'update',
        timestamp: serverTimestamp()
      });

      toast({ title: "تم تحديث البيانات بنجاح" });
      setEditingArchive(null);
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToBin = async (item: any) => {
    if (!firestore) return;
    try {
      const { id, ...originalData } = item;
      await addDoc(collection(firestore, "recycleBin"), {
        type: 'archive',
        originalData,
        originalId: id,
        deletedAt: serverTimestamp(),
        name: item.studentName,
        identifier: item.subjectName
      });
      await deleteDoc(doc(firestore, "archives", id));

      // تسجيل في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "حذف ملف من الأرشيف",
        target: `${item.studentName} - ${item.subjectName}`,
        type: 'delete',
        timestamp: serverTimestamp()
      });

      toast({ title: "تم نقل الملف لسلة المحذوفات" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في النقل" });
    }
  };

  const handleDownload = async (item: any) => {
    if (!item.fileUrl) return;
    toast({ title: "جاري تجهيز الملف للتحميل..." });
    const fileName = `${item.studentName}_${item.subjectName}`;
    const result = await downloadFile(item.fileUrl, fileName);
    if (!result.success) {
      toast({ variant: "destructive", title: "فشل تحميل الملف" });
    }
  };

  const isValidImageUrl = (url: string) => {
    return typeof url === 'string' && (url.startsWith('http') || url.startsWith('/'));
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الأرشيف المركزي</h1>
          <p className="text-muted-foreground font-bold text-sm">مراجعة وتعديل وحذف الملفات المؤرشفة من قبل الموظفين</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border self-end md:self-auto">
          <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setView('grid')} className={cn("rounded-xl px-4 gap-2 h-9", view === 'grid' && "gradient-blue shadow-md text-white")}><LayoutGrid className="w-4 h-4" />شبكة</Button>
          <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className={cn("rounded-xl px-4 gap-2 h-9", view === 'list' && "gradient-blue shadow-md text-white")}><List className="w-4 h-4" />قائمة</Button>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-3 md:p-4 rounded-[2rem] shadow-xl border-none bg-white flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="اسم الطالب، رقم القيد، أو اسم المادة..." 
              className="w-full h-12 md:h-14 pr-12 pl-4 rounded-2xl border-none bg-muted/20 outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-sm text-right" 
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)} 
            className="h-12 md:h-14 w-full md:auto rounded-2xl px-6 border-2 font-black gap-2 text-sm"
          >
            {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
            تصفية
          </Button>
        </Card>

        {showFilters && (
          <Card className="p-6 md:p-8 rounded-[2rem] shadow-lg border-none bg-white animate-slide-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="space-y-2">
              <label className="text-xs font-black text-primary mr-1 flex items-center gap-2 justify-start"><Calendar className="w-4 h-4 text-secondary" />السنة الدراسية</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر السنة" /></SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="all">كافة السنوات</SelectItem>
                  {academicYears.map((y: any) => <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-primary mr-1 flex items-center gap-2 justify-start"><Building2 className="w-4 h-4 text-secondary" />التخصص</label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                <SelectContent className="rounded-xl font-bold">
                  <SelectItem value="all">كافة التخصصات</SelectItem>
                  {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.id}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-primary mr-1 flex items-center gap-2 justify-start"><GraduationCap className="w-4 h-4 text-secondary" />المستوى</label>
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
          {filteredArchives.length > 0 ? (
            view === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {filteredArchives.map((item) => (
                  <Card key={item.id} className="group overflow-hidden border-none shadow-lg rounded-2xl bg-white hover:-translate-y-1 transition-all flex flex-col h-full">
                    <div className="relative aspect-[3/2] bg-muted/30 overflow-hidden shrink-0">
                      {isValidImageUrl(item.fileUrl) ? (
                        <Image 
                          src={item.fileUrl.includes('drive.google') ? PlaceHolderImages[1].imageUrl : item.fileUrl} 
                          alt="Exam" 
                          fill 
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                          <FileText className="w-12 h-12 text-primary opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-[1px]">
                        <Button size="icon" onClick={() => setViewingArchive(item)} className="rounded-lg h-8 w-8 bg-white text-primary shadow-lg hover:bg-white/90" title="معاينة"><Eye className="w-4 h-4" /></Button>
                        <Button size="icon" onClick={() => setEditingArchive(item)} className="rounded-lg h-8 w-8 bg-blue-500 text-white shadow-lg hover:bg-blue-600" title="تعديل"><Edit2 className="w-4 h-4" /></Button>
                        <Button size="icon" onClick={() => handleDownload(item)} className="rounded-lg h-8 w-8 bg-secondary text-white shadow-lg hover:bg-secondary/90" title="تنزيل المستند"><Download className="w-4 h-4" /></Button>
                        <Button size="icon" variant="destructive" className="rounded-lg h-8 w-8 shadow-lg" onClick={() => handleMoveToBin(item)} title="حذف"><Trash2 className="w-4 h-4" /></Button>
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
                        <th className="p-5 font-black text-primary">المادة / القسم</th>
                        <th className="p-5 font-black text-primary text-center">السنة / الترم</th>
                        <th className="p-5 font-black text-primary">المستوى</th>
                        <th className="p-5 text-center font-black text-primary">إجراءات المدير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArchives.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/10 transition-colors group">
                          <td className="p-5">
                            <div className="flex flex-col">
                              <span className="font-black text-primary text-sm">{item.studentName}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{item.studentRegId}</span>
                            </div>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-primary">{item.subjectName}</span>
                              <span className="text-[10px] text-secondary font-bold">{item.departmentName}</span>
                            </div>
                          </td>
                          <td className="p-5 text-center">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-primary">{item.year}</span>
                              <span className="text-[10px] font-bold text-muted-foreground">{item.term}</span>
                            </div>
                          </td>
                          <td className="p-5"><Badge variant="outline" className="font-bold border-primary text-primary rounded-lg text-[10px]">{item.level || 'غير محدد'}</Badge></td>
                          <td className="p-5 text-center">
                            <div className="flex justify-center gap-1.5">
                              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/5 h-9 w-9" onClick={() => setViewingArchive(item)} title="معاينة"><Eye className="w-4 h-4 text-primary" /></Button>
                              <Button size="icon" variant="ghost" className="rounded-xl hover:bg-blue-50 h-9 w-9" onClick={() => setEditingArchive(item)} title="تعديل"><Edit2 className="w-4 h-4 text-blue-600" /></Button>
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

      {/* Edit Archive Dialog */}
      <Dialog open={!!editingArchive} onOpenChange={(open) => !open && setEditingArchive(null)}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
           <div className="p-8 space-y-6">
              <DialogHeader className="text-right items-start">
                <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                  تعديل بيانات الملف الموثق
                  <Edit2 className="w-6 h-6 text-secondary" />
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">تحديث المعلومات الأكاديمية للمستند المختار لتصحيح أخطاء الأرشفة.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                    <User className="w-4 h-4 text-secondary" />
                    اسم الطالب
                  </Label>
                  <Input 
                    value={editingArchive?.studentName || ""} 
                    onChange={(e) => setEditingArchive({...editingArchive, studentName: e.target.value})} 
                    className="rounded-xl h-11 border-muted font-bold text-right" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                    <Fingerprint className="w-4 h-4 text-secondary" />
                    رقم القيد
                  </Label>
                  <Input 
                    value={editingArchive?.studentRegId || ""} 
                    onChange={(e) => setEditingArchive({...editingArchive, studentRegId: e.target.value})} 
                    className="rounded-xl h-11 border-muted font-bold text-right" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    المادة الدراسية
                  </Label>
                  <Select 
                    value={editingArchive?.subjectId || ""} 
                    onValueChange={(v) => {
                      const s = subjects.find((sub: any) => sub.id === v) as any;
                      setEditingArchive({...editingArchive, subjectId: v, subjectName: s?.nameAr || ""});
                    }}
                  >
                    <SelectTrigger className="rounded-xl h-11 font-bold">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                    <Calendar className="w-4 h-4 text-secondary" />
                    السنة الدراسية
                  </Label>
                  <Input 
                    value={editingArchive?.year || ""} 
                    onChange={(e) => setEditingArchive({...editingArchive, year: e.target.value})} 
                    className="rounded-xl h-11 border-muted font-bold text-right" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    المستوى
                  </Label>
                  <Select 
                    value={editingArchive?.level || ""} 
                    onValueChange={(v) => setEditingArchive({...editingArchive, level: v})}
                  >
                    <SelectTrigger className="rounded-xl h-11 font-bold">
                      <SelectValue placeholder="المستوى" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                      <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                      <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                      <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter className="flex-row gap-3 pt-6 border-t">
                <Button onClick={handleUpdateArchive} disabled={isSubmitting} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg gap-2 text-white">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التعديلات
                </Button>
                <Button variant="outline" onClick={() => setEditingArchive(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
              </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>

      {/* Viewing Dialog */}
      <Dialog open={!!viewingArchive} onOpenChange={(o) => !o && setViewingArchive(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none shadow-2xl rounded-3xl md:rounded-[2.5rem] bg-background">
          <DialogHeader className="sr-only">
            <DialogTitle>معاينة المستند الموثق</DialogTitle>
            <DialogDescription>عرض تفاصيل الطالب وصورة ورقة الامتحان</DialogDescription>
          </DialogHeader>
          {viewingArchive && (
            <div className="flex flex-col md:flex-row h-full w-full relative">
              <button 
                onClick={() => setViewingArchive(null)}
                className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-primary" />
              </button>
              <div className="w-full md:w-2/5 p-8 border-b md:border-b-0 md:border-l bg-white flex flex-col text-right">
                 <div className="space-y-6 flex-1">
                    <div className="space-y-2">
                       <Label className="text-muted-foreground text-[10px] font-black uppercase tracking-widest block">بيانات الطالب</Label>
                       <h3 className="text-xl md:text-2xl font-black text-primary leading-tight">{viewingArchive.studentName}</h3>
                       <div className="flex items-center justify-end gap-2 text-secondary font-black bg-secondary/5 p-2.5 rounded-xl border border-secondary/10 text-xs">
                          <Fingerprint className="w-4 h-4" />
                          <span>رقم القيد: {viewingArchive.studentRegId}</span>
                       </div>
                    </div>
                    <Separator className="opacity-50" />
                    <div className="grid grid-cols-1 gap-4">
                       <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-primary">
                          <Label className="text-muted-foreground text-[9px] font-black block mb-1">المادة الدراسية</Label>
                          <div className="flex items-center justify-end gap-2 font-black text-primary text-base">
                             {viewingArchive.subjectName}
                             <BookOpen className="w-4 h-4 text-secondary" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-secondary text-right">
                             <Label className="text-muted-foreground text-[9px] font-black block mb-1">السنة</Label>
                             <div className="font-black text-primary text-xs">{viewingArchive.year}</div>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-muted/10 border-r-4 border-secondary text-right">
                             <Label className="text-muted-foreground text-[9px] font-black block mb-1">المستوى</Label>
                             <div className="font-black text-primary text-xs">{viewingArchive.level}</div>
                          </div>
                       </div>
                    </div>
                 </div>
                 <div className="pt-8 flex flex-col gap-3">
                    <Button onClick={() => setEditingArchive(viewingArchive)} className="w-full h-12 rounded-xl font-black bg-blue-600 hover:bg-blue-700 shadow-lg gap-2 text-sm text-white">
                       <Edit2 className="w-5 h-5" />
                       تعديل بيانات المستند
                    </Button>
                    <Button variant="outline" onClick={() => handleDownload(viewingArchive)} className="w-full h-12 rounded-xl font-black border-2 gap-2 text-sm">
                       <Download className="w-5 h-5" />
                       تنزيل المستند الأصلي
                    </Button>
                 </div>
              </div>
              <div className="flex-1 relative bg-neutral-100 flex items-center justify-center p-8 min-h-[350px]">
                 <div className="relative w-full h-full bg-white shadow-xl rounded-xl overflow-hidden border-4 border-white flex items-center justify-center">
                    {isValidImageUrl(viewingArchive.fileUrl) && !viewingArchive.fileUrl.includes('drive.google') ? (
                       <Image src={viewingArchive.fileUrl} alt="Exam Preview" fill className="object-contain" />
                    ) : (
                       <div className="flex flex-col items-center gap-4 p-10 text-center">
                          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                             <FileText className="w-10 h-10 text-primary opacity-30" />
                          </div>
                          <p className="text-sm font-bold text-muted-foreground">هذا المستند مخزن في السحابة. الرجاء الضغط على زر التنزيل لحفظه.</p>
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
