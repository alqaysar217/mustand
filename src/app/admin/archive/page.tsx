"use client";

import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Archive, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit2, 
  Trash2, 
  FileText,
  Calendar,
  GraduationCap,
  BookOpen,
  Building,
  X,
  Plus,
  FileUp,
  Loader2,
  CheckCircle
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

const INITIAL_ARCHIVES = [
  { id: '1', name: 'أحمد محمود علي', regId: '20210045', subject: 'رياضيات 1', year: '2023 / 2024', term: 'الفصل الأول', department: 'تقنية المعلومات', date: '2024-05-20', pages: 4, fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '2', name: 'سارة خالد يوسف', regId: '20220112', subject: 'فيزياء عامة', year: '2022 / 2023', term: 'الفصل الثاني', department: 'علوم الحاسوب', date: '2024-05-18', pages: 6, fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '3', name: 'وليد جاسم مرزوق', regId: '20210567', subject: 'برمجة 2', year: '2023 / 2024', term: 'الفصل الأول', department: 'هندسة البرمجيات', date: '2024-05-15', pages: 5, fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '4', name: 'مريم سعيد سالم', regId: '20230001', subject: 'اللغة الإنجليزية', year: '2023 / 2024', term: 'الفصل التكميلي', department: 'تقنية المعلومات', date: '2024-05-10', pages: 3, fileUrl: PlaceHolderImages[1].imageUrl },
];

