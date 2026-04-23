
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
  RefreshCcw, 
  X, 
  Layers, 
  Search,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  ImageIcon
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSidebarToggle } from "@/components/providers/SidebarProvider";
import { compressImage } from "@/lib/storage-utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

interface AIResult {
  studentRegistrationId: string;
  studentName: string;
  subjectName: string;
  fileData: string;
  isVerified?: boolean;
  dbStudentName?: string;
  isSearching?: boolean;
}

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
  const [manualStudent, setManualStudent] = useState<{name: string, regId: string, deptName: string} | null>(null);

  // AI Flow State
  const [aiResults, setAiResults] = useState<AIResult[]>([]);
  
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
    if (!context.deptId || !context.level || !context.term) return [];
    return (allSubjects as any[]).filter(s => {
      const matchDept = s.departmentId === context.deptId || s.departmentName === context.deptName;
      const matchLevel = s.level === context.level;
      const matchTerm = s.term === context.term;
      return matchDept && matchLevel && matchTerm;
    });
  }, [allSubjects, context.deptId, context.level, context.term, context.deptName]);

  // Handle student identification in manual mode
  const identifyStudent = async (regId: string) => {
    if (!firestore || !regId) return;
    setLoading(true);
    try {
      const q = query(collection(firestore, "students"), where("regId", "==", regId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setManualStudent({ 
          name: data.name, 
          regId: data.regId, 
          deptName: data.departmentName || "غير محدد" 
        });
        toast({ title: "تم التعرف على الطالب بنجاح" });
      } else {
        setManualStudent(null);
        toast({ 
          variant: "destructive", 
          title: "الطالب غير موجود", 
          description: "يرجى إضافة الطالب أولاً من واجهة إدارة الطلاب." 
        });
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
    if (!firestore || !manualId || files.length === 0 || !manualStudent) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "تأكد من اختيار الطالب ورفع الصورة." });
      return;
    }
    setLoading(true);
    setLoadingText("جاري حفظ الأرشيف...");
    try {
      await addDoc(collection(firestore, "archives"), {
        student_id: manualId,
        studentName: manualStudent.name,
        studentRegId: manualId,
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

  // AI Logic with DB Verification
  const verifyStudentInDB = async (regId: string) => {
    if (!firestore || !regId) return { isVerified: false };
    const q = query(collection(firestore, "students"), where("regId", "==", regId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const data = snap.docs[0].data();
      return { isVerified: true, dbStudentName: data.name };
    }
    return { isVerified: false };
  };

  const startAIAnalysis = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setLoadingText("جاري تحليل الأوراق والتحقق من البيانات...");
    
    const results: AIResult[] = [];
    for (const file of files) {
      try {
        const response = await fetch('/api/ai/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examImageDataUri: file })
        });
        const data = await response.json();
        
        // التحقق المباشر من قاعدة البيانات
        const dbCheck = await verifyStudentInDB(data.studentRegistrationId || "");
        
        results.push({
          ...data,
          studentRegistrationId: data.studentRegistrationId || "",
          studentName: dbCheck.dbStudentName || data.studentName || "غير معروف",
          subjectName: context.subjectName, 
          fileData: file,
          isVerified: dbCheck.isVerified,
          dbStudentName: dbCheck.dbStudentName
        });
      } catch (e) {
        results.push({ 
          studentName: "فشل التحليل", 
          studentRegistrationId: "", 
          subjectName: context.subjectName, 
          fileData: file,
          isVerified: false 
        });
      }
    }
    
    setAiResults(results);
    setLoading(false);
  };

  const handleUpdateAiResult = async (index: number, field: string, value: string) => {
    const newResults = [...aiResults];
    (newResults[index] as any)[field] = value;
    
    if (field === 'studentRegistrationId') {
      const check = await verifyStudentInDB(value);
      newResults[index].isVerified = check.isVerified;
      if (check.isVerified) {
        newResults[index].studentName = check.dbStudentName || newResults[index].studentName;
      }
    }
    setAiResults(newResults);
  };

  const saveBatchAI = async () => {
    if (!firestore || aiResults.length === 0) return;
    setLoading(true);
    setLoadingText("جاري حفظ الأرشيف...");
    
    try {
      for (const res of aiResults) {
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
      toast({ title: `تم بنجاح أرشفة ${aiResults.length} ورقة اختبار` });
      setFiles([]);
      setAiResults([]);
      setStep(1); 
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
          <div className="text-right">
            <h1 className="text-4xl font-black text-primary mb-2">مركز الأرشفة الذكي</h1>
            <p className="text-muted-foreground font-bold text-lg">اختر آلية الرفع المناسبة لبدء التوثيق الرقمي</p>
          </div>
          <Tabs value={activeMode} onValueChange={(v: any) => { setActiveMode(v); setStep(1); setFiles([]); setAiResults([]); setManualId(""); setManualStudent(null); }} className="w-full md:w-[450px]">
            <TabsList className="grid w-full grid-cols-2 h-16 bg-white/50 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-white">
              <TabsTrigger 
                value="manual" 
                className="rounded-xl font-black text-base transition-all duration-300 data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Keyboard className="w-5 h-5 ml-2" /> الرفع اليدوي
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-xl font-black text-base transition-all duration-300 data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Cpu className="w-5 h-5 ml-2" /> الرفع الذكي
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

        {/* Step 1: Selection Context */}
        {step === 1 && (
          <Card className="p-8 md:p-12 border-none shadow-2xl rounded-[2.5rem] bg-white animate-slide-up">
            <div className="flex items-center gap-4 mb-10 border-b pb-6">
              <div className="p-4 bg-primary/5 rounded-2xl text-primary shadow-sm"><Layers className="w-8 h-8" /></div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-primary">تحديد السياق الأكاديمي</h2>
                <p className="text-muted-foreground font-bold">تحديد المادة والتخصص لربط كافة الأوراق المرفوعة بها تلقائياً</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 text-right">
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
                <Label className="font-black text-primary pr-1">المستوى الدراسي</Label>
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
                  disabled={!context.deptId || !context.level || !context.term}
                  value={context.subjectId} 
                  onChange={(e) => {
                    const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                    setContext({...context, subjectId: e.target.value, subjectName: sel?.nameAr || ""});
                  }}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-muted bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right disabled:opacity-50"
                >
                  <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "لا توجد مواد لهذا القسم والمستوى"}</option>
                  {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!context.year || !context.deptId || !context.level || !context.subjectId || !context.term}
                className="h-16 px-20 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-3 transition-transform hover:scale-105 active:scale-95 text-white"
              >
                تثبيت البيانات والبدء
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Upload and Process */}
        {step === 2 && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-white p-5 rounded-[2rem] shadow-lg border-2 border-white flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-inner"><BookOpen className="w-7 h-7" /></div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">أرشفة مادة</span>
                    <h3 className="text-lg font-black text-primary">{context.subjectName}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-secondary mt-0.5">
                       <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{context.deptName}</span>
                       <span className="w-1 h-1 rounded-full bg-secondary/30"></span>
                       <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{context.level} - {context.term}</span>
                    </div>
                  </div>
               </div>
               <Button variant="outline" size="sm" onClick={() => setStep(1)} className="rounded-xl font-black gap-2 border-2 border-muted h-11 px-6 hover:bg-muted/50">
                 <RefreshCcw className="w-4 h-4" /> تغيير الإعدادات
               </Button>
            </div>

            <div className={cn(
              "grid gap-8",
              activeMode === 'manual' || (activeMode === 'ai' && aiResults.length === 0) 
                ? "grid-cols-1 lg:grid-cols-12" 
                : "grid-cols-1"
            )}>
              <div className={cn(
                activeMode === 'manual' || (activeMode === 'ai' && aiResults.length === 0) 
                  ? "lg:col-span-5" 
                  : "w-full"
              )}>
                <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white h-full flex flex-col items-center justify-center relative overflow-hidden group">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-full min-h-[350px] border-4 border-dashed border-muted/50 rounded-[2rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    {files.length > 0 ? (
                      <div className="relative w-full h-full p-6 flex flex-col items-center">
                        {activeMode === 'manual' ? (
                          <div className="relative w-full aspect-[3/4] max-h-[400px]">
                            <Image src={files[0]} alt="Preview" fill className="object-contain rounded-xl shadow-lg" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full">
                            {files.map((f, i) => (
                              <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border-2 border-white group/img">
                                <Image src={f} alt={`Page ${i+1}`} fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                  <span className="text-white font-black text-xs">صفحة {i+1}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-4 mt-8">
                          <Button 
                            variant="destructive" 
                            onClick={(e) => { e.stopPropagation(); setFiles([]); setAiResults([]); setManualId(""); setManualStudent(null); }} 
                            className="rounded-2xl shadow-lg h-12 px-6 gap-2"
                          >
                            <Trash2 className="w-5 h-5" /> مسح الكل
                          </Button>
                          {activeMode === 'ai' && aiResults.length === 0 && (
                            <Button 
                              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} 
                              className="rounded-2xl shadow-lg h-12 px-6 gap-2 bg-secondary text-white"
                            >
                              <ImageIcon className="w-5 h-5" /> إضافة المزيد
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                          <FileUp className="w-12 h-12" />
                        </div>
                        <div className="text-center px-4">
                          <p className="text-2xl font-black text-primary mb-2">اضغط لرفع ورقة الاختبار</p>
                          <p className="text-muted-foreground font-bold text-sm">أو اسحب الصورة وأفلتها هنا</p>
                        </div>
                      </>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={activeMode === 'ai'} onChange={handleFileUpload} />
                </Card>
              </div>

              <div className={cn(
                activeMode === 'manual' || (activeMode === 'ai' && aiResults.length === 0) 
                  ? "lg:col-span-7" 
                  : "w-full"
              )}>
                {activeMode === 'manual' ? (
                  <Card className="p-10 border-none shadow-2xl rounded-[2.5rem] bg-white h-full space-y-8 flex flex-col text-right">
                    <div className="space-y-4">
                      <Label className="text-xl font-black text-primary flex items-center gap-3 mb-2 justify-start">
                        <Fingerprint className="w-7 h-7 text-secondary" />
                        رقم القيد الجامعي
                      </Label>
                      <div className="flex gap-4">
                        <div className="relative flex-1">
                          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                          <Input 
                            value={manualId} 
                            onChange={(e) => setManualId(e.target.value)}
                            placeholder="أدخل رقم القيد المكتوب في الورقة..." 
                            className="h-16 pr-14 rounded-2xl border-2 text-2xl font-black text-right focus:ring-primary/20"
                            onKeyDown={(e) => e.key === 'Enter' && identifyStudent(manualId)}
                          />
                        </div>
                        <Button 
                          onClick={() => identifyStudent(manualId)}
                          disabled={!manualId || loading}
                          className="h-16 w-20 rounded-2xl gradient-blue shadow-lg transition-transform active:scale-90 text-white"
                        >
                          <Search className="w-8 h-8" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-xs font-black text-muted-foreground pr-1">اسم الطالب (آلي)</Label>
                          <div className="h-14 bg-muted/20 border-2 rounded-2xl px-5 flex items-center font-black text-primary">
                             {manualStudent?.name || "بانتظار رقم القيد..."}
                          </div>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-black text-muted-foreground pr-1">تخصص الطالب المسجل</Label>
                          <div className="h-14 bg-muted/20 border-2 rounded-2xl px-5 flex items-center font-black text-secondary">
                             {manualStudent?.deptName || "---"}
                          </div>
                       </div>
                    </div>

                    {manualStudent && (
                      <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-200 animate-slide-up mt-auto">
                         <div className="flex items-center gap-5 justify-start">
                            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                               <UserCheck className="w-8 h-8" />
                            </div>
                            <div className="text-right">
                               <p className="text-green-700 font-black text-xs mb-0.5">تم التحقق من هوية الطالب</p>
                               <h3 className="text-xl font-black text-green-900">{manualStudent.name}</h3>
                            </div>
                         </div>
                      </div>
                    )}

                    {!manualStudent && manualId && !loading && (
                      <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-200 animate-slide-up flex items-center gap-4 text-red-700">
                         <AlertCircle className="w-8 h-8 shrink-0" />
                         <p className="font-black text-sm text-right">هذا الرقم غير مسجل. يرجى إضافة بيانات الطالب في صفحة إدارة الطلاب أولاً.</p>
                      </div>
                    )}

                    <div className="pt-6">
                      <Button 
                        onClick={saveManualArchive}
                        disabled={!manualId || files.length === 0 || loading || !manualStudent}
                        className="w-full h-20 rounded-[2.5rem] text-2xl font-black bg-green-600 hover:bg-green-700 shadow-xl gap-4 text-white transition-all transform hover:-translate-y-1 disabled:opacity-50"
                      >
                        <CloudUpload className="w-8 h-8" />
                        إتمام الأرشفة والحفظ
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <>
                    {aiResults.length > 0 ? (
                      <Card className="p-8 md:p-10 border-none shadow-2xl rounded-[2.5rem] bg-white w-full space-y-8 flex flex-col text-right animate-slide-up">
                        <div className="flex items-center justify-between mb-4 border-b pb-6">
                           <div className="space-y-1">
                             <h2 className="text-3xl font-black text-primary flex items-center gap-3">
                               <CheckCircle className="w-8 h-8 text-green-500" />
                               مراجعة والتحقق من النتائج
                             </h2>
                             <p className="text-muted-foreground font-bold">تأكد من مطابقة أرقام القيد وحالة التحقق قبل الاعتماد النهائي في الأرشيف.</p>
                           </div>
                           <div className="bg-primary/10 text-primary px-8 py-3 rounded-2xl text-lg font-black shadow-sm">{aiResults.length} ورقة جاهزة</div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6">
                           {aiResults.map((res, i) => (
                             <div key={i} className={cn(
                               "p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center gap-8 transition-all group hover:shadow-xl",
                               res.isVerified ? "bg-green-50/40 border-green-100" : "bg-red-50/40 border-red-100"
                             )}>
                               <div className="w-32 h-40 relative rounded-[2rem] overflow-hidden border-4 border-white shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                                 <Image src={res.fileData} alt="thumb" fill className="object-cover" />
                                 <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full">#{i+1}</div>
                               </div>
                               
                               <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                                 <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground mr-2">اسم الطالب المستخرج</Label>
                                    <div className="relative">
                                      <Input 
                                        value={res.studentName} 
                                        onChange={(e) => handleUpdateAiResult(i, 'studentName', e.target.value)} 
                                        className="h-14 rounded-2xl font-bold text-base bg-white border-muted pr-10" 
                                      />
                                      <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    </div>
                                 </div>
                                 <div className="space-y-2">
                                    <Label className="text-xs font-black text-muted-foreground mr-2">رقم القيد الجامعي</Label>
                                    <div className="relative">
                                      <Input 
                                        value={res.studentRegistrationId} 
                                        onChange={(e) => handleUpdateAiResult(i, 'studentRegistrationId', e.target.value)} 
                                        className={cn(
                                          "h-14 rounded-2xl font-black text-xl bg-white pr-12",
                                          res.isVerified ? "border-green-500 text-green-700" : "border-red-500 text-red-700"
                                        )} 
                                      />
                                      <Fingerprint className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    </div>
                                 </div>
                                 <div className="flex flex-col justify-center items-center md:items-end gap-2">
                                    <Label className="text-xs font-black text-muted-foreground mb-1">حالة التحقق</Label>
                                    {res.isVerified ? (
                                      <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-black text-sm flex items-center gap-2 shadow-sm border border-green-200">
                                        <CheckCircle2 className="w-5 h-5" /> مطابق للسجلات
                                      </div>
                                    ) : (
                                      <div className="bg-red-100 text-red-700 px-6 py-2 rounded-full font-black text-sm flex items-center gap-2 shadow-sm border border-red-200">
                                        <XCircle className="w-5 h-5" /> غير مسجل
                                      </div>
                                    )}
                                 </div>
                               </div>

                               <div className="flex shrink-0">
                                 <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => setAiResults(prev => prev.filter((_, idx) => idx !== i))} 
                                  className="text-destructive hover:bg-red-100 rounded-2xl w-14 h-14 shadow-sm border border-transparent hover:border-red-200 transition-colors"
                                 >
                                   <Trash2 className="w-7 h-7" />
                                 </Button>
                               </div>
                             </div>
                           ))}
                        </div>
                        
                        <div className="pt-10 grid grid-cols-1 md:grid-cols-2 gap-6 border-t mt-6">
                          <Button 
                            onClick={saveBatchAI} 
                            disabled={aiResults.length === 0 || loading}
                            className="h-20 rounded-[2.5rem] text-2xl font-black bg-green-600 hover:bg-green-700 shadow-2xl text-white gap-4 transform transition-transform hover:-translate-y-1"
                          >
                             <CheckCircle className="w-8 h-8" /> اعتماد وحفظ الكل في الأرشيف
                          </Button>
                          <Button 
                            variant="outline"
                            onClick={() => { setAiResults([]); setFiles([]); }}
                            className="h-20 rounded-[2.5rem] text-2xl font-black border-2 border-muted hover:bg-muted/10 gap-4"
                          >
                             <RefreshCcw className="w-8 h-8" /> إلغاء وإعادة المحاولة
                          </Button>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-12 border-none shadow-2xl rounded-[2.5rem] bg-white h-full flex flex-col items-center justify-center text-center space-y-10">
                        <div className="relative">
                           <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
                           <div className="w-40 h-40 bg-white rounded-[3.5rem] flex items-center justify-center text-secondary shadow-2xl border-2 border-secondary/5 relative z-10">
                              <Cpu className="w-20 h-20" />
                           </div>
                        </div>
                        <div className="max-w-md space-y-4">
                           <h3 className="text-4xl font-black text-primary">بدء التحليل والتحقق</h3>
                           <p className="text-muted-foreground font-bold text-lg leading-relaxed">سيقوم Gemini AI بمسح الأوراق، وسنقوم فوراً بمطابقة الأسماء مع قاعدة البيانات لضمان دقة الأرشفة.</p>
                        </div>
                        <Button 
                          onClick={startAIAnalysis}
                          disabled={files.length === 0 || loading}
                          className="h-24 px-20 rounded-[3rem] text-3xl font-black gradient-blue shadow-2xl gap-6 transition-all hover:scale-105 active:scale-95 text-white"
                        >
                          <Scan className="w-10 h-10" /> بدء التحليل الذكي الفوري
                        </Button>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
