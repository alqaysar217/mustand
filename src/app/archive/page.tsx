
"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  List, 
  Eye, 
  Download, 
  Filter, 
  Search,
  MoreVertical,
  Calendar
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";

const mockArchives = [
  { id: '1', name: 'أحمد محمود علي', regId: '20210045', subject: 'رياضيات 1', year: '2024', term: 'الفصل الأول', date: '2024-05-20' },
  { id: '2', name: 'سارة خالد يوسف', regId: '20220112', subject: 'فيزياء عامة', year: '2023', term: 'الفصل الثاني', date: '2024-05-18' },
  { id: '3', name: 'وليد جاسم مرزوق', regId: '20210567', subject: 'برمجة 2', year: '2024', term: 'الفصل الأول', date: '2024-05-15' },
  { id: '4', name: 'مريم سعيد سالم', regId: '20230001', subject: 'اللغة الإنجليزية', year: '2024', term: 'الفصل التكميلي', date: '2024-05-10' },
  { id: '5', name: 'فيصل عبدالرحمن', regId: '20210089', subject: 'كيمياء عضوية', year: '2023', term: 'الفصل الثاني', date: '2024-05-08' },
  { id: '6', name: 'نورة عيسى محمد', regId: '20220334', subject: 'مقدمة حاسب', year: '2024', term: 'الفصل الأول', date: '2024-05-05' },
];

export default function ArchivePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1">الأرشيف الرقمي</h1>
            <p className="text-muted-foreground">استعرض وابحث في جميع الاختبارات المؤرشفة</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border">
            <Button 
              variant={view === 'grid' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('grid')}
              className="rounded-xl px-4"
            >
              <LayoutGrid className="w-4 h-4 ml-2" />
              شبكة
            </Button>
            <Button 
              variant={view === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setView('list')}
              className="rounded-xl px-4"
            >
              <List className="w-4 h-4 ml-2" />
              قائمة
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-lg border-none mb-10 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="ابحث باسم الطالب، رقم القيد، أو المادة..." 
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" className="h-12 rounded-xl gap-2 font-bold px-6 border-2">
            <Filter className="w-4 h-4" />
            تصفية النتائج
          </Button>
        </div>

        {view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {mockArchives.map((item) => (
              <Card key={item.id} className="group overflow-hidden border-none shadow-xl rounded-3xl bg-white hover:-translate-y-2 transition-all">
                <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                  <Image 
                    src={PlaceHolderImages[1].imageUrl} 
                    alt="Exam Preview" 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end gap-3">
                    <Button className="w-full rounded-xl bg-white text-primary hover:bg-white/90 font-bold">
                      <Eye className="w-4 h-4 ml-2" />
                      عرض الاختبار
                    </Button>
                    <Button variant="outline" className="w-full rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 font-bold backdrop-blur-md">
                      <Download className="w-4 h-4 ml-2" />
                      تحميل PDF
                    </Button>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary/80 backdrop-blur-md border-none">{item.term} {item.year}</Badge>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-primary truncate mb-1">{item.name}</h3>
                  <p className="text-sm text-secondary font-bold mb-4">{item.subject}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </div>
                    <div className="flex items-center gap-1 font-bold">
                      ID: {item.regId}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-primary border-b">
                    <th className="p-6 font-bold">اسم الطالب</th>
                    <th className="p-6 font-bold">رقم القيد</th>
                    <th className="p-6 font-bold">المادة</th>
                    <th className="p-6 font-bold">الفصل / السنة</th>
                    <th className="p-6 font-bold">تاريخ الأرشفة</th>
                    <th className="p-6 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockArchives.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary">
                            {item.name[0]}
                          </div>
                          <span className="font-bold text-primary">{item.name}</span>
                        </div>
                      </td>
                      <td className="p-6 font-mono text-muted-foreground">{item.regId}</td>
                      <td className="p-6 text-secondary font-bold">{item.subject}</td>
                      <td className="p-6">
                        <span className="text-xs bg-muted px-3 py-1 rounded-full">{item.term} {item.year}</span>
                      </td>
                      <td className="p-6 text-xs text-muted-foreground">{item.date}</td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-2">
                           <Button variant="ghost" size="icon" className="rounded-xl text-primary hover:bg-primary/5"><Eye className="w-4 h-4" /></Button>
                           <Button variant="ghost" size="icon" className="rounded-xl text-secondary hover:bg-secondary/5"><Download className="w-4 h-4" /></Button>
                           <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:bg-muted"><MoreVertical className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
