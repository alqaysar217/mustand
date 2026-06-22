"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building2,
  Loader2,
  Filter,
  Type,
  Layers,
  RefreshCw,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  ShieldCheck
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function SubjectsPage() {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);

  const { data: subjects = [], loading } = useCollection(subjectsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [newSubject, setNewSubject] = useState({
    nameAr: "",
    nameEn: "",
    departmentId: "",
    level: "المستوى الأول",
    term: "الفصل الأول"
  });

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSubjects = useMemo(() => {
    return (subjects as any[]).filter(s => {
      const matchesSearch = s.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "all" || s.departmentId === filterDept;
      const matchesLevel = filterLevel === "all" || s.level === filterLevel;
      
      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [subjects, searchTerm, filterDept, filterLevel]);

  const handleAddSubject = () => {
    if (!firestore || !newSubject.nameAr || !newSubject.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }
    
    setSubmitting(true);
    const selectedDeptObj = (departments as any[]).find(d => d.id === newSubject.departmentId);
    const data = {
      ...newSubject,
      departmentName: selectedDeptObj?.nameAr || selectedDeptObj?.name || "",
      createdAt: serverTimestamp()
    };

    addDoc(collection(firestore, "subjects"), data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewSubject({ nameAr: "", nameEn: "", departmentId: "", level: "المستوى الأول", term: "الفصل الأول" });
        toast({ title: "تمت إضافة المادة بنجاح" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateSubject = () => {
    if (!firestore || !editingSubject?.nameAr || !editingSubject?.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    setSubmitting(true);
    const selectedDeptObj = (departments as any[]).find(d => d.id === editingSubject.departmentId);
    const docRef = doc(firestore, "subjects", editingSubject.id);
    const data = {
      nameAr: editingSubject.nameAr,
      nameEn: editingSubject.nameEn || "",
      departmentId: editingSubject.departmentId,
      departmentName: selectedDeptObj?.nameAr || selectedDeptObj?.name || "",
      level: editingSubject.level,
      term: editingSubject.term,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, data)
      .then(() => {
        setEditingSubject(null);
        toast({ title: "تم التحديث بنجاح" });
      })
      .catch(() => toast({ variant: "destructive", title: "فشل التحديث" }))
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, "subjects", id))
      .then(() => toast({ variant: "destructive", title: "تم الحذف" }));
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة المواد الدراسية</h1>
          <p className="text-muted-foreground font-bold">التحكم في المناهج والمستويات الأربعة</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2 text-white">
                <Plus className="w-5 h-5" />
                إضافة مادة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-8">
                <DialogHeader className="text-right items-start mb-8">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-secondary" />
                    مادة دراسية جديدة
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground">أدخل بيانات المادة لاعتمادها في السجلات الأكاديمية.</DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2">
                    <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                      <Type className="w-4 h-4 text-secondary" />
                      اسم المادة (عربي)
                    </Label>
                    <Input value={newSubject.nameAr} onChange={(e) => setNewSubject({...newSubject, nameAr: e.target.value})} placeholder="مثال: برمجة 1" className="rounded-xl h-11 border-muted font-bold text-right" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                      <Type className="w-4 h-4 text-secondary" />
                      اسم المادة (English)
                    </Label>
                    <Input value={newSubject.nameEn} onChange={(e) => setNewSubject({...newSubject, nameEn: e.target.value})} placeholder="Programming 1" className="rounded-xl h-11 border-muted text-left font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-secondary" />
                      التخصص الدراسي
                    </Label>
                    <Select value={newSubject.departmentId} onValueChange={(v) => setNewSubject({...newSubject, departmentId: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-secondary" />
                      المستوى الدراسي
                    </Label>
                    <Select value={newSubject.level} onValueChange={(v) => setNewSubject({...newSubject, level: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
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
                  <div className="space-y-2">
                    <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-secondary" />
                      الفصل الدراسي
                    </Label>
                    <Select value={newSubject.term} onValueChange={(v) => setNewSubject({...newSubject, term: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                        <SelectValue placeholder="اختر الفصل" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                        <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter className="flex-row gap-3 pt-8 border-t mt-6">
                  <Button disabled={submitting} onClick={handleAddSubject} className="flex-1 rounded-xl gradient-blue h-12 font-black text-white shadow-lg">
                    {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : "حفظ المادة الجديدة"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-[2] relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" placeholder="البحث باسم المادة..." className="w-full bg-muted/30 outline-none text-sm font-bold h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 text-right" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex-1">
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-primary">
                <Layers className="w-4 h-4 ml-2 opacity-50" />
                <SelectValue placeholder="كل المستويات" />
              </SelectTrigger>
              <SelectContent className="rounded-xl font-bold">
                <SelectItem value="all">كافة المستويات</SelectItem>
                <SelectItem value="المستوى الأول">الأول</SelectItem>
                <SelectItem value="المستوى الثاني">الثاني</SelectItem>
                <SelectItem value="المستوى الثالث">الثالث</SelectItem>
                <SelectItem value="المستوى الرابع">الرابع</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-right font-black text-primary py-5">المادة الدراسية</TableHead>
                <TableHead className="text-right font-black text-primary">التخصص / القسم</TableHead>
                <TableHead className="text-right font-black text-primary">المستوى / الفصل</TableHead>
                <TableHead className="text-center font-black text-primary w-32">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filteredSubjects.length > 0 ? filteredSubjects.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/10 border-b">
                  <TableCell className="p-4">
                    <div className="flex flex-col">
                      <span className="font-black text-primary text-base">{s.nameAr}</span>
                      {s.nameEn && <span className="text-[10px] text-muted-foreground font-mono">{s.nameEn}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-bold text-secondary">{s.departmentName}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-primary">{s.level}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{s.term}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingSubject(s)} className="rounded-xl text-secondary hover:bg-secondary/10">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl text-destructive hover:bg-destructive/10">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-6 max-w-[380px]" dir="rtl">
                          <AlertDialogHeader className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce duration-[2000ms]">
                              <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <div className="space-y-2 w-full text-right">
                              <AlertDialogTitle className="text-xl font-black text-primary">حذف المادة الدراسية</AlertDialogTitle>
                              <AlertDialogDescription className="font-bold text-muted-foreground text-xs leading-relaxed">
                                أنت على وشك حذف مادة <span className="text-red-600 font-black">({s.nameAr})</span> نهائياً. لا يمكن التراجع.
                              </AlertDialogDescription>
                            </div>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex flex-col gap-2 mt-6 w-full">
                            <AlertDialogAction onClick={() => handleDelete(s.id)} className="w-full rounded-xl bg-red-600 hover:bg-red-700 font-black h-12 text-white border-none order-1">نعم، احذف نهائياً</AlertDialogAction>
                            <AlertDialogCancel className="w-full rounded-xl font-black border-2 h-12 text-primary order-2">إلغاء</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="h-40 text-center font-bold opacity-30">لا توجد مواد مطابقة للبحث</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(o) => !o && setEditingSubject(null)}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
           <div className="p-8">
             <DialogHeader className="text-right items-start mb-8">
                <DialogTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Edit2 className="w-7 h-7 text-secondary" />
                  تعديل المادة الدراسية
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">تحديث بيانات المادة المختارة في السجلات المركزية.</DialogDescription>
             </DialogHeader>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2">
                  <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                    <Type className="w-4 h-4 text-secondary" />
                    اسم المادة (عربي)
                  </Label>
                  <Input value={editingSubject?.nameAr || ""} onChange={(e) => setEditingSubject({...editingSubject, nameAr: e.target.value})} className="rounded-xl h-11 border-muted font-bold text-right" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                    <Type className="w-4 h-4 text-secondary" />
                    اسم المادة (English)
                  </Label>
                  <Input value={editingSubject?.nameEn || ""} onChange={(e) => setEditingSubject({...editingSubject, nameEn: e.target.value})} className="rounded-xl h-11 border-muted text-left font-mono" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary" />
                    التخصص الدراسي
                  </Label>
                  <Select value={editingSubject?.departmentId || ""} onValueChange={(v) => setEditingSubject({...editingSubject, departmentId: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-secondary" />
                    المستوى الدراسي
                  </Label>
                  <Select value={editingSubject?.level || ""} onValueChange={(v) => setEditingSubject({...editingSubject, level: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
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
                  <Label className="text-primary font-black pr-1 mb-1 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-secondary" />
                    الفصل الدراسي
                  </Label>
                  <Select value={editingSubject?.term || ""} onValueChange={(v) => setEditingSubject({...editingSubject, term: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                      <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>

             <DialogFooter className="flex-row gap-3 pt-8 border-t mt-6">
                <Button disabled={submitting} onClick={handleUpdateSubject} className="flex-1 rounded-xl gradient-blue h-12 font-black text-white shadow-lg gap-2">
                  {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                  حفظ كافة التعديلات
                </Button>
                <Button variant="outline" onClick={() => setEditingSubject(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
             </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
