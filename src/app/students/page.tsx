
"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  MoreVertical, 
  FileDown, 
  Eye, 
  Edit2, 
  Trash2,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Plus,
  User,
  Fingerprint,
  Building2,
  Banknote
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
import { Badge } from "@/components/ui/badge";
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

const INITIAL_STUDENTS = [
  { id: '1', regId: '20210045', name: 'أحمد محمود علي', department: 'تقنية المعلومات', level: 'المستوى الثالث', admissionType: 'عام', status: 'active', joinDate: '2021-09-12' },
  { id: '2', regId: '20220112', name: 'سارة خالد يوسف', department: 'علوم الحاسوب', level: 'المستوى الثاني', admissionType: 'موازي', status: 'active', joinDate: '2022-09-15' },
  { id: '3', regId: '20210567', name: 'وليد جاسم مرزوق', department: 'هندسة البرمجيات', level: 'المستوى الرابع', admissionType: 'عام', status: 'suspended', joinDate: '2021-09-10' },
  { id: '4', regId: '20230001', name: 'مريم سعيد سالم', department: 'تقنية المعلومات', level: 'المستوى الأول', admissionType: 'نفقة خاصة', status: 'active', joinDate: '2023-09-20' },
];

export default function StudentsManagementPage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter States
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const { toast } = useToast();

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.includes(searchTerm) || student.regId.includes(searchTerm);
      const matchesDept = filterDept === "all" || student.department === filterDept;
      const matchesLevel = filterLevel === "all" || student.level === filterLevel;
      const matchesType = filterType === "all" || student.admissionType === filterType;
      
      return matchesSearch && matchesDept && matchesLevel && matchesType;
    });
  }, [students, searchTerm, filterDept, filterLevel, filterType]);

  const handleDelete = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    toast({
      variant: "destructive",
      title: "تم حذف السجل",
      description: "تمت إزالة بيانات الطالب من قاعدة البيانات بنجاح.",
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg gap-1 font-bold"><CheckCircle2 className="w-3 h-3" /> نشط</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg gap-1 font-bold"><XCircle className="w-3 h-3" /> موقوف</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary mb-1">إدارة الطلاب</h1>
            <p className="text-muted-foreground font-bold">تحديث سجلات الطلاب لتسهيل مطابقة بيانات الأرشفة</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
                  <UserPlus className="w-5 h-5" />
                  إضافة طالب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
                <div className="p-8">
                  <DialogHeader className="text-right items-start space-y-2 mb-8">
                    <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                      <UserPlus className="w-6 h-6 text-secondary" />
                      إضافة طالب جديد
                    </DialogTitle>
                    <DialogDescription className="font-bold text-muted-foreground text-sm">
                      أدخل البيانات الأكاديمية والشخصية للطالب لمطابقتها لاحقاً مع ملفات الأرشفة.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-2 col-span-2 text-right">
                      <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                        <User className="w-4 h-4 text-secondary" />
                        الاسم الكامل
                      </Label>
                      <Input placeholder="مثال: محمد أحمد علي" className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                        <Fingerprint className="w-4 h-4 text-secondary" />
                        رقم القيد
                      </Label>
                      <Input placeholder="20240000" className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" />
                    </div>
                    <div className="space-y-2 text-right">
                      <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                        <Building2 className="w-4 h-4 text-secondary" />
                        التخصص
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
                    <div className="space-y-2 text-right">
                      <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                        <Banknote className="w-4 h-4 text-secondary" />
                        نوع القبول
                      </Label>
                      <Select>
                        <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold">
                          <SelectValue placeholder="نوع القبول" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl font-bold">
                          <SelectItem value="general">عام</SelectItem>
                          <SelectItem value="parallel">موازي</SelectItem>
                          <SelectItem value="private">نفقة خاصة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter className="flex-row gap-3 pt-8">
                    <Button type="submit" onClick={() => { setIsAddDialogOpen(false); toast({ title: "تم الحفظ", description: "تمت إضافة الطالب بنجاح." }); }} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">حفظ البيانات</Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input 
                type="text"
                placeholder="البحث بالاسم أو رقم القيد..."
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
              <Filter className="w-5 h-5" />
              تصفية متقدمة
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 p-6 bg-muted/20 rounded-2xl animate-slide-up">
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold mr-1 text-xs">التخصص</Label>
                <Select value={filterDept} onValueChange={setFilterDept}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-white font-bold">
                    <SelectValue placeholder="الكل" />
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
                <Label className="text-primary font-bold mr-1 text-xs">المستوى</Label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-white font-bold">
                    <SelectValue placeholder="الكل" />
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
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold mr-1 text-xs">نوع القبول</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="rounded-xl h-11 border-muted bg-white font-bold">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold">
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="عام">عام</SelectItem>
                    <SelectItem value="موازي">موازي</SelectItem>
                    <SelectItem value="نفقة خاصة">نفقة خاصة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="ghost" 
                  onClick={() => { setFilterDept("all"); setFilterLevel("all"); setFilterType("all"); }}
                  className="w-full h-11 rounded-xl font-bold text-muted-foreground hover:text-primary"
                >
                  إعادة ضبط
                </Button>
              </div>
            </div>
          )}

          <div className="rounded-2xl border overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent border-b">
                  <TableHead className="text-right font-bold text-primary">الطالب</TableHead>
                  <TableHead className="text-right font-bold text-primary">رقم القيد</TableHead>
                  <TableHead className="text-right font-bold text-primary">التخصص / المستوى</TableHead>
                  <TableHead className="text-right font-bold text-primary">نوع القبول</TableHead>
                  <TableHead className="text-right font-bold text-primary">الحالة</TableHead>
                  <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/20 border-b group">
                    <TableCell className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                          <GraduationCap className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="font-bold text-primary">{student.name}</span>
                          <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 justify-end">
                            {student.joinDate} :تاريخ الالتحاق
                            <Clock className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-muted-foreground">{student.regId}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-right">
                        <span className="text-sm font-bold text-primary">{student.department}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{student.level}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-secondary text-secondary rounded-lg font-bold">
                        {student.admissionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
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
                            تعديل البيانات
                            <Edit2 className="w-4 h-4 text-secondary" />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(student.id)}
                            className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive"
                          >
                            حذف السجل
                            <Trash2 className="w-4 h-4" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-bold">
                      لا يوجد طلاب مطابقين للبحث
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
