"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

// Firebase Imports
import { useFirestore, useCollection, useStorage } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState({ id: '', name: '' });
  const [formData, setFormData] = useState({ year: '', term: 'الفصل الأول', subjectId: '', subjectName: '' });
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();
  const storage = useStorage();
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const { data: subjects = [] } = useCollection(subjectsQuery);

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
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      const readers = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newFiles => {
        setFiles(prev => [...prev, ...newFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };

  const handleOCR = async () => {
    if (files.length === 0) return;
    setLoading(true);
    try {
      // محاولة استخراج البيانات باستخدام الذكاء الاصطناعي
      const result = await extractExamDetails({ examImageDataUri: files[0] });
      
      // تحديث البيانات المستخرجة في حالة النجاح
      setExtractedData({
        id: result.studentRegistrationId || '',
        name: result.studentName || ''
      });
      
      // الانتقال للخطوة التالية (التأكيد)
      nextStep();
    } catch (err: any) {
      // في حالة الفشل، نظهر رسالة الخطأ ونسمح للمستخدم بالإكمال يدوياً
      toast({
        variant: "destructive",
        title: "خطأ في التحليل",
        description: err.message || "فشل التحليل الذكي. يمكنك إدخال البيانات يدوياً الآن.",
      });
      
      // ضمان تصفير البيانات لتمكين الإدخال اليدوي النظيف
      setExtractedData({ id: '', name: '' });
      
      // ننتقل للخطوة الأخيرة (خطوة 5) للسماح بالإدخال اليدوي فوراً
      setStep(5);
    } finally {
      // إيقاف مؤشر التحميل في كل الأحوال لضمان عدم تجمد الواجهة
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!firestore || !storage || !extractedData.id || !formData.subjectName || files.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى التأكد من إدخال اسم الطالب والمادة ورفع الملفات." });
      return;
    }

    setLoading(true);
    try {
      const fileName = `exams/${extractedData.id}_${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      await uploadString(storageRef, files[0], 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);

      const archiveData = {
        studentRegId: extractedData.id,
        studentName: extractedData.name,
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        year: formData.year,
        term: formData.term,
        fileUrl: downloadUrl,
        pages: files.length,
        uploadedAt: serverTimestamp()
      };

      await addDoc(collection(firestore, "archives"), archiveData);
      
      toast({ title: "تمت الأرشفة بنجاح", description: "تم رفع الملف وحفظ البيانات في السجل المركزي." });
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error("Archive error:", error);
      toast({ variant: "destructive", title: "فشل الأرشفة", description: "حدث خطأ أثناء محاولة رفع الملف." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in max-w-4xl mx-auto text-right",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )} dir="rtl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">أرشفة اختبار جديد</h1>
          <p className="text-muted-foreground">اتبع الخطوات لرفع وتحليل الاختبار رقمياً</p>
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
                {s === 1 && 'المعلومات'}
                {s === 2 && 'الصور'}
                {s === 3 && 'المعاينة'}
                {s === 4 && 'التحليل'}
                {s === 5 && 'تأكيد'}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white overflow-hidden min-h-[450px] flex flex-col">
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />

          {step === 1 && (
            <div className="space-y-6 animate-slide-up flex-1">
              <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2 justify-start">
                <Info className="w-6 h-6 text-secondary" />
                المعلومات الأكاديمية
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary block">السنة الدراسية</label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 outline-none font-bold text-right"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-primary block">الفصل الدراسي</label>
                  <select 
                    value={formData.term}
                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 outline-none font-bold text-right"
                  >
                    <option value="الفصل الأول">الفصل الأول</option>
                    <option value="الفصل الثاني">الفصل الثاني</option>
                    <option value="الفصل التكميلي">الفصل التكميلي</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-bold text-primary block">المادة الدراسية</label>
                  <select 
                    value={formData.subjectId}
                    onChange={(e) => {
                      const sel = subjects.find((s: any) => s.id === e.target.value) as any;
                      setFormData({...formData, subjectId: e.target.value, subjectName: sel?.name || ""});
                    }}
                    className="w-full h-12 px-4 rounded-xl border bg-muted/20 outline-none font-bold text-right"
                  >
                    <option value="">اختر المادة ....</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.departmentName})</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-lg h-64 border-4 border-dashed border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
              >
                <div className="p-6 bg-primary/5 rounded-full group-hover:scale-110 transition-transform">
                  <FileUp className="w-12 h-12 text-primary" />
                </div>
                <div className="text-center px-4">
                  <p className="text-lg font-bold text-primary">اضغط لرفع صور ورقة الاختبار</p>
                  <p className="text-sm text-muted-foreground font-bold">يمكنك اختيار ملفات متعددة</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up flex-1">
               <h2 className="text-xl font-bold text-primary mb-6 text-right">معاينة الصفحات المختارة</h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {files.map((f, i) => (
                   <div key={i} className="relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 shadow-md">
                     <Image src={f} alt="Page" fill className="object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="destructive" className="rounded-full" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                     </div>
                   </div>
                 ))}
                 <button onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-all">
                    <Plus className="w-8 h-8 text-primary/50" />
                    <span className="text-xs font-bold text-primary/50">إضافة صفحة</span>
                 </button>
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up text-center space-y-8">
              <div className="relative">
                <div className="w-32 h-32 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Scan className="w-16 h-16 text-secondary" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">استخراج البيانات الذكي</h2>
                <p className="text-muted-foreground max-w-sm mx-auto font-bold">سيقوم الذكاء الاصطناعي الآن بقراءة رقم القيد واسم الطالب من الصفحة الأولى.</p>
              </div>
              <Button onClick={handleOCR} disabled={loading} className="h-14 px-10 rounded-2xl text-lg font-bold gradient-blue shadow-xl">
                {loading ? <Loader2 className="w-6 h-6 animate-spin ml-2" /> : null}
                بدء القراءة التلقائية
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up flex-1 space-y-8">
               <div className="flex items-center gap-4 bg-green-50 p-6 rounded-3xl border border-green-100 flex-row-reverse">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-green-700">تأكيد البيانات</h2>
                    <p className="text-green-600 text-sm font-bold">يرجى مراجعة البيانات المستخرجة أو إدخالها يدوياً.</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold">رقم قيد الطالب</Label>
                    <input 
                      type="text" 
                      value={extractedData.id}
                      onChange={(e) => setExtractedData({...extractedData, id: e.target.value})}
                      placeholder="20210045"
                      className="w-full h-14 px-4 rounded-xl border focus:ring-2 focus:ring-primary outline-none font-bold text-right"
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold">اسم الطالب الرباعي</Label>
                    <input 
                      type="text" 
                      value={extractedData.name}
                      onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                      placeholder="أدخل اسم الطالب..."
                      className="w-full h-14 px-4 rounded-xl border focus:ring-2 focus:ring-primary outline-none font-bold text-right"
                    />
                  </div>
               </div>
            </div>
          )}

          <div className="mt-auto pt-8 flex items-center justify-between flex-row-reverse">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || loading}
              className="h-12 px-6 rounded-xl border-2 font-bold gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>

            {step < 5 ? (
              <Button 
                onClick={nextStep} 
                disabled={(step === 2 && files.length === 0) || (step === 1 && !formData.subjectId)}
                className="h-12 px-10 rounded-xl font-bold gap-2 gradient-blue"
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSaveToArchive}
                disabled={loading}
                className="h-12 px-10 rounded-xl font-bold gap-2 bg-green-600 hover:bg-green-700 shadow-xl"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                حفظ في الأرشيف
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <label className={cn("text-sm block", className)}>{children}</label>;
}
