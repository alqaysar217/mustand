
"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  School, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  PlusCircle,
  FileText,
  Loader2,
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { cn } from "@/lib/utils";

// Firebase Imports
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function CollegesManagementPage() {
  const firestore = useFirestore();
  
  const collegesQuery = useMemo(() => {
    if (!firestore) return null;
    return collection(firestore, "colleges");
  }, [firestore]);

  const { data: colleges = [], loading } = useCollection(collegesQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [newCollege, setNewCollege] = useState({ name: "", code: "" });
  const [submitting, setSubmitting] = useState(false);

  const { isOpen } = useSidebarToggle();
  const { toast } = useToast();

  const filteredColleges = useMemo(() => {
    return (colleges as any[]).filter(college => 
      college.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      college.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [colleges, searchTerm]);

  const handleAddCollege = () => {
    if (!firestore || !newCollege.name || !newCollege.code) return;
    
    setSubmitting(true);
    const collegesRef = collection(firestore, "colleges");
    const data = {
      ...newCollege,
      createdAt: serverTimestamp()
    };

    addDoc(collegesRef, data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewCollege({ name: "", code: "" });
        toast({ title: "تم الحفظ", description: "تمت إضافة الكلية بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: collegesRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateCollege = () => {
    if (!firestore || !editingCollege?.name || !editingCollege?.code) return;

    setSubmitting(true);
    const docRef = doc(firestore, "colleges", editingCollege.id);
    const data = {
      name: editingCollege.name,
      code: editingCollege.code,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, data)
      .then(() => {
        setEditingCollege(null);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات الكلية بنجاح." });
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
    const docRef = doc(firestore, "colleges", id);

    deleteDoc(docRef)
      .then(() => {
        toast({
          variant: "destructive",
          title: "تم حذف الكلية",
          description: "تمت إزالة الكلية من النظام بنجاح.",
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
            <h1 className="text-3xl font-black text-primary mb-1">إدارة الكليات</h1>
            <p className="text-muted-foreground font-bold">إدارة وتحديث بيانات الكليات في قاعدة البيانات المركزية</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
                <Plus className="w-5 h-5" />
                إضافة كلية جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-8">
                <DialogHeader className="text-right items-start space-y-2 mb-8">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-secondary" />
                    كلية جديدة
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground">أدخل بيانات الكلية الرسمية لتفعيلها في النظام.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                      <Type className="w-4 h-4 text-secondary" />
                      اسم الكلية الرسمي
                    </Label>
                    <div className="relative">
                      <Input 
                        value={newCollege.name}
                        onChange={(e) => setNewCollege({...newCollege, name: e.target.value})}
                        placeholder="مثال: كلية تقنية المعلومات" 
                        className="rounded-xl h-12 border-muted text-right font-bold pr-10" 
                      />
                      <School className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                      <Hash className="w-4 h-4 text-secondary" />
                      رمز الكلية (Code)
                    </Label>
                    <div className="relative">
                      <Input 
                        value={newCollege.code}
                        onChange={(e) => setNewCollege({...newCollege, code: e.target.value})}
                        placeholder="IT" 
                        className="rounded-xl h-12 border-muted text-right font-bold uppercase pr-10" 
                      />
                      <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                    </div>
                  </div>
                </div>
                <DialogFooter className="flex-row gap-3 pt-8">
                  <Button 
                    disabled={submitting}
                    onClick={handleAddCollege}
                    className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg gap-2"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    {submitting ? "جاري الحفظ..." : "حفظ الكلية"}
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
                placeholder="البحث باسم الكلية أو الرمز..."
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
                  <TableHead className="text-right font-bold text-primary">الكلية</TableHead>
                  <TableHead className="text-right font-bold text-primary">الرمز</TableHead>
                  <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                ) : filteredColleges.length > 0 ? filteredColleges.map((college) => (
                  <TableRow key={college.id} className="hover:bg-muted/20 border-b group">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                          <School className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-primary">{college.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-black text-secondary">{college.code}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingCollege(college)}
                          className="rounded-xl hover:bg-primary/5 text-secondary"
                          title="تعديل"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDelete(college.id)}
                          className="rounded-xl hover:bg-destructive/10 text-destructive"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-bold">لا توجد كليات مسجلة حالياً</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingCollege} onOpenChange={(open) => !open && setEditingCollege(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-8">
            <DialogHeader className="text-right items-start space-y-2 mb-8 relative">
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل بيانات الكلية
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">تحديث معلومات الكلية المختارة في قاعدة البيانات.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6 py-4">
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                  <Type className="w-4 h-4 text-secondary" />
                  الاسم الرسمي
                </Label>
                <div className="relative">
                  <Input 
                    value={editingCollege?.name || ""}
                    onChange={(e) => setEditingCollege({...editingCollege, name: e.target.value})}
                    className="rounded-xl h-12 border-muted text-right font-bold pr-10" 
                  />
                  <School className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 mb-1">
                  <Hash className="w-4 h-4 text-secondary" />
                  الرمز المختصر
                </Label>
                <div className="relative">
                  <Input 
                    value={editingCollege?.code || ""}
                    onChange={(e) => setEditingCollege({...editingCollege, code: e.target.value})}
                    className="rounded-xl h-12 border-muted text-right font-bold uppercase pr-10" 
                  />
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/50" />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-3 pt-8">
              <Button 
                disabled={submitting} 
                onClick={handleUpdateCollege}
                className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                {submitting ? "جاري الحفظ..." : "حفظ التعديلات"}
              </Button>
              <Button variant="outline" onClick={() => setEditingCollege(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
