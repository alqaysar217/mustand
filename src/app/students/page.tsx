
"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  MoreVertical, 
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Fingerprint,
  Building2,
  Banknote,
  Loader2,
  Trash2,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

// Firebase Imports
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function StudentsManagementPage() {
  const firestore = useFirestore();
  
  // Memoize queries to avoid infinite re-renders
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);

  const { data: students = [], loading: loadingStudents } = useCollection(studentsQuery);
  const { data: departments = [], loading: loadingDepts } = useCollection(deptsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { isOpen } = useSidebarToggle();
  
  // Form State
  const [newStudent, setNewStudent] = useState({
    name: "",
    regId: "",
    departmentId: "",
    level: "المستوى الأول",
    admissionType: "عام"
  });

  // Filter States
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");

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

  const handleAddStudent = () => {
    if (!firestore || !newStudent.name || !newStudent.regId || !newStudent.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الحقول الأساسية واختيار القسم." });
      return;
    }

    setSubmitting(true);
    const selectedDept = (departments as any[]).find(d => d.id === newStudent.departmentId);
    const studentsRef = collection(firestore, "students");
    const data = {
      ...newStudent,
      departmentName: selectedDept?.name || "",
      status: "active",
      joinDate: new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp()
    };

    addDoc(studentsRef, data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewStudent({ name: "", regId: "", departmentId: "", level: "المستوى الأول", admissionType: "عام" });
        toast({ title: "تم الحفظ", description: "تم تسجيل الطالب بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: studentsRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "students", id);

    deleteDoc(docRef)
      .then(() => {
        toast({
          variant: "destructive",
          title: "تم حذف السجل",
          description: "تمت إزالة بيانات الطالب من قاعدة البيانات بنجاح.",
        });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> نشط</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg gap-1 font-bold"><XCircle className="w-3 h-3" /> موقوف</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in text-right",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )} dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary mb-1">إدارة الطلاب</h1>
            <p className="text-muted-foreground font-bold">إدارة سجلات الطلاب والمستويات الأكاديمية</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
                <UserPlus className="w-5 h-5" />
                إضافة طالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-8">
                <DialogHeader className="text-right items-start space-y-2 mb-8 relative">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <UserPlus className="w-6 h-6 text-secondary" />
                    طالب جديد
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-2 col-span-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <User className="w-4 h-4 text-secondary" />
                      الاسم الكامل
                    </Label>
                    <Input 
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                      placeholder="مثال: أحمد محمد علي" 
                      className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" 
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <Fingerprint className="w-4 h-4 text-secondary" />
                      رقم القيد
                    </Label>
                    <Input 
                      value={newStudent.regId}
                      onChange={(e) => setNewStudent({...newStudent, regId: e.target.value})}
                      placeholder="20240000" 
                      className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" 
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <Building2 className="w-4 h-4 text-secondary" />
                      التخصص
                    </Label>
                    <Select onValueChange={(v) => setNewStudent({...newStudent, departmentId: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        {loadingDepts ? (
                          <div className="p-2 text-center text-xs opacity-50">جاري التحميل...</div>
                        ) : departments.map((d: any) => (
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
                    <Select value={newStudent.level} onValueChange={(v) => setNewStudent({...newStudent, level: v})}>
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
                    <Select value={newStudent.admissionType} onValueChange={(v) => setNewStudent({...newStudent, admissionType: v})}>
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
                    onClick={handleAddStudent}
                    className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : null}
                    حفظ البيانات
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="البحث بالاسم أو رقم القيد..."
                className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
                  <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingStudents ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" />
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/20 border-b group">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-primary">{student.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{student.regId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-bold text-primary">{student.departmentName}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{student.level}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                            <MoreVertical className="w-4 h-4 text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right shadow-xl" dir="rtl">
                          <DropdownMenuItem 
                            onClick={() => handleDelete(student.id)}
                            className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive"
                          >
                            حذف السجل
                            <Trash2 className="w-4 h-4" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">
                      لا يوجد طلاب مسجلون حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
}
