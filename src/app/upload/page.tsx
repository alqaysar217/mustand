
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  FileUp, 
  Trash2, 
  CheckCircle, 
  Loader2, 
  Scan, 
  Building2, 
  BookOpen, 
  Calendar, 
  GraduationCap, 
  Fingerprint, 
  User, 
  CloudUpload, 
  Keyboard, 
  Cpu, 
  RefreshCcw, 
  Layers, 
  Search,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
  ArrowLeft,
  UserPlus,
  ShieldCheck,
  Zap,
  X,
  AlertCircle,
  RotateCcw
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { compressImage } from "@/lib/storage-utils";
import { Badge } from "@/components/ui/badge";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

interface AIResult {
  studentRegistrationId: string;
  studentName: string;
  fileData: string;
  isVerified: boolean;
  dbStudentName?: string;
  dbDepartmentName?: string;
  status: 'pending' | 'success' | 'not_found' | 'error';
  errorMessage?: string;
}

export default function UploadPage() {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري المعالجة...");
  
  const [context, setContext] = useState({ 
    year: '', 
    deptId: '', 
    deptName: '',
    level: '', 
    term: '',
    subjectId: '',
    subjectName: ''
  });

  const [files, setFiles] = useState<string[]>([]);
  const [manualId, setManualId] = useState("");
  const [manualStudent, setManualStudent] = useState<{name: string, regId: string, deptName: string} | null>(null);
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  
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
    if (!context.deptId || !context.level || !context.term) return [];
    return (allSubjects as any[]).filter(s => 
      s.departmentId === context.deptId && 
      s.level === context.level && 
      s.term === context.term
    );
  }, [allSubjects, context.deptId, context.level, context.term]);

  const verifyStudentInDB = async (regId: string) => {
    if (!firestore || !regId) return { isVerified: false };
    try {
      const q = query(collection(firestore, "students"), where("regId", "==", regId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return { isVerified: true, dbStudentName: data.name, dbDepartmentName: data.departmentName };
      }
    } catch (e) {}
    return { isVerified: false };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    setLoading(true);
    setLoadingText("جاري تحسين جودة الصور...");
    
    const newFiles: string[] = [];
    let processed = 0;

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const { data } = await compressImage(event.target.result as string, 0.7, 1200);
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

  const processSingleImageAI = async (file: string): Promise<AIResult> => {
    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examImageDataUri: file })
      });
      
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "خطأ في الاتصال بالمحرك");
      
      const regId = responseData.studentRegistrationId || "";
      const dbCheck = await verifyStudentInDB(regId);
      
      return {
        studentRegistrationId: regId || "",
        studentName: dbCheck.isVerified ? dbCheck.dbStudentName! : (responseData.studentName || "غير متوفر"),
        dbDepartmentName: dbCheck.dbDepartmentName || (dbCheck.isVerified ? "" : "غير مسجل"),
        fileData: file,
        isVerified: dbCheck.isVerified,
        status: dbCheck.isVerified ? 'success' : 'not_found'
      };
    } catch (e: any) {
      return { 
        studentName: "فشل التحليل", 
        studentRegistrationId: "", 
        fileData: file, 
        isVerified: false,
        status: 'error',
        errorMessage: e.message
      };
    }
  };

  const startAIAnalysis = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setLoadingText("جاري استخراج البيانات ذكياً...");
    
    const results: AIResult[] = [];
    for (const file of files) {
      const res = await processSingleImageAI(file);
      results.push(res);
    }
    
    setAiResults(results);
    setLoading(false);
  };

  const handleRetryAI = async (index: number) => {
    const newResults = [...aiResults];
    newResults[index].status = 'pending';
    setAiResults(newResults);

    const freshRes = await processSingleImageAI(newResults[index].fileData);
    newResults[index] = freshRes;
    setAiResults([...newResults]);
  };

  const handleUpdateAiResult = async (index: number, field: string, value: string) => {
    const newResults = [...aiResults];
    (newResults[index] as any)[field] = value;
    
    if (field === 'studentRegistrationId') {
      const check = await verifyStudentInDB(value);
      newResults[index].isVerified = check.isVerified;
      newResults[index].status = check.isVerified ? 'success' : 'not_found';
      if (check.isVerified) {
        newResults[index].studentName = check.dbStudentName!;
        newResults[index].dbDepartmentName = check.dbDepartmentName;
      } else {
        newResults[index].studentName = "طالب غير مسجل";
        newResults[index].dbDepartmentName = "غير موجود";
      }
    }
    setAiResults(newResults);
  };

  const identifyManualStudent = async (regId: string) => {
    if (!firestore || !regId) return;
    setLoading(true);
    setLoadingText("جاري التحقق...");
    const check = await verifyStudentInDB(regId);
    if (check.isVerified) {
      setManualStudent({ name: check.dbStudentName!, regId, deptName: check.dbDepartmentName || "عام" });
      toast({ title: "تم العثور على الطالب" });
    } else {
      setManualStudent(null);
      toast({ variant: "destructive", title: "رقم غير مسجل" });
    }
    setLoading(false);
  };

  const saveManualArchive = async () => {
    if (!firestore || !manualStudent) return;
    setLoading(true);
    try {
      await addDoc(collection(firestore, "archives"), {
        student_id: manualStudent.regId,
        studentName: manualStudent.name,
        studentRegId: manualStudent.regId,
        subjectName: context.subjectName,
        subjectId: context.subjectId,
        fileUrl: files[0],
        file_data: files[0],
        file_type: "image/jpeg",
        year: context.year,
        term: context.term,
        departmentId: context.deptId,
        departmentName: context.deptName,
        level: context.level,
        uploadedAt: serverTimestamp()
      });
      toast({ title: "تمت الأرشفة بنجاح" });
      setFiles([]);
      setManualId("");
      setManualStudent(null);
    } catch (e) {
      toast({ variant: "destructive", title: "فشل الحفظ" });
    } finally {
      setLoading(false);
    }
  };

  const saveBatchAI = async () => {
    const validResults = aiResults.filter(r => r.isVerified);
    if (!firestore || validResults.length === 0) {
      toast({ variant: "destructive", title: "لا يوجد طلاب مطابقون للأرشفة" });
      return;
    }
    setLoading(true);
    setLoadingText("جاري حفظ الدفعة المطابقة...");
    try {
      for (const res of validResults) {
        await addDoc(collection(firestore, "archives"), {
          student_id: res.studentRegistrationId,
          studentRegId: res.studentRegistrationId,
          studentName: res.studentName,
          subjectName: context.subjectName,
          subjectId: context.subjectId,
          fileUrl: res.fileData,
          file_data: res.fileData,
          file_type: "image/jpeg",
          year: context.year,
          term: context.term,
          departmentId: context.deptId,
          departmentName: context.deptName,
          level: context.level,
          uploadedAt: serverTimestamp()
        });
      }
      toast({ title: `تمت أرشفة ${validResults.length} ورقة بنجاح` });
      setAiResults(aiResults.filter(r => !r.isVerified)); // إبقاء غير المطابقين فقط للمراجعة
      if (validResults.length === aiResults.length) {
        setFiles([]);
        setStep(1);
      }
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ أثناء الأرشفة" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-right" dir="rtl">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-4 md:p-10 animate-fade-in max-w-7xl mx-auto",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
          <div className="text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-primary mb-2 tracking-tight">بوابة الأرشفة الرقمية</h1>
          </div>

          <Tabs value={activeMode} onValueChange={(v: any) => { setActiveMode(v); setStep(1); setFiles([]); setAiResults([]); setManualId(""); setManualStudent(null); }} className="w-full md:w-[400px]">
            <TabsList className="grid w-full grid-cols-2 h-14 md:h-16 bg-white rounded-2xl p-1.5 shadow-xl border overflow-hidden">
              <TabsTrigger 
                value="manual" 
                className="rounded-xl font-black text-xs md:text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white"
              >
                <Keyboard className="w-4 h-4 ml-2" /> أرشفة يدوية
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-xl font-black text-xs md:text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white"
              >
                <Cpu className="w-4 h-4 ml-2" /> أرشفة ذكية
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-4 md:gap-6 p-6 text-center">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
              <Cpu className="absolute inset-0 m-auto w-8 h-8 md:w-10 md:h-10 text-primary animate-pulse" />
            </div>
            <p className="font-black text-xl md:text-2xl text-primary">{loadingText}</p>
          </div>
        )}

        {step === 1 && (
          <Card className="p-6 md:p-12 border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] bg-white animate-slide-up border-t-8 border-primary">
            <div className="flex items-center gap-4 mb-8 md:mb-10 border-b pb-6">
              <div className="p-3 md:p-4 bg-primary/5 rounded-2xl text-primary"><Layers className="w-6 h-6 md:w-8 md:h-8" /></div>
              <div className="text-right">
                <h2 className="text-xl md:text-2xl font-black text-primary">تجهيز ملف المادة</h2>
                <p className="text-xs md:text-sm font-bold text-muted-foreground">حدد تفاصيل المادة لربط الاختبارات بها</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-12">
              <div className="space-y-2">
                <Label className="font-black text-primary text-xs md:text-sm mr-1">العام الجامعي</Label>
                <select value={context.year} onChange={(e) => setContext({...context, year: e.target.value})} className="w-full h-11 md:h-12 px-4 rounded-xl border-2 bg-muted/5 font-black text-sm outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر العام...</option>
                  {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-primary text-xs md:text-sm mr-1">القسم العلمي</Label>
                <select value={context.deptId} onChange={(e) => {
                  const sel = departments.find((d: any) => d.id === e.target.value) as any;
                  setContext({...context, deptId: e.target.value, deptName: sel?.nameAr || sel?.name || ""});
                }} className="w-full h-11 md:h-12 px-4 rounded-xl border-2 bg-muted/5 font-black text-sm outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر القسم...</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-primary text-xs md:text-sm mr-1">المستوى</Label>
                <select value={context.level} onChange={(e) => setContext({...context, level: e.target.value})} className="w-full h-11 md:h-12 px-4 rounded-xl border-2 bg-muted/5 font-black text-sm outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر المستوى...</option>
                  {["المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع", "المستوى الخامس"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-primary text-xs md:text-sm mr-1">الفصل الدراسي</Label>
                <select value={context.term} onChange={(e) => setContext({...context, term: e.target.value})} className="w-full h-11 md:h-12 px-4 rounded-xl border-2 bg-muted/5 font-black text-sm outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر الفصل...</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-black text-primary text-xs md:text-sm mr-1">المادة الدراسية</Label>
                <select 
                  value={context.subjectId} 
                  onChange={(e) => {
                    const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                    setContext({...context, subjectId: e.target.value, subjectName: sel?.nameAr || ""});
                  }} 
                  className="w-full h-11 md:h-12 px-4 rounded-xl border-2 bg-muted/5 font-black text-sm text-primary outline-none focus:border-primary text-right appearance-none"
                >
                  <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "يرجى تحديد القسم والمستوى أولاً"}</option>
                  {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
            </div>

            <Button onClick={() => setStep(2)} disabled={!context.subjectId} className="w-full md:w-auto md:px-20 h-14 md:h-16 rounded-2xl text-lg md:text-xl font-black gradient-blue shadow-2xl gap-4 text-white hover:scale-[1.02] transition-all mx-auto flex">
              متابعة الخطوة التالية <ArrowLeft className="w-6 h-6" />
            </Button>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-6 md:space-y-10 animate-slide-up pb-20">
            {/* عرض المادة الحالية - متجاوب */}
            <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-r-8 border-secondary">
               <div className="flex items-center gap-4 md:gap-5 w-full md:w-auto">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary shrink-0"><BookOpen className="w-6 h-6 md:w-8 md:h-8" /></div>
                  <div className="text-right overflow-hidden">
                    <h3 className="text-lg md:text-2xl font-black text-primary truncate">{context.subjectName}</h3>
                    <p className="text-xs md:text-sm font-bold text-muted-foreground truncate">{context.deptName} • {context.level}</p>
                  </div>
               </div>
               <Button variant="outline" size="sm" onClick={() => setStep(1)} className="rounded-xl font-black h-10 md:h-12 px-4 md:px-6 border-2 w-full md:w-auto gap-2">
                 <RefreshCcw className="w-4 h-4" /> تغيير المادة
               </Button>
            </div>

            {/* منطقة رفع الصور */}
            <Card className="p-6 md:p-8 border-none shadow-2xl rounded-[2rem] bg-white">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-black text-primary flex items-center gap-3">
                    <ImageIcon className="w-6 h-6 md:w-7 md:h-7 text-secondary" />
                    الأوراق المرفوعة
                    <Badge variant="secondary" className="bg-muted px-2.5 rounded-lg text-primary">{files.length}</Badge>
                  </h2>
                  <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-secondary font-black hover:bg-secondary/5 rounded-xl border-2 border-transparent text-xs md:text-sm">
                    <UserPlus className="w-5 h-5 ml-1 md:ml-2" /> إضافة
                  </Button>
               </div>

              <div 
                onClick={() => files.length === 0 && fileInputRef.current?.click()}
                className={cn(
                  "w-full min-h-[180px] md:min-h-[220px] rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all",
                  files.length === 0 ? "border-4 border-dashed border-muted cursor-pointer hover:border-primary hover:bg-primary/5" : "bg-muted/10 p-4 md:p-8"
                )}
              >
                {files.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-5 w-full">
                    {files.map((f, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md group border-2 border-white transition-transform hover:scale-105">
                        <Image src={f} alt="Exam" fill className="object-cover" />
                        {aiResults.length === 0 && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                             <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2"><FileUp className="w-8 h-8 md:w-10 md:h-10" /></div>
                    <p className="text-lg md:text-xl font-black text-primary">اسحب صور الاختبارات هنا</p>
                    <p className="text-xs font-bold text-muted-foreground">يدعم رفع عدة صور دفعة واحدة</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={activeMode === 'ai'} onChange={handleFileUpload} />
              
              {files.length > 0 && activeMode === 'ai' && aiResults.length === 0 && (
                <Button onClick={startAIAnalysis} className="w-full mt-8 md:mt-10 rounded-2xl font-black gradient-blue shadow-2xl text-white h-16 md:h-20 text-xl md:text-2xl hover:scale-[1.01] transition-all">
                  <Scan className="w-6 h-6 md:w-8 md:h-8 ml-3 md:ml-4 animate-pulse" /> بدء التحليل والاستخراج الذكي
                </Button>
              )}
            </Card>

            {/* مراجعة النتائج */}
            {activeMode === 'manual' ? (
              files.length > 0 && (
                <Card className="p-6 md:p-10 border-none shadow-2xl rounded-[2rem] bg-white animate-slide-up border-b-8 border-green-500">
                  <div className="flex items-center gap-3 mb-6 md:mb-8">
                     <div className="p-2.5 bg-green-50 rounded-xl text-green-600"><CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" /></div>
                     <h2 className="text-xl md:text-2xl font-black text-primary">التحقق اليدوي من الطالب</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                     <div className="space-y-2">
                        <Label className="font-black text-primary text-xs md:text-sm mr-1">رقم القيد</Label>
                        <div className="flex gap-2">
                          <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="0000" className="h-12 md:h-14 rounded-xl border-2 font-black text-xl text-center shadow-inner" onKeyDown={(e) => e.key === 'Enter' && identifyManualStudent(manualId)} />
                          <Button onClick={() => identifyManualStudent(manualId)} className="h-12 md:h-14 w-12 md:w-14 rounded-xl gradient-blue text-white shrink-0 shadow-lg"><Search className="w-5 h-5 md:w-6 md:h-6" /></Button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="font-black text-primary text-xs md:text-sm mr-1">الاسم بالكامل</Label>
                        <div className={cn("h-12 md:h-14 bg-muted/20 border-2 border-transparent rounded-xl px-4 flex items-center font-black text-sm md:text-xl", manualStudent ? "text-primary bg-primary/5" : "text-muted-foreground")}>{manualStudent?.name || "سيظهر الاسم هنا..."}</div>
                     </div>
                     <div className="space-y-2">
                        <Label className="font-black text-primary text-xs md:text-sm mr-1">التخصص الدراسي</Label>
                        <div className={cn("h-12 md:h-14 bg-muted/20 border-2 border-transparent rounded-xl px-4 flex items-center font-black text-xs md:text-lg", manualStudent ? "text-secondary bg-secondary/5" : "text-muted-foreground")}>{manualStudent?.deptName || "---"}</div>
                     </div>
                  </div>
                  {manualStudent && (
                    <Button onClick={saveManualArchive} className="w-full mt-10 md:mt-12 h-16 md:h-20 rounded-2xl md:rounded-[2.5rem] text-xl md:text-3xl font-black bg-green-600 hover:bg-green-700 shadow-2xl text-white gap-3 md:gap-4 transition-all">
                      <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10" /> اعتماد وحفظ الورقة
                    </Button>
                  )}
                </Card>
              )
            ) : (
              aiResults.length > 0 && (
                <div className="space-y-6 md:space-y-8 animate-slide-up">
                  <div className="flex flex-col md:flex-row items-center justify-between bg-white px-6 md:px-10 py-5 md:py-6 rounded-2xl md:rounded-[2.5rem] shadow-xl border-r-8 border-green-500 gap-4">
                     <div className="text-center md:text-right">
                        <h2 className="text-lg md:text-2xl font-black text-primary">مراجعة نتائج التحقق</h2>
                        <p className="text-muted-foreground font-bold text-xs md:text-base">يرجى تصحيح الأرقام غير المسجلة (باللون الأحمر) لتطابق السجلات.</p>
                     </div>
                     <Badge className="bg-primary text-white px-6 md:px-10 py-2.5 md:py-3 rounded-xl font-black text-lg md:text-xl">{aiResults.length} ورقة</Badge>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                     {aiResults.map((res, i) => (
                       <Card key={i} className={cn(
                         "p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 md:border-4 flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-white shadow-xl relative overflow-hidden transition-all", 
                         res.status === 'success' ? "border-green-400" : res.status === 'error' ? "border-orange-400 bg-orange-50/10" : "border-red-500 bg-red-50/20"
                        )}>
                          {/* شريط الحالة الجانبي */}
                          <div className={cn("absolute top-0 right-0 w-2 md:w-3 h-full", 
                            res.status === 'success' ? "bg-green-400" : res.status === 'error' ? "bg-orange-400" : "bg-red-500"
                          )} />
                          
                          {/* صورة مصغرة */}
                          <div className="w-full md:w-32 h-40 md:h-44 relative rounded-xl overflow-hidden shadow-lg shrink-0 border-2 border-white">
                             <Image src={res.fileData} alt="Extracted" fill className="object-cover" />
                             {res.status === 'pending' && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}
                          </div>

                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full text-right">
                             {/* الاسم */}
                             <div className="space-y-1">
                                <Label className="text-[10px] md:text-xs font-black text-muted-foreground mr-1">الاسم من السجلات</Label>
                                <div className={cn(
                                  "h-11 md:h-12 rounded-xl px-3 flex items-center font-black text-xs md:text-sm truncate", 
                                  res.status === 'success' ? "bg-green-50 text-primary border border-green-100" : "bg-red-50 text-red-800 border border-red-100"
                                )}>
                                  {res.status === 'error' ? <span className="text-orange-600 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> فشل التحليل</span> : res.studentName}
                                </div>
                             </div>
                             
                             {/* رقم القيد */}
                             <div className="space-y-1">
                                <Label className="text-[10px] md:text-xs font-black text-muted-foreground mr-1">رقم القيد</Label>
                                <Input 
                                  value={res.studentRegistrationId} 
                                  disabled={res.status === 'pending'}
                                  onChange={(e) => handleUpdateAiResult(i, 'studentRegistrationId', e.target.value)} 
                                  className={cn(
                                    "h-11 md:h-12 rounded-xl font-black text-lg md:text-xl text-center shadow-inner", 
                                    res.status === 'not_found' ? "border-red-500 bg-red-50" : "border-muted"
                                  )} 
                                />
                             </div>

                             {/* الحالة والرسائل */}
                             <div className="lg:col-span-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                               <div className="flex flex-col gap-1 w-full sm:w-auto">
                                 {res.status === 'success' ? (
                                   <Badge className="bg-green-500 text-white h-10 md:h-12 px-4 rounded-xl font-black flex items-center justify-center gap-2 shadow-md">
                                     <ShieldCheck className="w-4 h-4" /> مطابق للنظام
                                   </Badge>
                                 ) : res.status === 'error' ? (
                                   <div className="flex flex-col gap-1">
                                      <Badge variant="outline" className="bg-orange-50 text-orange-700 h-10 md:h-12 px-4 rounded-xl font-black flex items-center justify-center gap-2 border-orange-200">
                                        <AlertTriangle className="w-4 h-4" /> فشل التحليل
                                      </Badge>
                                      <p className="text-[10px] text-orange-600 font-bold px-1">يرجى التأكد من النت أو جودة الصورة</p>
                                   </div>
                                 ) : (
                                   <div className="flex flex-col gap-1">
                                      <Badge variant="outline" className="bg-red-50 text-red-700 h-10 md:h-12 px-4 rounded-xl font-black flex items-center justify-center gap-2 border-red-200">
                                        <AlertCircle className="w-4 h-4" /> طالب غير مسجل
                                      </Badge>
                                      <p className="text-[10px] text-red-600 font-bold px-1">تأكد من الرقم أو سجل الطالب أولاً</p>
                                   </div>
                                 )}
                               </div>

                               <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                 {res.status === 'error' && (
                                   <Button size="icon" variant="outline" onClick={() => handleRetryAI(i)} className="h-10 w-10 md:h-12 md:w-12 rounded-xl border-2 hover:bg-orange-50 text-orange-600" title="إعادة المحاولة">
                                     <RotateCcw className="w-5 h-5" />
                                   </Button>
                                 )}
                                 <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => setAiResults(prev => prev.filter((_, idx) => idx !== i))} 
                                    className="text-destructive hover:bg-red-50 rounded-xl h-10 w-10 md:h-12 md:w-12"
                                  >
                                    <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
                                  </Button>
                               </div>
                             </div>
                          </div>
                       </Card>
                     ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-6 pb-20">
                     <Button 
                      onClick={saveBatchAI} 
                      disabled={aiResults.filter(r => r.isVerified).length === 0}
                      className="flex-1 h-16 md:h-24 rounded-2xl md:rounded-[2rem] text-lg md:text-3xl font-black gradient-blue shadow-2xl text-white gap-4 md:gap-6 border-b-8 border-primary/50"
                     >
                       <CloudUpload className="w-8 h-8 md:w-10 md:h-10" /> اعتماد وأرشفة الدفعة المطابقة
                     </Button>
                     <Button variant="outline" onClick={() => { setAiResults([]); setFiles([]); }} className="h-16 md:h-24 px-10 md:px-16 rounded-2xl md:rounded-[2rem] font-black border-2 md:border-4 text-lg md:text-2xl text-primary hover:bg-muted/50">إلغاء الكل</Button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
