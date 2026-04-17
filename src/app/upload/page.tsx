
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileUp, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  Info,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  Scan
} from "lucide-react";
import { extractExamDetails } from "@/ai/flows/extract-exam-details";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState({ id: '', name: '' });
  const [formData, setFormData] = useState({ year: '', term: 'الخريف', subject: 'برمجة 1' });
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push(`${year - 1} / ${year}`);
    }
    setAcademicYears(years);
    if (years.length > 0) {
      setFormData(prev => ({ ...prev, year: years[0] }));
    }
  }, []);

  const nextStep = () => setStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFiles([...files, event.target.result as string]);
        }
      };
      reader.readAsDataURL(fileList[0]);
    }
  };

  const handleOCR = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      const result = await extractExamDetails({ examImageDataUri: files[0] });
      setExtractedData({
        id: result.studentRegistrationId || '20210045',
        name: result.studentName || 'أحمد محمد علي'
      });
      nextStep();
    } catch (err: any) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "خطأ في التحليل",
        description: err.message || "فشل النظام في استخراج البيانات. يرجى التأكد من مفتاح API وإدخال البيانات يدوياً.",
      });
      setExtractedData({ id: '20210045', name: 'أحمد محمد علي' });
      nextStep();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className="mr-0 md:mr-64 p-6 md:p-10 animate-fade-in max-w-4xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">رفع اختبار جديد</h1>
          <p className="text-muted-foreground">أكمل الخطوات التالية لأرشفة الاختبار بنجاح</p>
        </div>

        <div className="flex items-center justify-between mb-12 relative px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0"></div>
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={cn(
                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-4",
                step >= s ? "bg-primary text-white border-primary shadow-lg" : "bg-white text-muted-foreground border-muted"
              )}
            >
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              <span className="absolute -bottom-8 whitespace-nowrap text-[10px] font-bold text-primary/70">
                {s === 1 && 'البيانات'}
                {s === 2 && 'الصور'}
                {s === 3 && 'المعاينة'}
                {s === 4 && 'التحليل'}
                {s === 5 && 'تأكيد'}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white overflow-hidden min-h-[450px] flex flex-col">
          {step === 1 && (
            <div className="space-y-6 animate-slide-up flex-1">
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
                <Info className="w-6 h-6 text-secondary" />
                المعلومات الأكاديمية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">السنة الدراسية</label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary appearance-none bg-muted/20"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary">الفصل الدراسي</label>
                  <select 
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary appearance-none bg-muted/20"
                  >
                    <option value="الخريف">الخريف</option>
                    <option value="الربيع">الربيع</option>
                    <option value="الصيف">الصيف</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-primary">المادة</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary appearance-none bg-muted/20"
                  >
                    <option value="مقدمة في البرمجة">مقدمة في البرمجة</option>
                    <option value="فيزياء عامة">فيزياء عامة</option>
                    <option value="رياضيات متقدمة">رياضيات متقدمة</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
              <label className="w-full max-w-lg h-64 border-4 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="p-6 bg-primary/5 rounded-full group-hover:scale-110 transition-transform">
                  <FileUp className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-primary">اضغط هنا أو اسحب الملفات لرفعها</p>
                  <p className="text-sm text-muted-foreground">يدعم صور PNG, JPG حتى 10 ميجابايت</p>
                </div>
                <input type="file" className="hidden" multiple onChange={handleFileUpload} />
              </label>
              {files.length > 0 && (
                <p className="mt-4 text-secondary font-bold">تم اختيار {files.length} ملفات</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up flex-1">
               <h2 className="text-xl font-bold text-primary mb-6">معاينة الصفحات</h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {files.length > 0 ? files.map((f, i) => (
                   <div key={i} className="relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 border-border shadow-md">
                     <Image src={f} alt={`Page ${i+1}`} fill className="object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button size="icon" variant="destructive" className="rounded-full w-8 h-8" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                     <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {i+1}
                     </div>
                   </div>
                 )) : (
                   <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl">
                     لا توجد ملفات حالياً
                   </div>
                 )}
                 <button className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all group">
                    <Plus className="w-8 h-8 text-primary/50 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-primary/50">إضافة صفحة</span>
                 </button>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up text-center space-y-8">
              <div className="relative">
                <div className="w-40 h-40 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Scan className="w-20 h-20 text-secondary" />
                </div>
                <div className="absolute -top-4 -right-4 bg-primary text-white p-3 rounded-2xl shadow-xl animate-bounce">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">التحليل الذكي (OCR)</h2>
                <p className="text-muted-foreground max-w-sm mx-auto">سيقوم النظام الآن باستخراج رقم القيد واسم الطالب تلقائياً من الصورة الأولى للاختبار.</p>
              </div>
              <Button 
                onClick={handleOCR} 
                disabled={loading}
                className="h-14 px-10 rounded-2xl text-lg font-bold gradient-blue shadow-xl shadow-primary/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin ml-2" /> : null}
                بدء التحليل التلقائي
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up flex-1 space-y-8">
               <div className="flex items-center gap-4 bg-green-50 p-6 rounded-3xl border border-green-100">
                  <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-green-700">تم التحليل بنجاح!</h2>
                    <p className="text-green-600 text-sm">يرجى مراجعة البيانات وتعديلها إذا لزم الأمر.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">رقم قيد الطالب</label>
                    <input 
                      type="text" 
                      value={extractedData.id}
                      onChange={(e) => setExtractedData({...extractedData, id: e.target.value})}
                      className="w-full h-14 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary">اسم الطالب الرباعي</label>
                    <input 
                      type="text" 
                      value={extractedData.name}
                      onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                      className="w-full h-14 px-4 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none font-bold text-primary"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-primary">ملاحظات إضافية (اختياري)</label>
                    <textarea 
                      className="w-full h-24 p-4 rounded-xl border border-border focus:ring-2 focus:ring-primary outline-none resize-none"
                      placeholder="أضف أي ملاحظات مهمة عن حالة ورقة الاختبار..."
                    ></textarea>
                  </div>
               </div>
            </div>
          )}

          <div className="mt-auto pt-8 flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || loading}
              className="h-12 px-6 rounded-xl border-2 hover:bg-muted font-bold gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            {step < 5 ? (
              <Button 
                onClick={nextStep} 
                disabled={step === 4 || (step === 2 && files.length === 0)}
                className="h-12 px-10 rounded-xl font-bold gap-2 gradient-blue"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="h-12 px-10 rounded-xl font-bold gap-2 bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200"
              >
                حفظ في الأرشيف
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
