
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  Search, 
  Eye, 
  Trash2, 
  FileText, 
  Edit2, 
  Loader2, 
  Save,
  X,
  BookOpen,
  Calendar,
  GraduationCap,
  Fingerprint,
  User
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function AdminArchivePage() {
  const firestore = useFirestore();
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);

  const { data: archives = [], loading } = useCollection(archivesQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewingArchive, setViewingArchive] = useState<any>(null);
  const [editingArchive, setEditingArchive] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const filteredArchives = useMemo(() => {
    return (archives as any[]).filter(item => 
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.studentRegId?.includes(searchTerm) || 
      item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [archives, searchTerm]);

  const handleUpdateArchive = async () => {
    if (!firestore || !editingArchive) return;
    setIsSubmitting(true);
    try {
      const docRef = doc(firestore, "archives", editingArchive.id);
      const { id, ...updateData } = editingArchive;
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });

      // تسجيل في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "تعديل بيانات ملف مؤرشف",
        target: `${editingArchive.studentName} - ${editingArchive.subjectName}`,
        type: 'update',
        timestamp: serverTimestamp()
      });

      toast({ title: "تم تحديث البيانات بنجاح" });
      setEditingArchive(null);
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحديث" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveToBin = async (item: any) => {
    if (!firestore) return;
    try {
      const { id, ...originalData } = item;
      await addDoc(collection(firestore, "recycleBin"), {
        type: 'archive',
        originalData,
        originalId: id,
        deletedAt: serverTimestamp(),
        name: item.studentName,
        identifier: item.subjectName
      });
      await deleteDoc(doc(firestore, "archives", id));

      // تسجيل في السجل
      await addDoc(collection(firestore, "logs"), {
        user: "المدير العام",
        role: "manager",
        action: "حذف ملف من الأرشيف",
        target: `${item.studentName} - ${item.subjectName}`,
        type: 'delete',
        timestamp: serverTimestamp()
      });

      toast({ title: "تم نقل الملف لسلة المحذوفات" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في النقل" });
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الأرشيف الرقمي</h1>
          <p className="text-muted-foreground font-bold">مراجعة وتعديل وحذف الملفات المؤرشفة من قبل الموظفين</p>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث باسم الطالب، رقم القيد، أو المادة..."
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
                <TableHead className="text-right font-bold text-primary">الطالب / المادة</TableHead>
                <TableHead className="text-right font-bold text-primary">السنة / الترم</TableHead>
                <TableHead className="text-right font-bold text-primary">المستوى</TableHead>
                <TableHead className="text-center font-bold text-primary w-40">إجراءات المدير</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredArchives.length > 0 ? filteredArchives.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{item.studentName}</span>
                        <span className="text-[10px] text-secondary font-bold">{item.subjectName}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">{item.year}</span>
                      <span className="text-[10px] text-muted-foreground font-bold">{item.term}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg font-bold text-[10px] text-blue-600 border-blue-200 bg-blue-50">
                      {item.level || 'غير محدد'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewingArchive(item)} className="rounded-xl hover:bg-primary/5 text-primary" title="معاينة المستند"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingArchive(item)} className="rounded-xl hover:bg-blue-50 text-blue-600" title="تعديل البيانات"><Edit2 className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleMoveToBin(item)} className="rounded-xl hover:bg-destructive/10 text-destructive" title="نقل للسلة"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">لا توجد ملفات مؤرشفة</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Archive Dialog */}
      <Dialog open={!!editingArchive} onOpenChange={(open) => !open && setEditingArchive(null)}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
           <div className="p-8 space-y-6">
              <DialogHeader className="text-right items-start">
                <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                  تعديل بيانات الملف الموثق
                  <Edit2 className="w-6 h-6 text-secondary" />
                </DialogTitle>
                <DialogDescription className="font-bold text-muted-foreground">تحديث المعلومات الأكاديمية للمستند المختار لتصحيح أخطاء الأرشفة.</DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-primary font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-secondary" />
                    اسم الطالب
                  </Label>
                  <Input 
                    value={editingArchive?.studentName || ""} 
                    onChange={(e) => setEditingArchive({...editingArchive, studentName: e.target.value})} 
                    className="rounded-xl h-11 border-muted font-bold text-right" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-secondary" />
                    رقم القيد
                  </Label>
                  <Input 
                    value={editingArchive?.studentRegId || ""} 
                    onChange={(e) => setEditingArchive({...editingArchive, studentRegId: e.target.value})} 
                    className="rounded-xl h-11 border-muted font-bold text-right" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    المادة الدراسية
                  </Label>
                  <Select 
                    value={editingArchive?.subjectId || ""} 
                    onValueChange={(v) => {
                      const s = subjects.find((sub: any) => sub.id === v) as any;
                      setEditingArchive({...editingArchive, subjectId: v, subjectName: s?.nameAr || ""});
                    }}
                  >
                    <SelectTrigger className="rounded-xl h-11 font-bold">
                      <SelectValue placeholder="اختر المادة" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl font-bold">
                      {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    السنة الدراسية
                  </Label>
                  <Input 
                    value={editingArchive?.year || ""} 
                    onChange={(e) => setEditingArchive({...editingArchive, year: e.target.value})} 
                    className="rounded-xl h-11 border-muted font-bold text-right" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    المستوى
                  </Label>
                  <Select 
                    value={editingArchive?.level || ""} 
                    onValueChange={(v) => setEditingArchive({...editingArchive, level: v})}
                  >
                    <SelectTrigger className="rounded-xl h-11 font-bold">
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
              </div>

              <DialogFooter className="flex-row gap-3 pt-6 border-t">
                <Button onClick={handleUpdateArchive} disabled={isSubmitting} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg gap-2">
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  حفظ التعديلات
                </Button>
                <Button variant="outline" onClick={() => setEditingArchive(null)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
              </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingArchive} onOpenChange={(open) => !open && setViewingArchive(null)}>
        <DialogContent className="max-w-xl rounded-3xl p-8 border-none shadow-2xl text-right" dir="rtl">
          {viewingArchive && (
            <div className="space-y-6">
              <DialogHeader className="text-right">
                <DialogTitle className="text-2xl font-bold text-primary flex items-center justify-end gap-2">
                  {viewingArchive.studentName}
                  <X className="w-5 h-5 cursor-pointer opacity-50" onClick={() => setViewingArchive(null)} />
                </DialogTitle>
              </DialogHeader>
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border-2 shadow-inner bg-muted">
                <Image src={viewingArchive.fileUrl} alt="Exam Preview" fill className="object-contain" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <Label className="text-[10px] block mb-1 font-bold opacity-70">رقم القيد</Label>
                  <p className="font-black text-primary">{viewingArchive.studentRegId}</p>
                </div>
                <div className="p-4 bg-muted/30 rounded-2xl">
                  <Label className="text-[10px] block mb-1 font-bold opacity-70">المادة</Label>
                  <p className="font-black text-primary">{viewingArchive.subjectName}</p>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-xl font-bold border-2 h-12" onClick={() => setViewingArchive(null)}>إغلاق المعاينة</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