export default function AdminArchivePage() {
  const [archives, setArchives] = useState(INITIAL_ARCHIVES);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingArchive, setViewingArchive] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for new archive
  const [newArchive, setNewArchive] = useState({
    name: '',
    regId: '',
    subject: '',
    year: '2023 / 2024',
    term: 'الفصل الأول',
    department: 'تقنية المعلومات',
    file: null as string | null
  });

  const filteredArchives = archives.filter(item => 
    item.name.includes(searchTerm) || item.regId.includes(searchTerm) || item.subject.includes(searchTerm)
  );

  const handleDelete = (id: string) => {
    setArchives(prev => prev.filter(a => a.id !== id));
    toast({
      title: "تم النقل إلى سلة المحذوفات",
      description: "يمكنك استرجاع الملف من قسم سلة المحذوفات لاحقاً.",
    });
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

  const handleSaveNewArchive = () => {
    if (!newArchive.name || !newArchive.regId || !newArchive.subject || !newArchive.file) {
      toast({
        variant: "destructive",
        title: "بيانات ناقصة",
        description: "يرجى إكمال كافة الحقول ورفع صورة الاختبار.",
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newArchive.name,
        regId: newArchive.regId,
        subject: newArchive.subject,
        year: newArchive.year,
        term: newArchive.term,
        department: newArchive.department,
        date: new Date().toISOString().split('T')[0],
        pages: 1,
        fileUrl: newArchive.file || PlaceHolderImages[1].imageUrl
      };

      setArchives(prev => [newItem, ...prev]);
      setIsSubmitting(false);
      setIsAddDialogOpen(false);
      setNewArchive({
        name: '',
        regId: '',
        subject: '',
        year: '2023 / 2024',
        term: 'الفصل الأول',
        department: 'تقنية المعلومات',
        file: null
      });

      toast({
        title: "تمت الأرشفة بنجاح",
        description: `تمت إضافة اختبار الطالب ${newItem.name} إلى الأرشيف المركزي.`,
      });
    }, 1500);
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الأرشيف الرقمي</h1>
          <p className="text-muted-foreground font-bold">التحكم الكامل في الملفات المؤرشفة، تعديل البيانات، وإدارة المحذوفات</p>
        </div>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2"
        >
          <Plus className="w-5 h-5" />
          أرشفة ملفات جديدة
        </Button>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
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
                <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                <TableHead className="text-right font-bold text-primary">الصفحات</TableHead>
                <TableHead className="text-right font-bold text-primary">تاريخ الأرشفة</TableHead>
                <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArchives.length > 0 ? filteredArchives.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{item.name}</span>
                        <span className="text-[10px] text-secondary font-bold">{item.subject}</span>
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
                    <Badge variant="outline" className="border-primary/20 text-primary rounded-lg font-bold">
                      {item.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-black text-primary">{item.pages}</span>
                  </TableCell>
                  <TableCell className="text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                          <MoreVertical className="w-4 h-4 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 text-right" dir="rtl">
                        <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات المدير</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setViewingArchive(item)}
                          className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold"
                        >
                          عرض الملف
                          <Eye className="w-4 h-4 text-primary" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                          تعديل البيانات
                          <Edit2 className="w-4 h-4 text-secondary" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(item.id)}
                          className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive"
                        >
                          نقل لسلة المحذوفات
                          <Trash2 className="w-4 h-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-bold">
                    لا توجد ملفات مؤرشفة مطابقة للبحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dialog للأرشفة السريعة (مدير) */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl overflow-hidden p-0" dir="rtl">
          <div className="p-8 space-y-6">
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black text-primary flex items-center justify-end gap-2">
                أرشفة اختبار جديد
                <Archive className="w-6 h-6 text-secondary" />
              </DialogTitle>
              <DialogDescription className="font-bold pt-1">إدخال بيانات الاختبار مباشرة في السجل المركزي</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">اسم الطالب الرباعي</Label>
                <Input 
                  value={newArchive.name}
                  onChange={(e) => setNewArchive({...newArchive, name: e.target.value})}
                  placeholder="مثال: أحمد محمد علي" 
                  className="rounded-xl h-11 border-muted bg-muted/20 font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">رقم القيد</Label>
                <Input 
                  value={newArchive.regId}
                  onChange={(e) => setNewArchive({...newArchive, regId: e.target.value})}
                  placeholder="20210045" 
                  className="rounded-xl h-11 border-muted bg-muted/20 font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">المادة الدراسية</Label>
                <Input 
                  value={newArchive.subject}
                  onChange={(e) => setNewArchive({...newArchive, subject: e.target.value})}
                  placeholder="اسم المادة..." 
                  className="rounded-xl h-11 border-muted bg-muted/20 font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">التخصص</Label>
                <Select value={newArchive.department} onValueChange={(v) => setNewArchive({...newArchive, department: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-muted/20 font-bold">
                    <SelectValue placeholder="اختر القسم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                    <SelectItem value="علوم الحاسوب">علوم الحاسوب</SelectItem>
                    <SelectItem value="هندسة البرمجيات">هندسة البرمجيات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">السنة الدراسية</Label>
                <Select value={newArchive.year} onValueChange={(v) => setNewArchive({...newArchive, year: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-muted/20 font-bold">
                    <SelectValue placeholder="السنة" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="2023 / 2024">2023 / 2024</SelectItem>
                    <SelectItem value="2022 / 2023">2022 / 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold mr-1">الفصل الدراسي</Label>
                <Select value={newArchive.term} onValueChange={(v) => setNewArchive({...newArchive, term: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-muted/20 font-bold">
                    <SelectValue placeholder="الفصل" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                    <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                    <SelectItem value="الفصل التكميلي">الفصل التكميلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-4">
              <Label className="text-primary font-bold mr-1 block mb-3">صورة الاختبار</Label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "w-full h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all",
                  newArchive.file ? "border-green-500 bg-green-50" : "border-muted-foreground/20 hover:border-primary hover:bg-primary/5"
                )}
              >
                {newArchive.file ? (
                  <>
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border">
                      <Image src={newArchive.file} alt="Preview" fill className="object-cover" />
                    </div>
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      تم رفع الملف بنجاح
                    </span>
                  </>
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
              <Button 
                onClick={handleSaveNewArchive}
                disabled={isSubmitting}
                className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إكمال الأرشفة"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="flex-1 rounded-xl h-12 font-bold border-2"
              >
                إلغاء
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog لمعاينة الملف */}
      <Dialog open={!!viewingArchive} onOpenChange={(open) => !open && setViewingArchive(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-0 overflow-hidden border-none shadow-2xl text-right" dir="rtl">
          {viewingArchive && (
            <div className="flex flex-col md:flex-row h-full">
              <div className="relative w-full md:w-1/2 aspect-[3/4] bg-muted">
                <Image src={viewingArchive.fileUrl} alt="Exam Preview" fill className="object-cover" />
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <DialogHeader className="text-right mb-6">
                  <DialogTitle className="text-2xl font-bold text-primary mb-2">{viewingArchive.name}</DialogTitle>
                  <p className="text-secondary font-bold flex items-center justify-end gap-2">
                    {viewingArchive.subject}
                    <BookOpen className="w-4 h-4" />
                  </p>
                </DialogHeader>
                
                <div className="space-y-4 text-right flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-1">
                         رقم القيد
                         <GraduationCap className="w-3 h-3" />
                      </p>
                      <p className="text-primary font-bold">{viewingArchive.regId}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-1">
                        السنة الدراسية
                        <Calendar className="w-3 h-3" />
                      </p>
                      <p className="text-primary font-bold">{viewingArchive.year}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-1">
                        الفصل الدراسي
                        <BookOpen className="w-3 h-3" />
                      </p>
                      <p className="text-primary font-bold">{viewingArchive.term}</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-2xl flex flex-col items-end">
                      <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 mb-1">
                        القسم
                        <Building className="w-3 h-3" />
                      </p>
                      <p className="text-primary font-bold">{viewingArchive.department}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <p className="text-primary font-bold">{viewingArchive.date}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">تاريخ الأرشفة</p>
                  </div>
                </div>

                <div className="mt-8">
                  <Button variant="outline" className="w-full rounded-xl font-bold border-2 h-12" onClick={() => setViewingArchive(null)}>إغلاق المعاينة</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
