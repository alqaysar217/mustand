
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { 
  History, 
  Search, 
  User, 
  Clock, 
  FileText, 
  Settings, 
  Trash2, 
  AlertCircle,
  Loader2,
  Archive as ArchiveIcon,
  AlertTriangle,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, query, orderBy, limit, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore";

export default function LogsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const logsQuery = useMemo(() => firestore ? query(collection(firestore, "logs"), orderBy("timestamp", "desc"), limit(100)) : null, [firestore]);
  const { data: logs = [], loading } = useCollection(logsQuery);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredLogs = useMemo(() => {
    return (logs as any[]).filter(log => 
      log.user?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.target?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const handleDeleteLog = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "logs", id));
      toast({ title: "تم حذف السجل بنجاح" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل حذف السجل" });
    }
  };

  const handleClearAllLogs = async () => {
    if (!firestore) return;
    setIsProcessing(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, "logs"));
      const batch = writeBatch(firestore);
      querySnapshot.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      toast({ title: "تم تفريغ سجل العمليات بالكامل" });
    } catch (e) {
      toast({ variant: "destructive", title: "فشل في مسح السجل" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getActionBadge = (type: string) => {
    switch(type) {
      case 'upload': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-lg gap-1 font-black"><FileText className="w-3 h-3" /> رفع</Badge>;
      case 'update': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg gap-1 font-black"><Settings className="w-3 h-3" /> تعديل</Badge>;
      case 'delete': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg gap-1 font-black"><Trash2 className="w-3 h-3" /> حذف</Badge>;
      case 'archive': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none rounded-lg gap-1 font-black"><ArchiveIcon className="w-3 h-3" /> أرشفة</Badge>;
      case 'system': return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-none rounded-lg gap-1 font-black"><AlertCircle className="w-3 h-3" /> نظام</Badge>;
      default: return <Badge variant="outline" className="rounded-lg font-bold">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">سجل العمليات المركزي</h1>
          <p className="text-muted-foreground font-bold text-sm">تتبع شامل لكافة النشاطات والعمليات المنفذة في النظام في الوقت الحقيقي</p>
        </div>

        {logs.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" disabled={isProcessing} className="rounded-2xl h-12 px-6 font-bold gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700">
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                تفريغ السجل بالكامل
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-6 max-w-[380px]" dir="rtl">
              <AlertDialogHeader className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center animate-bounce duration-[2000ms]">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div className="space-y-2 w-full text-right">
                  <AlertDialogTitle className="text-xl font-black text-primary">تفريغ كافة السجلات؟</AlertDialogTitle>
                  <AlertDialogDescription className="font-bold text-muted-foreground text-xs leading-relaxed">
                    سيتم مسح كافة الأنشطة المسجلة نهائياً. لن تتمكن من تتبع العمليات السابقة بعد هذا الإجراء.
                  </AlertDialogDescription>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex flex-col gap-2 mt-6 w-full">
                <AlertDialogAction 
                  onClick={handleClearAllLogs} 
                  className="w-full rounded-xl bg-red-600 hover:bg-red-700 font-black h-12 text-white shadow-lg border-none order-1"
                >
                  نعم، امسح السجل بالكامل
                </AlertDialogAction>
                <AlertDialogCancel className="w-full rounded-xl font-black border-2 h-12 text-primary hover:bg-muted/50 transition-all order-2">
                  تراجع
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Card className="p-6 border-none shadow-xl rounded-[2rem] bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث بالمستخدم، العملية، أو الهدف..."
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
                <TableHead className="text-right font-black text-primary py-5">المستخدم</TableHead>
                <TableHead className="text-right font-black text-primary">العملية</TableHead>
                <TableHead className="text-right font-black text-primary">التفاصيل / الهدف</TableHead>
                <TableHead className="text-right font-black text-primary">تاريخ الإجراء</TableHead>
                <TableHead className="text-center font-black text-primary w-20">حذف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="h-60 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto opacity-20" /></TableCell></TableRow>
              ) : filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-primary text-sm">{log.user}</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{log.role === 'manager' ? 'مدير' : 'موظف'}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionBadge(log.type)}
                      <span className="text-sm font-black text-primary">{log.action}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-bold text-muted-foreground max-w-[200px] truncate">
                    {log.target}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-primary">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleDateString('ar-EG-u-nu-latn') : 'الآن'}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString('ar-EG-u-nu-latn') : 'الآن'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 text-muted-foreground/30 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-[1.5rem] border-none shadow-2xl p-5 max-w-[340px]" dir="rtl">
                        <AlertDialogHeader className="text-right">
                          <AlertDialogTitle className="text-lg font-black text-primary flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            حذف العملية؟
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-bold text-xs">
                            هل تود حذف هذا السجل من قائمة الأنشطة؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex gap-2 mt-4">
                          <AlertDialogAction onClick={() => handleDeleteLog(log.id)} className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 font-bold h-10 text-xs">حذف</AlertDialogAction>
                          <AlertDialogCancel className="flex-1 rounded-xl font-bold border-2 h-10 text-xs">إلغاء</AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-80 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center">
                        <History className="w-10 h-10 text-muted-foreground opacity-30" />
                      </div>
                      <h3 className="text-xl font-black text-primary">لا توجد سجلات بعد</h3>
                      <p className="text-muted-foreground font-bold text-sm">سيتم تسجيل كافة الأنشطة الإدارية هنا بمجرد حدوثها.</p>
                    </div>
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
