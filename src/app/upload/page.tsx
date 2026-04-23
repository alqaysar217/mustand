
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  Image as ImageIcon,
  Check,
  RefreshCcw,
  X,
  Layers,
  Search
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { compressImage } from "@/lib/storage-utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

export default function UploadPage() {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [step, setStep] = useState(1); // 1: Context, 2: Upload/Process
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري المعالجة...");
  
  // Academic Context (Sticky)
  const [context, setContext] = useState({ 
    year: '', 
    deptId: '', 
    deptName: '',
    level: '', 
    term: '',
    subjectId: '',
    subjectName: ''
  });

  // Files State
  const [files, setFiles] = useState<string[]>([]); // Base64 strings
  
  // Manual Flow State
  const [manualId, setManualId] = useState("");
  const [manualStudent, setManualStudent] = useState<{name: string, regId: string} | null>(null);

  // AI Flow State
  const [aiResults, setAiResults] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { isOpen } = useSidebarToggle();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const firestore = useFirestore();

  // Queries for selectors
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: departments = [] } = useCollection(deptsQuery);
  const { data: allSubjects = [] } = useCollection(subjectsQuery);
  const { data: academicYears = [] } = useCollection(yearsQuery);

  // Filter subjects based on context
  const filteredSubjects = useMemo(() => {
    if (!context.deptId || !context.level) return [];
    return (allSubjects as any[]).filter(s => 
      (s.departmentId === context.deptId || s.departmentName === context.deptName) && 
      (s.level === context.level)
    );
  }, [allSubjects, context.deptId, context.level, context.deptName]);

  // Handle student identification in manual mode
  const identifyStudent = async (regId: string) => {
    if (!firestore || !regId) return;
    setLoading(true);
    try {
      const q = query(collection(firestore, "students"), where("regId", "==", regId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setManualStudent({ name: data.name, regId: data.regId });
        toast({ title: "تم التعرف على الطالب" });
      } else {
        setManualStudent(null);
        toast({ variant: "destructive", title: "الطالب غير مسجل", description: "يرجى التأكد من رقم القيد أو إدخاله يدوياً." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في البحث" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setLoading(true);
    setLoadingText("جاري معالجة الصور...");
    
    const newFiles: string[] = [];
    let processed = 0;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const { data } = await compressImage(event.target.result as string, 0.6, 1200);
          newFiles.push(data);
          processed++;
          if (processed === fileList.length) {
            setFiles(prev => activeMode === 'manual' ? [data] : [...prev, ...newFiles]);
            setLoading(false);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const saveManualArchive = async () => {
    if (!firestore || !manualId || files.length === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "archives"), {
        student_id: manualId,
        student_name: manualStudent?.name || "طالب يدوي",
        subject_name: context.subjectName,
        subjectId: context.subjectId,
        file_data: files[0],
        file_type: "image/jpeg",
        year: context.year,
        term: context.term || "غير محدد",
        departmentId: context.deptId,
        departmentName: context.deptName,
        level: context.level,
        uploadedAt: serverTimestamp()
      });

      toast({ title: "تمت الأرشفة بنجاح" });
      // Reset for next paper but keep context
      setFiles([]);
      setManualId("");
      setManualStudent(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setLoading(false);
    }
  };

  const startAIAnalysis = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setLoadingText("جاري تحليل كافة الأوراق عبر Gemini AI...");
    
    const results = [];
    for (const file of files) {
      try {
        const response = await fetch('/api/ai/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examImageDataUri: file })
        });
        const data = await response.json();
        
        // Auto-merge with context for missing fields
        results.push({
          ...data,
          studentRegistrationId: data.studentRegistrationId || "",
          studentName: data.studentName || "غير معروف",
          subjectName: context.subjectName, // Always take selected subject for precision
          fileData: file
        });
      } catch (e) {
        results.push({ studentName: "فشل التحليل", studentRegistrationId: "", subjectName: context.subjectName, fileData: file });
      }
    }
    
    setAiResults(results);
    setLoading(false);
  };

  const saveBatchAI = async () => {
    if (!firestore || aiResults.length === 0) return;
    setLoading(true);
    setLoadingText("جاري حفظ الأرشيف...");
    
    try {
      for (const res of aiResults) {
        await addDoc(collection(firestore, "archives"), {
          student_id: res.studentRegistrationId,
          student_name: res.studentName,
          subject_name: context.subjectName,
          subjectId: context.subjectId,
          file_data: res.fileData,
          file_type: "image/jpeg",
          year: context.year,
          term: context.term || "غير محدد",
          departmentId: context.deptId,
          departmentName: context.deptName,
          level: context.level,
          uploadedAt: serverTimestamp()
        });
      }
      toast({ title: `تم حفظ ${aiResults.length} مستند بنجاح` });
      setFiles([]);
      setAiResults([]);
      setStep(1); // Return to context or stay? User said back to upload.
    } catch (e) {
      toast({ variant: "destructive", title: "حدث خطأ أثناء الحفظ المتعدد" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in max-w-6xl mx-auto text-right",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )} dir="rtl">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-primary mb-2">مركز الأرشفة المتطور</h1>
            <p className="text-muted-foreground font-bold text-lg">اختر آلية الرفع المناسبة لحجم العمل الحالي</p>
          </div>
          <Tabs value={activeMode} onValueChange={(v: any) => { setActiveMode(v); setStep(1); setFiles([]); setAiResults([]); }} className="w-full md:w-[400px]">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-white rounded-2xl p-1 shadow-sm border">
              <TabsTrigger value="manual" className="rounded-xl font-black text-sm data-[state=active]:gradient-blue data-[state=active]:text-white">
                <Keyboard className="w-4 h-4 ml-2" /> الرفع اليدوي
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-xl font-black text-sm data-[state=active]:gradient-blue data-[state=active]:text-white">
                <Cpu className="w-4 h-4 ml-2" /> الرفع الذكي
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 text-center p-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/20 animate-ping absolute inset-0"></div>
              <Loader2 className="w-24 h-24 animate-spin text-primary relative z-10" />
            </div>
            <p className="font-black text-2xl text-primary animate-pulse">{loadingText}</p>
          </div>
        )}

        {/* Step 1: Selection Context (Shared) */}
        {step === 1 && (
          <Card className="p-8 md:p-12 border-none shadow-2xl rounded-[2.5rem] bg-white animate-slide-up">
            <div className="flex items-center gap-4 mb-10 border-b pb-6">
              <div className="p-4 bg-primary/5 rounded-2xl text-primary shadow-sm"><Layers className="w-8 h-8" /></div>
              <div>
                <h2 className="text-2xl font-black text-primary">تحديد السياق الأكاديمي</h2>
                <p className="text-muted-foreground font-bold">هذه البيانات ستكون "ثابتة" لكافة الأوراق التي سترفعها في هذه الجلسة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="space-y-3">
                <Label className="font-black text-primary pr-1">العام الجامعي</Label>
                <select 
                  value={context.year} 
                  onChange={(e) => setContext({...context, year: e.target.value})}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right"
                >
                  <option value="">اختر العام...</option>
                  {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-primary pr-1">القسم العلمي</Label>
                <select 
                  value={context.deptId} 
                  onChange={(e) => {
                    const sel = departments.find((d: any) => d.id === e.target.value) as any;
                    setContext({...context, deptId: e.target.value, deptName: sel?.nameAr || sel?.name || ""});
                  }}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right"
                >
                  <option value="">اختر القسم...</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-primary pr-1">المستوى</Label>
                <select 
                  value={context.level} 
                  onChange={(e) => setContext({...context, level: e.target.value})}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right"
                >
                  <option value="">اختر المستوى...</option>
                  {["المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع", "المستوى الخامس"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="font-black text-primary pr-1">الفصل (الترم)</Label>
                <select 
                  value={context.term} 
                  onChange={(e) => setContext({...context, term: e.target.value})}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right"
                >
                  <option value="">اختر الفصل...</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                </select>
              </div>

              <div className="space-y-3 md:col-span-2">
                <Label className="font-black text-primary pr-1">المادة الدراسية</Label>
                <select 
                  disabled={!context.deptId || !context.level}
                  value={context.subjectId} 
                  onChange={(e) => {
                    const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                    setContext({...context, subjectId: e.target.value, subjectName: sel?.nameAr || ""});
                  }}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right disabled:opacity-50"
                >
                  <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "لا توجد مواد مطابقة للقسم والمستوى"}</option>
                  {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!context.year || !context.deptId || !context.level || !context.subjectId}
                className="h-16 px-20 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-3 transition-transform hover:scale-105 active:scale-95"
              >
                بدء عملية الرفع
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Upload and Process */}
        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            
            {/* Header with back button */}
            <div className="bg-white p-4 rounded-3xl shadow-sm border flex items-center justify-between mb-6">
               <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/5 rounded-xl text-primary"><BookOpen className="w-5 h-5" /></div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">الأرشفة الحالية لـ</span>
                    <span className="text-sm font-black text-primary">{context.subjectName} - {context.deptName}</span>
                  </div>
               </div>
               <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="rounded-xl font-bold gap-2 text-muted-foreground hover:text-primary">
                 <RefreshCcw className="w-4 h-4" /> تغيير المادة
               </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Side: Upload Zone */}
              <div className="lg:col-span-5">
                <Card className="p-8 border-none shadow-xl rounded-[2.5rem] bg-white h-full flex flex-col items-center justify-center relative overflow-hidden group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full min-h-[300px] border-4 border-dashed border-muted rounded-[2rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    {files.length > 0 ? (
                      <div className="relative w-full h-full p-4">
                        <Image src={files[0]} alt="Preview" width={400} height={500} className="object-contain rounded-xl max-h-[350px] mx-auto shadow-md" />
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <Button size="icon" variant="destructive" onClick={(e) => { e.stopPropagation(); setFiles([]); setAiResults([]); }} className="rounded-full shadow-lg"><X className="w-4 h-4" /></Button>
                        </div>
                        {activeMode === 'ai' && files.length > 1 && (
                          <div className="mt-4 bg-primary text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg mx-auto w-fit">
                            +{files.length - 1} صور أخرى
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                          <FileUp className="w-12 h-12" />
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-black text-primary mb-1">اضغط لاختيار {activeMode === 'manual' ? 'صورة' : 'مجموعة صور'}</p>
                          <p className="text-muted-foreground font-bold text-sm">أو اسحب وأفلت الملفات هنا</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={activeMode === 'ai'} onChange={handleFileUpload} />
                </Card>
              </div>

              {/* Right Side: Data Entry */}
              <div className="lg:col-span-7">
                {activeMode === 'manual' ? (
                  <Card className="p-10 border-none shadow-xl rounded-[2.5rem] bg-white h-full space-y-10">
                    <div className="space-y-4">
                      <Label className="text-xl font-black text-primary flex items-center gap-3">
                        <Fingerprint className="w-6 h-6 text-secondary" />
                        إدخال بيانات الطالب (رقم القيد)
                      </Label>
                      <div className="flex gap-3">
                        <Input 
                          value={manualId} 
                          onChange={(e) => setManualId(e.target.value)}
                          placeholder="أدخل رقم القيد المكتوب في الورقة..." 
                          className="h-16 rounded-2xl border-2 text-2xl font-black text-center focus:ring-primary/20"
                          onKeyDown={(e) => e.key === 'Enter' && identifyStudent(manualId)}
                        />
                        <Button 
                          onClick={() => identifyStudent(manualId)}
                          disabled={!manualId || loading}
                          className="h-16 w-20 rounded-2xl gradient-blue shadow-lg transition-transform active:scale-90"
                        >
                          <Search className="w-8 h-8" />
                        </Button>
                      </div>
                    </div>

                    {manualStudent && (
                      <div className="bg-green-50 p-8 rounded-3xl border-2 border-green-200 animate-slide-up">
                         <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                               <UserCheck className="w-9 h-9" />
                            </div>
                            <div className="text-right">
                               <p className="text-green-700 font-black text-sm mb-1 uppercase tracking-widest">تم مطابقة الطالب</p>
                               <h3 className="text-2xl font-black text-green-900">{manualStudent.name}</h3>
                               <p className="text-green-600 font-bold">القيد: {manualStudent.regId}</p>
                            </div>
                         </div>
                      </div>
                    )}

                    <div className="pt-6">
                      <Button 
                        onClick={saveManualArchive}
                        disabled={!manualId || files.length === 0 || loading}
                        className="w-full h-20 rounded-[2rem] text-2xl font-black bg-green-600 hover:bg-green-700 shadow-xl gap-4 text-white transition-all transform hover:-translate-y-1"
                      >
                        <CloudUpload className="w-8 h-8" />
                        إتمام الأرشفة والحفظ
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-10 border-none shadow-xl rounded-[2.5rem] bg-white h-full flex flex-col">
                    {aiResults.length > 0 ? (
                      <div className="flex-1 space-y-6 overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                           <h2 className="text-2xl font-black text-primary">مراجعة النتائج المستخرجة</h2>
                           <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black">{aiResults.length} مستند</span>
                        </div>
                        <div className="overflow-y-auto pr-2 flex-1 space-y-4 max-h-[500px]">
                           {aiResults.map((res, i) => (
                             <div key={i} className="p-5 bg-muted/20 rounded-2xl border border-muted flex items-center gap-4 transition-all hover:border-primary/20">
                               <div className="w-16 h-20 relative rounded-lg overflow-hidden border bg-white shrink-0">
                                 <Image src={res.fileData} alt="thumb" fill className="object-cover" />
                               </div>
                               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <Label className="text-[10px] font-black text-muted-foreground mr-1">الاسم المستخرج</Label>
                                    <Input value={res.studentName} onChange={(e) => {
                                      const newRes = [...aiResults];
                                      newRes[i].studentName = e.target.value;
                                      setAiResults(newRes);
                                    }} className="h-9 rounded-lg font-bold text-xs" />
                                 </div>
                                 <div className="space-y-1">
                                    <Label className="text-[10px] font-black text-muted-foreground mr-1">رقم القيد</Label>
                                    <Input value={res.studentRegistrationId} onChange={(e) => {
                                      const newRes = [...aiResults];
                                      newRes[i].studentRegistrationId = e.target.value;
                                      setAiResults(newRes);
                                    }} className="h-9 rounded-lg font-black text-xs" />
                                 </div>
                               </div>
                               <Button size="icon" variant="ghost" onClick={() => setAiResults(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                             </div>
                           ))}
                        </div>
                        <Button onClick={saveBatchAI} className="w-full h-16 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-700 shadow-lg text-white gap-3 mt-4">
                           <CheckCircle className="w-6 h-6" /> تأكيد وحفظ كافة المستندات
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center text-secondary shadow-sm border border-secondary/5">
                           <Cpu className="w-12 h-12" />
                        </div>
                        <div className="max-w-xs">
                           <h3 className="text-2xl font-black text-primary mb-2">بدء التحليل المتعدد</h3>
                           <p className="text-muted-foreground font-bold">سيقوم Gemini AI بقراءة الأسماء وأرقام القيد من كافة الصور تلقائياً ودمجها مع بيانات المادة المحددة.</p>
                        </div>
                        <Button 
                          onClick={startAIAnalysis}
                          disabled={files.length === 0 || loading}
                          className="h-16 px-12 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-4 transition-all hover:scale-105"
                        >
                          <Scan className="w-6 h-6" /> بدء التحليل الذكي الفوري
                        </Button>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
