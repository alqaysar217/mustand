
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  X,
  ArrowRight
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

export default function ExamViewerPage() {
  const router = useRouter();
  const params = useParams();
  const [zoom, setZoom] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  // Mock exam data
  const exam = {
    id: params.id,
    subject: 'برمجة 2',
    year: '2023 / 2024',
    term: 'الفصل الأول',
    pages: [PlaceHolderImages[1].imageUrl, PlaceHolderImages[1].imageUrl, PlaceHolderImages[1].imageUrl, PlaceHolderImages[1].imageUrl, PlaceHolderImages[1].imageUrl]
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  return (
    <div className="fixed inset-0 bg-background z-[60] flex flex-col animate-fade-in" dir="rtl">
      {/* Viewer Header */}
      <header className="h-16 bg-white border-b px-4 md:px-8 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => router.back()}>
            <ArrowRight className="w-6 h-6 text-primary" />
          </Button>
          <div className="text-right">
            <h1 className="text-sm md:text-base font-bold text-primary truncate max-w-[150px] md:max-w-none">{exam.subject}</h1>
            <p className="text-[10px] text-muted-foreground font-bold">{exam.year} - {exam.term}</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-muted/30 p-1 rounded-2xl">
          <Button variant="ghost" size="icon" onClick={handleZoomOut} className="rounded-xl"><ZoomOut className="w-4 h-4" /></Button>
          <span className="text-xs font-black text-primary px-2">{Math.round(zoom * 100)}%</span>
          <Button variant="ghost" size="icon" onClick={handleZoomIn} className="rounded-xl"><ZoomIn className="w-4 h-4" /></Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl font-bold h-10 border-2 hidden sm:flex">
            <Share2 className="w-4 h-4 ml-2" />
            مشاركة
          </Button>
          <Button className="rounded-xl gradient-blue font-bold h-10 px-4 shadow-lg">
            <Download className="w-4 h-4 ml-2" />
            تحميل PDF
          </Button>
        </div>
      </header>

      {/* Viewer Content */}
      <div className="flex-1 overflow-auto bg-neutral-200 p-4 md:p-10 flex flex-col items-center">
        <div 
          className="relative bg-white shadow-2xl transition-transform duration-300 origin-top rounded-lg overflow-hidden max-w-4xl w-full aspect-[3/4]"
          style={{ transform: `scale(${zoom})` }}
        >
          <Image 
            src={exam.pages[currentPage - 1]} 
            alt={`Page ${currentPage}`} 
            fill 
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Viewer Footer / Controls */}
      <footer className="h-20 bg-white border-t px-6 flex items-center justify-between shrink-0 shadow-lg z-10">
        <div className="flex items-center gap-3">
          <Button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            variant="outline" 
            className="rounded-xl h-12 w-12 border-2 p-0"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex flex-col items-center min-w-[60px]">
            <span className="text-xs font-bold text-muted-foreground">الصفحة</span>
            <span className="text-lg font-black text-primary">{currentPage} / {totalPages}</span>
          </div>
          <Button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            variant="outline" 
            className="rounded-xl h-12 w-12 border-2 p-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </div>

        <div className="flex md:hidden items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleZoomOut} className="rounded-xl"><ZoomOut className="w-5 h-5" /></Button>
           <Button variant="ghost" size="icon" onClick={handleZoomIn} className="rounded-xl"><ZoomIn className="w-5 h-5" /></Button>
        </div>

        <p className="hidden md:block text-xs font-bold text-muted-foreground">
          استخدم أزرار التنقل أو اسحب للأسفل لاستعراض جميع الصفحات
        </p>
      </footer>
    </div>
  );
}
