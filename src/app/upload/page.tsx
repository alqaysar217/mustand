
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
  ChevronLeft,
  CheckCircle2,
  XCircle,
  AlertCircle
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
      const deptMatch = s.departmentId === context.deptId || s.departmentName === context.deptName;
      const levelMatch = s.level === context.level || s.level?.includes(context.level);
      const termMatch = s.term === context.term;
      return deptMatch && levelMatch && termMatch;
    });
  }, [allSubjects, context.deptId, context.level, context.term, context.deptName]);

  const identifyStudent = async (regId: string) => {
    if (!firestore || !regId) return;
    setLoading(true);
    setLoadingText("جاري البحث عن الطالب...");
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
      toast({ variant: "destructive", title: "خطأ في الاتصال بقاعدة البيانات" });
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
          // ضغط الصورة لضمان عدم تجاوز حجم Firestore
          const { data } = await compressImage(event.target.result as string, 0.5, 1000);
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
    try {
      const q = query(collection(firestore, "students"), where("regId", "==", regId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        return { isVerified: true, dbStudentName: data.name };
      }
    } catch (e) {}
    return { isVerified: false };
  };

  const startAIAnalysis = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setLoadingText("جاري تحليل الأوراق ومطابقة البيانات...");
    
    const results: AIResult[] = [];
    let successCount = 0;

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
        
        const dbCheck = await verifyStudentInDB(responseData.studentRegistrationId || "");
        
        results.push({
          ...responseData,
          studentRegistrationId: responseData.studentRegistrationId || "",
          studentName: dbCheck.dbStudentName || responseData.studentName || "غير معروف",
          subjectName: context.subjectName, 
          fileData: file,
          isVerified: dbCheck.isVerified,
          dbStudentName: dbCheck.dbStudentName,
          status: dbCheck.isVerified ? 'success' : 'failed'
        });
        successCount++;
      } catch (e: any) {
        console.error('Analysis item error:', e);
        results.push({ 
          studentName: "فشل التحليل الذكي لهذه الورقة", 
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
    
    if (successCount === 0) {
      toast({ variant: "destructive", title: "فشل التحليل بالكامل", description: "تأكد من جودة الصور ومن صلاحية مفتاح الـ API." });
    } else if (results.some(r => !r.isVerified)) {
      toast({ variant: "destructive", title: "تحذير: نتائج غير متطابقة", description: "بعض الطلاب غير مسجلين في قاعدة البيانات. يرجى مراجعة الحقول الحمراء." });
    }
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
    
    const unverified = aiResults.filter(r => !r.isVerified);
    if (unverified.length > 0) {
      toast({ variant: "destructive", title: "لا يمكن الحفظ", description: "يجب تصحيح أرقام القيد للطلاب غير المسجلين (الحمراء) قبل الاعتماد." });
      return;
    }

    setLoading(true);
    setLoadingText("جاري الحفظ الجماعي...");
    
    try {
      let savedCount = 0;
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
        savedCount++;
      }
      toast({ title: `تم أرشفة ${savedCount} مستند بنجاح` });
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
            <h1 className="text-4xl font-black text-primary mb-2">رفع الاختبارات</h1>
            <p className="text-muted-foreground font-bold text-lg">أرشفة رقمية سريعة باستخدام تقنيات التحقق الذكي</p>
          </div>
          
          <Tabs value={activeMode} onValueChange={(v: any) => { setActiveMode(v); setStep(1); setFiles([]); setAiResults([]); setManualId(""); setManualStudent(null); }} className="w-full md:w-[420px]">
            <TabsList className="grid w-full grid-cols-2 h-16 bg-white/40 backdrop-blur-xl rounded-2xl p-1.5 shadow-2xl border border-white/20 overflow-hidden relative z-10">
              <TabsTrigger 
                value="manual" 
                className="rounded-xl font-black text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
              >
                <Keyboard className="w-4 h-4 ml-2" /> الرفع اليدوي
              </TabsTrigger>
              <TabsTrigger 
                value="ai" 
                className="rounded-xl font-black text-sm transition-all data-[state=active]:gradient-blue data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:scale-[1.02]"
              >
                <Cpu className="w-4 h-4 ml-2" /> الرفع الذكي
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur-md z-[100] flex flex-col items-center justify-center gap-6 text-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin"></div>
              <Cpu className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
            </div>
            <p className="font-black text-2xl text-primary">{loadingText}</p>
          </div>
        )}

        {step === 1 && (
          <Card className="p-8 md:p-12 border-none shadow-2xl rounded-[2.5rem] bg-white animate-slide-up border-b-8 border-primary">
            <div className="flex items-center gap-5 mb-10 border-b pb-8 justify-start">
              <div className="p-5 bg-primary/5 rounded-[1.5rem] text-primary shadow-inner"><Layers className="w-10 h-10" /></div>
              <div className="text-right">
                <h2 className="text-2xl font-black text-primary">تحديد سياق الأرشفة</h2>
                <p className="text-muted-foreground font-bold">يرجى تحديد البيانات الأكاديمية المشتركة لكافة الأوراق التي سيتم رفعها</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              <div className="space-y-3">
                <Label className="font-black text-primary pr-1 flex items-center gap-2"><Calendar className="w-4 h-4 text-secondary" />العام الجامعي</Label>
                <select value={context.year} onChange={(e) => setContext({...context, year: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/5 font-black outline-none focus:border-primary transition-all text-right appearance-none hover:bg-muted/10">
                  <option value="">اختر العام...</option>
                  {academicYears.map((y: any) => <option key={y.id} value={y.label}>{y.label}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-primary pr-1 flex items-center gap-2"><Building2 className="w-4 h-4 text-secondary" />القسم العلمي</Label>
                <select value={context.deptId} onChange={(e) => {
                  const sel = departments.find((d: any) => d.id === e.target.value) as any;
                  setContext({...context, deptId: e.target.value, deptName: sel?.nameAr || sel?.name || ""});
                }} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/5 font-black outline-none focus:border-primary transition-all text-right appearance-none hover:bg-muted/10">
                  <option value="">اختر القسم...</option>
                  {departments.map((d: any) => <option key={d.id} value={d.id}>{d.nameAr || d.name}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-primary pr-1 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-secondary" />المستوى الدراسي</Label>
                <select value={context.level} onChange={(e) => setContext({...context, level: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/5 font-black outline-none focus:border-primary transition-all text-right appearance-none hover:bg-muted/10">
                  <option value="">اختر المستوى...</option>
                  {["المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع", "المستوى الخامس"].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label className="font-black text-primary pr-1 flex items-center gap-2"><RefreshCcw className="w-4 h-4 text-secondary" />الفصل الدراسي</Label>
                <select value={context.term} onChange={(e) => setContext({...context, term: e.target.value})} className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/5 font-black outline-none focus:border-primary transition-all text-right appearance-none hover:bg-muted/10">
                  <option value="">اختر الفصل...</option>
                  <option value="الفصل الأول">الفصل الأول</option>
                  <option value="الفصل الثاني">الفصل الثاني</option>
                </select>
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label className="font-black text-primary pr-1 flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary" />المادة الدراسية</Label>
                <select 
                  value={context.subjectId} 
                  onChange={(e) => {
                    const sel = filteredSubjects.find((s: any) => s.id === e.target.value) as any;
                    setContext({...context, subjectId: e.target.value, subjectName: sel?.nameAr || ""});
                  }} 
                  className="w-full h-14 px-5 rounded-2xl border-2 bg-muted/5 font-black text-primary outline-none focus:border-primary transition-all appearance-none text-right hover:bg-muted/10"
                >
                  <option value="">{filteredSubjects.length > 0 ? "اختر المادة..." : "لا توجد مواد مطابقة لهذا القسم والمستوى والترم"}</option>
                  {filteredSubjects.map((s: any) => <option key={s.id} value={s.id}>{s.nameAr}</option>)}
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                onClick={() => setStep(2)} 
                disabled={!context.subjectId || !context.year}
                className="h-16 px-16 rounded-2xl text-xl font-black gradient-blue shadow-xl gap-3 text-white transition-transform active:scale-95"
              >
                تثبيت البيانات والبدء <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-slide-up">
            {/* Header Info Banner */}
            <div className="bg-white p-6 rounded-[2rem] shadow-xl border flex flex-col md:flex-row items-center justify-between gap-6 border-r-8 border-secondary">
               <div className="flex items-center gap-6 justify-start">
                  <div className="w-16 h-16 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary shadow-inner border border-secondary/10"><BookOpen className="w-8 h-8" /></div>
                  <div className="text-right">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">أرشفة مادة</span>
                    <h3 className="text-2xl font-black text-primary">{context.subjectName}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-secondary mt-1">
                       <Building2 className="w-3.5 h-3.5" /> <span>{context.deptName}</span>
                       <span className="w-1 h-1 rounded-full bg-secondary/30" />
                       <Layers className="w-3.5 h-3.5" /> <span>{context.level} - {context.term}</span>
                    </div>
                  </div>
               </div>
               <Button variant="outline" onClick={() => setStep(1)} className="rounded-xl font-black gap-2 h-12 border-2 px-6 hover:bg-muted/10 transition-colors">
                 <RefreshCcw className="w-4 h-4" /> تغيير السياق الأكاديمي
               </Button>
            </div>

            {/* Photo Upload Area */}
            <Card className="p-8 border-none shadow-2xl rounded-[2.5rem] bg-white text-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full min-h-[220px] border-4 border-dashed border-muted/50 rounded-[2.5rem] flex flex-col items-center justify-center gap-5 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
              >
                {files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-5 p-6 w-full">
                    {files.map((f, i) => (
                      <div key={i} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-white group/img hover:scale-105 transition-transform">
                        <Image src={f} alt="Page" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                           <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl" onClick={(e) => { e.stopPropagation(); setFiles(prev => prev.filter((_, idx) => idx !== i)); }}><Trash2 className="w-5 h-5" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><FileUp className="w-12 h-12" /></div>
                    <div>
                      <p className="text-2xl font-black text-primary mb-1">اضغط لرفع صور الاختبارات</p>
                      <p className="text-muted-foreground font-bold">يمكنك اختيار صورة واحدة (يدوي) أو عدة صور (ذكي)</p>
                    </div>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple={activeMode === 'ai'} onChange={handleFileUpload} />
              
              {files.length > 0 && (
                <div className="flex justify-center gap-4 mt-8">
                  <Button variant="outline" onClick={() => { setFiles([]); setAiResults([]); }} className="rounded-xl font-black gap-2 h-14 border-2 px-8">
                    <Trash2 className="w-5 h-5" /> مسح كافة الصور
                  </Button>
                  {activeMode === 'ai' && aiResults.length === 0 && (
                    <Button onClick={startAIAnalysis} className="rounded-xl font-black gradient-blue shadow-xl px-12 text-white gap-3 h-14 text-lg">
                      <Scan className="w-6 h-6 animate-pulse" /> بدء التحليل والتحقق من الطلاب
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Verification & Final Step */}
            {activeMode === 'manual' ? (
              files.length > 0 && (
                <Card className="p-10 border-none shadow-2xl rounded-[2.5rem] bg-white animate-slide-up border-b-8 border-green-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="space-y-3">
                        <Label className="font-black text-primary flex items-center gap-2 pr-1"><Fingerprint className="w-4 h-4 text-secondary" />رقم القيد الجامعي</Label>
                        <div className="flex gap-2">
                          <Input value={manualId} onChange={(e) => setManualId(e.target.value)} placeholder="00000000" className="h-14 rounded-xl border-2 font-black text-2xl text-center focus:ring-secondary" onKeyDown={(e) => e.key === 'Enter' && identifyStudent(manualId)} />
                          <Button onClick={() => identifyStudent(manualId)} className="h-14 w-14 rounded-xl gradient-blue text-white shrink-0 shadow-lg"><Search className="w-6 h-6" /></Button>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <Label className="font-black text-primary flex items-center gap-2 pr-1"><User className="w-4 h-4 text-secondary" />اسم الطالب</Label>
                        <div className="h-14 bg-muted/10 border-2 rounded-xl px-5 flex items-center font-black text-primary text-lg">{manualStudent?.name || "---"}</div>
                     </div>
                     <div className="space-y-3">
                        <Label className="font-black text-primary flex items-center gap-2 pr-1"><Building2 className="w-4 h-4 text-secondary" />القسم العلمي</Label>
                        <div className="h-14 bg-muted/10 border-2 rounded-xl px-5 flex items-center font-black text-secondary">{manualStudent?.deptName || "---"}</div>
                     </div>
                  </div>
                  {manualStudent && (
                    <div className="mt-12">
                      <Button onClick={saveManualArchive} className="w-full h-16 rounded-2xl text-xl font-black bg-green-600 hover:bg-green-700 shadow-xl text-white gap-3 transition-transform active:scale-[0.98]">
                        <CloudUpload className="w-7 h-7" /> إتمام الأرشفة وحفظ المستند
                      </Button>
                    </div>
                  )}
                </Card>
              )
            ) : (
              aiResults.length > 0 && (
                <div className="space-y-8 animate-slide-up">
                  <div className="flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] shadow-lg border">
                     <div className="text-right">
                       <h2 className="text-2xl font-black text-primary flex items-center gap-3"><CheckCircle className="w-7 h-7 text-green-500" /> مراجعة واعتماد النتائج</h2>
                       <p className="text-muted-foreground font-bold text-sm">تم استخراج البيانات، يرجى مطابقة الأسماء والأرقام قبل الحفظ</p>
                     </div>
                     <div className="bg-primary/5 text-primary px-8 py-3 rounded-2xl font-black border border-primary/10 shadow-inner flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                       {aiResults.length} ورقة جاهزة
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     {aiResults.map((res, i) => (
                       <Card key={i} className={cn("p-6 rounded-[2.5rem] border-2 flex flex-col md:flex-row items-center gap-8 transition-all bg-white shadow-xl relative overflow-hidden", res.isVerified ? "border-green-100" : "border-red-100")}>
                          {!res.isVerified && <div className="absolute top-0 right-0 w-2 h-full bg-red-500" />}
                          {res.isVerified && <div className="absolute top-0 right-0 w-2 h-full bg-green-500" />}
                          
                          <div className="w-28 h-36 relative rounded-2xl overflow-hidden shadow-xl shrink-0 border-4 border-white"><Image src={res.fileData} alt="Exam" fill className="object-cover" /></div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                             <div className="space-y-2">
                                <Label className="text-[11px] font-black text-muted-foreground mr-1 uppercase flex items-center gap-1">اسم الطالب المستخرج <AlertCircle className="w-3 h-3" /></Label>
                                <Input value={res.studentName} onChange={(e) => handleUpdateAiResult(i, 'studentName', e.target.value)} className="h-12 rounded-xl font-bold bg-muted/5 border-muted/50 focus:border-primary text-lg" />
                             </div>
                             <div className="space-y-2">
                                <Label className="text-[11px] font-black text-muted-foreground mr-1 uppercase flex items-center gap-1">رقم القيد المستخرج <Fingerprint className="w-3 h-3" /></Label>
                                <Input value={res.studentRegistrationId} onChange={(e) => handleUpdateAiResult(i, 'studentRegistrationId', e.target.value)} className="h-12 rounded-xl font-black text-xl bg-muted/5 border-muted/50 focus:border-primary text-center" />
                             </div>
                             <div className="flex items-center justify-center lg:justify-end gap-3 pt-6">
                                {res.isVerified ? (
                                  <div className="bg-green-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-green-100"><CheckCircle2 className="w-5 h-5" /> مطابق بالكامل</div>
                                ) : (
                                  <div className="bg-red-500 text-white px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg shadow-red-100"><XCircle className="w-5 h-5" /> غير مسجل</div>
                                )}
                                <Button size="icon" variant="ghost" onClick={() => setAiResults(prev => prev.filter((_, idx) => idx !== i))} className="text-destructive hover:bg-red-50 rounded-2xl h-12 w-12 border border-transparent hover:border-red-100"><Trash2 className="w-6 h-6" /></Button>
                             </div>
                          </div>
                       </Card>
                     ))}
                  </div>

                  <Card className="p-8 rounded-[2.5rem] bg-white border-t-8 border-green-500 shadow-2xl flex flex-col md:flex-row gap-6">
                     <Button onClick={saveBatchAI} className="flex-1 h-18 rounded-2xl text-2xl font-black bg-green-600 hover:bg-green-700 shadow-2xl text-white gap-4 transition-transform active:scale-[0.98] py-8">
                       <CheckCircle className="w-8 h-8" /> اعتماد وأرشفة كافة الأوراق
                     </Button>
                     <Button variant="outline" onClick={() => { setAiResults([]); setFiles([]); }} className="h-18 px-12 rounded-2xl font-black border-2 hover:bg-red-50 hover:text-red-600 transition-colors text-lg">إلغاء وإعادة الرفع</Button>
                  </Card>
                </div>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}
