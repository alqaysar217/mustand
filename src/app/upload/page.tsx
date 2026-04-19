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
  Scan,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { extractExamDetails } from "@/ai/flows/extract-exam-details";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

// Firebase Imports
import { useFirestore, useCollection, useStorage } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export default function UploadPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState({ id: '', name: '', found: false });
  const [formData, setFormData] = useState({ year: '', subjectId: '', subjectName: '', deptId: '', level: '', term: '' });
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();
  const storage = useStorage();
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const { data: subjects = [] } = useCollection(subjectsQuery);

  // توليد الأعوام الدراسية ديناميكياً (من 2020 حتى العام القادم)
  useEffect(() => {
    const startYear = 2020;
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = startYear; year <= currentYear + 1; year++) {
      years.push(`${year} / ${year + 1}`);
    }
    setAcademicYears(years.reverse()); // الأحدث أولاً
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
        if (step === 2 && newFiles.length > 0) nextStep();
      });
    }
  };

  const handleOCR = async () => {
    if (files.length === 0 || !firestore) return;
    setLoading(true);
    try {
      // 1. استخراج رقم القيد والاسم من الصورة باستخدام AI
      const result = await extractExamDetails({ examImageDataUri: files[0] });
      const regId = result.studentRegistrationId?.trim() || '';
      
      // 2. مطابقة رقم القيد مع قاعدة بيانات الطلاب لدينا
      const studentsRef = collection(firestore, "students");
      const q = query(studentsRef, where("regId", "==", regId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0].data();
        setExtractedData({
          id: regId,
          name: studentDoc.name,
          found: true
        });
        toast({
          title: "تم التعرف على الطالب",
          description: `تمت مطابقة رقم القيد مع سجلات: ${studentDoc.name}`,
        });
      } else {
        setExtractedData({
          id: regId,
          name: result.studentName || '',
          found: false
        });
        toast({
          variant: "destructive",
          title: "طالب غير مسجل",
          description: "تم استخراج البيانات ولكن رقم القيد غير موجود في قاعدة البيانات.",
        });
      }
      
      setStep(5); // الانتقال مباشرة لواجهة التأكيد
    } catch (err: any) {
      console.warn("AI Analysis Fallback triggered:", err.message);
      toast({
        variant: "destructive",
        title: "تنبيه النظام",
        description: "لم نتمكن من تحليل الملف تلقائياً، يرجى إدخال البيانات يدوياً.",
      });
      setStep(5); 
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!firestore || !storage || !extractedData.id || !formData.subjectName || files.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى التأكد من إدخال رقم القيد واسم الطالب ورفع الصور." });
      return;
    }

    setLoading(true);
    try {
      const fileName = `archives/${formData.year.replace(/\s/g, '')}/${formData.subjectName}/${extractedData.id}_${Date.now()}.jpg`;
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
        departmentId: formData.deptId,
        fileUrl: downloadUrl,
        pages: files.length,
        uploadedAt: serverTimestamp()
      };

      await addDoc(collection(firestore, "archives"), archiveData);
      
      toast({ title: "تمت الأرشفة بنجاح", description: `تم حفظ اختبار الطالب ${extractedData.name} سحابياً.` });
      
      // العودة لخطوة الرفع لمواصلة العمل على نفس المادة والسنة
      setFiles([]);
      setExtractedData({ id: '', name: '', found: false });
      setStep(2); 
    } catch (error: any) {
      console.error("Archive error:", error);
      toast({ variant: "destructive", title: "فشل الحفظ", description: "حدث خطأ أثناء محاولة مزامنة البيانات مع السحابة." });
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
          <h1 className="text-3xl font-black text-primary mb-2">أرشفة رقمية ذكية</h1>
          <p className="text-muted-foreground font-bold">نظام استخراج البيانات والمطابقة السحابية التلقائية</p>
        </div>

        {/* Breadcrumbs / Progress */}
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
              <span className={cn(
                "absolute -bottom-8 whitespace-nowrap text-[10px] font-black",
                step >= s ? "text-primary" : "text-muted-foreground"
              )}>
                {s === 1 && 'السياق'}
                {s === 2 && 'الرفع'}
                {s === 3 && 'المعاينة'}
                {s === 4 && 'التحليل'}
                {s === 5 && 'التأكيد'}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-8 border-none shadow-2xl rounded-3xl bg-white overflow-hidden min-h-[480px] flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-black text-primary animate-pulse">جاري معالجة البيانات سحابياً...</p>
            </div>
          )}
          
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />

          {step === 1 && (
            <div className="space-y-8 animate-slide-up flex-1">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-primary/5 rounded-xl">
                  <Info className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-primary">تحديد سياق الاختبار</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-black text-primary mr-1">العام الجامعي</label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full h-14 px-4 rounded-2xl border-2 border-muted bg-muted/20 outline-none font-black text-primary focus:border-primary transition-all text-right"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-black text-primary mr-1">المادة الدراسية (مرتبطة بالتخصص)</label>
                  <select 
                    value={formData.subjectId}
                    onChange={(e) => {
                      const sel = subjects.find((s: any) => s.id === e.target.value) as any;
                      setFormData({
                        ...formData, 
                        subjectId: e.target.value, 
                        subjectName: sel?.nameAr || "",
                        deptId: sel?.departmentId || "",
                        level: sel?.level || "",
                        term: sel?.term || ""
                      });
                    }}
                    className="w-full h-14 px-4 rounded-2xl border-2 border-muted bg-muted/20 outline-none font-black text-primary focus:border-primary transition-all text-right"
                  >
                    <option value="">اختر المادة الدراسية ...</option>
                    {subjects.map((s: any) => (
                      <option key={s.id} value={s.id}>{s.nameAr} - {s.departmentName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {formData.subjectId && (
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 grid grid-cols-3 gap-4 animate-fade-in">
                   <div className="text-center">
                     <p className="text-[10px] font-bold text-muted-foreground mb-1">المستوى</p>
                     <p className="font-black text-primary">{formData.level}</p>
                   </div>
                   <div className="text-center border-x border-primary/10">
                     <p className="text-[10px] font-bold text-muted-foreground mb-1">الفصل الدراسي</p>
                     <p className="font-black text-primary">{formData.term}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[10px] font-bold text-muted-foreground mb-1">حالة التخزين</p>
                     <p className="font-black text-green-600">سحابي نشط</p>
                   </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-lg h-72 border-4 border-dashed border-primary/20 rounded-[40px] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-inner"
              >
                <div className="p-8 bg-primary/5 rounded-full group-hover:scale-110 transition-transform shadow-sm">
                  <FileUp className="w-16 h-16 text-primary" />
                </div>
                <div className="text-center px-6">
                  <p className="text-2xl font-black text-primary mb-2">رفع ورقة الاختبار</p>
                  <p className="text-sm text-muted-foreground font-bold">يمكنك اختيار صور متعددة لورقة واحدة</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up flex-1">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-black text-primary">معاينة صفحات الاختبار</h2>
                 <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="rounded-xl font-black text-secondary gap-2">
                   <Plus className="w-4 h-4" />
                   إضافة صفحة أخرى
                 </Button>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                 {files.map((f, i) => (
                   <div key={i} className="relative group aspect-[3/4] rounded-2xl overflow-hidden border-2 border-muted shadow-lg">
                     <Image src={f} alt="Page" fill className="object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button size="icon" variant="destructive" className="rounded-full w-12 h-12 shadow-xl" onClick={() => setFiles(files.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                     </div>
                     <div className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-black">
                       صفحة {i + 1}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up text-center space-y-10">
              <div className="relative">
                <div className="w-40 h-40 bg-secondary/10 rounded-full flex items-center justify-center shadow-inner">
                  <Scan className="w-20 h-20 text-secondary" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-primary/10">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="max-w-md">
                <h2 className="text-3xl font-black text-primary mb-3">التحليل والمطابقة الذكية</h2>
                <p className="text-muted-foreground font-bold leading-relaxed">سيقوم النظام بقراءة رقم القيد ومطابقته فوراً مع قاعدة بيانات الطلاب المسجلين لجلب الاسم والتخصص بدقة 100%.</p>
              </div>
              <Button onClick={handleOCR} disabled={loading} className="h-16 px-12 rounded-2xl text-xl font-black gradient-blue shadow-2xl hover:scale-105 transition-transform">
                {loading ? <Loader2 className="w-7 h-7 animate-spin ml-3" /> : <Scan className="w-7 h-7 ml-3" />}
                بدء القراءة والمطابقة
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up flex-1 space-y-10">
               <div className={cn(
                 "flex items-center gap-5 p-8 rounded-[32px] border-2 flex-row-reverse shadow-sm transition-all",
                 extractedData.found ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
               )}>
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm",
                    extractedData.found ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  )}>
                    {extractedData.found ? <UserCheck className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                  </div>
                  <div className="text-right flex-1">
                    <h2 className={cn("text-2xl font-black mb-1", extractedData.found ? "text-green-800" : "text-orange-800")}>
                      {extractedData.found ? "تمت المطابقة بنجاح" : "لم يتم العثور على الطالب"}
                    </h2>
                    <p className={cn("text-sm font-bold", extractedData.found ? "text-green-600" : "text-orange-600")}>
                      {extractedData.found ? "تم جلب البيانات الرسمية من قاعدة البيانات المركزية." : "يرجى مراجعة رقم القيد أو الاسم وإدخالهما يدوياً."}
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 text-right">
                    <label className="text-sm font-black text-primary block mr-1">رقم قيد الطالب (مستخرج)</label>
                    <input 
                      type="text" 
                      value={extractedData.id}
                      onChange={(e) => setExtractedData({...extractedData, id: e.target.value})}
                      placeholder="أدخل رقم القيد..."
                      className="w-full h-16 px-6 rounded-2xl border-2 border-muted focus:border-primary outline-none font-black text-primary text-lg text-right shadow-sm"
                    />
                  </div>
                  <div className="space-y-3 text-right">
                    <label className="text-sm font-black text-primary block mr-1">اسم الطالب الرباعي (مطابق)</label>
                    <input 
                      type="text" 
                      value={extractedData.name}
                      onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                      placeholder="أدخل اسم الطالب..."
                      className="w-full h-16 px-6 rounded-2xl border-2 border-muted focus:border-primary outline-none font-black text-primary text-lg text-right shadow-sm"
                    />
                  </div>
               </div>
               
               <div className="p-6 bg-muted/30 rounded-3xl flex items-center justify-between border border-muted">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-secondary"></div>
                   <span className="text-xs font-black text-primary">المادة: {formData.subjectName}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full bg-primary"></div>
                   <span className="text-xs font-black text-primary">العام: {formData.year}</span>
                 </div>
               </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="mt-auto pt-10 flex items-center justify-between flex-row-reverse border-t border-muted/50">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || loading}
              className="h-14 px-8 rounded-2xl border-2 font-black gap-3 hover:bg-muted/50 transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
              السابق
            </Button>

            {step < 5 ? (
              <Button 
                onClick={nextStep} 
                disabled={(step === 2 && files.length === 0) || (step === 1 && !formData.subjectId)}
                className="h-14 px-12 rounded-2xl font-black gap-3 gradient-blue shadow-xl hover:scale-105 transition-transform"
              >
                التالي
                <ChevronLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                onClick={handleSaveToArchive}
                disabled={loading}
                className="h-14 px-12 rounded-2xl font-black gap-3 bg-green-600 hover:bg-green-700 text-white shadow-xl hover:scale-105 transition-transform"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
                حفظ نهائي في الأرشيف
              </Button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
