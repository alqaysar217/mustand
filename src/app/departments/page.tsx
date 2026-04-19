
"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  PlusCircle,
  FileText,
  School,
  Loader2,
  Filter,
  CheckCircle,
  Type,
  Hash
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

// Firebase Imports
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function DepartmentsManagementPage() {
  const firestore = useFirestore();
  
  // Memoize queries to prevent infinite loops
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);

  const { data: departments = [], loading: loadingDepts } = useCollection(deptsQuery);
  const { data: colleges = [], loading: loadingColleges } = useCollection(collegesQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [newDept, setNewDept] = useState({ name: "", code: "", collegeId: "" });

  const { isOpen } = useSidebarToggle();
  const { toast } = useToast();

  const filteredDepartments = useMemo(() => {
    return (departments as any[]).filter(dept => {
      const matchesSearch = dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           dept.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCollege = filterCollege === "all" || dept.collegeId === filterCollege;
      return matchesSearch && matchesCollege;
    });
  }, [departments, searchTerm, filterCollege]);

  const handleAddDept = () => {
    if (!firestore || !newDept.name || !newDept.code || !newDept.collegeId) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى ملء كافة الحقول واختيار الكلية." });
      return;
    }
    
    setSubmitting(true);
    const selectedCollege = (colleges as any[]).find(c => c.id === newDept.collegeId);
    const deptsRef = collection(firestore, "departments");
    const data = {
      ...newDept,
      collegeName: selectedCollege?.name || "",
      createdAt: serverTimestamp()
    };

    addDoc(deptsRef, data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewDept({ name: "", code: "", collegeId: "" });
        toast({ title: "تم الحفظ", description: "تمت إضافة التخصص بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: deptsRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateDept = () => {
    if (!firestore || !editingDept?.name || !editingDept?.code || !editingDept?.collegeId) return;

    setSubmitting(true);
    const selectedCollege = (colleges as any[]).find(c => c.id === editingDept.collegeId);
    const docRef = doc(firestore, "departments", editingDept.id);
    const data = {
      name: editingDept.name,
      code: editingDept.code,
      collegeId: editingDept.collegeId,
      collegeName: selectedCollege?.name || "",
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, data)
      .then(() => {
        setEditingDept(null);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات القسم بنجاح." });
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
    const docRef = doc(firestore, "departments", id);

    deleteDoc(docRef)
      .then(() => {
        toast({
          variant: "destructive",
          title: "تم حذف القسم",
          description: "تمت إزالة القسم العلمي من النظام بنجاح.",
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
            <h1 className="text-3xl font-black text-primary mb-1">إدارة التخصصات</h1>
            <p className="text-muted-foreground font-bold">إدارة الأقسام العلمية وتوزيعها على الكليات الجامعية</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
                <Plus className="w-5 h-5" />
                إضافة تخصص جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-8">
                <DialogHeader className="text-right items-start space-y-2 mb-8 relative">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-secondary" />
                    تخصص جديد
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground">إنشاء قسم علمي جديد في السجلات المركزية.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                      <School className="w-4 h-4 text-secondary" />
                      الكلية التابع لها
                    </Label>
                    <Select onValueChange={(v) => setNewDept({...newDept, collegeId: v})}>
                      <SelectTrigger className="rounded-xl h-12 border-muted text-right font-bold bg-muted/20">
                        <SelectValue placeholder="اختر الكلية" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        {loadingColleges ? (
                          <div className="p-2 text-center text-xs opacity-50">جاري تحميل الكليات...</div>
                        ) : colleges.map((c: any) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                      <Type className="w-4 h-4 text-secondary" />
                      اسم التخصص العلمي
                    </Label>
                    <div className="relative">
                      <Input 
                        value={newDept.name}
                        onChange={(e) => setNewDept({...newDept, name: e.target.value})}
                        placeholder="مثال: هندسة البرمجيات" 
                        className="rounded-xl h-12 border-muted text-right font-bold pr-10" 
                      />
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-secondary" />
                      رمز التخصص (Code)
                    </Label>
                    <div className="relative">
                      <Input 
                        value={newDept.code}
                        onChange={(e) => setNewDept({...newDept, code: e.target.value})}
                        placeholder="SE" 
                        className="rounded-xl h-12 border-muted text-right font-bold uppercase pr-10" 
                      />
                      <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-row gap-3 pt-8">
                  <Button 
                    disabled={submitting}
                    onClick={handleAddDept}
                    className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {submitting ? "جاري الحفظ..." : "تفعيل التخصص"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-[2] relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="البحث باسم التخصص، الكلية أو الرمز..."
                className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-1">
               <Select value={filterCollege} onValueChange={setFilterCollege}>
                 <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-primary">
                   <Filter className="w-4 h-4 ml-2 opacity-50" />
                   <SelectValue placeholder="تصفية حسب الكلية" />
                 </SelectTrigger>
                 <SelectContent className="rounded-xl font-bold">
                   <SelectItem value="all">كل الكليات</SelectItem>
                   {colleges.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                 </SelectContent>
               </Select>
            </div>
          </div>

          <div className="rounded-2xl border overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                  <TableHead className="text-right font-bold text-primary">الكلية</TableHead>
                  <TableHead className="text-right font-bold text-primary">الرمز</TableHead>
                  <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingDepts ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" />
                    </TableCell>
                  </TableRow>
                ) : filteredDepartments.length > 0 ? filteredDepartments.map((dept) => (
                  <TableRow key={dept.id} className="hover:bg-muted/20 border-b group">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-primary">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-bold text-muted-foreground">{dept.collegeName}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-secondary">{dept.code}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingDept(dept)}
                          className="rounded-xl hover:bg-primary/5 text-secondary"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(dept.id)}
                          className="rounded-xl hover:bg-destructive/10 text-destructive"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">
                      لا توجد تخصصات مسجلة حالياً
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingDept} onOpenChange={(open) => !open && setEditingDept(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-8">
            <DialogHeader className="text-right items-start space-y-2 mb-8 relative">
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل بيانات القسم
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">تحديث معلومات القسم المختار في قاعدة البيانات.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                  <School className="w-4 h-4 text-secondary" />
                  الكلية التابع لها
                </Label>
                <Select value={editingDept?.collegeId || ""} onValueChange={(v) => setEditingDept({...editingDept, collegeId: v})}>
                  <SelectTrigger className="rounded-xl h-12 border-muted text-right font-bold bg-muted/20">
                    <SelectValue placeholder="اختر الكلية" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {colleges.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                  <Type className="w-4 h-4 text-secondary" />
                  اسم التخصص
                </Label>
                <div className="relative">
                  <Input 
                    value={editingDept?.name || ""}
                    onChange={(e) => setEditingDept({...editingDept, name: e.target.value})}
                    className="rounded-xl h-12 border-muted text-right font-bold pr-10" 
                  />
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-secondary" />
                  رمز التخصص
                </Label>
                <div className="relative">
                  <Input 
                    value={editingDept?.code || ""}
                    onChange={(e) => setEditingDept({...editingDept, code: e.target.value})}
                    className="rounded-xl h-12 border-muted text-right font-bold uppercase pr-10" 
                  />
                  <FileText className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-3 pt-8">
              <Button 
                disabled={submitting} 
                onClick={handleUpdateDept}
                className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Button variant="outline" onClick={() => setEditingDept(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
