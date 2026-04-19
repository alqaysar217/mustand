
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  TrendingUp, 
  ChevronLeft,
  Calendar,
  Sparkles,
  Eye,
  Download
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

const stats = [
  { label: 'إجمالي الاختبارات', value: 12, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'آخر مادة مضافة', value: 'برمجة 2', icon: Sparkles, color: 'text-purple-600', bg: 'bg-purple-100' },
  { label: 'آخر تحديث', value: 'منذ يومين', icon: Clock, color: 'text-green-600', bg: 'bg-green-100' },
];

const LATEST_EXAMS = [
  { id: '1', subject: 'برمجة 2', year: '2023 / 2024', term: 'الفصل الأول', date: '2024-05-15', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '2', subject: 'رياضيات 1', year: '2023 / 2024', term: 'الفصل الأول', date: '2024-05-20', fileUrl: PlaceHolderImages[1].imageUrl },
  { id: '3', subject: 'فيزياء عامة', year: '2022 / 2023', term: 'الفصل الثاني', date: '2024-05-18', fileUrl: PlaceHolderImages[1].imageUrl },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<string | null>(null);

  useEffect(() => {
    setCurrentTime(new Date().toLocaleDateString('ar-EG-u-nu-latn', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  return (
    <div className="space-y-8 text-right">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">مرحباً بك، أحمد!</h1>
          <p className="text-muted-foreground font-bold">هذا هو ملخص نشاطك الأكاديمي اليوم</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border shadow-sm flex items-center gap-2 self-start md:self-auto">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-primary">{currentTime || '...'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-none shadow-xl rounded-2xl bg-white hover:-translate-y-1 transition-all">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 shadow-sm`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <h3 className="text-muted-foreground text-xs font-bold mb-1">{stat.label}</h3>
            <p className="text-2xl font-black text-primary">{typeof stat.value === 'number' ? stat.value.toLocaleString('en-US') : stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              أحدث الاختبارات المضافة
            </h2>
            <Button variant="ghost" className="text-secondary font-bold" onClick={() => router.push('/student/exams')}>
              عرض الكل
              <ChevronLeft className="w-4 h-4 mr-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {LATEST_EXAMS.map((exam) => (
              <Card key={exam.id} className="overflow-hidden border-none shadow-xl rounded-2xl bg-white group">
                <div className="relative aspect-[16/9] bg-muted">
                  <Image src={exam.fileUrl} alt={exam.subject} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Button size="sm" className="rounded-xl gradient-blue font-bold" onClick={() => router.push(`/student/viewer/${exam.id}`)}>
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                  </div>
                </div>
                <div className="p-5 text-right">
                  <h4 className="font-bold text-primary mb-1">{exam.subject}</h4>
                  <p className="text-xs text-muted-foreground font-bold mb-3">{exam.year} - {exam.term}</p>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {exam.date}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-secondary gap-1 rounded-lg">
                      <Download className="w-3 h-3" />
                      تحميل
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-primary">نصائح دراسية</h2>
          <Card className="p-8 border-none shadow-xl rounded-2xl gradient-blue text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-4">استعد للامتحان!</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                مراجعة الاختبارات السابقة هي أفضل وسيلة لفهم نمط الأسئلة. لقد قمنا بأرشفة أكثر من 12 اختباراً في تخصصك هذا الفصل.
              </p>
              <Button className="bg-white text-primary hover:bg-white/90 rounded-xl font-bold w-full h-11">
                ابدأ المراجعة الآن
              </Button>
            </div>
            <TrendingUp className="absolute -bottom-6 -left-6 w-32 h-32 opacity-10" />
          </Card>

          <Card className="p-6 border-none shadow-xl rounded-2xl bg-white">
            <h3 className="font-bold text-primary mb-4">مواعيد هامة</h3>
            <div className="space-y-4">
              {[
                { title: 'بدء امتحانات الترم', date: '15 يونيو 2024', color: 'bg-blue-500' },
                { title: 'آخر موعد للأرشفة', date: '30 يونيو 2024', color: 'bg-green-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                  <div className={`w-1 h-8 rounded-full ${item.color}`}></div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">{item.title}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
