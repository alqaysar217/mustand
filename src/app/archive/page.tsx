
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
  User as UserIcon,
  BookOpen,
  Building,
  Loader2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

const INITIAL_ARCHIVES = [
  { id: '1', name: 'أحمد محمود علي', regId: '20210045', subject: 'رياضيات 1', year: '2023 / 2024', term: 'الفصل الأول', department: 'تقنية المعلومات', date: '2024-05-20', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '2', name: 'سارة خالد يوسف', regId: '20220112', subject: 'فيزياء عامة', year: '2022 / 2023', term: 'الفصل الثاني', department: 'علوم الحاسوب', date: '2024-05-18', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '3', name: 'وليد جاسم مرزوق', regId: '20210567', subject: 'برمجة 2', year: '2023 / 2024', term: 'الفصل الأول', department: 'هندسة البرمجيات', date: '2024-05-15', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '4', name: 'مريم سعيد سالم', regId: '20230001', subject: 'اللغة الإنجليزية', year: '2023 / 2024', term: 'الفصل التكميلي', department: 'تقنية المعلومات', date: '2024-05-10', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '5', name: 'فيصل عبدالرحمن', regId: '20210089', subject: 'كيمياء عضوية', year: '2022 / 2023', term: 'الفصل الثاني', department: 'علوم الحاسوب', date: '2024-05-08', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '6', name: 'نورة عيسى محمد', regId: '20220334', subject: 'مقدمة حاسب', year: '2023 / 2024', term: 'الفصل الأول', department: 'تقنية المعلومات', date: '2024-05-05', fileUrl: PlaceHolderImages[1].imageUrl },
];

export default function ArchivePage() {
  const [archives, setArchives] = useState(INITIAL_ARCHIVES);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const [viewingExam, setViewingExam] = useState<any>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedTerm, setSelectedTerm] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1} / ${year}`);
    }
    setAcademicYears(years);
  }, []);

  const filteredResults = useMemo(() => {
    return archives.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.regId.includes(searchTerm) ||
        item.subject.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = selectedYear === "all" || item.year === selectedYear;
      const matchesTerm = selectedTerm === "all" || item.term === selectedTerm;
      const matchesDept = selectedDept === "all" || item.department === selectedDept;

      return matchesSearch && matchesYear && matchesTerm && matchesDept;
    });
  }, [archives, searchTerm, selectedYear, selectedTerm, selectedDept]);

  const handleApplyFilters = () => {
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setSelectedYear("all");
    setSelectedTerm("all");
    setSelectedDept("all");
    setSearchTerm("");
  };

  const handleDownload = async (item: any) => {
    if (!item?.fileUrl) return;
    setDownloadingId(item.id);
    try {
      toast({ title: "جاري التجهيز", description: `يتم الآن معالجة ملف: ${item.name}` });
      const response = await fetch(item.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/\s+/g, '_')}_${item.subject.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "تم التحميل بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل التحميل" });
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setArchives(prev => prev.filter(a => a.id !== itemToDelete.id));
    toast({ variant: "destructive", title: "تم الحذف بنجاح" });
    setItemToDelete(null);
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
            <h1 className="text-3xl font-bold text-primary mb-1 text-right">الأرشيف الرقمي</h1>
            <p className="text-muted-foreground text-right">استعرض وابحث في جميع الاختبارات المؤرشفة</p>
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
          <Button variant={showFilters ? "default" : "outline"} onClick={() => setShowFilters(!showFilters)} className="h-12 rounded-xl gap-2 font-bold px-6 border-2">
            <Filter className="w-4 h-4" />
            تصفية النتائج
          </Button>
        </div>

        {/* Results grid/list with transition-aware sizing */}
        <div className="animate-slide-up">
           {filteredResults.length > 0 ? (
             view === 'grid' ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                 {filteredResults.map((item) => (
                   <Card key={item.id} className="group overflow-hidden border-none shadow-xl rounded-3xl bg-white hover:-translate-y-2 transition-all">
                     <div className="relative aspect-[3/4] bg-muted/30 overflow-hidden">
                       <Image src={item.fileUrl} alt="Exam" fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end gap-2">
                         <Button onClick={() => setViewingExam(item)} className="w-full rounded-xl bg-white text-primary font-bold">عرض</Button>
                         <Button onClick={() => handleDownload(item)} variant="outline" className="w-full rounded-xl bg-white/10 text-white border-white/20 font-bold backdrop-blur-md">تحميل</Button>
                       </div>
                       <div className="absolute top-4 right-4">
                         <Badge className="bg-primary/80 backdrop-blur-md border-none">{item.term}</Badge>
                       </div>
                     </div>
                     <div className="p-6 text-right">
                       <h3 className="text-lg font-bold text-primary truncate mb-1">{item.name}</h3>
                       <p className="text-sm text-secondary font-bold mb-4">{item.subject}</p>
                       <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t pt-4">
                         <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</div>
                         <div className="font-bold">رقم القيد: {item.regId}</div>
                       </div>
                     </div>
                   </Card>
                 ))}
               </div>
             ) : (
               <Card className="border-none shadow-xl rounded-3xl bg-white overflow-hidden">
                 <div className="overflow-x-auto">
                   <table className="w-full text-right">
                     <thead><tr className="bg-muted/30 border-b"><th className="p-6">الطالب</th><th className="p-6">رقم القيد</th><th className="p-6">المادة</th><th className="p-6 text-center">إجراءات</th></tr></thead>
                     <tbody>
                       {filteredResults.map((item) => (
                         <tr key={item.id} className="border-b hover:bg-muted/10 transition-colors">
                           <td className="p-6 font-bold">{item.name}</td>
                           <td className="p-6 font-mono text-muted-foreground">{item.regId}</td>
                           <td className="p-6 text-secondary font-bold">{item.subject}</td>
                           <td className="p-6 text-center">
                             <Button size="icon" variant="ghost" onClick={() => setViewingExam(item)}><Eye className="w-4 h-4" /></Button>
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
                <p className="font-bold text-muted-foreground">لا توجد نتائج مطابقة لبحثك</p>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
