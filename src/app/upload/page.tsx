
"use client";

/**
 * @fileOverview صفحة رفع وأرشفة الاختبارات مع تحويل التحليل إلى API Route لضمان الاستقرار.
 */

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
  CheckCircle, 
  Info,
  ChevronLeft,
  ChevronRight,
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
  CloudUpload,
  Keyboard,
  Cpu,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { compressImage, getBase64SizeKB } from "@/lib/storage-utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function UploadPage() {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري المعالجة...");
  const [files, setFiles] = useState<string[]>([]);
  const [fileType, setFileType] = useState("image/jpeg");
  const [extractedData, setExtractedData] = useState({ id: '', name: '', found: false });
  const [formData, setFormData] = useState({ 
    year: '', 
    deptId: '', 
    deptName: '',
    collegeName: '',
    subjectId: '', 
    subjectName: '', 
    level: '', 
    term: '' 
  });
  
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();

  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: allSubjects = [] } = useCollection(subjectsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  const filteredSubjects = useMemo(() => {
    if (!formData.deptId || !formData.level) return [];
    
    const currentDept = (departments as any[]).find(d => d.id === formData.deptId);
    const targetDeptNameAr = (currentDept?.nameAr || "").toLowerCase();
    const targetDeptCode = (currentDept?.code || "").toLowerCase();

    return (allSubjects as any[]).filter(s => {
      const levelMatch = s.level === formData.level;
      if (!levelMatch) return false;

      const subDeptId = (s.departmentId || "").toLowerCase();
      const subDeptName = (s.departmentName || "").toLowerCase();

      return subDeptId === formData.deptId.toLowerCase() || 
             subDeptName === targetDeptNameAr || 
             subDeptId === targetDeptCode;
    });
  }, [allSubjects, formData.deptId, formData.level, departments]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      setLoadingText("جاري معالجة حجم الملف...");
      setLoading(true);
      
      const file = fileList[0];
      setFileType(file.type);
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const { data } = await compressImage(event.target.result as string, 0.6, 1200);
          setFiles([data]);
          setLoading(false);
          setStep(3);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const findStudentByRegId = async (regId: string) => {
    if (!firestore || !regId) return null;
    const studentsRef = collection(firestore, "students");
    const q = query(studentsRef, where("regId", "==", regId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) return querySnapshot.docs[0].data();
    return null;
  };

  const handleOCR = async () => {
    if (files.length === 0 || !firestore) return;
    
    setLoadingText("جاري استخراج البيانات ذكياً...");
    setLoading(true);
    
    try {
      // إرسال صورة مضغوطة جداً للتحليل لتقليل استهلاك البيانات
      const { data: ocrData } = await compressImage(files[0], 0.3, 600); 

      // استدعاء API Route الجديد
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examImageDataUri: ocrData })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.error('--- [OCR FAILURE] ---', response.status, errJson);
        throw new Error(errJson.error || `خطأ غير متوقع من الخادم (Status: ${response.status})`);
      }

      const result = await response.json();
      const cleanRegId = result.studentRegistrationId || '';
      const student = await findStudentByRegId(cleanRegId);
      
      setExtractedData({ 
        id: cleanRegId, 
        name: student ? student.name : (result.studentName || ''), 
        found: !!student
      });

      if (result.subjectName) {
        const matchedSub = (allSubjects as any[]).find(s => 
          s.nameAr.includes(result.subjectName!) || result.subjectName!.includes(s.nameAr)
        );
        if (matchedSub) {
          setFormData(prev => ({
            ...prev,
            subjectId: matchedSub.id,
            subjectName: matchedSub.nameAr,
            deptId: matchedSub.departmentId,
            level: matchedSub.level,
            term: matchedSub.term
          }));
        }
      }

      setStep(5);
    } catch (err: any) {
      console.error("OCR Analysis Error:", err);
      toast({ 
        variant: "destructive", 
        title: "فشل التحليل الذكي", 
        description: err.message || "تلقى النظام استجابة غير متوقعة. يرجى إدخال البيانات يدوياً." 
      });
      // ننتقل للخطوة اليدوية للسماح للمستخدم بالإكمال رغم فشل الذكاء الاصطناعي
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToArchive = async () => {
    if (!firestore || !extractedData.id || !formData.subjectName || files.length === 0) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى تأكيد رقم القيد واختيار المادة." });
      return;
    }

    setLoadingText("جاري الأرشفة في Firestore...");
    setLoading(true);

    try {
      await addDoc(collection(firestore, "archives"), {
        student_id: extractedData.id,
        student_name: extractedData.name || "طالب غير معروف",
        subject_name: formData.subjectName,
        file_data: files[0],
        file_type: fileType,
        year: formData.year,
        term: formData.term,
        departmentId: formData.deptId,
        level: formData.level,
        uploadedAt: serverTimestamp()
      });

      toast({ title: "تمت الأرشفة بنجاح" });
      setFiles([]);
      setExtractedData({ id: '', name: '', found: false });
      setStep(1);

    } catch (error: any) {
      toast({ variant: "destructive", title: "خطأ في الحفظ السحابي" });
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-black text-primary mb-2">نظام الأرشفة الذكي</h1>
          <p className="text-muted-foreground font-bold text-lg">تحليل واستخراج البيانات عبر API Routes المستقرة</p>
        </div>

        <div className="max-w-md mx-auto mb-12">
          <Tabs value={mode} onValueChange={(v) => { setMode(v as any); setStep(1); }} className="w-full">
            <TabsList className="bg-white p-1 rounded-2xl h-14 shadow-lg border w-full">
              <TabsTrigger value="ai" className={cn("flex-1 rounded-xl font-black transition-all gap-2", mode === 'ai' ? "gradient-blue text-white shadow-md" : "text-muted-foreground")}><Cpu className="w-4 h-4" />تحليل ذكي (Clean Slate)</TabsTrigger>
              <TabsTrigger value="manual" className={cn("flex-1 rounded-xl font-black transition-all gap-2", mode === 'manual' ? "gradient-blue text-white shadow-md" : "text-muted-foreground")}><Keyboard className="w-4 h-4" />أرشفة يدوية</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center justify-between mb-16 relative px-4 max-w-3xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0"></div>
          {[1, 2, 3, 5].map((s) => (
            <div 
              key={s} 
              className={cn(
                "relative z-10 w-11 h-11 rounded-full flex items-center justify-center font-bold transition-all border-4 shadow-sm",
                step >= s ? "bg-primary text-white border-primary scale-110 shadow-lg" : "bg-white text-muted-foreground border-muted"
              )}
            >
              {step > s ? <CheckCircle className="w-6 h-6" /> : (s === 5 ? 4 : s === 3 ? 3 : s)}
              <span className={cn("absolute -bottom-10 whitespace-nowrap text-[11px] font-black", step >= s ? "text-primary" : "text-muted-foreground")}>
                {s === 1 && 'السياق'} {s === 2 && 'الرفع'} {s === 3 && 'المعاينة'} {s === 5 && 'التأكيد'}
              </span>
            </div>
          ))}
        </div>

        <Card className="p-8 md:p-12 border-none shadow-2xl rounded-[40px] bg-white min-h-[500px] flex flex-col relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-6 animate-fade-in text-center p-8">
              <Loader2 className="w-20 h-20 animate-spin text-primary" />
              <p className="font-black text-2xl text-primary">{loadingText}</p>
              <p className="text-sm text-muted-foreground font-bold">يتم الآن التحليل عبر مسار API المباشر لضمان الشفافية...</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10 animate-slide-up flex-1">
              <div className="flex items-center gap-4 border-b pb-6">
                <div className="p-3 bg-primary/5 rounded-2xl text-primary"><Info className="w-7 h-7" /></div>
                <div><h2 className="text-2xl font-black text-primary">تحديد السياق الأكاديمي</h2><p className="text-muted-foreground text-sm font-bold">سيتم عرض المواد بناءً على القسم والمستوى المختارين</p></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" />العام الجامعي</Label>
                  <select value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right">
                    <option value="">اختر العام...</option>
                    {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary" />القسم العلمي</Label>
                  <select value={formData.deptId} onChange={(e) => {
                    const sel = departments.find((d: any) => d.id === e.target.value) as any;
                    setFormData({...formData, deptId: e.target.value, deptName: sel?.nameAr || sel?.name || "", subjectId: '', subjectName: ''});
                  }} className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right">
                    <option value="">اختر القسم...</option>
                    {departments.map((d: any) => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary flex items-center gap-2"><GraduationCap className="w-4 h-4 text-secondary" />المستوى الدراسي</Label>
                  <select value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value, subjectId: '', subjectName: ''})} className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right">
                    <option value="">اختر المستوى...</option>
                    <option value="المستوى الأول">المستوى الأول</option><option value="المستوى الثاني">المستوى الثاني</option><option value="المستوى الثالث">المستوى الثالث</option><option value="المستوى الرابع">المستوى الرابع</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-black text-primary flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" />المادة الدراسية</Label>
                  <select 
                    disabled={!formData.deptId || !formData.level} 
                    value={formData.subjectId} 
                    onChange={(e) => { 
                      const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any; 
                      setFormData({ ...formData, subjectId: e.target.value, subjectName: sel?.nameAr || "", term: sel?.term || "" }); 
                    }} 
                    className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right disabled:opacity-50"
                  >
                    <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "لا توجد مواد تطابق هذا القسم والمستوى"}</option>
                    {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-slide-up flex-1 flex flex-col items-center justify-center">
              <div className="text-center space-y-4 mb-8">
                <div className="p-4 bg-primary/5 rounded-full inline-block text-primary mb-2"><ImageIcon className="w-12 h-12" /></div>
                <h2 className="text-3xl font-black text-primary">رفع ورقة الامتحان</h2>
                <p className="text-muted-foreground font-bold text-sm">يرجى رفع صورة واضحة للجزء العلوي من ورقة الاختبار</p>
              </div>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full max-w-xl p-16 border-4 border-dashed border-muted rounded-[40px] flex flex-col items-center gap-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                  <FileUp className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-primary">اضغط هنا لاختيار الصورة</p>
                  <p className="text-sm text-muted-foreground font-bold mt-2">يتم تحسين الحجم تلقائياً للأرشفة السحابية</p>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
            </div>
          )}

          {step === 3 && (
             <div className="animate-slide-up flex-1 space-y-10">
               <div className="flex items-center justify-between border-b pb-6">
                  <div><h2 className="text-2xl font-black text-primary">معاينة الملف الموثق</h2><p className="text-muted-foreground font-bold text-sm">تأكد من وضوح البيانات قبل بدء المعالجة الذكية</p></div>
                  <Button variant="ghost" onClick={() => { setFiles([]); setStep(2); }} className="text-destructive font-black gap-2"><Trash2 className="w-5 h-5" />مسح الصورة</Button>
               </div>
               <div className="flex flex-col md:flex-row gap-10 items-center justify-center">
                  <div className="w-full md:w-80 aspect-[3/4] relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-muted/20">
                    <Image src={files[0]} alt="Preview" fill className="object-contain" />
                  </div>
                  <div className="flex-1 max-w-md space-y-6 text-center md:text-right">
                    <div className="p-6 bg-muted/20 rounded-3xl border border-muted">
                      <p className="font-bold text-primary mb-1 text-sm">حجم الملف المستقر:</p>
                      <p className="text-3xl font-black text-secondary">{getBase64SizeKB(files[0]).toFixed(0)} KB</p>
                    </div>
                    {mode === 'ai' ? (
                       <Button onClick={handleOCR} className="w-full h-16 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-3">
                         <Scan className="w-6 h-6" />
                         بدء التحليل الذكي الفوري
                       </Button>
                    ) : (
                       <Button onClick={() => setStep(5)} className="w-full h-16 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-3">
                         <ChevronLeft className="w-6 h-6" />
                         متابعة للتعريف اليدوي
                       </Button>
                    )}
                  </div>
               </div>
             </div>
          )}

          {step === 5 && (
            <div className="animate-slide-up flex-1 space-y-10">
               <div className={cn("flex items-center gap-6 p-8 rounded-[30px] border-2 transition-all shadow-sm", extractedData.found ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200")}>
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-white", extractedData.found ? "bg-green-500" : "bg-orange-500")}>
                    {extractedData.found ? <UserCheck className="w-9 h-9" /> : <AlertCircle className="w-9 h-9" />}
                  </div>
                  <div className="text-right flex-1">
                    <h2 className={cn("text-2xl font-black", extractedData.found ? "text-green-800" : "text-orange-800")}>{extractedData.found ? "تم التعرف على الطالب" : "تنبيه: الطالب غير مسجل"}</h2>
                    <p className="text-base font-bold opacity-70">{extractedData.found ? `تمت مطابقة رقم القيد (${extractedData.id}) مع السجلات المركزية.` : "رقم القيد المستخرج لم يطابق أي سجل حالي. يرجى إكمال البيانات."}</p>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2"><Fingerprint className="w-4 h-4 text-secondary" />رقم القيد الجامعي</Label>
                    <input 
                      value={extractedData.id} 
                      onChange={(e) => setExtractedData({...extractedData, id: e.target.value.replace(/\D/g, '')})} 
                      className="w-full h-16 px-6 rounded-2xl border-2 border-muted focus:border-primary bg-white font-black text-2xl text-right outline-none transition-all shadow-inner" 
                      placeholder="رقم القيد..." 
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2"><User className="w-4 h-4 text-secondary" />اسم الطالب الكامل</Label>
                    <input 
                      value={extractedData.name} 
                      readOnly={extractedData.found}
                      onChange={(e) => setExtractedData({...extractedData, name: e.target.value})} 
                      className={cn("w-full h-16 px-6 rounded-2xl border-2 bg-white font-black text-lg text-right outline-none transition-all shadow-inner", extractedData.found ? "bg-muted/10 border-green-200" : "focus:border-primary")} 
                      placeholder="اسم الطالب..." 
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-black text-primary mr-1 flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" />تأكيد المادة المؤرشفة</Label>
                    <select 
                      value={formData.subjectId} 
                      onChange={(e) => { 
                        const sel = allSubjects.find((s: any) => s.id === e.target.value) as any; 
                        setFormData({ ...formData, subjectId: e.target.value, subjectName: sel?.nameAr || "", term: sel?.term || "" }); 
                      }} 
                      className="w-full h-16 px-6 rounded-2xl border-2 border-muted focus:border-primary bg-white font-black text-lg text-right outline-none transition-all shadow-inner appearance-none"
                    >
                      <option value="">اختر المادة...</option>
                      {allSubjects.filter((s: any) => !formData.deptId || s.departmentId === formData.deptId).map((s: any) => (
                        <option key={s.id} value={s.id}>{s.nameAr}</option>
                      ))}
                    </select>
                  </div>
               </div>
            </div>
          )}

          <div className="mt-auto pt-10 flex items-center justify-between border-t-2 border-muted/30">
            <Button variant="outline" onClick={() => setStep(prev => prev === 5 ? 3 : Math.max(prev - 1, 1))} disabled={step === 1 || loading} className="h-16 px-10 rounded-2xl border-2 border-muted font-black gap-4 hover:bg-muted/10 transition-all flex items-center">السابق<ChevronRight className="w-6 h-6" /></Button>
            <div className="flex gap-4">
              {step === 1 && (
                <Button onClick={() => setStep(2)} disabled={!formData.year || !formData.deptId || !formData.level} className="h-16 px-16 rounded-2xl font-black gap-4 gradient-blue shadow-lg hover:scale-105 transition-all flex items-center"><ChevronLeft className="w-6 h-6" />متابعة للرفع</Button>
              )}
              {step === 5 && (
                <Button onClick={handleSaveToArchive} disabled={loading || !extractedData.id || !formData.subjectId} className="h-16 px-16 rounded-2xl font-black gap-4 bg-green-600 text-white shadow-xl hover:bg-green-700 hover:scale-105 transition-all"><CloudUpload className="w-6 h-6" />إكمال الأرشفة السحابية</Button>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
