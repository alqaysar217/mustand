
"use client";

import { useState, useRef, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  Search, 
  Eye, 
  Trash2, 
  FileText, 
  Plus, 
  Loader2, 
  ImageIcon,
  Scan,
  CloudUpload
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
import { compressImage } from "@/lib/storage-utils";
import { extractExamDetails } from "@/ai/flows/extract-exam-details";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";

export default function AdminArchivePage() {
  const firestore = useFirestore();
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);

  const { data: archives = [], loading } = useCollection(archivesQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [viewingArchive, setViewingArchive] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [newArchive, setNewArchive] = useState({
    name: '',
    regId: '',
    subjectId: '',
    subjectName: '',
    year: '2023 / 2024',
    term: 'الفصل الأول',
    department: '',
    departmentName: '',
    level: 'المستوى الأول'
  });

  const filteredArchives = useMemo(() => {
    return (archives as any[]).filter(item => 
      item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.studentRegId?.includes(searchTerm) || 
      item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [archives, searchTerm]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const compressed = await compressImage(event.target.result as string, 0.7, 1200);
          setUploadedImage(compressed);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAIAnalysis = async () => {
    if (!uploadedImage) return;
    setIsSubmitting(true);
    try {
      const result = await extractExamDetails({ examImageDataUri: uploadedImage });
      setNewArchive(prev => ({
        ...prev,
        regId: result.studentRegistrationId || prev.regId,
        name: result.studentName || prev.name,
        year: result.academicYear || prev.year,
        level: result.level || prev.level
      }));
      toast({ title: "تم التحليل بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل التحليل الذكي" });
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
      toast({ title: "تم نقل الملف لسلة المحذوفات" });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ في النقل" });
    }
  };

  const handleSaveNewArchive = async () => {
    if (!firestore || !newArchive.name || !newArchive.regId || !uploadedImage) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى رفع الصورة وتعبئة بيانات الطالب والمادة." });
      return;
    }

    setIsSubmitting(true);
    try {
      const archiveData = {
        studentName: newArchive.name,
        studentRegId: newArchive.regId,
        subjectName: newArchive.subjectName,
        subjectId: newArchive.subjectId,
        year: newArchive.year,
        term: newArchive.term,
        level: newArchive.level,
        fileUrl: uploadedImage,
        pages: 1,
        uploadMethod: 'Manual-Image',
        uploadedAt: serverTimestamp()
      };
      
      await addDoc(collection(firestore, "archives"), archiveData);
      
      setIsAddDialogOpen(false);
      setUploadedImage(null);
      setNewArchive({
        name: '', regId: '', subjectId: '', subjectName: '',
        year: '2023 / 2024', term: 'الفصل الأول', department: '', departmentName: '', level: 'المستوى الأول'
      });

      toast({ title: "تمت الأرشفة بنجاح" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "حدث خطأ أثناء الحفظ" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الأرشيف الرقمي</h1>
          <p className="text-muted-foreground font-bold">التحكم في الملفات المؤرشفة مباشرة عبر الصور</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2"
        >
          <Plus className="w-5 h-5" />
          أرشفة مستند جديد
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
                <TableHead className="text-right font-bold text-primary">المستوى</TableHead>
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
                  <TableCell>
                    <Badge variant="outline" className="rounded-lg font-bold text-[10px] text-blue-600 border-blue-200 bg-blue-50">
                      {item.level || 'غير محدد'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setViewingArchive(item)} className="rounded-xl hover:bg-primary/5 text-primary"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleMoveToBin(item)} className="rounded-xl hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></Button>
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl rounded-3xl border-none text-right shadow-2xl overflow-hidden p-0" dir="rtl">
          <div className="p-8 space-y-6">
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black text-primary flex items-center justify-end gap-2">أرشفة مستند جديد<Archive className="w-6 h-6 text-secondary" /></DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">ارفع صورة الاختبار وسيساعدك النظام في ملء البيانات.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-primary font-bold">صورة الاختبار الممسوحة ضوئياً</Label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[4/3] border-4 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-muted/30 transition-all overflow-hidden relative group"
                >
                  {uploadedImage ? (
                    <>
                      <Image src={uploadedImage} alt="Uploaded" fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" className="font-bold rounded-xl">تغيير الصورة</Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      <p className="text-xs font-bold text-muted-foreground">اضغط لرفع الصورة</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                {uploadedImage && (
                  <Button onClick={handleAIAnalysis} disabled={isSubmitting} className="w-full rounded-xl h-11 font-bold gradient-blue gap-2 shadow-md">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                    بدء التحليل الذكي للصورة
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2"><Label className="text-primary font-bold">اسم الطالب</Label><Input value={newArchive.name} onChange={(e) => setNewArchive({...newArchive, name: e.target.value})} placeholder="أحمد محمد" className="rounded-xl h-10 font-bold" /></div>
                  <div className="space-y-2"><Label className="text-primary font-bold">رقم القيد</Label><Input value={newArchive.regId} onChange={(e) => setNewArchive({...newArchive, regId: e.target.value})} placeholder="20210045" className="rounded-xl h-10 font-bold" /></div>
                  <div className="space-y-2"><Label className="text-primary font-bold">المادة</Label><Select value={newArchive.subjectId} onValueChange={(v) => { const s = subjects.find((sub: any) => sub.id === v) as any; setNewArchive({...newArchive, subjectId: v, subjectName: s?.nameAr || ""}); }}><SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue placeholder="اختر المادة" /></SelectTrigger><SelectContent className="rounded-xl font-bold">{subjects.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.nameAr}</SelectItem>)}</SelectContent></Select></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label className="text-primary font-bold">السنة</Label><Select value={newArchive.year} onValueChange={(v) => setNewArchive({...newArchive, year: v})}><SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue placeholder="السنة" /></SelectTrigger><SelectContent className="rounded-xl font-bold"><SelectItem value="2023 / 2024">2023 / 2024</SelectItem><SelectItem value="2022 / 2023">2022 / 2023</SelectItem></SelectContent></Select></div>
                    <div className="space-y-2"><Label className="text-primary font-bold">المستوى</Label><Select value={newArchive.level} onValueChange={(v) => setNewArchive({...newArchive, level: v})}><SelectTrigger className="rounded-xl h-10 font-bold"><SelectValue placeholder="المستوى" /></SelectTrigger><SelectContent className="rounded-xl font-bold"><SelectItem value="المستوى الأول">المستوى الأول</SelectItem><SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem><SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem><SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem></SelectContent></Select></div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-row gap-3 pt-4 border-t">
              <Button onClick={handleSaveNewArchive} disabled={isSubmitting || !uploadedImage} className="flex-1 rounded-xl h-12 font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg gap-2">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CloudUpload className="w-5 h-5" />}
                حفظ في الأرشيف
              </Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingArchive} onOpenChange={(open) => !open && setViewingArchive(null)}>
        <DialogContent className="max-w-xl rounded-3xl p-8 border-none shadow-2xl text-right" dir="rtl">
          {viewingArchive && (
            <div className="space-y-6">
              <DialogHeader><DialogTitle className="text-2xl font-bold text-primary">{viewingArchive.studentName}</DialogTitle></DialogHeader>
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden border-2 shadow-inner bg-muted">
                <Image src={viewingArchive.fileUrl} alt="Exam Preview" fill className="object-contain" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-2xl"><Label className="text-[10px] block mb-1">رقم القيد</Label><p className="font-black text-primary">{viewingArchive.studentRegId}</p></div>
                <div className="p-4 bg-muted/30 rounded-2xl"><Label className="text-[10px] block mb-1">المادة</Label><p className="font-black text-primary">{viewingArchive.subjectName}</p></div>
              </div>
              <Button variant="outline" className="w-full rounded-xl font-bold border-2 h-12" onClick={() => setViewingArchive(null)}>إغلاق المعاينة</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
