"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
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
  PlusCircle
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

const INITIAL_SUBJECTS = [
  { id: '1', name: 'برمجة 1', department: 'تقنية المعلومات', level: 'المستوى الأول', studentsCount: 145 },
  { id: '2', name: 'رياضيات متقدمة', department: 'علوم الحاسوب', level: 'المستوى الثاني', studentsCount: 98 },
  { id: '3', name: 'هندسة برمجيات', department: 'هندسة البرمجيات', level: 'المستوى الثالث', studentsCount: 72 },
  { id: '4', name: 'قواعد بيانات', department: 'تقنية المعلومات', level: 'المستوى الثاني', studentsCount: 110 },
  { id: '5', name: 'ذكاء اصطناعي', department: 'علوم الحاسوب', level: 'المستوى الرابع', studentsCount: 45 },
];

export default function SubjectsManagementPage() {
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const { toast } = useToast();

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      const matchesSearch = subject.name.includes(searchTerm) || subject.department.includes(searchTerm);
      const matchesDept = selectedDept === "all" || subject.department === selectedDept;
      const matchesLevel = selectedLevel === "all" || subject.level === selectedLevel;
      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [subjects, searchTerm, selectedDept, selectedLevel]);

  const handleDelete = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    toast({
      variant: "destructive",
      title: "تم الحذف",
      description: "تم حذف المادة بنجاح من النظام.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary mb-1">إدارة المواد الدراسية</h1>
            <p className="text-muted-foreground font-bold">تحديث سجلات المواد والأقسام لتسهيل الفرز والأرشفة</p>
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
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-secondary" />
                    إضافة مادة جديدة
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground text-sm">
                    أدخل تفاصيل المادة الدراسية الجديدة لضمها للسجلات الأكاديمية.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      اسم المادة
                    </Label>
                    <Input placeholder="مثال: هياكل بيانات" className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <Building2 className="w-4 h-4 text-secondary" />
                      التخصص (القسم)
                    </Label>
                    <Select>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        <SelectItem value="it">تقنية المعلومات</SelectItem>
                        <SelectItem value="cs">علوم الحاسوب</SelectItem>
                        <SelectItem value="se">هندسة البرمجيات</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <GraduationCap className="w-4 h-4 text-secondary" />
                      المستوى
                    </Label>
                    <Select>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold">
                        <SelectItem value="1">المستوى الأول</SelectItem>
                        <SelectItem value="2">المستوى الثاني</SelectItem>
                        <SelectItem value="3">المستوى الثالث</SelectItem>
                        <SelectItem value="4">المستوى الرابع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-row gap-3 pt-8">
                  <Button type="submit" onClick={() => { setIsAddDialogOpen(false); toast({ title: "تم الحفظ", description: "تمت إضافة المادة بنجاح." }); }} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">حفظ المادة</Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
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
                className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all text-right"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 rounded-2xl border-2 px-6 gap-2 font-bold transition-all"
            >
              {showFilters ? <X className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
              تصفية
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-6 bg-muted/20 rounded-2xl animate-slide-up">
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold mr-1 text-xs">التخصص الدراسي</Label>
                <Select value={selectedDept} onValueChange={setSelectedDept}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-white font-bold">
                    <SelectValue placeholder="تصفية حسب التخصص" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">جميع التخصصات</SelectItem>
                    <SelectItem value="تقنية المعلومات">تقنية المعلومات</SelectItem>
                    <SelectItem value="علوم الحاسوب">علوم الحاسوب</SelectItem>
                    <SelectItem value="هندسة البرمجيات">هندسة البرمجيات</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold mr-1 text-xs">المستوى الدراسي</Label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-white font-bold">
                    <SelectValue placeholder="تصفية حسب المستوى" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
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
                  onClick={() => { setSelectedDept("all"); setSelectedLevel("all"); setSearchTerm(""); }}
                  className="w-full h-11 rounded-xl font-bold text-muted-foreground hover:text-primary"
                >
                  إعادة ضبط المرشحات
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-right font-bold text-primary">المادة</TableHead>
                  <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                  <TableHead className="text-right font-bold text-primary">المستوى</TableHead>
                  <TableHead className="text-right font-bold text-primary">عدد الطلاب المسجلين</TableHead>
                  <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.length > 0 ? filteredSubjects.map((subject) => (
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
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-muted-foreground">{subject.department}</span>
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-muted-foreground">{subject.level}</span>
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center justify-center bg-secondary/10 text-secondary font-black px-3 py-1 rounded-lg text-xs">
                        {subject.studentsCount} طالب
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                            <MoreVertical className="w-4 h-4 text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right shadow-xl" dir="rtl">
                          <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات الموظف</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                            تعديل المادة
                            <Edit2 className="w-4 h-4 text-secondary" />
                          </DropdownMenuItem>
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
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">
                      لا توجد مواد دراسية مطابقة للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </main>
    </div>
  );
}
