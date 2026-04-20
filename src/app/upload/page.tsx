
"use client";

import { useState, useMemo, useRef } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle,
  Building2,
  BookOpen,
  Calendar,
  GraduationCap,
  Fingerprint,
  User,
  Search,
  CheckCircle2,
  CloudUpload,
  Keyboard,
  Cpu
} from "lucide-react";
import { extractExamDetails } from "@/ai/flows/extract-exam-details";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";

// Firebase Imports
import { useFirestore, useCollection, useStorage } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function UploadPage() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري المعالجة...");
  const [isSearching, setIsSearching] = useState(false);
  const [files, setFiles] = useState<string[]>([]);
  const [extractedData, setExtractedData] = useState({ id: '', name: '', found: false, originalName: '' });
  const [formData, setFormData] = useState({ 
    year: '', 
    deptId: '', 
    subjectId: '', 
    subjectName: '', 
    level: '', 
    term: '' 
  });
  
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();
  const storage = useStorage();

  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: subjects = [] } = useCollection(subjectsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  const filteredSubjects = useMemo(() => {
    if (!formData.deptId || !formData.level) return [];
    return (subjects as any[]).filter(s => 
      s.departmentId === formData.deptId && 
      s.level === formData.level
    );
  }, [subjects, formData.deptId, formData.level]);

  const nextStep = () => {
    if (mode === 'manual' && step === 3) {
      setStep(5);
    } else {
      setStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    if (mode === 'manual' && step === 5) {
      setStep(3);
    } else {
      setStep(prev => Math.max(prev - 1, 1));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      const filesArray = Array.from(fileList);
      const readers = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) resolve(event.target.result as string);
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

  const findStudentByRegId = async (regId: string) => {
    if (!firestore || !regId) return null;
    const studentsRef = collection(firestore, "students");
    const q = query(studentsRef, where("regId", "==", regId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data();
    }
    return null;
  };

  const handleRegIdChange = async (val: string) => {
    const cleanId = val.replace(/\D/g, '');
    setExtractedData(prev => ({ ...prev, id: cleanId }));

    if (cleanId.length >= 4) {
      setIsSearching(true);
      try {
        const student = await findStudentByRegId(cleanId);
        if (student) {
          setExtractedData(prev => ({ ...prev, name: student.name, found: true }));
        } else {
          setExtractedData(prev => ({ ...prev, name: '', found: false }));
        }
      } catch (err) {
        console.error("Match error:", err);
      } finally {
        setIsSearching(false);
      }
    } else {
      setExtractedData(prev => ({ ...prev, name: '', found: false }));
    }
  };

  const handleOCR = async () => {
    if (files.length === 0 || !firestore) return;
    setLoadingText("جاري التحليل واستخراج البيانات...");
    setLoading(true);
    try {
      const result = await extractExamDetails({ examImageDataUri: files[0] });
      const cleanRegId = result.studentRegistrationId?.replace(/\D/g, '') || '';
      const student = await findStudentByRegId(cleanRegId);
      
      if (student) {
        setExtractedData({ 
          id: cleanRegId, 
          name: student.name, 
          found: true,
          originalName: result.studentName || ''
        });
      } else {
        setExtractedData({ 
          id: cleanRegId, 
          name: result.studentName || '', 
          found: false,
          originalName: result.studentName || ''
        });
      }
      setStep(5);
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "فشل التحليل الذكي", 
        description: "تعذر قراءة البيانات آلياً، سننتقل للإدخال اليدوي." 
      });
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!firestore || !storage || !extractedData.id || !formData.subjectName || files.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }

    setLoadingText("جاري رفع الملف للسحابة...");
    setLoading(true);
    
    try {
      const folderName = (formData.year || "unknown").replace(/\s/g, '').replace(/\//g, '-');
      const fileName = `archives/${folderName}/${formData.subjectName}/${extractedData.id}_${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      
      // 1. رفع الصورة للسحابة (العملية الوحيدة التي يجب انتظارها للحصول على الرابط)
      const uploadResult = await uploadString(storageRef, files[0], 'data_url');
      const downloadUrl = await getDownloadURL(uploadResult.ref);

      // 2. تجهيز بيانات الأرشفة
      const archiveData = {
        studentRegId: extractedData.id,
        studentName: extractedData.name || "طالب غير معروف",
        subjectId: formData.subjectId,
        subjectName: formData.subjectName,
        year: formData.year,
        term: formData.term,
        departmentId: formData.deptId,
        fileUrl: downloadUrl,
        pages: files.length,
        uploadedAt: serverTimestamp()
      };

      // 3. الحفظ في Firestore (اتباع مبدأ الأرشفة المتفائلة - غير معطلة للواجهة)
      const archivesCollection = collection(firestore, "archives");
      addDoc(archivesCollection, archiveData)
        .catch(async (error) => {
          // التعامل مع خطأ الصلاحيات في Firestore فقط إذا حدث فعلياً
          const permissionError = new FirestorePermissionError({
            path: archivesCollection.path,
            operation: 'create',
            requestResourceData: archiveData,
          });
          errorEmitter.emit('permission-error', permissionError);
        });

      // 4. تصفية الواجهة فوراً لضمان السرعة الفائقة
      toast({ 
        title: "تمت الأرشفة بنجاح", 
        description: `تم حفظ اختبار الطالب ${extractedData.name} بنجاح.` 
      });

      setFiles([]);
      setExtractedData({ id: '', name: '', found: false, originalName: '' });
      setLoading(false);
      setStep(2); // العودة لخطوة الرفع لمواصلة العمل فوراً
      
    } catch (error: any) {
      console.error("Save/Storage Error:", error);
      setLoading(false);
      toast({ 
        variant: "destructive", 
        title: "خطأ في الاتصال", 
        description: "تعذر رفع الملف للسحابة، يرجى التأكد من استقرار الإنترنت." 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in max-w-5xl mx-auto text-right",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )} dir="rtl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-primary mb-2">أرشفة رقمية ذكية</h1>
          <p className="text-muted-foreground font-bold text-lg">نظام أتمتة وتخزين الاختبارات الجامعية</p>
        </div>

        {/* Mode Filter */}
        <div className="max-w-md mx-auto mb-12">
          <Tabs value={mode} onValueChange={(v) => {
            setMode(v as any);
            setStep(1); 
          }} className="w-full">
            <TabsList className="bg-white p-1 rounded-2xl h-14 shadow-lg border w-full">
              <TabsTrigger 
                value="ai" 
                className={cn(
                  "flex-1 rounded-xl font-black transition-all gap-2",
                  mode === 'ai' ? "gradient-blue text-white shadow-md" : "text-muted-foreground"
                )}
              >
                <Cpu className="w-4 h-4" />
                أرشفة ذكية (AI)
              </TabsTrigger>
              <TabsTrigger 
                value="manual" 
                className={cn(
                  "flex-1 rounded-xl font-black transition-all gap-2",
                  mode === 'manual' ? "gradient-blue text-white shadow-md" : "text-muted-foreground"
                )}
              >
                <Keyboard className="w-4 h-4" />
                أرشفة يدوية (سريع)
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center justify-between mb-16 relative px-4 max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0"></div>
          {[1, 2, 3, 4, 5].map((s) => {
            if (mode === 'manual' && s === 4) return null;
            return (
              <div 
                key={s} 
                className={cn(
                  "relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold transition-all border-4",
                  step >= s ? "bg-primary text-white border-primary shadow-xl scale-110" : "bg-white text-muted-foreground border-muted"
                )}
              >
                {step > s ? <CheckCircle className="w-6 h-6" /> : (mode === 'manual' && s === 5 ? 4 : s)}
                <span className={cn(
                  "absolute -bottom-10 whitespace-nowrap text-[11px] font-black transition-colors", 
                  step >= s ? "text-primary" : "text-muted-foreground"
                )}>
                  {s === 1 && 'السياق'} 
                  {s === 2 && 'الرفع'} 
                  {s === 3 && 'المعاينة'} 
                  {s === 4 && 'التحليل'} 
                  {s === 5 && (mode === 'manual' ? 'التعريف' : 'التأكيد')}
                </span>
              </div>
            )
          })}
        </div>

        <Card className="p-8 md:p-12 border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[40px] bg-white min-h-[520px] flex flex-col relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6 text-center p-10 animate-fade-in">
              <div className="relative">
                <Loader2 className="w-20 h-20 animate-spin text-primary" />
                <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping opacity-20"></div>
              </div>
              <div>
                <p className="font-black text-3xl text-primary mb-2">{loadingText}</p>
                <p className="text-muted-foreground font-bold">يتم التخزين سحابياً، لن يستغرق ذلك طويلاً...</p>
              </div>
            </div>
          )}
          
          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileUpload} />

          {step === 1 && (
            <div className="space-y-10 animate-slide-up flex-1">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 text-primary">
                  <Info className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-primary">تحديد سياق الاختبار</h2>
                  <p className="text-muted-foreground text-sm font-bold">يرجى تحديد البيانات الأكاديمية للمادة قبل البدء بالرفع</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-secondary" />
                    العام الجامعي
                  </Label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/20 outline-none font-black text-primary focus:border-primary focus:bg-white transition-all text-right appearance-none"
                  >
                    <option value="">اختر العام الجامعي...</option>
                    {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-secondary" />
                    التخصص (القسم)
                  </Label>
                  <select 
                    value={formData.deptId}
                    onChange={(e) => setFormData({...formData, deptId: e.target.value, subjectId: '', subjectName: ''})}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/20 outline-none font-black text-primary focus:border-primary focus:bg-white transition-all text-right appearance-none"
                  >
                    <option value="">اختر التخصص...</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-secondary" />
                    المستوى الدراسي
                  </Label>
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value, subjectId: '', subjectName: ''})}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/20 outline-none font-black text-primary focus:border-primary focus:bg-white transition-all text-right appearance-none"
                  >
                    <option value="">اختر المستوى...</option>
                    <option value="المستوى الأول">المستوى الأول</option>
                    <option value="المستوى الثاني">المستوى الثاني</option>
                    <option value="المستوى الثالث">المستوى الثالث</option>
                    <option value="المستوى الرابع">المستوى الرابع</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-secondary" />
                    المادة الدراسية
                  </Label>
                  <select 
                    disabled={!formData.deptId || !formData.level}
                    value={formData.subjectId}
                    onChange={(e) => {
                      const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                      setFormData({ ...formData, subjectId: e.target.value, subjectName: sel?.nameAr || "", term: sel?.term || "" });
                    }}
                    className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/20 outline-none font-black text-primary focus:border-primary focus:bg-white transition-all text-right appearance-none disabled:opacity-50"
                  >
                    <option value="">{(!formData.deptId || !formData.level) ? 'حدد التخصص والمستوى أولاً' : 'اختر المادة...'}</option>
                    {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col items-center justify-center animate-slide-up">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xl h-80 border-4 border-dashed border-primary/20 rounded-[50px] flex flex-col items-center justify-center gap-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group shadow-inner bg-muted/10"
              >
                <div className="p-10 bg-white rounded-full group-hover:scale-110 transition-transform shadow-xl border border-primary/5">
                  <FileUp className="w-20 h-20 text-primary" />
                </div>
                <div className="text-center px-10">
                  <p className="text-3xl font-black text-primary mb-3">رفع أوراق الاختبار</p>
                  <p className="text-sm text-muted-foreground font-bold bg-white px-4 py-2 rounded-full border shadow-sm">المادة المختارة: {formData.subjectName}</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-slide-up flex-1">
               <div className="flex items-center justify-between mb-10 border-b pb-6">
                 <div>
                  <h2 className="text-2xl font-black text-primary">معاينة صفحات الاختبار</h2>
                  <p className="text-muted-foreground font-bold text-sm">تأكد من وضوح كافة الصفحات قبل الحفظ</p>
                 </div>
                 <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-2xl h-12 px-6 font-black text-secondary border-2 gap-2 hover:bg-secondary/5 transition-all">
                    <Plus className="w-5 h-5" />
                    إضافة صفحة
                 </Button>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                 {files.map((f, i) => (
                   <div key={i} className="relative group aspect-[3/4] rounded-3xl overflow-hidden border-4 border-white shadow-2xl transition-transform hover:-translate-y-2">
                     <Image src={f} alt="Page" fill className="object-cover" />
                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <Button size="icon" variant="destructive" className="rounded-2xl w-12 h-12 shadow-xl hover:scale-110 transition-transform" onClick={() => setFiles(files.filter((_, idx) => idx !== i))} title="حذف هذه الصفحة">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                     </div>
                     <div className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-md text-white text-xs px-3 py-1 rounded-xl font-black shadow-lg">صفحة {i + 1}</div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {step === 4 && mode === 'ai' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12">
              <div className="relative">
                <div className="w-48 h-48 bg-secondary/5 rounded-full flex items-center justify-center shadow-inner relative z-10 overflow-hidden">
                  <Scan className="w-24 h-24 text-secondary animate-pulse" />
                </div>
                <div className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-3xl shadow-2xl flex items-center justify-center border-4 border-primary/5 z-20">
                  <Sparkles className="w-8 h-8 text-primary animate-bounce" />
                </div>
                <div className="absolute inset-0 bg-secondary/10 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              </div>
              <div className="max-w-lg">
                <h2 className="text-4xl font-black text-primary mb-4">التحليل والمطابقة الذكية</h2>
                <p className="text-muted-foreground font-bold text-lg leading-relaxed">سيقوم محرك الذكاء الاصطناعي بمطابقة رقم القيد المستخرج من الورقة مع سجلات الطلاب الرسمية.</p>
              </div>
              <Button onClick={handleOCR} disabled={loading} className="h-20 px-16 rounded-[2rem] text-2xl font-black gradient-blue shadow-lg hover:scale-105 transition-all group">
                {loading ? <Loader2 className="w-8 h-8 animate-spin ml-4" /> : <Scan className="w-8 h-8 ml-4 group-hover:rotate-90 transition-transform" />}
                بدء المطابقة الآن
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up flex-1 space-y-10">
               <div className={cn(
                 "flex items-center gap-6 p-8 rounded-[40px] border-2 shadow-sm transition-all", 
                 extractedData.found ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
               )}>
                  <div className={cn(
                    "w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg", 
                    extractedData.found ? "bg-green-500 text-white" : "bg-orange-500 text-white"
                  )}>
                    {isSearching ? <Loader2 className="w-9 h-9 animate-spin" /> : extractedData.found ? <UserCheck className="w-9 h-9" /> : <AlertCircle className="w-9 h-9" />}
                  </div>
                  <div className="text-right flex-1">
                    <h2 className={cn("text-2xl font-black", extractedData.found ? "text-green-800" : "text-orange-800")}>
                      {isSearching ? "جاري المطابقة..." : extractedData.found ? "تم التعرف على الطالب" : "تنبيه: الطالب غير مسجل"}
                    </h2>
                    <p className="text-base font-bold opacity-70">
                      {isSearching 
                        ? "يتم الآن جلب بيانات الطالب من السجلات الرسمية..."
                        : extractedData.found 
                        ? `تمت مطابقة رقم القيد (${extractedData.id}) مع سجلات الطالب ${extractedData.name}.`
                        : "رقم القيد المدخل لا يطابق أي طالب مسجل. يرجى التأكد من الرقم."}
                    </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3 text-right">
                    <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-secondary" />
                      رقم القيد الجامعي
                    </Label>
                    <div className="relative group">
                      <input 
                        value={extractedData.id} 
                        onChange={(e) => handleRegIdChange(e.target.value)} 
                        className={cn(
                          "w-full h-16 pr-14 pl-6 rounded-3xl border-2 bg-white font-black text-2xl text-right outline-none transition-all shadow-inner",
                          extractedData.found ? "border-green-300 focus:border-green-500" : "border-muted focus:border-primary"
                        )}
                        placeholder="أدخل رقم القيد..."
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isSearching ? <Loader2 className="w-6 h-6 animate-spin text-primary" /> : extractedData.found ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Search className="w-6 h-6 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-right">
                    <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2">
                      <User className="w-4 h-4 text-secondary" />
                      اسم الطالب الكامل (آلي)
                    </Label>
                    <div className="relative">
                      <input 
                        value={extractedData.name} 
                        readOnly={extractedData.found}
                        onChange={(e) => setExtractedData({...extractedData, name: e.target.value})} 
                        className={cn(
                          "w-full h-16 pr-14 pl-6 rounded-3xl border-2 bg-muted/10 font-black text-lg text-right outline-none transition-all shadow-inner",
                          extractedData.found ? "bg-green-50/50 border-green-200 text-green-800" : "bg-white border-muted focus:border-primary"
                        )}
                        placeholder={extractedData.found ? "" : "أدخل الاسم يدوياً..."}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {extractedData.found ? <UserCheck className="w-6 h-6 text-green-500" /> : <User className="w-6 h-6 text-muted-foreground" />}
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          )}

          <div className="mt-auto pt-10 flex items-center justify-between border-t-2 border-muted/50">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={step === 1 || loading} 
              className="h-16 px-10 rounded-[1.5rem] border-2 border-muted font-black gap-4 shadow-sm hover:bg-muted/10 transition-all flex items-center"
            >
              <ChevronRight className="w-6 h-6" />
              السابق
            </Button>
            
            {(step < 5 && !(step === 3 && mode === 'manual')) ? (
              <Button 
                onClick={nextStep} 
                disabled={
                  (step === 2 && files.length === 0) || 
                  (step === 1 && (!formData.subjectId || !formData.level)) ||
                  (step === 3 && files.length === 0)
                } 
                className="h-16 px-16 rounded-[1.5rem] font-black gap-4 gradient-blue shadow-lg hover:scale-105 transition-all flex items-center"
              >
                التالي 
                <ChevronLeft className="w-6 h-6" />
              </Button>
            ) : step === 3 && mode === 'manual' ? (
              <Button 
                onClick={nextStep} 
                className="h-16 px-16 rounded-[1.5rem] font-black gap-4 gradient-blue shadow-lg hover:scale-105 transition-all flex items-center"
              >
                تحديد الطالب 
                <ChevronLeft className="w-6 h-6" />
              </Button>
            ) : step === 5 ? (
              <Button 
                onClick={handleSaveToArchive} 
                disabled={loading || !extractedData.id || isSearching} 
                className="h-16 px-16 rounded-[1.5rem] font-black gap-4 bg-green-600 text-white shadow-lg hover:bg-green-700 hover:scale-105 transition-all"
              >
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <CloudUpload className="w-6 h-6" />} 
                حفظ نهائي في الأرشيف
              </Button>
            ) : null}
          </div>
        </Card>
      </main>
    </div>
  );
}
