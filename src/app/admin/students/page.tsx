"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  Edit2, 
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Fingerprint,
  User,
  Building2,
  Banknote,
  Filter
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function StudentsPage() {
  const firestore = useFirestore();
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);

  const { data: students = [], loading } = useCollection(studentsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [newStudent, setNewStudent] = useState({
    name: "",
    regId: "",
    departmentId: "",
    level: "المستوى الأول",
    admissionType: "عام"
  });

  const { toast } = useToast();

  const filteredStudents = useMemo(() => {
    return (students as any[]).filter(student => {
      const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           student.regId?.includes(searchTerm);
      const matchesDept = filterDept === "all" || student.departmentId === filterDept;
      const matchesLevel = filterLevel === "all" || student.level === filterLevel;
      
      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [students, searchTerm, filterDept, filterLevel]);

  const handleAddStudent = async () => {
    if (!firestore || !newStudent.name || !newStudent.regId || !newStudent.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    setSubmitting(true);
    try {
      const selectedDept = (departments as any[]).find(d => d.id === newStudent.departmentId);
      await addDoc(collection(firestore, "students"), {
        ...newStudent,
        departmentName: selectedDept?.name || "",
        status: "active",
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      setIsAddDialogOpen(false);
      setNewStudent({ name: "", regId: "", departmentId: "", level: "المستوى الأول", admissionType: "عام" });
      toast({ title: "تم تسجيل الطالب بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStudent = () => {
    if (!firestore || !editingStudent?.name || !editingStudent?.regId || !editingStudent?.departmentId) return;

    setSubmitting(true);
    const selectedDept = (departments as any[]).find(d => d.id === editingStudent.departmentId);
    const docRef = doc(firestore, "students", editingStudent.id);
    const data = {
      name: editingStudent.name,
      regId: editingStudent.regId,
      departmentId: editingStudent.departmentId,
      departmentName: selectedDept?.name || "",
      level: editingStudent.level,
      admissionType: editingStudent.admissionType,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, data)
      .then(() => {
        setEditingStudent(null);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات الطالب بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "students", id));
      toast({ title: "تم حذف سجل الطالب" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل الحذف" });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg gap-1"><CheckCircle2 className="w-3 h-3" /> نشط</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg gap-1"><XCircle className="w-3 h-3" /> موقوف</Badge>;
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الطلاب</h1>
          <p className="text-muted-foreground font-bold">قاعدة بيانات الطلاب المسجلين سحابياً</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
                <UserPlus className="w-5 h-5" />
                إضافة طالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-8">
                <DialogHeader className="text-right items-start space-y-2 mb-8">
                  <DialogTitle className="text-2xl font-black text-primary">إضافة طالب</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-2 col-span-2 text-right">
                    <Label className="text-primary font-bold">الاسم الكامل</Label>
                    <Input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="مثال: محمد أحمد علي" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold">رقم القيد</Label>
                    <Input value={newStudent.regId} onChange={(e) => setNewStudent({...newStudent, regId: e.target.value})} placeholder="20240000" className="rounded-xl h-11" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold">التخصص</Label>
                    <Select onValueChange={(v) => setNewStudent({...newStudent, departmentId: v})}>
                      <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-row gap-3 pt-8">
                  <Button disabled={submitting} onClick={handleAddStudent} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    حفظ البيانات
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-[2] relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث بالاسم أو رقم القيد..."
              className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
             <Select value={filterDept} onValueChange={setFilterDept}>
               <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-primary">
                 <Filter className="w-4 h-4 ml-2 opacity-50" />
                 <SelectValue placeholder="كل التخصصات" />
               </SelectTrigger>
               <SelectContent className="rounded-xl font-bold">
                 <SelectItem value="all">جميع التخصصات</SelectItem>
                 {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
          <div className="flex-1">
             <Select value={filterLevel} onValueChange={setFilterLevel}>
               <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-primary">
                 <SelectValue placeholder="كل المستويات" />
               </SelectTrigger>
               <SelectContent className="rounded-xl font-bold">
                 <SelectItem value="all">جميع المستويات</SelectItem>
                 <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                 <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                 <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                 <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-right font-bold text-primary">الطالب</TableHead>
                <TableHead className="text-right font-bold text-primary">رقم القيد</TableHead>
                <TableHead className="text-right font-bold text-primary">التخصص / المستوى</TableHead>
                <TableHead className="text-right font-bold text-primary">الحالة</TableHead>
                <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <TableRow key={student.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">انضم: {student.joinDate}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">{student.regId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">{student.departmentName}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{student.level}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingStudent(student)}
                        className="rounded-xl hover:bg-primary/5 text-secondary"
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(student.id)}
                        className="rounded-xl hover:bg-destructive/10 text-destructive"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">لا يوجد طلاب مطابقين للبحث</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-8">
            <DialogHeader className="text-right items-start space-y-2 mb-8">
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل بيانات الطالب
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-2 col-span-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                  <User className="w-4 h-4 text-secondary" />
                  الاسم الكامل
                </Label>
                <Input 
                  value={editingStudent?.name || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="rounded-xl h-11 border-muted text-right font-bold" 
                />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                  <Fingerprint className="w-4 h-4 text-secondary" />
                  رقم القيد
                </Label>
                <Input 
                  value={editingStudent?.regId || ""}
                  onChange={(e) => setEditingStudent({...editingStudent, regId: e.target.value})}
                  className="rounded-xl h-11 border-muted text-right font-bold" 
                />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                  <Building2 className="w-4 h-4 text-secondary" />
                  التخصص
                </Label>
                <Select value={editingStudent?.departmentId || ""} onValueChange={(v) => setEditingStudent({...editingStudent, departmentId: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {departments.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                  <GraduationCap className="w-4 h-4 text-secondary" />
                  المستوى
                </Label>
                <Select value={editingStudent?.level || ""} onValueChange={(v) => setEditingStudent({...editingStudent, level: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                    <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                    <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                    <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                  <Banknote className="w-4 h-4 text-secondary" />
                  نوع القبول
                </Label>
                <Select value={editingStudent?.admissionType || ""} onValueChange={(v) => setEditingStudent({...editingStudent, admissionType: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                    <SelectValue placeholder="نوع القبول" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="عام">عام</SelectItem>
                    <SelectItem value="موازي">موازي</SelectItem>
                    <SelectItem value="نفقة خاصة">نفقة خاصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-row gap-3 pt-8">
              <Button 
                disabled={submitting} 
                onClick={handleUpdateStudent}
                className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : "حفظ التعديلات"}
              </Button>
              <Button variant="outline" onClick={() => setEditingStudent(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
