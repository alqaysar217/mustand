
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2,
  Loader2,
  Fingerprint,
  User,
  Building2,
  Banknote,
  Filter,
  Layers,
  ShieldCheck,
  CheckCircle,
  School,
  Calendar,
  X,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  MoreHorizontal
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";

const LEVEL_PROGRESSION: Record<string, string> = {
  "المستوى الأول": "المستوى الثاني",
  "المستوى الثاني": "المستوى الثالث",
  "المستوى الثالث": "المستوى الرابع",
  "المستوى الرابع": "المستوى الخامس",
  "المستوى الخامس": "خريج"
};

export default function AdminStudentsPage() {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();

  // Queries
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: students = [], loading } = useCollection(studentsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: colleges = [] } = useCollection(collegesQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  // Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterAdmissionType, setFilterAdmissionType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newStudent, setNewStudent] = useState({
    name: "",
    regId: "",
    collegeId: "",
    departmentId: "",
    level: "المستوى الأول",
    admissionType: "عام",
    academicYear: ""
  });

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredStudents = useMemo(() => {
    return (students as any[]).filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           student.regId?.includes(searchTerm);
      const matchesCollege = filterCollege === "all" || student.collegeId === filterCollege;
      const matchesDept = filterDept === "all" || student.departmentId === filterDept;
      const matchesLevel = filterLevel === "all" || student.level === filterLevel;
      const matchesYear = filterYear === "all" || student.academicYear === filterYear;
      const matchesAdmission = filterAdmissionType === "all" || student.admissionType === filterAdmissionType;
      
      return matchesSearch && matchesCollege && matchesDept && matchesLevel && matchesYear && matchesAdmission;
    });
  }, [students, searchTerm, filterCollege, filterDept, filterLevel, filterYear, filterAdmissionType]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBatchPromote = async () => {
    if (!firestore || selectedIds.length === 0) return;
    setSubmitting(true);
    try {
      const batch = writeBatch(firestore);
      let promotedCount = 0;

      for (const id of selectedIds) {
        const student = (students as any[]).find(s => s.id === id);
        if (student && student.level) {
          const nextLevel = LEVEL_PROGRESSION[student.level] || student.level;
          if (nextLevel !== student.level) {
            const docRef = doc(firestore, "students", id);
            batch.update(docRef, { level: nextLevel, updatedAt: serverTimestamp() });
            promotedCount++;
          }
        }
      }

      await batch.commit();
      
      // تسجيل في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "ترفيع جماعي للطلاب",
        target: `تم ترفيع ${promotedCount} طالب بنجاح`,
        type: 'update',
        timestamp: serverTimestamp()
      });

      toast({ title: `تم ترفيع ${promotedCount} طالب بنجاح` });
      setSelectedIds([]);
      setIsPromotionDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "فشل ترفيع الطلاب" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStudent = async () => {
    if (!firestore || !newStudent.name || !newStudent.regId || !newStudent.collegeId || !newStudent.departmentId || !newStudent.academicYear) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    setSubmitting(true);
    try {
      const selectedCollege = (colleges as any[]).find(c => c.id === newStudent.collegeId);
      const selectedDept = (departments as any[]).find(d => d.id === newStudent.departmentId);

      await addDoc(collection(firestore, "students"), {
        ...newStudent,
        collegeName: selectedCollege?.name || "",
        departmentName: selectedDept?.nameAr || selectedDept?.name || "",
        status: "active",
        createdAt: serverTimestamp()
      });

      setIsAddDialogOpen(false);
      setNewStudent({ name: "", regId: "", collegeId: "", departmentId: "", level: "المستوى الأول", admissionType: "عام", academicYear: "" });
      toast({ title: "تم تسجيل الطالب بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!firestore || !editingStudent?.name || !editingStudent?.regId) return;

    setSubmitting(true);
    try {
      const selectedCollege = (colleges as any[]).find(c => c.id === editingStudent.collegeId);
      const selectedDept = (departments as any[]).find(d => d.id === editingStudent.departmentId);
      
      const docRef = doc(firestore, "students", editingStudent.id);
      await updateDoc(docRef, {
        name: editingStudent.name,
        regId: editingStudent.regId,
        collegeId: editingStudent.collegeId || "",
        collegeName: selectedCollege?.name || editingStudent.collegeName || "",
        departmentId: editingStudent.departmentId || "",
        departmentName: selectedDept?.nameAr || selectedDept?.name || editingStudent.departmentName || "",
        level: editingStudent.level || "المستوى الأول",
        admissionType: editingStudent.admissionType || "عام",
        academicYear: editingStudent.academicYear || "",
        updatedAt: serverTimestamp()
      });
      setEditingStudent(null);
      toast({ title: "تم تحديث البيانات" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في التحديث" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveToBin = async (student: any) => {
    if (!firestore) return;
    try {
      const { id, ...originalData } = student;
      await addDoc(collection(firestore, "recycleBin"), {
        type: 'student',
        originalData,
        originalId: id,
        deletedAt: serverTimestamp(),
        name: student.name,
        identifier: student.regId
      });
      await deleteDoc(doc(firestore, "students", id));
      toast({ title: "تم نقل الطالب لسلة المحذوفات" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة شؤون الطلاب</h1>
          <p className="text-muted-foreground font-bold text-sm">إدارة السجلات الأكاديمية والترفيع الجماعي للمستويات</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {selectedIds.length > 0 && (
            <Button 
              onClick={() => setIsPromotionDialogOpen(true)}
              className="rounded-2xl h-12 px-6 font-black bg-secondary hover:bg-secondary/90 shadow-lg gap-2 text-white animate-fade-in"
            >
              <TrendingUp className="w-5 h-5" />
              ترفيع ({selectedIds.length}) طلاب
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2 text-white">
                <UserPlus className="w-5 h-5" />
                تسجيل طالب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl rounded-[2rem] border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-10">
                <DialogHeader className="text-right items-start space-y-2 mb-8">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-secondary" />
                    تسجيل ملف أكاديمي
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2 col-span-2 text-right">
                    <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">الاسم الرباعي الكامل</Label>
                    <Input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="الاسم كما في الهوية" className="rounded-xl h-12 bg-muted/20 border-muted font-bold" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">رقم القيد</Label>
                    <Input value={newStudent.regId} onChange={(e) => setNewStudent({...newStudent, regId: e.target.value})} placeholder="رقم القيد" className="rounded-xl h-12 bg-muted/20 border-muted font-black" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">العام الدراسي</Label>
                    <Select onValueChange={(v) => setNewStudent({...newStudent, academicYear: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold"><SelectValue placeholder="اختر العام" /></SelectTrigger>
                      <SelectContent className="rounded-xl font-bold" dir="rtl">
                        {academicYears.map((y: any) => <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">الكلية</Label>
                    <Select onValueChange={(v) => setNewStudent({...newStudent, collegeId: v, departmentId: ""})}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold"><SelectValue placeholder="اختر الكلية" /></SelectTrigger>
                      <SelectContent className="rounded-xl font-bold" dir="rtl">
                        {colleges.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">التخصص</Label>
                    <Select value={newStudent.departmentId} onValueChange={(v) => setNewStudent({...newStudent, departmentId: v})}>
                      <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                      <SelectContent className="rounded-xl font-bold" dir="rtl">
                        {departments.filter((d: any) => !newStudent.collegeId || d.collegeId === newStudent.collegeId).map((d: any) => (
                          <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="flex-row gap-4 pt-8 border-t mt-6">
                  <Button disabled={submitting} onClick={handleAddStudent} className="flex-1 rounded-xl h-12 font-black gradient-blue shadow-lg gap-2 text-white">تأكيد التسجيل</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="p-3 md:p-4 rounded-[2rem] shadow-xl border-none bg-white flex flex-col md:flex-row items-center gap-4">
          <div className="flex-[3] relative w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              placeholder="ابحث باسم الطالب أو رقم القيد..." 
              className="w-full h-12 md:h-14 pr-12 pl-4 rounded-2xl border-none bg-muted/20 outline-none focus:ring-2 focus:ring-primary font-bold transition-all text-sm text-right" 
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
          <Card className="p-6 md:p-8 rounded-[2rem] shadow-lg border-none bg-white animate-slide-up grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-primary mr-1 flex items-center gap-2 justify-start"><Calendar className="w-4 h-4 text-secondary" />السنة</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="السنة" /></SelectTrigger>
                <SelectContent className="rounded-xl font-bold" dir="rtl">
                  <SelectItem value="all">كافة السنوات</SelectItem>
                  {academicYears.map((y: any) => <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-primary mr-1 flex items-center gap-2 justify-start"><Layers className="w-4 h-4 text-secondary" />المستوى</label>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="rounded-xl h-11 bg-muted/30 border-none font-bold text-sm"><SelectValue placeholder="المستوى" /></SelectTrigger>
                <SelectContent className="rounded-xl font-bold" dir="rtl">
                  <SelectItem value="all">كافة المستويات</SelectItem>
                  {Object.keys(LEVEL_PROGRESSION).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}
      </div>

      <Card className="p-6 border-none shadow-xl rounded-[2rem] bg-white overflow-hidden">
        <div className="rounded-2xl border overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-[50px] p-4">
                  <Checkbox 
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0} 
                    onCheckedChange={handleSelectAll} 
                    className="border-primary"
                  />
                </TableHead>
                <TableHead className="text-right font-black text-primary py-5">الطالب / القيد</TableHead>
                <TableHead className="text-right font-black text-primary">التخصص / الكلية</TableHead>
                <TableHead className="text-right font-black text-primary">المستوى</TableHead>
                <TableHead className="text-center font-black text-primary w-32">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-60 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto opacity-20 text-primary" /></TableCell></TableRow>
              ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableRow key={student.id} className={cn("hover:bg-muted/10 border-b group transition-colors", selectedIds.includes(student.id) && "bg-secondary/5")}>
                  <TableCell className="p-4">
                    <Checkbox 
                      checked={selectedIds.includes(student.id)} 
                      onCheckedChange={(checked) => handleSelectOne(student.id, !!checked)} 
                      className="border-primary"
                    />
                  </TableCell>
                  <TableCell className="p-4 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 shadow-sm">
                        <GraduationCap className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-primary text-base">{student.name}</span>
                        <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-widest">{student.regId}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">{student.departmentName || '---'}</span>
                      <span className="text-[10px] font-black text-secondary uppercase">{student.collegeName || '---'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] px-3 py-1 border-secondary/30 text-secondary font-black bg-secondary/5 rounded-lg">
                      {student.level || 'غير محدد'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)} className="rounded-xl hover:bg-blue-50 text-blue-600 h-9 w-9"><Edit2 className="w-4 h-4" /></Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 text-destructive h-9 w-9"><Trash2 className="w-4 h-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-6 max-w-[380px]" dir="rtl">
                          <AlertDialogHeader className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce duration-[2000ms]"><AlertTriangle className="w-8 h-8 text-red-500" /></div>
                            <div className="space-y-2 w-full text-right">
                              <AlertDialogTitle className="text-xl font-black text-primary">حذف بيانات الطالب</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold text-muted-foreground text-xs leading-relaxed">
                                سيتم نقل سجل الطالب <span className="text-red-600 font-black">({student.name})</span> لسلة المحذوفات. هل أنت متأكد؟
                              </AlertDialogDescription>
                            </div>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex flex-col gap-2 mt-6 w-full">
                            <AlertDialogAction onClick={() => handleMoveToBin(student)} className="w-full rounded-xl bg-red-600 hover:bg-red-700 font-black h-12 text-white border-none order-1">نعم، احذف الطالب</AlertDialogAction>
                            <AlertDialogCancel className="w-full rounded-xl font-black border-2 h-12 text-primary hover:bg-muted/50 order-2">إلغاء</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="h-60 text-center text-muted-foreground font-bold">لا يوجد طلاب مطابقون للبحث</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Promotion Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="max-w-[400px] rounded-[2rem] border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-8">
            <DialogHeader className="text-right items-center space-y-4 mb-6">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center text-secondary animate-pulse">
                <TrendingUp className="w-8 h-8" />
              </div>
              <DialogTitle className="text-xl font-black text-primary">تأكيد الترفيع الجماعي</DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground text-center">
                أنت على وشك ترفيع <span className="text-secondary font-black text-lg">{selectedIds.length}</span> طالب مختارين إلى المستوى الدراسي التالي.
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted/30 p-4 rounded-2xl mb-8 space-y-3">
               <div className="flex items-center justify-between text-xs font-bold border-b border-muted pb-2">
                 <span className="text-muted-foreground">الكلية / القسم:</span>
                 <span className="text-primary">{filterCollege !== 'all' ? colleges.find((c:any)=>c.id===filterCollege)?.name : 'مختلف'}</span>
               </div>
               <div className="flex items-center justify-between">
                 <Badge className="bg-primary/10 text-primary border-none text-[10px]">المستوى الحالي</Badge>
                 <TrendingUp className="w-4 h-4 text-muted-foreground/30" />
                 <Badge className="bg-secondary/10 text-secondary border-none text-[10px]">المستوى القادم</Badge>
               </div>
            </div>

            <DialogFooter className="flex-col gap-2">
              <Button disabled={submitting} onClick={handleBatchPromote} className="w-full rounded-xl h-12 font-black bg-secondary hover:bg-secondary/90 shadow-lg text-white gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserCheck className="w-5 h-5" />}
                بدء عملية الترفيع الآن
              </Button>
              <Button variant="outline" onClick={() => setIsPromotionDialogOpen(false)} className="w-full rounded-xl h-12 font-bold border-2">تراجع</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Student Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="max-w-3xl rounded-[2rem] border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-10">
            <DialogHeader className="text-right items-start space-y-2 mb-8">
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                <Edit2 className="w-7 h-7 text-secondary" />
                تحديث السجل الأكاديمي
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2 col-span-2 text-right">
                <Label className="text-primary font-black pr-1 mb-2">الاسم الكامل</Label>
                <Input value={editingStudent?.name || ""} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold" />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-black pr-1 mb-2">رقم القيد</Label>
                <Input value={editingStudent?.regId || ""} onChange={(e) => setEditingStudent({...editingStudent, regId: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted text-right font-black" />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-black pr-1 mb-2">المستوى الدراسي</Label>
                <Select value={editingStudent?.level || ""} onValueChange={(v) => setEditingStudent({...editingStudent, level: v})}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold"><SelectValue placeholder="اختر المستوى" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold" dir="rtl">
                    {Object.keys(LEVEL_PROGRESSION).map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    <SelectItem value="خريج">خريج</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-row gap-4 pt-8 border-t mt-6">
              <Button disabled={submitting} onClick={handleUpdateStudent} className="flex-1 rounded-xl h-12 font-black gradient-blue shadow-lg gap-2 text-white">حفظ التحديثات</Button>
              <Button variant="outline" onClick={() => setEditingStudent(null)} className="flex-1 rounded-xl h-12 font-bold border-2">تراجع</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
