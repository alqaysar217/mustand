"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  GraduationCap,
  Building2,
  Loader2,
  PlusCircle,
  Clock
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
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

  const filteredSubjects = useMemo(() => {
    return (subjects as any[]).filter(s => 
      s.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.departmentName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);

  const handleAddSubject = () => {
    if (!firestore || !newSubject.nameAr || !newSubject.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال الحقول الأساسية." });
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
        setNewSubject({ nameAr: "", nameEn: "", departmentId: "", level: "المستوى الأول", term: "الفصل الأول" });
        toast({ title: "تم التفعيل", description: "تمت إضافة المادة الدراسية بنجاح." });
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

  const handleUpdateSubject = () => {
    if (!firestore || !editingSubject?.nameAr || !editingSubject?.departmentId) return;

    setSubmitting(true);
    const selectedDeptObj = (departments as any[]).find(d => d.id === editingSubject.departmentId);
    const docRef = doc(firestore, "subjects", editingSubject.id);
    const data = {
      nameAr: editingSubject.nameAr,
      nameEn: editingSubject.nameEn,
      departmentId: editingSubject.departmentId,
      departmentName: selectedDeptObj?.name || "",
      level: editingSubject.level,
      term: editingSubject.term,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, data)
      .then(() => {
        setEditingSubject(null);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المادة بنجاح." });
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

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "subjects", id);

    deleteDoc(docRef)
      .then(() => {
        toast({ variant: "destructive", title: "تم الحذف", description: "تمت إزالة المادة من السجلات." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة المواد الدراسية</h1>
          <p className="text-muted-foreground font-bold">التحكم في المناهج، المستويات، والأترام الدراسية</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
              <Plus className="w-5 h-5" />
              إضافة مادة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
            <div className="p-8">
              <DialogHeader className="text-right items-start space-y-2 mb-8">
                <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                  <PlusCircle className="w-6 h-6 text-secondary" />
                  مادة دراسية جديدة
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2 text-right">
                  <Label className="text-primary font-bold">اسم المادة (بالعربي)</Label>
                  <Input 
                    value={newSubject.nameAr} 
                    onChange={(e) => setNewSubject({...newSubject, nameAr: e.target.value})} 
                    placeholder="مثال: برمجة 1" 
                    className="rounded-xl h-11 border-muted text-right font-bold" 
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-primary font-bold">اسم المادة (English)</Label>
                  <Input 
                    value={newSubject.nameEn} 
                    onChange={(e) => setNewSubject({...newSubject, nameEn: e.target.value})} 
                    placeholder="Programming 1" 
                    className="rounded-xl h-11 border-muted text-left font-mono" 
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-primary font-bold">التخصص (القسم)</Label>
                  <Select onValueChange={(v) => setNewSubject({...newSubject, departmentId: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-primary font-bold">المستوى الدراسي</Label>
                  <Select value={newSubject.level} onValueChange={(v) => setNewSubject({...newSubject, level: v})}>
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
                  <Label className="text-primary font-bold">الفصل الدراسي (الترم)</Label>
                  <Select value={newSubject.term} onValueChange={(v) => setNewSubject({...newSubject, term: v})}>
                    <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                      <SelectValue placeholder="اختر الترم" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                      <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                      <SelectItem value="الفصل التكميلي">الفصل التكميلي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-row gap-3 pt-8">
                <Button disabled={submitting} onClick={handleAddSubject} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">
                   {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ المادة"}
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
              placeholder="البحث باسم المادة..."
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
                <TableHead className="text-right font-bold text-primary">المادة</TableHead>
                <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                <TableHead className="text-right font-bold text-primary">المستوى / الترم</TableHead>
                <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredSubjects.length > 0 ? filteredSubjects.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-bold text-primary">{s.nameAr}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{s.nameEn}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-bold text-primary">{s.departmentName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-bold text-primary">{s.level}</span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.term}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setEditingSubject(s)} 
                        className="rounded-xl hover:bg-primary/5 text-secondary" 
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(s.id)} 
                        className="rounded-xl hover:bg-destructive/10 text-destructive" 
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">لا توجد مواد مسجلة حالياً</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-8">
            <DialogHeader className="text-right items-start space-y-2 mb-8">
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل بيانات المادة
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold">اسم المادة (عربي)</Label>
                <Input value={editingSubject?.nameAr || ""} onChange={(e) => setEditingSubject({...editingSubject, nameAr: e.target.value})} className="rounded-xl h-11 border-muted" />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold">اسم المادة (English)</Label>
                <Input value={editingSubject?.nameEn || ""} onChange={(e) => setEditingSubject({...editingSubject, nameEn: e.target.value})} className="rounded-xl h-11 border-muted text-left font-mono" />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold">التخصص</Label>
                <Select value={editingSubject?.departmentId || ""} onValueChange={(v) => setEditingSubject({...editingSubject, departmentId: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold">المستوى</Label>
                <Select value={editingSubject?.level || ""} onValueChange={(v) => setEditingSubject({...editingSubject, level: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted">
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
                <Label className="text-primary font-bold">الترم الدراسي</Label>
                <Select value={editingSubject?.term || ""} onValueChange={(v) => setEditingSubject({...editingSubject, term: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted">
                    <SelectValue placeholder="اختر الترم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                    <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                    <SelectItem value="الفصل التكميلي">الفصل التكميلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-row gap-3 pt-8">
              <Button disabled={submitting} onClick={handleUpdateSubject} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التعديلات"}
              </Button>
              <Button variant="outline" onClick={() => setEditingSubject(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}