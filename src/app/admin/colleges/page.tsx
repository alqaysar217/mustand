
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  School, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Building2,
  Users,
  FileText,
  ShieldCheck,
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
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function AdminCollegesPage() {
  const firestore = useFirestore();
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const { data: colleges = [], loading } = useCollection(collegesQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCollege, setNewCollege] = useState({ name: '', code: '' });
  
  const { toast } = useToast();

  const filteredColleges = useMemo(() => {
    return (colleges as any[]).filter(college => 
      college.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      college.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [colleges, searchTerm]);

  const handleAddCollege = () => {
    if (!firestore || !newCollege.name || !newCollege.code) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    setSubmitting(true);
    const collegesRef = collection(firestore, "colleges");
    const data = {
      ...newCollege,
      createdAt: serverTimestamp()
    };

    addDoc(collegesRef, data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewCollege({ name: '', code: '' });
        toast({ title: "تم التفعيل", description: "تم إنشاء الكلية وتفعيلها في النظام بنجاح." });
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

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "colleges", id);

    deleteDoc(docRef)
      .then(() => {
        toast({
          variant: "destructive",
          title: "تم حذف الكلية",
          description: "تمت إزالة الكلية من السجلات الإدارية المركزية.",
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
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الكليات الجامعية</h1>
          <p className="text-muted-foreground font-bold">التحكم المركزي في هيكلية الكليات والوحدات التعليمية</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
              <Plus className="w-5 h-5" />
              إضافة كلية إدارية
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
            <div className="p-8">
              <DialogHeader className="text-right items-start space-y-2 mb-8">
                <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                  إنشاء كلية جديدة
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground text-sm">
                  تسجيل وحدة تعليمية جديدة في قاعدة البيانات المركزية.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="space-y-2 text-right">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                    <School className="w-4 h-4 text-secondary" />
                    الاسم الرسمي للكلية
                  </Label>
                  <Input 
                    value={newCollege.name}
                    onChange={(e) => setNewCollege({...newCollege, name: e.target.value})}
                    placeholder="مثال: كلية الطب البشري" 
                    className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" 
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                    <FileText className="w-4 h-4 text-secondary" />
                    رمز الكلية المختصر
                  </Label>
                  <Input 
                    value={newCollege.code}
                    onChange={(e) => setNewCollege({...newCollege, code: e.target.value})}
                    placeholder="مثال: MED" 
                    className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20 uppercase" 
                  />
                </div>
              </div>
              <DialogFooter className="flex-row gap-3 pt-8">
                <Button 
                  disabled={submitting} 
                  onClick={handleAddCollege}
                  className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "تفعيل الكلية"}
                </Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <School className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-muted-foreground">إجمالي الكليات</p>
            <h4 className="text-2xl font-black text-primary">{colleges.length}</h4>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-muted-foreground">نظام العمل</p>
            <h4 className="text-2xl font-black text-primary">سحابي</h4>
          </div>
        </Card>
        <Card className="p-6 border-none shadow-lg rounded-3xl bg-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <Users className="w-6 h-6" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-muted-foreground">الحالة</p>
            <h4 className="text-2xl font-black text-primary">متصل</h4>
          </div>
        </Card>
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
                <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                          <MoreVertical className="w-4 h-4 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right shadow-xl" dir="rtl">
                        <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات المدير</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(college.id)}
                          className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive"
                        >
                          حذف الكلية
                          <Trash2 className="w-4 h-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-bold">
                    لا توجد كليات مسجلة حالياً
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
