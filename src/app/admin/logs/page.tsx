"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  History, 
  Search, 
  User, 
  Clock, 
  FileText, 
  Settings, 
  Trash2,
  AlertCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const MOCK_LOGS = [
  { id: '1', user: 'أحمد محمود', role: 'مدير', action: 'رفع اختبار', target: 'برمجة 1 - طالب: محمد خالد', date: '2024-05-22', time: '10:30 ص', type: 'upload' },
  { id: '2', user: 'سارة خالد', role: 'موظف', action: 'تعديل بيانات طالب', target: 'أحمد وليد (20210045)', date: '2024-05-22', time: '11:15 ص', type: 'update' },
  { id: '3', user: 'أحمد محمود', role: 'مدير', action: 'حذف مادة', target: 'رياضيات 101', date: '2024-05-21', time: '09:45 ص', type: 'delete' },
  { id: '4', user: 'ليلى وليد', role: 'موظف', action: 'أرشفة ملف', target: 'فيزياء عامة - طالبة: نورة عيسى', date: '2024-05-21', time: '02:20 م', type: 'archive' },
  { id: '5', user: 'النظام', role: 'تلقائي', action: 'نسخ احتياطي', target: 'قاعدة البيانات المركزية', date: '2024-05-21', time: '03:00 ص', type: 'system' },
];

export default function LogsPage() {
  const [logs] = useState(MOCK_LOGS);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(log => 
    log.user.includes(searchTerm) || log.action.includes(searchTerm) || log.target.includes(searchTerm)
  );

  const getActionBadge = (type: string) => {
    switch(type) {
      case 'upload': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none rounded-lg gap-1"><FileText className="w-3 h-3" /> رفع</Badge>;
      case 'update': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-lg gap-1"><Settings className="w-3 h-3" /> تعديل</Badge>;
      case 'delete': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none rounded-lg gap-1"><Trash2 className="w-3 h-3" /> حذف</Badge>;
      case 'system': return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none rounded-lg gap-1"><AlertCircle className="w-3 h-3" /> نظام</Badge>;
      default: return <Badge variant="outline" className="rounded-lg">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">سجل العمليات</h1>
          <p className="text-muted-foreground font-bold">تتبع شامل لكافة النشاطات والعمليات المنفذة في النظام</p>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث بالمستخدم، العملية، أو الهدف..."
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
                <TableHead className="text-right font-bold text-primary">المستخدم</TableHead>
                <TableHead className="text-right font-bold text-primary">العملية</TableHead>
                <TableHead className="text-right font-bold text-primary">التفاصيل / الهدف</TableHead>
                <TableHead className="text-right font-bold text-primary">التاريخ والوقت</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{log.user}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{log.role}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getActionBadge(log.type)}
                    <span className="mr-2 text-sm font-bold text-primary">{log.action}</span>
                  </TableCell>
                  <TableCell className="text-sm font-bold text-muted-foreground">
                    {log.target}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-primary">{log.date}</span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.time}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">
                    لا توجد عمليات مسجلة تطابق البحث
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
      
      <Card className="p-6 border-none shadow-lg bg-primary/5 border-r-4 border-primary rounded-2xl">
        <div className="flex gap-4">
          <History className="w-6 h-6 text-primary shrink-0" />
          <div className="text-right">
            <h4 className="font-bold text-primary">ملاحظة الأمان</h4>
            <p className="text-sm text-muted-foreground font-medium">سجلات العمليات يتم الاحتفاظ بها لمدة سنة كاملة لأغراض التدقيق والمراجعة، ولا يمكن حذفها أو تعديلها من قبل أي مستخدم.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
