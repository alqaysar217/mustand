"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  RotateCcw, 
  Search, 
  FileText, 
  AlertTriangle,
  Calendar,
  Clock,
  MoreVertical
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const MOCK_DELETED_ITEMS = [
  { id: '1', name: 'خالد عمر علي', subject: 'هياكل بيانات', deletedAt: '2024-05-22', reason: 'خطأ في التخصص', year: '2023 / 2024' },
  { id: '2', name: 'نورة جاسم', subject: 'شبكات الحاسوب', deletedAt: '2024-05-21', reason: 'رفع ملف غير واضح', year: '2023 / 2024' },
  { id: '3', name: 'سلطان محمد', subject: 'ذكاء اصطناعي', deletedAt: '2024-05-20', reason: 'تكرار الملف', year: '2022 / 2023' },
];

export default function RecycleBinPage() {
  const [items, setItems] = useState(MOCK_DELETED_ITEMS);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredItems = items.filter(item => 
    item.name.includes(searchTerm) || item.subject.includes(searchTerm)
  );

  const handleRestore = (id: string) => {
    const item = items.find(i => i.id === id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast({
      title: "تم استرجاع الملف",
      description: `تمت إعادة ملف الطالب ${item?.name} إلى الأرشيف بنجاح.`,
    });
  };

  const handlePermanentDelete = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    toast({
      variant: "destructive",
      title: "حذف نهائي",
      description: "تم حذف الملف من النظام بشكل نهائي ولا يمكن استرجاعه.",
    });
  };

  const handleEmptyBin = () => {
    setItems([]);
    toast({
      title: "تفريغ السلة",
      description: "تم مسح جميع الملفات من سلة المحذوفات بنجاح.",
    });
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">سلة المحذوفات</h1>
          <p className="text-muted-foreground font-bold">إدارة الملفات المحذوفة مؤقتاً، استرجاعها أو مسحها نهائياً</p>
        </div>

        {items.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="rounded-2xl h-12 px-6 font-bold gap-2">
                <Trash2 className="w-5 h-5" />
                تفريغ السلة نهائياً
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-3xl border-none text-right" dir="rtl">
              <AlertDialogHeader className="text-right">
                <AlertDialogTitle className="text-2xl font-black text-primary">هل أنت متأكد تماماً؟</AlertDialogTitle>
                <AlertDialogDescription className="font-bold pt-2">
                  هذا الإجراء سيقوم بحذف جميع الملفات في السلة بشكل نهائي. لا يمكن التراجع عن هذه العملية لاحقاً.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-3">
                <AlertDialogAction onClick={handleEmptyBin} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 font-bold h-11">نعم، احذف الكل</AlertDialogAction>
                <AlertDialogCancel className="flex-1 rounded-xl font-bold border-2 h-11">إلغاء</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث باسم الطالب أو المادة..."
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
                <TableHead className="text-right font-bold text-primary">الملف / المادة</TableHead>
                <TableHead className="text-right font-bold text-primary">تاريخ الحذف</TableHead>
                <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{item.name}</span>
                        <span className="text-[10px] text-secondary font-bold">{item.subject} - {item.year}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-bold text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {item.deletedAt}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRestore(item.id)}
                        className="rounded-xl hover:bg-green-50 text-green-600"
                        title="استرجاع"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl hover:bg-destructive/10 text-destructive"
                            title="حذف نهائي"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-3xl border-none text-right" dir="rtl">
                          <AlertDialogHeader className="text-right">
                            <AlertDialogTitle className="text-2xl font-black text-primary">حذف نهائي للملف؟</AlertDialogTitle>
                            <AlertDialogDescription className="font-bold pt-2">
                              أنت على وشك حذف ملف <span className="text-destructive">{item.name}</span> بشكل نهائي. لن تتمكن من استرجاع هذا الملف أبداً بعد الآن.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-row gap-3">
                            <AlertDialogAction onClick={() => handlePermanentDelete(item.id)} className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 font-bold h-11">تأكيد الحذف النهائي</AlertDialogAction>
                            <AlertDialogCancel className="flex-1 rounded-xl font-bold border-2 h-11">تراجع</AlertDialogCancel>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
                        <Trash2 className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                      <p className="text-muted-foreground font-bold text-lg">سلة المحذوفات فارغة حالياً</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-6 border-none shadow-lg bg-orange-50 border-r-4 border-orange-500 rounded-2xl">
        <div className="flex gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0" />
          <div className="text-right">
            <h4 className="font-bold text-orange-800">تنبيه النظام</h4>
            <p className="text-sm text-orange-700 font-medium">يتم الاحتفاظ بالملفات في سلة المحذوفات لمدة 30 يوماً قبل حذفها تلقائياً من النظام. يمكنك استرجاع أي ملف خلال هذه الفترة.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
