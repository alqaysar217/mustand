
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserX, 
  UserCheck,
  Shield,
  User as UserIcon,
  GraduationCap,
  Briefcase
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
import { cn } from "@/lib/utils";

const INITIAL_USERS = [
  { id: '1', name: 'أحمد محمود', username: 'ahmed_admin', role: 'manager', status: 'active', createdAt: '2024-01-10' },
  { id: '2', name: 'سارة خالد', username: 'sara_emp', role: 'employee', status: 'active', createdAt: '2024-02-15' },
  { id: '3', name: 'محمد علي', username: 'mohamed_std', role: 'student', status: 'suspended', createdAt: '2024-03-01' },
  { id: '4', name: 'ليلى وليد', username: 'layla_emp', role: 'employee', status: 'active', createdAt: '2024-03-05' },
];

export default function UsersPage() {
  const [users, setUsers] = useState(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || user.username.includes(searchTerm)
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'manager': return <Badge className="bg-primary hover:bg-primary/90 rounded-lg gap-1"><Shield className="w-3 h-3" /> مدير</Badge>;
      case 'employee': return <Badge className="bg-secondary hover:bg-secondary/90 rounded-lg gap-1"><Briefcase className="w-3 h-3" /> موظف</Badge>;
      case 'student': return <Badge variant="outline" className="rounded-lg gap-1 border-primary text-primary"><GraduationCap className="w-3 h-3" /> طالب</Badge>;
      default: return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' 
      ? <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg">نشط</Badge>
      : <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg">موقوف</Badge>;
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة المستخدمين</h1>
          <p className="text-muted-foreground font-bold">إضافة، تعديل، والتحكم في صلاحيات الوصول للنظام</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2">
              <UserPlus className="w-5 h-5" />
              إضافة مستخدم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl border-none text-right" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle className="text-2xl font-black text-primary">إضافة مستخدم</DialogTitle>
              <DialogDescription className="font-bold">أدخل بيانات المستخدم الجديد وحدد صلاحياته.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary font-bold">الاسم الكامل</Label>
                <Input id="name" placeholder="مثال: محمد أحمد علي" className="rounded-xl h-11 border-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-primary font-bold">اسم المستخدم</Label>
                <Input id="username" placeholder="مثال: m_ahmed" className="rounded-xl h-11 border-muted" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-primary font-bold">الدور (الصلاحية)</Label>
                <Select>
                  <SelectTrigger className="rounded-xl h-11 border-muted">
                    <SelectValue placeholder="اختر نوع الحساب" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="manager">مدير نظام</SelectItem>
                    <SelectItem value="employee">موظف أرشفة</SelectItem>
                    <SelectItem value="student">طالب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pass" className="text-primary font-bold">كلمة المرور</Label>
                <Input id="pass" type="password" placeholder="••••••••" className="rounded-xl h-11 border-muted" />
              </div>
            </div>
            <DialogFooter className="flex-row gap-3">
              <Button type="submit" className="flex-1 rounded-xl h-11 font-bold gradient-blue">حفظ المستخدم</Button>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-11 font-bold border-2">إلغاء</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <div className="flex items-center gap-4 mb-8 bg-muted/30 p-2 rounded-2xl border border-muted">
          <Search className="w-5 h-5 text-muted-foreground mr-2" />
          <input 
            type="text"
            placeholder="البحث بالاسم أو اسم المستخدم..."
            className="flex-1 bg-transparent outline-none text-sm font-bold text-primary h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-right font-bold text-primary">المستخدم</TableHead>
                <TableHead className="text-right font-bold text-primary">نوع الحساب</TableHead>
                <TableHead className="text-right font-bold text-primary">الحالة</TableHead>
                <TableHead className="text-right font-bold text-primary">تاريخ الإنشاء</TableHead>
                <TableHead className="text-center font-bold text-primary w-20">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20 border-b">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <UserIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{user.name}</span>
                        <span className="text-xs text-muted-foreground font-medium">@{user.username}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground">{user.createdAt}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/5">
                          <MoreVertical className="w-4 h-4 text-primary" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 text-right" dir="rtl">
                        <DropdownMenuLabel className="text-right font-bold text-xs text-muted-foreground">خيارات المستخدم</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                          تعديل البيانات
                          <Edit2 className="w-4 h-4 text-secondary" />
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold">
                          {user.status === 'active' ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          {user.status === 'active' ? <UserX className="w-4 h-4 text-orange-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center justify-end gap-2 text-right cursor-pointer rounded-xl font-bold text-destructive focus:text-destructive">
                          حذف المستخدم (مؤقت)
                          <Trash2 className="w-4 h-4" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-bold">
                    لا يوجد مستخدمين مطابقين للبحث
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
