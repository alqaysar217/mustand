
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Search as SearchIcon, 
  History, 
  FileText, 
  ChevronLeft,
  Sparkles,
  BookOpen,
  Calendar
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const RECENT_SEARCHES = ['برمجة 2', 'رياضيات', 'فيزياء', '2023'];

export default function StudentSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) setIsSearching(true);
  };

  return (
    <div className="space-y-10 text-right animate-fade-in max-w-4xl mx-auto pt-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-primary">البحث في الأرشيف</h1>
        <p className="text-muted-foreground font-bold">ابحث عن أي اختبار باستخدام اسم المادة أو السنة</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto group">
        <SearchIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary group-focus-within:scale-110 transition-transform" />
        <input 
          type="text" 
          placeholder="ابحث هنا..."
          className="w-full h-16 pr-16 pl-32 rounded-3xl border-none shadow-2xl text-lg font-bold outline-none focus:ring-4 focus:ring-primary/10 transition-all bg-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          <Button type="submit" className="h-10 px-6 rounded-2xl font-bold gradient-blue shadow-lg">ابحث</Button>
        </div>
      </form>

      {!isSearching ? (
        <div className="space-y-8 animate-slide-up">
          <div>
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-secondary" />
              عمليات بحث أخيرة
            </h3>
            <div className="flex flex-wrap gap-3">
              {RECENT_SEARCHES.map(s => (
                <button 
                  key={s} 
                  onClick={() => { setQuery(s); setIsSearching(true); }}
                  className="px-5 py-2.5 bg-white rounded-full border shadow-sm text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Card className="p-12 text-center border-none shadow-xl rounded-3xl bg-primary/5 border-dashed border-2 border-primary/20">
             <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                <Sparkles className="w-10 h-10 text-secondary" />
             </div>
             <h4 className="text-xl font-bold text-primary mb-2">استكشف مكتبتك الرقمية</h4>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto font-bold">يمكنك العثور على أي اختبار مؤرشف بسرعة فائقة من خلال محرك البحث الذكي.</p>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 animate-slide-up">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">نتائج البحث عن "{query}"</h3>
              <Button variant="ghost" onClick={() => setIsSearching(false)} className="text-xs font-bold text-muted-foreground">مسح النتائج</Button>
           </div>

           <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="p-4 border-none shadow-lg rounded-3xl bg-white hover:border-primary/10 border-2 border-transparent transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-20 bg-muted rounded-xl overflow-hidden relative flex-shrink-0">
                        <Image src={PlaceHolderImages[1].imageUrl} alt="Exam" fill className="object-cover" />
                     </div>
                     <div className="flex-1 text-right">
                        <h4 className="font-bold text-primary text-lg">برمجة {i + 1}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-bold mt-1">
                           <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> تقنية المعلومات</span>
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> 2023 / 2024</span>
                        </div>
                     </div>
                     <Button className="rounded-xl gradient-blue h-10 px-5 font-bold shadow-lg" onClick={() => router.push(`/student/viewer/${i}`)}>عرض</Button>
                  </div>
                </Card>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
