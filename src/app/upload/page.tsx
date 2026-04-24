
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
  Info,
  ShieldCheck,
  XCircle,
  X
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
  fileData: string;
  isVerified: boolean;
  dbStudentName?: string;
  dbDepartmentName?: string;
  status: 'pending' | 'success' | 'failed';
}

export default function UploadPage() {
  const [activeMode, setActiveMode] = useState<'manual' | 'ai'>('manual');
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("جاري المعالجة...");
  const [apiTesting, setApiTesting] = useState(false);
  
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

  const checkApiConnection = async () => {
    setApiTesting(true);
    try {
      const res = await fetch('/api/ai/test');
      const data = await res.json();
      if (data.success) {
        toast({ title: "تم الاتصال بنجاح!", description: "المفتاح يعمل والمحرك مستعد للتحليل الذكي." });
      } else {
        toast({ 
          variant: "destructive", 
          title: "فشل اختبار المفتاح", 
          description: data.rawError || "يرجى التحقق من صحة المفتاح في AI Studio."
        });
      }
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في الشبكة", description: "تعذر الاتصال بخادم الاختبار." });
    } finally {
      setApiTesting(false);
    }
  };

  const identifyStudent = async (regId: string) => {
    if (!firestore || !regId) return;
    setLoading(true);
    setLoadingText("جاري التحقق من سجلات الطلاب...");
    try {
      const check = await verifyStudentInDB(regId);
      if (check.isVerified) {
        setManualStudent({ 
          name: check.dbStudentName!, 
          regId: regId, 
          deptName: check.dbDepartmentName || "غير محدد" 
        });
        toast({ title: "تم العثور على الطالب" });
      } else {
        setManualStudent(null);
        toast({ variant: "destructive", title: "طالب غير مسجل", description: "رقم القيد هذا غير موجود في قاعدة البيانات." });
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
    setLoadingText("جاري ضغط وتحسين جودة الصور...");
    
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

  const startAIAnalysis = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setLoadingText("جاري استخراج البيانات عبر محرك Gemini 1.5...");
    
    const tempResults: AIResult[] = [];

    for (const file of files) {
      try {
        const response = await fetch('/api/ai/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examImageDataUri: file })
        });
        
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(responseData.error || `خطأ (${response.status})`);
        }
        
        const regId = responseData.studentRegistrationId || "";
        const dbCheck = await verifyStudentInDB(regId);
        
        tempResults.push({
          studentRegistrationId: regId || "",
          studentName: dbCheck.isVerified ? dbCheck.dbStudentName! : (responseData.studentName || "غير معروف"),
          dbDepartmentName: dbCheck.dbDepartmentName || (dbCheck.isVerified ? "" : "غير مسجل"),
          fileData: file,
          isVerified: dbCheck.isVerified,
          status: dbCheck.isVerified ? 'success' : 'failed'
        });
      } catch (e: any) {
        tempResults.push({ 
          studentName: "فشل التحليل الذكي", 
          studentRegistrationId: "", 
          fileData: file, 
          isVerified: false,
          status: 'failed'
        });
      }
    }
    
    setAiResults(tempResults);
    setLoading(false);
  };

  const handleUpdateAiResult = async (index: number, field: string, value: string) => {
    const newResults = [...aiResults];
    (newResults[index] as any)[field] = value;
    
    if (field === 'studentRegistrationId') {
      const check = await verifyStudentInDB(value);
      newResults[index].isVerified = check.isVerified;
      newResults[index].status = check.isVerified ? 'success' : 'failed';
      if (check.isVerified) {
        newResults[index].studentName = check.dbStudentName!;
        newResults[index].dbDepartmentName = check.dbDepartmentName;
      } else {
        newResults[index].studentName = "طالب غير مسجل";
        newResults[index].dbDepartmentName = "غير موجود في النظام";
      }
    }
    setAiResults(newResults);
  };

  const saveManualArchive = async () => {
    if (!firestore || !manualStudent) return;
    setLoading(true);
    setLoadingText("جاري الأرشفة النهائية...");
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
    if (!firestore || aiResults.length === 0) return;
    setLoading(true);
    setLoadingText("جاري أرشفة الدفعة بالكامل...");
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
      toast({ title: "اكتملت الأرشفة الذكية للدفعة" });
      setFiles([]);
      setAiResults([]);
      setStep(1); 
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
        "transition-all duration-300 p-6 md:p-10 animate-fade-in max-w-7xl mx-auto",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )}>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-primary mb-2 tracking-tight">أرشفة الاختبارات</h1>
            <p className="text-muted-foreground font-bold text-lg">نظام الكشف الذكي المطور (Gemini 1.5 Flash)</p>
          </div>

          <div className="flex flex-col items-end gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 mb-2">
               <Info className="w-4 h-4 text-blue-600" />
               <span className="text-[10px] font-black text-blue-800">مشروعك في AI Studio: 242985731141</span>
               <Button 
                onClick={checkApiConnection} 
                disabled={apiTesting}
                variant="ghost"
                className="h-7 px-3 text-[10px] font-black bg-blue-600 text-white rounded-lg hover:bg-blue-700 mr-2"
              >
                {apiTesting ? <Loader2 className="w-3 h-3 animate-spin" /> : "فحص المفتاح"}
              </Button>
            </div>
            
            <Tabs value={activeMode} onValueChange={(v: any) => { setActiveMode(v); setStep(1); setFiles([]); setAiResults([]); setManualId(""); setManualStudent(null); }} className="w-full md:w-[400px]">
              <TabsList className="grid w-full grid-cols-2 h-16 bg-white rounded-2xl p-1.5 shadow-xl border overflow-hidden">
                <TabsTrigger 
                  value="manual" 
                  className="rounded-xl font-black text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Keyboard className="w-4 h-4 ml-2" /> أرشفة يدوية
                </TabsTrigger>
                <TabsTrigger 
                  value="ai" 
                  className="rounded-xl font-black text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  <Cpu className="w-4 h-4 ml-2" /> أرشفة ذكية
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
              <Cpu className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
            </div>
            <p className="font-black text-2xl text-primary">{loadingText}</p>
          </div>
        )}

        {step === 1 && (
          <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white animate-slide-up border-r-8 border-primary">
            <div className="flex items-center gap-5 mb-10 border-b pb-6">
              <div className="p-4 bg-primary/5 rounded-2xl text-primary shadow-sm"><Layers className="w-8 h-8" /></div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-primary">تحديد تفاصيل الأرشفة</h2>
                <p className="text-sm font-bold text-muted-foreground">اختر المادة لربط الأوراق بها</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="space-y-3 text-right">
                <Label className="font-black text-primary flex items-center gap-2 pr-1 justify-start"><Calendar className="w-4 h-4 text-secondary" />العام الجامعي</Label>
                <select value={context.year} onChange={(e) => setContext({...context, year: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 bg-muted/5 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر العام...</option>
                  {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                </select>
              </div>
              <div className="space-y-3 text-right">
                <Label className="font-black text-primary flex items-center gap-2 pr-1 justify-start"><Building2 className="w-4 h-4 text-secondary" />القسم العلمي</Label>
                <select value={context.deptId} onChange={(e) => {
                  const sel = departments.find((d: any) => d.id === e.target.value) as any;
                  setContext({...context, deptId: e.target.value, deptName: sel?.nameAr || sel?.name || ""});
                }} className="w-full h-12 px-4 rounded-xl border-2 bg-muted/5 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر القسم...</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                </select>
              </div>
              <div className="space-y-3 text-right">
                <Label className="font-black text-primary flex items-center gap-2 pr-1 justify-start"><GraduationCap className="w-4 h-4 text-secondary" />المستوى الدراسي</Label>
                <select value={context.level} onChange={(e) => setContext({...context, level: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 bg-muted/5 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر المستوى...</option>
                  {["المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع", "المستوى الخامس"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3 text-right">
                <Label className="font-black text-primary flex items-center gap-2 pr-1 justify-start"><RefreshCcw className="w-4 h-4 text-secondary" />الفصل الدراسي</Label>
                <select value={context.term} onChange={(e) => setContext({...context, term: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 bg-muted/5 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر الفصل...</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                </select>
              </div>
              <div className="space-y-3 md:col-span-2 text-right">
                <Label className="font-black text-primary flex items-center gap-2 pr-1 justify-start"><BookOpen className="w-4 h-4 text-secondary" />المادة الدراسية</Label>
                <select 
                  value={context.subjectId} 
                  onChange={(e) => {
                    const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                    setContext({...context, subjectId: e.target.value, subjectName: sel?.nameAr || ""});
                  }} 
                  className="w-full h-12 px-4 rounded-xl border-2 bg-muted/5 font-black text-primary outline-none focus:border-primary text-right appearance-none"
                >
                  <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "يرجى تحديد القسم والمستوى أولاً"}</option>
                  {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => setStep(2)} disabled={!context.subjectId} className="h-16 px-20 rounded-[2rem] text-xl font-black gradient-blue shadow-2xl gap-4 text-white hover:scale-105 transition-transform">
                متابعة الخطوة التالية <ArrowLeft className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-slide-up pb-20">
            {/* المادة الحالية */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-r-8 border-secondary">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary border border-secondary/10 shadow-inner"><BookOpen className="w-8 h-8" /></div>
                  <div className="text-right">
                    <h3 className="text-2xl font-black text-primary">{context.subjectName}</h3>
                    <p className="text-sm font-bold text-muted-foreground">{context.deptName} • {context.level}</p>
                  </div>
               </div>
               <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-black h-12 px-6 border-2 hover:bg-muted/50 gap-2"><RefreshCcw className="w-4 h-4" /> تغيير المادة</Button>
            </div>

            {/* صف الصور المرفوعة (علوي) */}
            <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white text-center">
               <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                    <ImageIcon className="w-7 h-7 text-secondary" />
                    صور الأوراق المرفوعة ({files.length})
                  </h2>
                  {aiResults.length === 0 && (
                    <Button variant="ghost" onClick={() => fileInputRef.current?.click()} className="text-secondary font-black hover:bg-secondary/5 h-12 px-4 rounded-xl border-2 border-transparent">
                      <UserPlus className="w-5 h-5 ml-2" /> إضافة صور
                    </Button>
                  )}
               </div>

              <div 
                onClick={() => files.length === 0 && fileInputRef.current?.click()}
                className={cn(
                  "w-full min-h-[200px] rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500",
                  files.length === 0 ? "border-4 border-dashed border-muted cursor-pointer hover:border-primary hover:bg-primary/5" : "bg-muted/10 p-8"
                )}
              >
                {files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 w-full">
                    {files.map((f, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-xl group border-4 border-white transition-transform hover:scale-105">
                        <Image src={f} alt="Exam Page" fill className="object-cover" />
                        {aiResults.length === 0 && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                             <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl shadow-lg" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}><Trash2 className="w-5 h-5" /></Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-fade-in flex flex-col items-center gap-3">
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary mb-2 shadow-lg"><FileUp className="w-12 h-12" /></div>
                    <p className="text-2xl font-black text-primary">اضغط هنا لرفع صور الاختبارات</p>
                    <p className="text-sm font-bold text-muted-foreground">يمكنك اختيار عدة صور في آن واحد</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={activeMode === 'ai'} onChange={handleFileUpload} />
              
              {files.length > 0 && activeMode === 'ai' && aiResults.length === 0 && (
                <Button onClick={startAIAnalysis} className="mt-10 rounded-2xl font-black gradient-blue shadow-2xl px-16 text-white h-20 text-2xl hover:scale-105 transition-all">
                  <Scan className="w-8 h-8 ml-4 animate-pulse" /> بدء التحليل والاستخراج الذكي
                </Button>
              )}
            </Card>

            {/* صف مراجعة النتائج والتحقق (سفلي - كامل العرض) */}
            {activeMode === 'manual' ? (
              files.length > 0 && (
                <Card className="p-10 border-none shadow-2xl rounded-[3rem] bg-white animate-slide-up border-b-8 border-green-500">
                  <div className="flex items-center gap-3 mb-8">
                     <div className="p-3 bg-green-50 rounded-xl text-green-600"><CheckCircle2 className="w-7 h-7" /></div>
                     <h2 className="text-2xl font-black text-primary">التحقق اليدوي من بيانات الطالب</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-3 text-right">
                        <Label className="font-black text-primary flex items-center gap-2 pr-1 justify-start"><Fingerprint className="w-4 h-4 text-secondary" />رقم القيد</Label>
                        <div className="flex gap-2">
                          <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="رقم القيد..." className="h-14 rounded-xl border-2 font-black text-2xl text-center shadow-inner" onKeyDown={(e) => e.key === 'Enter' && identifyStudent(manualId)} />
                          <Button onClick={() => identifyStudent(manualId)} className="h-14 w-14 rounded-xl gradient-blue text-white shrink-0 shadow-lg"><Search className="w-6 h-6" /></Button>
                        </div>
                     </div>
                     <div className="space-y-3 text-right">
                        <Label className="font-black text-primary pr-1">الاسم الكامل</Label>
                        <div className={cn("h-14 bg-muted/20 border-2 border-transparent rounded-xl px-4 flex items-center font-black text-xl shadow-sm", manualStudent ? "text-primary bg-primary/5" : "text-muted-foreground")}>{manualStudent?.name || "---"}</div>
                     </div>
                     <div className="space-y-3 text-right">
                        <Label className="font-black text-primary pr-1">التخصص</Label>
                        <div className={cn("h-14 bg-muted/20 border-2 border-transparent rounded-xl px-4 flex items-center font-black text-lg shadow-sm", manualStudent ? "text-secondary bg-secondary/5" : "text-muted-foreground")}>{manualStudent?.deptName || "---"}</div>
                     </div>
                  </div>
                  {manualStudent && (
                    <Button onClick={saveManualArchive} className="w-full mt-12 h-20 rounded-[2.5rem] text-3xl font-black bg-green-600 hover:bg-green-700 shadow-2xl text-white gap-4 transition-all">
                      <CheckCircle2 className="w-10 h-10" /> إتمام الأرشفة وحفظ الورقة
                    </Button>
                  )}
                </Card>
              )
            ) : (
              aiResults.length > 0 && (
                <div className="space-y-10 animate-slide-up">
                  <div className="flex flex-col md:flex-row items-center justify-between bg-white px-10 py-6 rounded-[2.5rem] shadow-xl border-r-8 border-green-500 gap-4">
                     <div className="text-right">
                        <h2 className="text-2xl font-black text-primary flex items-center gap-3">
                          <CheckCircle className="w-8 h-8 text-green-500" /> 
                          مراجعة نتائج التحقق الذكي
                        </h2>
                        <p className="text-muted-foreground font-bold text-base">البطاقات الحمراء تعني أن الطالب غير مسجل؛ يرجى تصحيح القيد يدوياً.</p>
                     </div>
                     <div className="bg-primary/5 text-primary px-10 py-4 rounded-2xl font-black border-2 border-primary/10 shadow-sm text-2xl">{aiResults.length} مستند</div>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                     {aiResults.map((res, i) => (
                       <Card key={i} className={cn(
                         "p-8 rounded-[3rem] border-4 flex flex-col md:flex-row items-center gap-10 bg-white shadow-2xl relative overflow-hidden transition-all", 
                         res.isVerified ? "border-green-400" : "border-red-500 bg-red-50/20"
                        )}>
                          <div className={cn("absolute top-0 right-0 w-5 h-full", res.isVerified ? "bg-green-400" : "bg-red-500")} />
                          
                          <div className="w-44 h-60 relative rounded-2xl overflow-hidden shadow-2xl shrink-0 border-4 border-white">
                             <Image src={res.fileData} alt="Extracted" fill className="object-cover" />
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-10 w-full text-right">
                             <div className="space-y-3">
                                <Label className="text-xs font-black text-muted-foreground flex items-center gap-2 justify-start"><User className="w-4 h-4" /> اسم الطالب</Label>
                                <div className={cn(
                                  "h-16 rounded-xl px-4 flex items-center font-black text-xl truncate shadow-sm", 
                                  res.isVerified ? "bg-green-50 text-primary" : "bg-red-100 text-red-800"
                                )}>
                                  {res.studentName}
                                </div>
                             </div>
                             
                             <div className="space-y-3">
                                <Label className="text-xs font-black text-muted-foreground flex items-center gap-2 justify-start"><Fingerprint className="w-4 h-4" /> رقم القيد</Label>
                                <Input 
                                  value={res.studentRegistrationId} 
                                  onChange={(e) => handleUpdateAiResult(i, 'studentRegistrationId', e.target.value)} 
                                  className={cn(
                                    "h-16 rounded-xl font-black text-3xl text-center", 
                                    !res.isVerified ? "border-red-500 ring-red-100 ring-4" : "border-green-500"
                                  )} 
                                />
                             </div>

                             <div className="space-y-3">
                                <Label className="text-xs font-black text-muted-foreground flex items-center gap-2 justify-start"><Building2 className="w-4 h-4" /> التخصص</Label>
                                <div className={cn(
                                  "h-16 rounded-xl px-4 flex items-center font-black text-sm truncate shadow-sm", 
                                  res.isVerified ? "bg-green-50 text-secondary" : "bg-red-100 text-red-500"
                                )}>
                                  {res.dbDepartmentName}
                                </div>
                             </div>

                             <div className="flex items-center justify-end gap-4">
                                {res.isVerified ? (
                                  <div className="bg-green-500 text-white h-16 px-8 rounded-2xl font-black flex items-center gap-3 shadow-lg">
                                    <ShieldCheck className="w-6 h-6" /> مطابق
                                  </div>
                                ) : (
                                  <div className="bg-red-600 text-white h-16 px-8 rounded-2xl font-black flex items-center gap-3 shadow-lg">
                                    <AlertTriangle className="w-6 h-6" /> غير مسجل
                                  </div>
                                )}
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => setAiResults(prev => prev.filter((_, idx) => idx !== i))} 
                                  className="text-destructive hover:bg-red-100 rounded-2xl h-16 w-16"
                                >
                                  <Trash2 className="w-8 h-8" />
                                </Button>
                             </div>
                          </div>
                       </Card>
                     ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-8 pt-10 pb-20">
                     <Button onClick={saveBatchAI} className="flex-1 h-28 rounded-[3rem] text-4xl font-black gradient-blue shadow-2xl text-white gap-8 border-b-8 border-primary/50">
                       <CloudUpload className="w-12 h-12" /> اعتماد وأرشفة الدفعة بالكامل
                     </Button>
                     <Button variant="outline" onClick={() => { setAiResults([]); setFiles([]); }} className="h-28 px-20 rounded-[3rem] font-black border-4 text-3xl text-primary">إلغاء وإعادة الرفع</Button>
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
