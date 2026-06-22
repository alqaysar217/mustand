"use client";

import { useState, useMemo, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
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
  CheckCircle,
  ShieldCheck,
  School,
  Calendar,
  X,
  AlertTriangle,
  Save,
  RotateCcw
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
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore";

export default function StudentsManagementPage() {
  const [mounted, setMounted] = useState(false);
  const { isOpen } = useSidebarToggle();
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

  const [searchTerm, setSearchTerm] = useState("");
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
      return matchesSearch;
    });
  }, [students, searchTerm]);

  const handleAddStudent = async () => {
    if (!firestore || !newStudent.name || !newStudent.regId || !newStudent.collegeId || !newStudent.departmentId || !newStudent.academicYear) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    if (newStudent.regId.length !== 11) {
      toast({ variant: "destructive", title: "رقم القيد يجب أن يكون 11 رقم" });
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
        ...editingStudent,
        collegeName: selectedCollege?.name || editingStudent.collegeName,
        departmentName: selectedDept?.nameAr || selectedDept?.name || editingStudent.departmentName,
        updatedAt: serverTimestamp()
      });
      setEditingStudent(null);
      toast({ title: "تم تحديث البيانات بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      <main className={cn("transition-all duration-300 p-6 md:p-10 animate-fade-in text-right", isOpen ? "mr-0 md:mr-64" : "mr-0")} dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div><h1 className="text-3xl font-black text-primary mb-1">إدارة الطلاب</h1><p className="text-muted-foreground font-bold text-sm">مراجعة وتصحيح بيانات الطلاب (4 مستويات)</p></div>
          
          <div className="flex gap-3">
             <div className="relative w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="بحث باسم الطالب..." className="pr-9 rounded-xl h-11 border-muted bg-white shadow-sm" />
             </div>
             
             <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2 text-white">
                    <UserPlus className="w-5 h-5" /> تسجيل طالب جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl rounded-[2.5rem] border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
                  <div className="p-8 md:p-10">
                    <DialogHeader className="text-right items-start mb-8">
                      <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-secondary" /> تسجيل ملف أكاديمي
                      </DialogTitle>
                      <DialogDescription className="font-bold text-muted-foreground">أدخل البيانات الرسمية للطالب لإنشاء سجل جديد.</DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4">
                      <div className="space-y-2 col-span-full">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <User className="w-4 h-4 text-secondary" /> الاسم الكامل
                        </Label>
                        <Input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="الاسم الكامل" className="rounded-xl h-12 bg-muted/20 border-muted font-bold" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <Fingerprint className="w-4 h-4 text-secondary" /> رقم القيد (11 رقم)
                        </Label>
                        <Input value={newStudent.regId} onChange={(e) => setNewStudent({...newStudent, regId: e.target.value})} placeholder="22170XXXXXX" className="rounded-xl h-12 bg-muted/20 border-muted font-black text-center text-lg" />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <Calendar className="w-4 h-4 text-secondary" /> العام الجامعي
                        </Label>
                        <Select onValueChange={(v) => setNewStudent({...newStudent, academicYear: v})}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                            <SelectValue placeholder="اختر العام" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            {academicYears.map((y: any) => <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <School className="w-4 h-4 text-secondary" /> الكلية
                        </Label>
                        <Select onValueChange={(v) => setNewStudent({...newStudent, collegeId: v, departmentId: ""})}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                            <SelectValue placeholder="اختر الكلية" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            {colleges.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <Building2 className="w-4 h-4 text-secondary" /> التخصص / القسم
                        </Label>
                        <Select value={newStudent.departmentId} onValueChange={(v) => setNewStudent({...newStudent, departmentId: v})}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                            <SelectValue placeholder="اختر التخصص" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            {departments.filter((d: any) => !newStudent.collegeId || d.collegeId === newStudent.collegeId).map((d: any) => (
                              <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <Layers className="w-4 h-4 text-secondary" /> المستوى الدراسي
                        </Label>
                        <Select value={newStudent.level} onValueChange={(v) => setNewStudent({...newStudent, level: v})}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                            <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                            <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                            <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                          <Banknote className="w-4 h-4 text-secondary" /> نظام القبول
                        </Label>
                        <Select value={newStudent.admissionType} onValueChange={(v) => setNewStudent({...newStudent, admissionType: v})}>
                          <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl font-bold">
                            <SelectItem value="عام">نظام عام</SelectItem>
                            <SelectItem value="موازي">موازي</SelectItem>
                            <SelectItem value="نفقة خاصة">نفقة خاصة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="flex-row gap-4 pt-10 border-t mt-8">
                      <Button disabled={submitting} onClick={handleAddStudent} className="flex-1 rounded-2xl h-14 font-black gradient-blue text-white shadow-xl">
                        {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : "تأكيد الحفظ"}
                      </Button>
                      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-2xl h-14 font-bold border-2">إلغاء</Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
             </Dialog>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden bg-white shadow-xl">
          <Table className="text-right">
            <TableHeader className="bg-muted/50"><TableRow><TableHead className="text-right font-black text-primary py-5">الطالب / القيد</TableHead><TableHead className="text-right font-black text-primary">الكلية / التخصص</TableHead><TableHead className="text-right font-black text-primary">المستوى</TableHead><TableHead className="text-center font-black text-primary w-32">إجراءات</TableHead></TableRow></TableHeader>
            <TableBody>
              {loading ? (<TableRow><TableCell colSpan={4} className="h-60 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></TableCell></TableRow>) : 
              filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="p-4"><div className="flex items-center gap-4"><div className="w-11 h-11 rounded-2xl bg-primary/5 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-primary" /></div><div className="flex flex-col"><span className="font-black text-primary text-base">{student.name}</span><span className="text-[10px] font-mono font-bold text-muted-foreground">{student.regId}</span></div></div></TableCell>
                  <TableCell><div className="flex flex-col"><span className="text-[10px] font-black text-secondary">{student.collegeName}</span><span className="text-sm font-bold text-primary">{student.departmentName}</span></div></TableCell>
                  <TableCell><span className="text-xs font-black text-primary">{student.level}</span></TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingStudent(student)} className="text-blue-600 hover:bg-blue-50 rounded-xl"><Edit2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (<TableRow><TableCell colSpan={4} className="h-60 text-center font-bold opacity-30">لا يوجد طلاب مطابقون</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog - للموظف بشمولية كاملة وأيقونات */}
        <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
          <DialogContent className="max-w-4xl rounded-[2.5rem] border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
            <div className="p-8 md:p-10">
              <DialogHeader className="text-right items-start mb-8">
                <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Edit2 className="w-7 h-7 text-secondary" /> تحديث بيانات الطالب
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">تحديث كافة البيانات المرتبطة بملف الطالب.</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 py-4">
                <div className="space-y-2 col-span-full">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <User className="w-4 h-4 text-secondary" /> الاسم الكامل
                  </Label>
                  <Input value={editingStudent?.name || ""} onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted font-bold" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <Fingerprint className="w-4 h-4 text-secondary" /> رقم القيد (11 رقم)
                  </Label>
                  <Input value={editingStudent?.regId || ""} onChange={(e) => setEditingStudent({...editingStudent, regId: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted font-black text-center text-lg" />
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <Calendar className="w-4 h-4 text-secondary" /> العام الجامعي
                  </Label>
                  <Select value={editingStudent?.academicYear || ""} onValueChange={(v) => setEditingStudent({...editingStudent, academicYear: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {academicYears.map((y: any) => <SelectItem key={y.id} value={y.label}>{y.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <School className="w-4 h-4 text-secondary" /> الكلية
                  </Label>
                  <Select value={editingStudent?.collegeId || ""} onValueChange={(v) => setEditingStudent({...editingStudent, collegeId: v, departmentId: ""})}>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {colleges.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <Building2 className="w-4 h-4 text-secondary" /> التخصص / القسم
                  </Label>
                  <Select value={editingStudent?.departmentId || ""} onValueChange={(v) => setEditingStudent({...editingStudent, departmentId: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {departments.filter((d: any) => !editingStudent?.collegeId || d.collegeId === editingStudent.collegeId).map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <Layers className="w-4 h-4 text-secondary" /> المستوى الدراسي
                  </Label>
                  <Select value={editingStudent?.level || "المستوى الأول"} onValueChange={(v) => setEditingStudent({...editingStudent, level: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                      <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                      <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                      <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary font-black flex items-center gap-2 mb-2 pr-1">
                    <Banknote className="w-4 h-4 text-secondary" /> نظام القبول
                  </Label>
                  <Select value={editingStudent?.admissionType || "عام"} onValueChange={(v) => setEditingStudent({...editingStudent, admissionType: v})}>
                    <SelectTrigger className="rounded-xl h-12 bg-muted/20 border-muted text-right font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="عام">نظام عام</SelectItem>
                      <SelectItem value="موازي">موازي</SelectItem>
                      <SelectItem value="نفقة خاصة">نفقة خاصة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter className="flex-row gap-4 pt-10 border-t mt-8">
                <Button disabled={submitting} onClick={handleUpdateStudent} className="flex-1 rounded-2xl h-14 font-black gradient-blue text-white shadow-xl gap-2">
                  {submitting ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                  حفظ التعديلات
                </Button>
                <Button variant="outline" onClick={() => setEditingStudent(null)} className="flex-1 rounded-2xl h-14 font-bold border-2 gap-2">
                  <RotateCcw className="w-5 h-5" /> تراجع
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
