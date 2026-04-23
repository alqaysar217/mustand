
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
  status: 'pending' | 'success' | 'failed';
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
    return (allSubjects as any[]).filter(s => {
      // مطابقة مرنة للقسم والمستوى والترم
      const deptMatch = s.departmentId === context.deptId || s.departmentName === context.deptName;
      const levelMatch = s.level === context.level || s.level?.includes(context.level);
      const termMatch = s.term === context.term;
      return deptMatch && levelMatch && termMatch;
    });
  }, [allSubjects, context.deptId, context.level, context.term, context.deptName]);

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
        toast({ variant: "destructive", title: "الطالب غير موجود", description: "يرجى إضافة الطالب من واجهة إدارة الطلاب أولاً." });
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
          // ضغط الصورة لضمان سرعة التحليل وعدم تجاوز حدود الحجم
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
    setLoadingText("جاري تحليل الأوراق ومطابقة البيانات...");
    
    const results: AIResult[] = [];
    for (const file of files) {
      try {
        const response = await fetch('/api/ai/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ examImageDataUri: file })
        });
        
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `خطأ من الخادم (${response.status})`);
        }
        
        const data = await response.json();
        const dbCheck = await verifyStudentInDB(data.studentRegistrationId || "");
        
        results.push({
          ...data,
          studentRegistrationId: data.studentRegistrationId || "",
          studentName: dbCheck.dbStudentName || data.studentName || "غير معروف",
          subjectName: context.subjectName, 
          fileData: file,
          isVerified: dbCheck.isVerified,
          dbStudentName: dbCheck.dbStudentName,
          status: dbCheck.isVerified ? 'success' : 'failed'
        });
      } catch (e: any) {
        console.error('AI Error:', e);
        toast({ 
          variant: "destructive", 
          title: "فشل التحليل الذكي", 
          description: e.message 
        });
        results.push({ 
          studentName: "خطأ في القراءة", 
          studentRegistrationId: "", 
          subjectName: context.subjectName, 
          fileData: file,
          isVerified: false,
          status: 'failed'
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
      newResults[index].status = check.isVerified ? 'success' : 'failed';
      if (check.isVerified) {
        newResults[index].studentName = check.dbStudentName || newResults[index].studentName;
      }
    }
    setAiResults(newResults);
  };

  const saveManualArchive = async () => {
    if (!firestore || !manualStudent) return;
    setLoading(true);
    setLoadingText("جاري حفظ الملف...");
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
    setLoadingText("جاري الأرشفة الجماعية...");
    
    try {
      let savedCount = 0;
      for (const res of aiResults) {
        if (!res.studentRegistrationId) continue;
        
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
        savedCount++;
      }
      toast({ title: `تم حفظ ${savedCount} ورقة بنجاح في الأرشيف المركزي` });
      setFiles([]);
      setAiResults([]);
      setStep(1); 
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ أثناء الحفظ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <Sidebar />
      <Navbar />
      
      <main className={cn(
        "transition-all duration-300 p-6 md:p-10 animate-fade-in max-w-7xl mx-auto text-right",
        isOpen ? "mr-0 md:mr-64" : "mr-0"
      )} dir="rtl">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="text-right">
            <h1 className="text-4xl font-black text-primary mb-2">الأرشفة الرقمية</h1>
            <p className="text-muted-foreground font-bold text-lg">نظام التوثيق والتحقق الذكي من الاختبارات</p>
          </div>
          
          <Tabs value={activeMode} onValueChange={(v: any) => { setActiveMode(v); setStep(1); setFiles([]); setAiResults([]); setManualId(""); setManualStudent(null); }} className="w-full md:w-[400px]">
            <TabsList className="grid w-full grid-cols-2 h-16 bg-white/50 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-white overflow-hidden">
              <TabsTrigger 
                value="manual" 
                className="rounded-xl font-black text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Keyboard className="w-4 h-4 ml-2" /> الرفع اليدوي
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-xl font-black text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                <Cpu className="w-4 h-4 ml-2" /> الرفع الذكي
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center gap-6 text-center">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="font-black text-2xl text-primary animate-pulse">{loadingText}</p>
          </div>
        )}

        {step === 1 && (
          <Card className="p-8 md:p-12 border-none shadow-2xl rounded-[2.5rem] bg-white animate-slide-up">
            <div className="flex items-center gap-4 mb-10 border-b pb-6 justify-start">
              <div className="p-4 bg-primary/5 rounded-2xl text-primary"><Layers className="w-8 h-8" /></div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-primary">سياق الأرشفة الموحد</h2>
                <p className="text-muted-foreground font-bold">سيتم تطبيق هذه البيانات على كافة الأوراق التي سترفعها الآن</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="space-y-2">
                <Label className="font-black text-primary pr-1">العام الجامعي</Label>
                <select value={context.year} onChange={(e) => setContext({...context, year: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/10 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر العام...</option>
                  {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-primary pr-1">القسم العلمي</Label>
                <select value={context.deptId} onChange={(e) => {
                  const sel = departments.find((d: any) => d.id === e.target.value) as any;
                  setContext({...context, deptId: e.target.value, deptName: sel?.nameAr || sel?.name || ""});
                }} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/10 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر القسم...</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-primary pr-1">المستوى الدراسي</Label>
                <select value={context.level} onChange={(e) => setContext({...context, level: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/10 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر المستوى...</option>
                  {["المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع", "المستوى الخامس"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label className="font-black text-primary pr-1">الفصل الدراسي</Label>
                <select value={context.term} onChange={(e) => setContext({...context, term: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/10 font-black outline-none focus:border-primary text-right appearance-none">
                  <option value="">اختر الفصل...</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="font-black text-primary pr-1">المادة الدراسية</Label>
                <select 
                  value={context.subjectId} 
                  onChange={(e) => {
                    const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                    setContext({...context, subjectId: e.target.value, subjectName: sel?.nameAr || ""});
                  }} 
                  className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/10 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right disabled:opacity-50"
                >
                  <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "لا توجد مواد لهذا القسم والمستوى والترم"}</option>
                  {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!context.subjectId || !context.year}
                className="h-16 px-16 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-3 text-white"
              >
                تثبيت البيانات والبدء <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-slide-up">
            {/* مؤشر السياق الأكاديمي المثبت */}
            <div className="bg-white p-6 rounded-[2rem] shadow-lg border flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-5 justify-start">
                  <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-inner"><BookOpen className="w-7 h-7" /></div>
                  <div className="text-right">
                    <span className="text-xs font-black text-muted-foreground uppercase">أرشفة مادة</span>
                    <h3 className="text-lg font-black text-primary">{context.subjectName}</h3>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-secondary">
                       <span>{context.deptName}</span> • <span>{context.level} - {context.term}</span>
                    </div>
                  </div>
               </div>
               <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-black gap-2 h-11 border-2">
                 <RefreshCcw className="w-4 h-4" /> تغيير السياق
               </Button>
            </div>

            {/* منطقة رفع الصور - عرض كامل */}
            <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[250px] border-4 border-dashed border-muted/50 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
              >
                {files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-6 w-full">
                    {files.map((f, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-md border-2 border-white group">
                        <Image src={f} alt="Page" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary"><FileUp className="w-10 h-10" /></div>
                    <div>
                      <p className="text-xl font-black text-primary">اضغط لرفع صور الاختبارات</p>
                      <p className="text-muted-foreground font-bold text-sm">يمكنك رفع عدة صور دفعة واحدة للتحليل الذكي</p>
                    </div>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={activeMode === 'ai'} onChange={handleFileUpload} />
              
              {files.length > 0 && (
                <div className="flex justify-center gap-4 mt-6">
                  <Button variant="outline" onClick={() => { setFiles([]); setAiResults([]); }} className="rounded-xl font-black gap-2 h-12 border-2"><Trash2 className="w-4 h-4" /> مسح كافة الصور</Button>
                  {activeMode === 'ai' && aiResults.length === 0 && (
                    <Button onClick={startAIAnalysis} className="rounded-xl font-black gradient-blue shadow-lg px-10 text-white gap-2 h-12">
                      <Scan className="w-5 h-5" /> بدء التحليل والتحقق الذكي
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* منطقة المراجعة والتحقق */}
            {activeMode === 'manual' ? (
              files.length > 0 && (
                <Card className="p-10 border-none shadow-2xl rounded-[2.5rem] bg-white animate-slide-up">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-2">
                        <Label className="font-black text-primary">رقم القيد الجامعي</Label>
                        <div className="flex gap-2">
                          <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="رقم قيد الطالب..." className="h-14 rounded-xl border-2 font-black text-xl text-center" onKeyDown={(e) => e.key === 'Enter' && identifyStudent(manualId)} />
                          <Button onClick={() => identifyStudent(manualId)} className="h-14 w-14 rounded-xl gradient-blue text-white shrink-0"><Search className="w-6 h-6" /></Button>
                        </div>
                     </div>
                     <div className="space-y-2">
                        <Label className="font-black text-primary">اسم الطالب</Label>
                        <div className="h-14 bg-muted/20 border-2 rounded-xl px-4 flex items-center font-black text-primary">{manualStudent?.name || "---"}</div>
                     </div>
                     <div className="space-y-2">
                        <Label className="font-black text-primary">القسم</Label>
                        <div className="h-14 bg-muted/20 border-2 rounded-xl px-4 flex items-center font-black text-secondary">{manualStudent?.deptName || "---"}</div>
                     </div>
                  </div>
                  {manualStudent && (
                    <div className="mt-10">
                      <Button onClick={saveManualArchive} className="w-full h-16 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl text-white gap-3">
                        <CloudUpload className="w-6 h-6" /> إتمام الأرشفة اليدوية والحفظ
                      </Button>
                    </div>
                  )}
                </Card>
              )
            ) : (
              aiResults.length > 0 && (
                <Card className="p-10 border-none shadow-2xl rounded-[2.5rem] bg-white space-y-8 animate-slide-up">
                  <div className="flex items-center justify-between border-b pb-6">
                     <div className="text-right">
                       <h2 className="text-2xl font-black text-primary flex items-center gap-3"><CheckCircle className="w-7 h-7 text-green-500" /> مراجعة والتحقق من النتائج</h2>
                       <p className="text-muted-foreground font-bold text-sm">تأكد من مطابقة أرقام القيد قبل الاعتماد النهائي</p>
                     </div>
                     <div className="bg-primary/5 text-primary px-6 py-2 rounded-xl font-black">{aiResults.length} ورقة جاهزة</div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     {aiResults.map((res, i) => (
                       <div key={i} className={cn("p-6 rounded-[2rem] border-2 flex flex-col md:flex-row items-center gap-8 transition-all", res.isVerified ? "bg-green-50/30 border-green-100" : "bg-red-50/30 border-red-100")}>
                          <div className="w-24 h-32 relative rounded-xl overflow-hidden shadow-md shrink-0 border-2 border-white"><Image src={res.fileData} alt="Exam" fill className="object-cover" /></div>
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                             <div className="space-y-1">
                                <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase">اسم الطالب المستخرج</Label>
                                <Input value={res.studentName} onChange={(e) => handleUpdateAiResult(i, 'studentName', e.target.value)} className="h-12 rounded-xl font-bold bg-white" />
                             </div>
                             <div className="space-y-1">
                                <Label className="text-[10px] font-black text-muted-foreground mr-1 uppercase">رقم القيد</Label>
                                <Input value={res.studentRegistrationId} onChange={(e) => handleUpdateAiResult(i, 'studentRegistrationId', e.target.value)} className="h-12 rounded-xl font-black text-lg bg-white text-center" />
                             </div>
                             <div className="flex items-center justify-center md:justify-end gap-3 pt-4">
                                {res.isVerified ? (
                                  <div className="bg-green-500 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm animate-fade-in"><CheckCircle2 className="w-4 h-4" /> مطابق للنظام</div>
                                ) : (
                                  <div className="bg-red-500 text-white px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm animate-pulse"><XCircle className="w-4 h-4" /> غير مسجل</div>
                                )}
                                <Button size="icon" variant="ghost" onClick={() => setAiResults(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:bg-destructive/10 rounded-xl h-11 w-11"><Trash2 className="w-5 h-5" /></Button>
                             </div>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t flex flex-col md:flex-row gap-4">
                     <Button onClick={saveBatchAI} className="flex-1 h-16 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl text-white gap-3"><CheckCircle className="w-6 h-6" /> اعتماد وحفظ الكل في الأرشيف</Button>
                     <Button variant="outline" onClick={() => { setAiResults([]); setFiles([]); }} className="h-16 px-10 rounded-2xl font-black border-2">إلغاء وإعادة المحاولة</Button>
                  </div>
                </Card>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
