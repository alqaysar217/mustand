
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Filter,
  GraduationCap,
  Building2,
  X,
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
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function SubjectsPage() {
  const firestore = useFirestore();
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);

  const { data: subjects = [], loading } = useCollection(subjectsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [submitting, setSubmitting] = useState(false);
  
  const [newSubject, setNewSubject] = useState({
    name: "",
    departmentId: "",
    level: "المستوى الأول"
  });

  const { toast } = useToast();

  const filteredSubjects = useMemo(() => {
    return (subjects as any[]).filter(subject => {
      const matchesSearch = subject.name?.includes(searchTerm) || subject.departmentName?.includes(searchTerm);
      const matchesDept = selectedDept === "all" || subject.departmentId === selectedDept;
      const matchesLevel = selectedLevel === "all" || subject.level === selectedLevel;
      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [subjects, searchTerm, selectedDept, selectedLevel]);

  const handleAddSubject = () => {
    if (!firestore || !newSubject.name || !newSubject.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الحقول واختيار التخصص." });
      return;
    }
    
    setSubmitting(true);
    const selectedDeptObj = (departments as any[]).find(d => d.id === newSubject.departmentId);
    const subjectsRef = collection(firestore, "subjects");
    const data = {
      ...newSubject,
      departmentName: selectedDeptObj?.name || "",
      createdAt: serverTimestamp()
    };

    addDoc(subjectsRef, data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewSubject({ name: "", departmentId: "", level: "المستوى الأول" });
        toast({ title: "تم الحفظ", description: "تمت إضافة المادة بنجاح إلى النظام." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: subjectsRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "subjects", id);

    deleteDoc(docRef)
      .then(() => {
        toast({
          variant: "destructive",
          title: "تم الحذف",
          description: "تم حذف المادة بنجاح من النظام.",
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

  const resetFilters = () => {
    setSelectedDept("all");
    setSelectedLevel("all");
    setSearchTerm("");
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة المواد الدراسية</h1>
          <p className="text-muted-foreground font-bold">إضافة وتعديل المواد، وتوزيعها على التخصصات والمستويات</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
              <Plus className="w-5 h-5" />
              إضافة مادة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
            <div className="p-8">
              <DialogHeader className="text-right items-start space-y-2 mb-8">
                <DialogTitle className="text-2xl font-black text-primary">إضافة مادة</DialogTitle>
                <DialogDescription className="font-bold">أدخل تفاصيل المادة الدراسية الجديدة.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <Label className="text-primary font-bold">اسم المادة</Label>
                  <Input 
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                    placeholder="مثال: هياكل بيانات" 
                    className="rounded-xl h-11 border-muted" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">التخصص</Label>
                  <Select onValueChange={(v) => setNewSubject({...newSubject, departmentId: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {departments.map((d: any) => (
                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">المستوى</Label>
                  <Select onValueChange={(v) => setNewSubject({...newSubject, level: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted">
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                      <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                      <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                      <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-row gap-3 pt-4">
                <Button 
                  disabled={submitting}
                  onClick={handleAddSubject}
                  className="flex-1 rounded-xl h-11 font-bold gradient-blue"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "قم بتفعيل هذا الزر ليحفظ التعديلات"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-11 font-bold border-2">إلغاء</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث باسم المادة أو التخصص..."
              className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="h-12 rounded-2xl border-2 px-6 gap-2 font-bold transition-all"
          >
            <Filter className="w-5 h-5" />
            تصفية
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-muted/20 rounded-2xl animate-slide-up">
            <div className="space-y-2">
              <Label className="text-primary font-bold mr-1 text-xs">التخصص الدراسي</Label>
              <Select value={selectedDept} onValueChange={setSelectedDept}>
                <SelectTrigger className="rounded-xl h-11 border-muted bg-white">
                  <SelectValue placeholder="تصفية حسب التخصص" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">جميع التخصصات</SelectItem>
                  {departments.map((d: any) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-primary font-bold mr-1 text-xs">المستوى الدراسي</Label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="rounded-xl h-11 border-muted bg-white">
                  <SelectValue placeholder="تصفية حسب المستوى" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">جميع المستويات</SelectItem>
                  <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                  <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                  <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                  <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="ghost" 
                onClick={resetFilters}
                className="w-full h-11 rounded-xl font-bold text-muted-foreground hover:text-primary"
              >
                إعادة ضبط المرشحات
              </Button>
            </div>
          </div>
        )}

        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-right font-bold text-primary">المادة</TableHead>
                <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                <TableHead className="text-right font-bold text-primary">المستوى</TableHead>
                <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
                <TableRow key={subject.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-bold text-primary">{subject.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold text-muted-foreground">{subject.departmentName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-bold text-muted-foreground">{subject.level}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                          <MoreVertical className="w-4 h-4 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right shadow-xl" dir="rtl">
                        <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات المادة</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(subject.id)}
                          className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive"
                        >
                          حذف المادة
                          <Trash2 className="w-4 h-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">
                    لا توجد مواد دراسية مطابقة للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
