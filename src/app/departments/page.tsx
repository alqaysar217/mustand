
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
  MoreVertical, 
  Edit2, 
  Trash2, 
  Filter,
  X,
  PlusCircle,
  FileText,
  Users
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

const INITIAL_DEPARTMENTS = [
  { id: '1', name: 'تقنية المعلومات', code: 'IT', studentsCount: 1240, subjectsCount: 45 },
  { id: '2', name: 'علوم الحاسوب', code: 'CS', studentsCount: 850, subjectsCount: 38 },
  { id: '3', name: 'هندسة البرمجيات', code: 'SE', studentsCount: 620, subjectsCount: 42 },
  { id: '4', name: 'نظم المعلومات', code: 'IS', studentsCount: 480, subjectsCount: 30 },
];

export default function DepartmentsManagementPage() {
  const [departments, setDepartments] = useState(INITIAL_DEPARTMENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.name.includes(searchTerm) || dept.code.includes(searchTerm.toUpperCase())
    );
  }, [departments, searchTerm]);

  const handleDelete = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    toast({
      variant: "destructive",
      title: "تم حذف التخصص",
      description: "تمت إزالة التخصص من النظام بنجاح.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in text-right" dir="rtl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-primary mb-1">إدارة التخصصات</h1>
            <p className="text-muted-foreground font-bold">إدارة الأقسام العلمية والتخصصات الأكاديمية في المؤسسة</p>
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
                <DialogHeader className="text-right items-start space-y-2 mb-8">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-secondary" />
                    تخصص جديد
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground text-sm">
                    أدخل بيانات القسم العلمي الجديد لتفعيله في النظام.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <Building2 className="w-4 h-4 text-secondary" />
                      اسم التخصص
                    </Label>
                    <Input placeholder="مثال: الذكاء الاصطناعي" className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start mb-1">
                      <FileText className="w-4 h-4 text-secondary" />
                      رمز التخصص (Code)
                    </Label>
                    <Input placeholder="مثال: AI" className="rounded-xl h-11 border-muted text-right font-bold focus:ring-secondary/20 uppercase" />
                  </div>
                </div>
                <DialogFooter className="flex-row gap-3 pt-8">
                  <Button type="submit" onClick={() => { setIsAddDialogOpen(false); toast({ title: "تم الحفظ", description: "تمت إضافة التخصص بنجاح." }); }} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">حفظ التخصص</Button>
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
                placeholder="البحث باسم التخصص أو الرمز..."
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
                  <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                  <TableHead className="text-right font-bold text-primary">الرمز</TableHead>
                  <TableHead className="text-right font-bold text-primary">عدد الطلاب</TableHead>
                  <TableHead className="text-right font-bold text-primary">عدد المواد</TableHead>
                  <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDepartments.length > 0 ? filteredDepartments.map((dept) => (
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
                      <span className="text-sm font-black text-secondary">{dept.code}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-muted-foreground">{dept.studentsCount}</span>
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold text-muted-foreground">{dept.subjectsCount}</span>
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                            <MoreVertical className="w-4 h-4 text-primary" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right shadow-xl" dir="rtl">
                          <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات القسم</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                            تعديل القسم
                            <Edit2 className="w-4 h-4 text-secondary" />
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(dept.id)}
                            className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive"
                          >
                            حذف القسم
                            <Trash2 className="w-4 h-4" />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">
                      لا توجد تخصصات مطابقة للبحث
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
