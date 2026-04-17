
"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search as SearchIcon, 
  Filter, 
  History, 
  BookOpen,
  Calendar
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const searchSuggestions = [
  'أحمد محمود علي', 'رياضيات 1', '20210045', 'فيزياء عامة', '2023 / 2024'
];

export default function SearchPage() {
  const [isSearching, setIsSearching] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  useEffect(() => {
    // Generates the last 5 years of study automatically based on today’s date
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1} / ${year}`);
    }
    setAcademicYears(years);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in max-w-6xl mx-auto">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-primary mb-4">البحث المتقدم</h1>
          <p className="text-muted-foreground">ابحث في آلاف الملفات المؤرشفة باستخدام محركنا الذكي</p>
        </div>

        <div className="relative mb-12 max-w-3xl mx-auto">
          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-primary">
            <SearchIcon className="w-6 h-6" />
          </div>
          <input 
            type="text" 
            placeholder="ابحث برقم القيد، اسم الطالب، أو المادة..." 
            className="w-full h-16 pr-16 pl-32 rounded-3xl border-none shadow-2xl text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-white"
            onFocus={() => setIsSearching(true)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <Button className="h-10 px-6 rounded-2xl font-bold gradient-blue shadow-lg">ابحث الآن</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-1 p-6 border-none shadow-xl rounded-3xl bg-white h-fit">
            <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-secondary" />
              مرشحات البحث
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">السنة الدراسية</label>
                <select className="w-full h-11 px-3 rounded-xl border border-border bg-muted/10 outline-none text-sm">
                  <option value="all">الكل</option>
                  {academicYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">الفصل الدراسي</label>
                <div className="flex flex-wrap gap-2">
                  {['الكل', 'الفصل الأول', 'الفصل الثاني', 'الفصل التكميلي'].map(t => (
                    <button 
                      key={t} 
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors", 
                        t === 'الكل' ? "bg-primary text-white" : "bg-muted hover:bg-muted/70 text-primary"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">التخصص / القسم</label>
                <select className="w-full h-11 px-3 rounded-xl border border-border bg-muted/10 outline-none text-sm">
                  <option>تقنية المعلومات</option>
                  <option>هندسة البرمجيات</option>
                  <option>علوم الحاسوب</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground">المادة</label>
                <input type="text" placeholder="اسم المادة..." className="w-full h-11 px-3 rounded-xl border border-border bg-muted/10 outline-none text-sm" />
              </div>

              <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-2 text-primary border-primary hover:bg-primary/5 mt-4">إعادة ضبط</Button>
            </div>
          </Card>

          <div className="lg:col-span-3 space-y-8">
            {isSearching ? (
               <div className="space-y-4">
                 <h4 className="text-lg font-bold text-primary">نتائج البحث (12)</h4>
                 {[1, 2, 3].map(i => (
                   <Card key={i} className="p-6 border-none shadow-lg rounded-3xl bg-white hover:border-primary/20 border-2 border-transparent transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-20 bg-muted/30 rounded-xl flex-shrink-0 relative overflow-hidden">
                          <Image src={PlaceHolderImages[1].imageUrl} alt="Exam" fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-bold text-primary text-lg">أحمد محمود علي</h5>
                            <span className="text-xs font-bold text-secondary">رقم القيد: 20210045</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> رياضيات 1</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> 2023 / 2024</span>
                          </div>
                        </div>
                        <Button className="rounded-xl gradient-blue h-10 px-6 font-bold shadow-lg">عرض</Button>
                      </div>
                   </Card>
                 ))}
               </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
                    <History className="w-5 h-5 text-secondary" />
                    عمليات بحث أخيرة
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {searchSuggestions.map(s => (
                      <button key={s} className="px-4 py-2 bg-white rounded-full border border-border shadow-sm text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 p-10 rounded-3xl border border-primary/10 text-center">
                  <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/10">
                    <SearchIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold text-primary mb-2">ابدأ البحث الآن</h4>
                  <p className="text-muted-foreground max-w-sm mx-auto">استخدم شريط البحث أعلاه للعثور على أي ملف في ثوانٍ معدودة.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
