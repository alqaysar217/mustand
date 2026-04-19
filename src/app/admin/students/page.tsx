"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  MoreVertical, 
  FileDown, 
  Eye, 
  Edit2, 
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
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

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

export default function StudentsPage() {
  const firestore = useFirestore();
  const studentsQuery = useMemo(() => firestore ? collection(firestore, "students") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);

  const { data: students = [], loading } = useCollection(studentsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
    return (students as any[]).filter(student => 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.regId?.includes(searchTerm)
    );
  }, [students, searchTerm]);

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
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none text-right" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle className="text-2xl font-black text-primary">إضافة طالب</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-primary font-bold">الاسم الكامل</Label>
                  <Input value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} placeholder="مثال: محمد أحمد علي" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">رقم القيد</Label>
                  <Input value={newStudent.regId} onChange={(e) => setNewStudent({...newStudent, regId: e.target.value})} placeholder="20240000" className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">التخصص</Label>
                  <Select onValueChange={(v) => setNewStudent({...newStudent, departmentId: v})}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="اختر التخصص" /></SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-row gap-3 pt-4">
                <Button disabled={submitting} onClick={handleAddStudent} className="flex-1 rounded-xl h-11 font-bold gradient-blue">
                   {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ البيانات"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-11 font-bold border-2">إلغاء</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث بالاسم أو رقم القيد..."
              className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                          <MoreVertical className="w-4 h-4 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right" dir="rtl">
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">تعديل البيانات<Edit2 className="w-4 h-4 text-secondary" /></DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(student.id)} className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive">حذف السجل<Trash2 className="w-4 h-4" /></DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">لا يوجد طلاب مطابقين للبحث</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
