
"use client";

import { useState, useEffect, useMemo } from "react";
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
  Calendar,
  Loader2,
  Trash2
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { downloadFile } from "@/lib/storage-utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, deleteDoc, doc } from "firebase/firestore";

export default function ArchivePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [viewingExam, setViewingExam] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  
  const firestore = useFirestore();
  const archivesQuery = useMemo(() => firestore ? collection(firestore, "archives") : null, [firestore]);
  const { data: archives = [], loading } = useCollection(archivesQuery);

  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");

  const filteredResults = useMemo(() => {
    return (archives as any[]).filter(item => {
      const matchesSearch = 
        item.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.studentRegId?.includes(searchTerm) ||
        item.subjectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      const matchesTerm = selectedTerm === "all" || item.term === selectedTerm;

      return matchesSearch && matchesYear && matchesTerm;
    });
  }, [archives, searchTerm, selectedYear, selectedTerm]);

  const handleDownload = async (item: any) => {
    if (!item?.fileUrl) return;
    setDownloadingId(item.id);
    try {
      toast({ title: "جاري التحميل", description: `يتم معالجة ملف: ${item.studentName}` });
      const result = await downloadFile(item.fileUrl, `${item.studentName}_${item.subjectName}`);
      if (result.success) toast({ title: "تم التحميل بنجاح" });
      else throw result.error;
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحميل", description: "تعذر تحميل الملف من السحابة." });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, "archives", id));
      toast({ title: "تم الحذف", description: "تمت إزالة الملف من الأرشيف بنجاح." });
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل حذف الملف." });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-1 text-right">الأرشيف المركزي</h1>
            <p className="text-muted-foreground text-right">إدارة كافة الاختبارات المؤرشفة في السحابة</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border">
            <Button variant={view === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setView('grid')} className="rounded-xl px-4">
              <LayoutGrid className="w-4 h-4 ml-2" />
              شبكة
            </Button>
            <Button variant={view === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setView('list')} className="rounded-xl px-4">
              <List className="w-4 h-4 ml-2" />
              قائمة
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl shadow-lg border-none mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الطالب، رقم القيد، أو المادة..." 
              className="w-full h-12 pr-12 pl-4 rounded-xl border border-border bg-muted/20 outline-none focus:ring-2 focus:ring-primary text-right"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary opacity-20" /></div>
        ) : (
          <div className="animate-slide-up">
            {filteredResults.length > 0 ? (
              view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredResults.map((item) => (
                    <Card key={item.id} className="group overflow-hidden border-none shadow-xl rounded-2xl bg-white hover:-translate-y-2 transition-all">
                      <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                        <Image src={item.fileUrl || PlaceHolderImages[1].imageUrl} alt="Exam" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end gap-2">
                          <Button onClick={() => setViewingExam(item)} className="w-full rounded-xl bg-white text-primary font-bold">عرض</Button>
                          <Button 
                            disabled={downloadingId === item.id}
                            onClick={() => handleDownload(item)} 
                            variant="outline" 
                            className="w-full rounded-xl bg-white/10 text-white border-white/20 font-bold backdrop-blur-md"
                          >
                            {downloadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Download className="w-4 h-4 ml-2" />}
                            تحميل
                          </Button>
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-primary/80 backdrop-blur-md border-none">{item.term}</Badge>
                        </div>
                      </div>
                      <div className="p-6 text-right">
                        <div className="flex justify-between items-start mb-1">
                          <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                          <h3 className="text-lg font-bold text-primary truncate flex-1">{item.studentName}</h3>
                        </div>
                        <p className="text-sm text-secondary font-bold mb-4">{item.subjectName}</p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-4">
                          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.uploadedAt?.toDate ? item.uploadedAt.toDate().toLocaleDateString('en-GB') : 'قيد الأرشفة'}</div>
                          <div className="font-bold">رقم القيد: {item.studentRegId}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right">
                      <thead><tr className="bg-muted/30 border-b"><th className="p-6">الطالب</th><th className="p-6">رقم القيد</th><th className="p-6">المادة</th><th className="p-6 text-center">إجراءات</th></tr></thead>
                      <tbody>
                        {filteredResults.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-muted/10 transition-colors">
                            <td className="p-6 font-bold">{item.studentName}</td>
                            <td className="p-6 font-mono text-muted-foreground">{item.studentRegId}</td>
                            <td className="p-6 text-secondary font-bold">{item.subjectName}</td>
                            <td className="p-6 text-center flex justify-center gap-2">
                              <Button size="icon" variant="ghost" onClick={() => setViewingExam(item)}><Eye className="w-4 h-4 text-primary" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDownload(item)} disabled={downloadingId === item.id}><Download className="w-4 h-4 text-secondary" /></Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )
            ) : (
              <div className="py-20 text-center bg-white rounded-3xl shadow-lg border border-dashed">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="font-bold text-muted-foreground">لا توجد نتائج في الأرشيف السحابي</p>
              </div>
            )}
          </div>
        )}
      </main>

      <Dialog open={!!viewingExam} onOpenChange={(o) => !o && setViewingExam(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background">
          {viewingExam && (
            <div className="relative w-full h-[80vh]">
              <Image src={viewingExam.fileUrl || PlaceHolderImages[1].imageUrl} alt="Exam Full" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
