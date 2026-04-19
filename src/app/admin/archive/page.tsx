
"use client";

import { useState, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  FileText,
  Calendar,
  GraduationCap,
  BookOpen,
  Plus,
  FileUp,
  Loader2,
  CheckCircle,
  Download,
  X
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection, useStorage } from "@/firebase";
import { collection, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { downloadFile } from "@/lib/storage-utils";

export default function AdminArchivePage() {
  const firestore = useFirestore();
  const storage = useStorage();
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);

  const { data: archives = [], loading } = useCollection(archivesQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewingArchive, setViewingArchive] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for new archive
  const [newArchive, setNewArchive] = useState({
    name: '',
    regId: '',
    subjectId: '',
    subjectName: '',
    year: '2023 / 2024',
    term: 'الفصل الأول',
    department: 'تقنية المعلومات',
    file: null as string | null
  });

  const filteredArchives = useMemo(() => {
    return (archives as any[]).filter(item => 
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.studentRegId?.includes(searchTerm) || 
      item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [archives, searchTerm]);

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "archives", id));
      toast({
        title: "تم الحذف بنجاح",
        description: "تمت إزالة الملف من الأرشيف المركزي.",
      });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف الملف." });
    }
  };

  const handleDownload = async (item: any) => {
    if (!item?.fileUrl) return;
    setDownloadingId(item.id);
    try {
      toast({ title: "جاري التحميل", description: `يتم معالجة: ${item.studentName}` });
      const result = await downloadFile(item.fileUrl, `${item.studentName}_${item.subjectName}`);
      if (result.success) toast({ title: "تم التحميل" });
      else throw result.error;
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في التحميل" });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewArchive(prev => ({ ...prev, file: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNewArchive = async () => {
    if (!firestore || !storage || !newArchive.name || !newArchive.regId || !newArchive.subjectName || !newArchive.file) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى إكمال كافة الحقول ورفع صورة الاختبار.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload image to Storage first (Crucial for performance)
      const folderName = newArchive.year.replace(/\s/g, '').replace(/\//g, '-');
      const fileName = `archives/manual/${folderName}/${newArchive.regId}_${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      
      await uploadString(storageRef, newArchive.file, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      const archiveData = {
        studentName: newArchive.name,
        studentRegId: newArchive.regId,
        subjectName: newArchive.subjectName,
        subjectId: newArchive.subjectId,
        year: newArchive.year,
        term: newArchive.term,
        departmentId: newArchive.department,
        fileUrl: downloadUrl, // Save cloud URL, NOT base64 string
        pages: 1,
        uploadedAt: serverTimestamp()
      };

      // 2. Add to Firestore (Non-blocking)
      addDoc(collection(firestore, "archives"), archiveData);
      
      setIsAddDialogOpen(false);
      setNewArchive({
        name: '',
        regId: '',
        subjectId: '',
        subjectName: '',
        year: '2023 / 2024',
        term: 'الفصل الأول',
        department: 'تقنية المعلومات',
        file: null
      });

      toast({
        title: "تمت الأرشفة بنجاح",
        description: `تمت إضافة اختبار الطالب ${archiveData.studentName} إلى السجل.`,
      });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حفظ البيانات." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الأرشيف الرقمي</h1>
          <p className="text-muted-foreground font-bold">التحكم الكامل في الملفات المؤرشفة سحابياً</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2"
        >
          <Plus className="w-5 h-5" />
          أرشفة ملفات جديدة
        </Button>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-2xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث باسم الطالب، رقم القيد، أو المادة..."
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
                <TableHead className="text-right font-bold text-primary">الطالب / المادة</TableHead>
                <TableHead className="text-right font-bold text-primary">السنة / الترم</TableHead>
                <TableHead className="text-right font-bold text-primary">تاريخ الأرشفة</TableHead>
                <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
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
                  <TableCell className="text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('en-GB') : 'قيد الأرشفة'}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setViewingArchive(item)}
                        className="rounded-xl hover:bg-primary/5 text-primary"
                        title="عرض"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        disabled={downloadingId === item.id}
                        onClick={() => handleDownload(item)}
                        className="rounded-xl hover:bg-primary/5 text-secondary"
                        title="تحميل"
                      >
                        {downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(item.id)}
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
                    لا توجد ملفات في الأرشيف السحابي
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl overflow-hidden p-0" dir="rtl">
          <div className="p-8 space-y-6">
            <DialogHeader className="text-right relative">
              <DialogTitle className="text-2xl font-black text-primary flex items-center justify-end gap-2">
                أرشفة اختبار جديد
                <Archive className="w-6 h-6 text-secondary" />
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">أدخل بيانات الطالب والمادة لرفع الاختبار إلى السحابة.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-primary font-bold">اسم الطالب الرباعي</Label>
                <Input value={newArchive.name} onChange={(e) => setNewArchive({...newArchive, name: e.target.value})} placeholder="مثال: أحمد محمد علي" className="rounded-xl h-11 bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold">رقم القيد</Label>
                <Input value={newArchive.regId} onChange={(e) => setNewArchive({...newArchive, regId: e.target.value})} placeholder="20210045" className="rounded-xl h-11 bg-muted/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold">المادة الدراسية</Label>
                <Select value={newArchive.subjectId} onValueChange={(v) => {
                  const s = (subjects as any[]).find(sub => sub.id === v);
                  setNewArchive({...newArchive, subjectId: v, subjectName: s?.nameAr || ""});
                }}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/20"><SelectValue placeholder="اختر المادة" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    {subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold">السنة الدراسية</Label>
                <Select value={newArchive.year} onValueChange={(v) => setNewArchive({...newArchive, year: v})}>
                  <SelectTrigger className="rounded-xl h-11 bg-muted/20"><SelectValue placeholder="السنة" /></SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="2023 / 2024">2023 / 2024</SelectItem>
                    <SelectItem value="2022 / 2023">2022 / 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Label className="text-primary font-bold block mb-3">صورة الاختبار</Label>
              <div onClick={() => fileInputRef.current?.click()} className={cn("w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer", newArchive.file ? "border-green-500 bg-green-50" : "border-muted-foreground/20 hover:border-primary")}>
                {newArchive.file ? (
                  <div className="flex flex-col items-center gap-1">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <span className="text-xs font-bold text-green-600">تم اختيار الملف</span>
                  </div>
                ) : (
                  <>
                    <FileUp className="w-10 h-10 text-muted-foreground/50" />
                    <span className="text-sm font-bold text-muted-foreground">اضغط لرفع صورة الاختبار</span>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>

            <DialogFooter className="flex-row gap-3 pt-4">
              <Button onClick={handleSaveNewArchive} disabled={isSubmitting} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إكمال الأرشفة"}
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingArchive} onOpenChange={(open) => !open && setViewingArchive(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 overflow-hidden border-none shadow-2xl text-right" dir="rtl">
          {viewingArchive && (
            <div className="flex flex-col md:flex-row h-full">
              <div className="relative w-full md:w-1/2 aspect-[3/4] bg-muted">
                <Image src={viewingArchive.fileUrl || PlaceHolderImages[1].imageUrl} alt="Exam Preview" fill className="object-cover" />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <DialogHeader className="text-right mb-6">
                  <DialogTitle className="text-2xl font-bold text-primary mb-2">{viewingArchive.studentName}</DialogTitle>
                  <DialogDescription className="text-secondary font-bold flex items-center justify-end gap-2">
                    {viewingArchive.subjectName}<BookOpen className="w-4 h-4" />
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 text-right flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-1">رقم القيد<GraduationCap className="w-3 h-3" /></p>
                      <p className="text-primary font-bold">{viewingArchive.studentRegId}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-1">السنة الدراسية<Calendar className="w-3 h-3" /></p>
                      <p className="text-primary font-bold">{viewingArchive.year}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                   <Button onClick={() => handleDownload(viewingArchive)} disabled={downloadingId === viewingArchive.id} className="flex-1 rounded-xl font-bold h-12 gradient-blue">
                     {downloadingId === viewingArchive.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Download className="w-4 h-4 ml-2" />}
                     تحميل الملف
                   </Button>
                   <Button variant="outline" className="flex-1 rounded-xl font-bold border-2 h-12" onClick={() => setViewingArchive(null)}>إغلاق</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

