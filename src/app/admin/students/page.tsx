
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Search, 
  UserPlus, 
  MoreVertical, 
  FileDown, 
  FileUp, 
  Eye, 
  Edit2, 
  Trash2,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  XCircle,
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
  { id: '4', regId: '20230001', name: 'مريم سعيد سالم', department: 'تقنية المعلومات', level: 'المستوى الأول', admissionType: 'منحة', status: 'active', joinDate: '2023-09-20' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredStudents = students.filter(student => 
    student.name.includes(searchTerm) || student.regId.includes(searchTerm)
  );

  const handleExport = () => {
    toast({
      title: "جاري التصدير",
      description: "يتم الآن تجهيز ملف Excel لبيانات الطلاب...",
    });
  };

  const handleImport = () => {
    toast({
      title: "استيراد البيانات",
      description: "يرجى اختيار ملف Excel المتوافق مع النظام.",
    });
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg gap-1"><CheckCircle2 className="w-3 h-3" /> نشط</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg gap-1"><XCircle className="w-3 h-3" /> موقوف</Badge>;
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الطلاب</h1>
          <p className="text-muted-foreground font-bold">قاعدة بيانات الطلاب، تتبع المستويات الأكاديمية والقبول</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleImport} className="rounded-2xl h-12 font-bold border-2 gap-2">
            <FileUp className="w-5 h-5" />
            استيراد Excel
          </Button>
          <Button variant="outline" onClick={handleExport} className="rounded-2xl h-12 font-bold border-2 gap-2">
            <FileDown className="w-5 h-5" />
            تصدير
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
                <UserPlus className="w-5 h-5" />
                إضافة طالب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl border-none text-right" dir="rtl">
              <DialogHeader className="text-right">
                <DialogTitle className="text-2xl font-black text-primary">إضافة طالب</DialogTitle>
                <DialogDescription className="font-bold">أدخل البيانات الأكاديمية والشخصية للطالب الجديد.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-6 py-4">
                <div className="space-y-2 col-span-2">
                  <Label className="text-primary font-bold">الاسم الكامل</Label>
                  <Input placeholder="مثال: محمد أحمد علي" className="rounded-xl h-11 border-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">رقم القيد</Label>
                  <Input placeholder="20240000" className="rounded-xl h-11 border-muted" />
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">التخصص</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-11 border-muted">
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="it">تقنية المعلومات</SelectItem>
                      <SelectItem value="cs">علوم الحاسوب</SelectItem>
                      <SelectItem value="se">هندسة البرمجيات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">المستوى</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-11 border-muted">
                      <SelectValue placeholder="اختر المستوى" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="1">المستوى الأول</SelectItem>
                      <SelectItem value="2">المستوى الثاني</SelectItem>
                      <SelectItem value="3">المستوى الثالث</SelectItem>
                      <SelectItem value="4">المستوى الرابع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary font-bold">نوع القبول</Label>
                  <Select>
                    <SelectTrigger className="rounded-xl h-11 border-muted">
                      <SelectValue placeholder="نوع القبول" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="general">عام</SelectItem>
                      <SelectItem value="parallel">موازي</SelectItem>
                      <SelectItem value="scholarship">منحة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="flex-row gap-3">
                <Button type="submit" className="flex-1 rounded-xl h-11 font-bold gradient-blue">حفظ البيانات</Button>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-11 font-bold border-2">إلغاء</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث بالاسم أو رقم القيد..."
              className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-12 rounded-2xl border-2 px-6 gap-2 font-bold">
            <Filter className="w-5 h-5" />
            تصفية متقدمة
          </Button>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table>
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
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{student.name}</span>
                        <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          تاريخ الالتحاق: {student.joinDate}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-muted-foreground">{student.regId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
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
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right" dir="rtl">
                        <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات الطالب</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                          الملف الأكاديمي
                          <Eye className="w-4 h-4 text-primary" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                          تعديل البيانات
                          <Edit2 className="w-4 h-4 text-secondary" />
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive">
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
    </div>
  );
}
