
"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  PlusCircle,
  Clock,
  Building2,
  Loader2,
  Filter,
  Type,
  Layers,
  CheckCircle,
  Save,
  X,
  RefreshCw,
  AlertTriangle,
  DatabaseZap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc, getDocs, writeBatch } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

export default function SubjectsPage() {
  const [mounted, setMounted] = useState(false);
  const firestore = useFirestore();
  const subjectsQuery = useMemo(() => firestore ? collection(firestore, "subjects") : null, [firestore]);
  const deptsQuery = useMemo(() => firestore ? collection(firestore, "departments") : null, [firestore]);

  const { data: subjects = [], loading } = useCollection(subjectsQuery);
  const { data: departments = [] } = useCollection(deptsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [newSubject, setNewSubject] = useState({
    nameAr: "",
    nameEn: "",
    departmentId: "",
    level: "المستوى الأول",
    term: "الفصل الأول"
  });

  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredSubjects = useMemo(() => {
    return (subjects as any[]).filter(s => {
      const matchesSearch = s.nameAr?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           s.nameEn?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = filterDept === "all" || s.departmentId === filterDept;
      const matchesLevel = filterLevel === "all" || s.level === filterLevel;
      
      return matchesSearch && matchesDept && matchesLevel;
    });
  }, [subjects, searchTerm, filterDept, filterLevel]);

  // دالة الحقن الشاملة للمواد الدراسية
  const handleResetAndInject = async () => {
    if (!firestore || departments.length === 0) {
      toast({ variant: "destructive", title: "خطأ", description: "يجب التأكد من وجود أقسام علمية مسجلة أولاً." });
      return;
    }

    setIsSyncing(true);
    try {
      // 1. حذف كافة المواد الحالية
      const querySnapshot = await getDocs(collection(firestore, "subjects"));
      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();

      // 2. قائمة المواد الجديدة للحقن
      const rawData = [
        { nameAr: "لغة عربية (1)", nameEn: "Arabic Language (1)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "لغة عربية (2)", nameEn: "Arabic Language (2)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "تنقيب بيانات", nameEn: "Data Mining", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "قواعد بيانات (1)", nameEn: "Database (1)", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "هندسة برمجيات (1)", nameEn: "Software Engineering (1)", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "برمجة كائنية (1)", nameEn: "Object Oriented Programming (1)", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "تجارة إلكترونية", nameEn: "E-Commerce", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "نظم", nameEn: "MIS", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "أمن معلومات", nameEn: "Information Security", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "لغة إنجليزية (4)", nameEn: "English Language (4)", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "لغة التجميع", nameEn: "Assembly Language", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "تكنولوجيا الوسائط المتعددة", nameEn: "Multimedia Technology", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "مهارات الحاسوب", nameEn: "Computer Skills", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "تحليل وتصميم خوارزميات", nameEn: "Analysis and Design of Algorithms", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "معالجة صور", nameEn: "Image Processing", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "تكنولوجيا الويب", nameEn: "Web Technology", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "الحوسبة في كل مكان", nameEn: "Ubiquitous Computing", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "ثقافة إسلامية (1)", nameEn: "Islamic Culture (1)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "حوسبة متنقلة", nameEn: "Mobile Computing", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "نظم موزعة", nameEn: "Distributed Systems", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "ندوة", nameEn: "Seminar", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "ثقافة إسلامية (2)", nameEn: "Islamic Culture (2)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "تفاعل إنسان وحاسوب", nameEn: "Human-Computer Interaction", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "رياضيات (1)", nameEn: "Mathematics (1)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "بحوث عمليات", nameEn: "Operations Research", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "إدارة شبكات", nameEn: "Network Administration", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "ثقافة إسلامية (2)", nameEn: "Islamic Culture (2)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "لغة إنجليزية (1)", nameEn: "English Language (1)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "رياضيات (2)", nameEn: "Mathematics (2)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "هياكل بيانات", nameEn: "Data Structures", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "تراكيب محددة", nameEn: "Discrete Structures", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "لغة إنجليزية (4)", nameEn: "English Language (4)", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "مقدمة في الحاسوب", nameEn: "Introduction to Computer", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "إدارة مشاريع", nameEn: "Project Management", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "عمارة حاسوب", nameEn: "Computer Architecture", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "بحوث عمليات", nameEn: "Operations Research", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "نظم موزعة", nameEn: "Distributed Systems", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "نظرية احتسابية", nameEn: "Theory of Computation", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "نظم خبيرة", nameEn: "Expert Systems", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "تكنولوجيا الويب", nameEn: "Web Technology", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "شبكات الحاسوب", nameEn: "Computer Networks", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "لغة إنجليزية (2)", nameEn: "English Language (2)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "برمجة (1)", nameEn: "Programming (1)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "برمجة مرئية", nameEn: "Visual Programming", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "احتمالات وإحصاء", nameEn: "Probability and Statistics", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "أمن الشبكات", nameEn: "Network Security", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "لغة عربية (2)", nameEn: "Arabic Language (2)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "احتمالات وإحصاء", nameEn: "Probability and Statistics", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "تصميم منطقي", nameEn: "Logic Design", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "قواعد بيانات (1)", nameEn: "Database (1)", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "مواضيع مختارة", nameEn: "Selected Topics", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "اتصالات وبيانات", nameEn: "Data Communications", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "حوسبة سحابية", nameEn: "Cloud Computing", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "نظم تشغيل", nameEn: "Operating Systems", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "رياضيات (3)", nameEn: "Mathematics (3)", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "نظم المعلومات الإدارية", nameEn: "Management Information Systems", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "هندسة برمجيات (1)", nameEn: "Software Engineering (1)", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "مقدمة في الحاسوب", nameEn: "Introduction to Computer", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "هياكل بيانات", nameEn: "Data Structures", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "ذكاء اصطناعي", nameEn: "Artificial Intelligence", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "تصميم منطقي", nameEn: "Logic Design", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "رسوم حاسوب", nameEn: "Computer Graphics", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "نظم تشغيل", nameEn: "Operating Systems", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "عمارة حاسوب", nameEn: "Computer Architecture", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "رياضيات (3)", nameEn: "Mathematics (3)", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "مهارات الحاسوب", nameEn: "Computer Skills", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "نظم المعلومات الجغرافية", nameEn: "Geographic Information Systems", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "فيزياء إلكترونية", nameEn: "Electronic Physics", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "لغات برمجة", nameEn: "Programming Languages", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "لغة التجميع", nameEn: "Assembly Language", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "ثقافة إسلامية (1)", nameEn: "Islamic Culture (1)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "تراكيب محددة", nameEn: "Discrete Structures", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "ذكاء اصطناعي", nameEn: "Artificial Intelligence", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "برمجة كائنية (1)", nameEn: "Object Oriented Programming (1)", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الثاني" },
        { nameAr: "رياضيات (1)", nameEn: "Mathematics (1)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "لغة إنجليزية (3)", nameEn: "English Language (3)", dept: "علوم الحاسوب", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "مشروع التخرج (1)", nameEn: "Graduation Project (1)", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "لغة عربية (1)", nameEn: "Arabic Language (1)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "فيزياء إلكترونية", nameEn: "Electronic Physics", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "جودة برمجيات", nameEn: "Software Quality", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "هندسة برمجيات (2)", nameEn: "Software Engineering (2)", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "اتصالات وبيانات", nameEn: "Data Communications", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الأول" },
        { nameAr: "رياضيات (2)", nameEn: "Mathematics (2)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "شبكات لاسلكية", nameEn: "Wireless Networks", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "حوسبة سحابية", nameEn: "Cloud Computing", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "ندوة", nameEn: "Seminar", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "واقع افتراضي", nameEn: "Virtual Reality", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "برمجة (1)", nameEn: "Programming (1)", dept: "علوم الحاسوب", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "لغة إنجليزية (2)", nameEn: "English Language (2)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الثاني" },
        { nameAr: "لغة إنجليزية (3)", nameEn: "English Language (3)", dept: "تقنية المعلومات", level: "المستوى الثاني", term: "الفصل الأول" },
        { nameAr: "لغة إنجليزية (1)", nameEn: "English Language (1)", dept: "تقنية المعلومات", level: "المستوى الأول", term: "الفصل الأول" },
        { nameAr: "أمن حاسوب", nameEn: "Computer Security", dept: "علوم الحاسوب", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "شبكات الحاسوب", nameEn: "Computer Networks", dept: "تقنية المعلومات", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "معالجة صور", nameEn: "Image Processing", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الأول" },
        { nameAr: "مشروع التخرج (1)", nameEn: "Graduation Project (1)", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الثاني" },
        { nameAr: "هندسة برمجيات (2)", nameEn: "Software Engineering (2)", dept: "علوم الحاسوب", level: "المستوى الثالث", term: "الفصل الثاني" },
        { nameAr: "التنقيب في الويب", nameEn: "Web Mining", dept: "تقنية المعلومات", level: "المستوى الرابع", term: "الفصل الثاني" }
      ];

      // 3. حقن البيانات مع الربط بالأقسام
      let successCount = 0;
      for (const item of rawData) {
        const targetDept = departments.find((d: any) => 
          (d.nameAr || d.name || "").includes(item.dept) || 
          (item.dept).includes(d.nameAr || d.name || "")
        );

        if (targetDept) {
          await addDoc(collection(firestore, "subjects"), {
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            departmentId: targetDept.id,
            departmentName: targetDept.nameAr || targetDept.name,
            level: item.level,
            term: item.term,
            createdAt: serverTimestamp()
          });
          successCount++;
        }
      }

      toast({ 
        title: "اكتملت العملية بنجاح", 
        description: `تم حذف كافة المواد القديمة وحقن ${successCount} مادة جديدة بنجاح.` 
      });
    } catch (error) {
      console.error("Injection Error:", error);
      toast({ variant: "destructive", title: "فشل في عملية الحقن" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSubjects = async () => {
    if (!firestore || subjects.length === 0 || departments.length === 0) {
      toast({ variant: "destructive", title: "لا توجد بيانات كافية للمزامنة" });
      return;
    }

    setIsSyncing(true);
    let fixedCount = 0;
    
    try {
      for (const sub of subjects as any[]) {
        let needsUpdate = false;
        const updates: any = {};

        const targetDept = departments.find((d: any) => 
          d.id === sub.departmentId || 
          (d.code && d.code === sub.departmentId) ||
          (d.nameAr && d.nameAr === sub.departmentName) ||
          (d.name && d.name === sub.departmentName)
        ) as any;

        if (targetDept && sub.departmentId !== targetDept.id) {
          updates.departmentId = targetDept.id;
          updates.departmentName = targetDept.nameAr || targetDept.name;
          needsUpdate = true;
        }

        const levelMapping: Record<string, string> = {
          "1": "المستوى الأول", "2": "المستوى الثاني", "3": "المستوى الثالث", "4": "المستوى الرابع", "5": "المستوى الخامس",
          "الأول": "المستوى الأول", "الثاني": "المستوى الثاني", "الثالث": "المستوى الثالث", "الرابع": "المستوى الرابع", "الخامس": "المستوى الخامس"
        };
        
        if (levelMapping[sub.level]) {
          updates.level = levelMapping[sub.level];
          needsUpdate = true;
        }

        if (needsUpdate) {
          await updateDoc(doc(firestore, "subjects", sub.id), {
            ...updates,
            syncedAt: serverTimestamp()
          });
          fixedCount++;
        }
      }

      toast({ 
        title: "اكتملت عملية المزامنة", 
        description: `تم إصلاح وتوصيل ${fixedCount} مادة دراسية بالتخصصات الصحيحة.` 
      });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل في عملية المزامنة" });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddSubject = () => {
    if (!firestore || !newSubject.nameAr || !newSubject.departmentId) {
      toast({ variant: "destructive", title: "بيانات ناقصة" });
      return;
    }
    
    setSubmitting(true);
    const selectedDeptObj = (departments as any[]).find(d => d.id === newSubject.departmentId);
    const subjectsRef = collection(firestore, "subjects");
    const data = {
      ...newSubject,
      departmentName: selectedDeptObj?.nameAr || selectedDeptObj?.name || "",
      createdAt: serverTimestamp()
    };

    addDoc(subjectsRef, data)
      .then(() => {
        setIsAddDialogOpen(false);
        setNewSubject({ nameAr: "", nameEn: "", departmentId: "", level: "المستوى الأول", term: "الفصل الأول" });
        toast({ title: "تم التفعيل", description: "تمت إضافة المادة الدراسية بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: subjectsRef.path,
          operation: 'create',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateSubject = () => {
    if (!firestore || !editingSubject?.nameAr || !editingSubject?.departmentId) return;

    setSubmitting(true);
    const selectedDeptObj = (departments as any[]).find(d => d.id === editingSubject.departmentId);
    const docRef = doc(firestore, "subjects", editingSubject.id);
    const data = {
      nameAr: editingSubject.nameAr,
      nameEn: editingSubject.nameEn,
      departmentId: editingSubject.departmentId,
      departmentName: selectedDeptObj?.nameAr || selectedDeptObj?.name || "",
      level: editingSubject.level,
      term: editingSubject.term,
      updatedAt: serverTimestamp()
    };

    updateDoc(docRef, data)
      .then(() => {
        setEditingSubject(null);
        toast({ title: "تم التحديث", description: "تم تحديث بيانات المادة بنجاح." });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "subjects", id);

    deleteDoc(docRef)
      .then(() => {
        toast({ variant: "destructive", title: "تم الحذف" });
      })
      .catch(async (error) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        });
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const openEditDialog = (subject: any) => {
    let fixedSubject = { ...subject };
    if (fixedSubject.departmentId && !departments.find((d: any) => d.id === fixedSubject.departmentId)) {
      const match = departments.find((d: any) => 
        (d.nameAr || d.name) === fixedSubject.departmentName || d.code === fixedSubject.departmentId
      );
      if (match) fixedSubject.departmentId = match.id;
    } else if (!fixedSubject.departmentId && fixedSubject.departmentName) {
      const match = departments.find((d: any) => (d.nameAr || d.name) === fixedSubject.departmentName);
      if (match) fixedSubject.departmentId = match.id;
    }
    setEditingSubject(fixedSubject);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة المواد الدراسية</h1>
          <p className="text-muted-foreground font-bold">التحكم في المناهج، المستويات، والأترام الدراسية</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleResetAndInject} 
            disabled={isSyncing || loading}
            variant="destructive"
            className="rounded-2xl h-12 px-6 font-bold gap-2 shadow-lg hover:scale-105 transition-all"
          >
            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <DatabaseZap className="w-5 h-5" />}
            إعادة تهيئة وحقن البيانات
          </Button>

          <Button 
            onClick={handleSyncSubjects} 
            disabled={isSyncing || loading}
            variant="outline"
            className="rounded-2xl h-12 px-6 font-bold border-2 border-primary/20 text-primary hover:bg-primary/5 gap-2"
          >
            {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
            إصلاح المزامنة
          </Button>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-12 px-6 font-bold gradient-blue shadow-lg gap-2 text-white">
                <Plus className="w-5 h-5" />
                إضافة مادة جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
              <div className="p-8">
                <DialogHeader className="text-right items-start space-y-2 mb-8">
                  <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                    <PlusCircle className="w-6 h-6 text-secondary" />
                    مادة دراسية جديدة
                  </DialogTitle>
                  <DialogDescription className="font-bold text-muted-foreground">أدخل تفاصيل المادة التعليمية الجديدة لدمجها في الخطة الدراسية.</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                      <BookOpen className="w-4 h-4 text-secondary" />
                      اسم المادة (بالعربي)
                    </Label>
                    <Input 
                      value={newSubject.nameAr} 
                      onChange={(e) => setNewSubject({...newSubject, nameAr: e.target.value})} 
                      placeholder="مثال: برمجة 1" 
                      className="rounded-xl h-11 border-muted text-right font-bold" 
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                      <Type className="w-4 h-4 text-secondary" />
                      اسم المادة (English)
                    </Label>
                    <Input 
                      value={newSubject.nameEn} 
                      onChange={(e) => setNewSubject({...newSubject, nameEn: e.target.value})} 
                      placeholder="Programming 1" 
                      className="rounded-xl h-11 border-muted text-left font-mono" 
                    />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                      <Building2 className="w-4 h-4 text-secondary" />
                      التخصص (القسم)
                    </Label>
                    <Select onValueChange={(v) => setNewSubject({...newSubject, departmentId: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold" dir="rtl">
                        <SelectValue placeholder="اختر التخصص" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold" dir="rtl">
                        {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                      <Layers className="w-4 h-4 text-secondary" />
                      المستوى الدراسي
                    </Label>
                    <Select value={newSubject.level} onValueChange={(v) => setNewSubject({...newSubject, level: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold" dir="rtl">
                        <SelectValue placeholder="اختر المستوى" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold" dir="rtl">
                        <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                        <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                        <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                        <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                        <SelectItem value="المستوى الخامس">المستوى الخامس</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                      <Clock className="w-4 h-4 text-secondary" />
                      الفصل الدراسي (الترم)
                    </Label>
                    <Select value={newSubject.term} onValueChange={(v) => setNewSubject({...newSubject, term: v})}>
                      <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold" dir="rtl">
                        <SelectValue placeholder="اختر الترم" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl font-bold" dir="rtl">
                        <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                        <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                        <SelectItem value="الفصل التكميلي">الفصل التكميلي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="flex-row gap-3 pt-8 border-t mt-6">
                  <Button disabled={submitting} onClick={handleAddSubject} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg text-white gap-2">
                     {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                     {submitting ? "جاري الحفظ..." : "حفظ المادة"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2 gap-2">
                    <X className="w-5 h-5" />
                    إلغاء
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 border-none shadow-xl rounded-3xl bg-white overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-[2] relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder="البحث باسم المادة..."
              className="w-full bg-muted/30 outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border border-transparent focus:border-primary/20 transition-all text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
             <Select value={filterDept} onValueChange={setFilterDept}>
               <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-primary" dir="rtl">
                 <Filter className="w-4 h-4 ml-2 opacity-50" />
                 <SelectValue placeholder="كل التخصصات" />
               </SelectTrigger>
               <SelectContent className="rounded-xl font-bold" dir="rtl">
                 <SelectItem value="all">جميع التخصصات</SelectItem>
                 {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
          <div className="flex-1">
             <Select value={filterLevel} onValueChange={setFilterLevel}>
               <SelectTrigger className="rounded-2xl h-12 bg-muted/30 border-none font-bold text-primary" dir="rtl">
                 <SelectValue placeholder="كل المستويات" />
               </SelectTrigger>
               <SelectContent className="rounded-xl font-bold" dir="rtl">
                 <SelectItem value="all">جميع المستويات</SelectItem>
                 <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                 <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                 <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                 <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                 <SelectItem value="المستوى الخامس">المستوى الخامس</SelectItem>
               </SelectContent>
             </Select>
          </div>
        </div>

        <div className="rounded-2xl border overflow-hidden">
          <Table className="text-right">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="text-right font-bold text-primary">المادة</TableHead>
                <TableHead className="text-right font-bold text-primary">التخصص</TableHead>
                <TableHead className="text-right font-bold text-primary">المستوى / الترم</TableHead>
                <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20 text-primary" /></TableCell></TableRow>
              ) : filteredSubjects.length > 0 ? filteredSubjects.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/20 border-b group">
                  <TableCell className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="font-bold text-primary">{s.nameAr}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{s.nameEn}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-secondary" />
                      <span className="text-sm font-bold text-primary">{s.departmentName}</span>
                      {(!s.departmentId || s.departmentId.length < 5) && <AlertTriangle className="w-3 h-3 text-orange-500" title="ربط غير مستقر" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-right">
                      <span className="text-sm font-bold text-primary">{s.level}</span>
                      <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {s.term}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEditDialog(s)} 
                        className="rounded-xl hover:bg-primary/5 text-secondary" 
                        title="تعديل"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(s.id)} 
                        className="rounded-xl hover:bg-destructive/10 text-destructive" 
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="h-40 text-center text-muted-foreground font-bold">لا توجد مواد تطابق خيارات البحث</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="max-w-2xl rounded-3xl border-none text-right shadow-2xl p-0 overflow-hidden" dir="rtl">
          <div className="p-8">
            <DialogHeader className="text-right items-start space-y-2 mb-8">
              <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل بيانات المادة
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">تعديل المعلومات التفصيلية للمادة الدراسية المسجلة.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                  <BookOpen className="w-4 h-4 text-secondary" />
                  اسم المادة (عربي)
                </Label>
                <Input value={editingSubject?.nameAr || ""} onChange={(e) => setEditingSubject({...editingSubject, nameAr: e.target.value})} className="rounded-xl h-11 border-muted font-bold text-right" />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                  <Type className="w-4 h-4 text-secondary" />
                  اسم المادة (English)
                </Label>
                <Input value={editingSubject?.nameEn || ""} onChange={(e) => setEditingSubject({...editingSubject, nameEn: e.target.value})} className="rounded-xl h-11 border-muted text-left font-mono" />
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                  <Building2 className="w-4 h-4 text-secondary" />
                  التخصص
                </Label>
                <Select value={editingSubject?.departmentId || ""} onValueChange={(v) => setEditingSubject({...editingSubject, departmentId: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold" dir="rtl">
                    <SelectValue placeholder="اختر التخصص" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold" dir="rtl">
                    {departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.nameAr || d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                  <Layers className="w-4 h-4 text-secondary" />
                  المستوى
                </Label>
                <Select value={editingSubject?.level || ""} onValueChange={(v) => setEditingSubject({...editingSubject, level: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold" dir="rtl">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold" dir="rtl">
                    <SelectItem value="المستوى الأول">المستوى الأول</SelectItem>
                    <SelectItem value="المستوى الثاني">المستوى الثاني</SelectItem>
                    <SelectItem value="المستوى الثالث">المستوى الثالث</SelectItem>
                    <SelectItem value="المستوى الرابع">المستوى الرابع</SelectItem>
                    <SelectItem value="المستوى الخامس">المستوى الخامس</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-primary font-bold flex items-center gap-2 justify-start">
                  <Clock className="w-4 h-4 text-secondary" />
                  الترم الدراسي
                </Label>
                <Select value={editingSubject?.term || ""} onValueChange={(v) => setEditingSubject({...editingSubject, term: v})}>
                  <SelectTrigger className="rounded-xl h-11 border-muted text-right font-bold" dir="rtl">
                    <SelectValue placeholder="اختر الترم" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl font-bold" dir="rtl">
                    <SelectItem value="الفصل الأول">الفصل الأول</SelectItem>
                    <SelectItem value="الفصل الثاني">الفصل الثاني</SelectItem>
                    <SelectItem value="الفصل التكميلي">الفصل التكميلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="flex-row gap-3 pt-8 border-t mt-6">
              <Button disabled={submitting} onClick={handleUpdateSubject} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg text-white gap-2">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {submitting ? "جاري التحديث..." : "حفظ التعديلات"}
              </Button>
              <Button variant="outline" onClick={() => setEditingSubject(null)} className="flex-1 rounded-xl h-12 font-bold border-2 gap-2">
                <X className="w-5 h-5" />
                إلغاء
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
