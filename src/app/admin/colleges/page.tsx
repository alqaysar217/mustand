
"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  School, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building2,
  Calendar,
  ShieldCheck,
  Loader2,
  FileText,
  Hash,
  Type
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Firebase
import { useFirestore, useCollection } from "@/firebase";
import { collection, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from "firebase/firestore";

export default function AdminCollegesPage() {
  const firestore = useFirestore();
  const collegesQuery = useMemo(() => firestore ? collection(firestore, "colleges") : null, [firestore]);
  const yearsQuery = useMemo(() => firestore ? collection(firestore, "academicYears") : null, [firestore]);

  const { data: colleges = [], loading: loadingColleges } = useCollection(collegesQuery);
  const { data: academicYears = [], loading: loadingYears } = useCollection(yearsQuery);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("colleges");
  const [submitting, setSubmitting] = useState(false);
  
  // States for Colleges
  const [isAddCollegeOpen, setIsAddCollegeOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<any>(null);
  const [newCollege, setNewCollege] = useState({ name: '', code: '' });

  // States for Years
  const [isAddYearOpen, setIsAddYearOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<any>(null);
  const [newYear, setNewYear] = useState({ label: '' });

  const { toast } = useToast();

  const filteredColleges = useMemo(() => {
    return (colleges as any[]).filter(college => 
      college.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      college.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [colleges, searchTerm]);

  const filteredYears = useMemo(() => {
    return (academicYears as any[]).filter(year => 
      year.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [academicYears, searchTerm]);

  // College Handlers
  const handleAddCollege = () => {
    if (!firestore || !newCollege.name || !newCollege.code) return;
    setSubmitting(true);
    const ref = collection(firestore, "colleges");
    const data = { ...newCollege, createdAt: serverTimestamp() };
    addDoc(ref, data)
      .then(() => {
        setIsAddCollegeOpen(false);
        setNewCollege({ name: '', code: '' });
        toast({ title: "تم تفعيل الكلية" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateCollege = () => {
    if (!firestore || !editingCollege) return;
    setSubmitting(true);
    const docRef = doc(firestore, "colleges", editingCollege.id);
    updateDoc(docRef, { name: editingCollege.name || "", code: editingCollege.code || "" })
      .then(() => {
        setEditingCollege(null);
        toast({ title: "تم التحديث" });
      })
      .finally(() => setSubmitting(false));
  };

  // Year Handlers
  const handleAddYear = () => {
    if (!firestore || !newYear.label) return;
    setSubmitting(true);
    const ref = collection(firestore, "academicYears");
    const data = { ...newYear, createdAt: serverTimestamp() };
    addDoc(ref, data)
      .then(() => {
        setIsAddYearOpen(false);
        setNewYear({ label: '' });
        toast({ title: "تم إضافة العام الدراسي" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleUpdateYear = () => {
    if (!firestore || !editingYear) return;
    setSubmitting(true);
    const docRef = doc(firestore, "academicYears", editingYear.id);
    updateDoc(docRef, { label: editingYear.label || "" })
      .then(() => {
        setEditingYear(null);
        toast({ title: "تم تحديث العام" });
      })
      .finally(() => setSubmitting(false));
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, collectionName, id));
      toast({ variant: "destructive", title: "تم الحذف" });
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ في الحذف" });
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary mb-1">إدارة الموارد الأساسية</h1>
          <p className="text-muted-foreground font-bold">التحكم في هيكلية الكليات والسنوات الدراسية</p>
        </div>
      </div>

      <Tabs defaultValue="colleges" onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-2xl h-14 shadow-sm border mb-8 flex items-stretch overflow-hidden">
          <TabsTrigger 
            value="colleges" 
            className={cn(
              "flex-1 rounded-xl font-black transition-all duration-300",
              activeTab === "colleges" ? "gradient-blue text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            إدارة الكليات
          </TabsTrigger>
          <TabsTrigger 
            value="years" 
            className={cn(
              "flex-1 rounded-xl font-black transition-all duration-300",
              activeTab === "years" ? "gradient-blue text-white shadow-lg" : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            الأعوام الدراسية
          </TabsTrigger>
        </TabsList>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text"
              placeholder={activeTab === 'colleges' ? "البحث بالاسم أو الرمز..." : "البحث بالعام..."}
              className="w-full bg-white outline-none text-sm font-bold text-primary h-12 pr-12 pl-4 rounded-2xl border shadow-sm focus:border-primary/20 transition-all text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            onClick={() => activeTab === 'colleges' ? setIsAddCollegeOpen(true) : setIsAddYearOpen(true)}
            className="rounded-2xl h-12 px-8 font-bold gradient-blue shadow-lg gap-2"
          >
            <Plus className="w-5 h-5" />
            {activeTab === 'colleges' ? 'إضافة كلية' : 'إضافة عام دراسي'}
          </Button>
        </div>

        <TabsContent value="colleges">
          <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right font-bold text-primary">الكلية</TableHead>
                  <TableHead className="text-right font-bold text-primary">الرمز</TableHead>
                  <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingColleges ? (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20 text-primary" /></TableCell></TableRow>
                ) : filteredColleges.length > 0 ? filteredColleges.map((college) => (
                  <TableRow key={college.id} className="hover:bg-muted/10 group">
                    <TableCell className="p-4 font-bold text-primary">{college.name}</TableCell>
                    <TableCell className="font-black text-secondary">{college.code}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingCollege(college)} className="text-secondary hover:bg-secondary/10 rounded-xl"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('colleges', college.id)} className="text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-bold">لا توجد كليات مسجلة</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="years">
          <Card className="border-none shadow-xl rounded-2xl bg-white overflow-hidden">
            <Table className="text-right">
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="text-right font-bold text-primary">العام الجامعي</TableHead>
                  <TableHead className="text-right font-bold text-primary">تاريخ الإضافة</TableHead>
                  <TableHead className="text-center font-bold text-primary w-32">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingYears ? (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto opacity-20 text-primary" /></TableCell></TableRow>
                ) : filteredYears.length > 0 ? filteredYears.map((year) => (
                  <TableRow key={year.id} className="hover:bg-muted/10">
                    <TableCell className="p-4 font-black text-primary text-lg">{year.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-bold">{year.createdAt?.toDate ? year.createdAt.toDate().toLocaleDateString('en-GB') : '---'}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setEditingYear(year)} className="text-secondary hover:bg-secondary/10 rounded-xl"><Edit2 className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete('academicYears', year.id)} className="text-destructive hover:bg-destructive/10 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="h-40 text-center text-muted-foreground font-bold">لا توجد أعوام دراسية مسجلة</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* College Add Dialog */}
      <Dialog open={isAddCollegeOpen} onOpenChange={setIsAddCollegeOpen}>
        <DialogContent className="rounded-3xl border-none text-right shadow-2xl p-8" dir="rtl">
          <DialogHeader className="text-right items-start mb-6">
            <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
              <School className="w-6 h-6 text-secondary" />
              كلية جديدة
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground">أدخل بيانات الكلية الرسمية لتفعيلها في النظام.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-primary flex items-center gap-2">
                <Type className="w-4 h-4 text-secondary" />
                الاسم الرسمي للكلية
              </Label>
              <div className="relative">
                <Input 
                  value={newCollege.name || ""} 
                  onChange={(e) => setNewCollege({...newCollege, name: e.target.value})} 
                  placeholder="مثال: كلية الهندسة"
                  className="rounded-xl h-12 bg-muted/20 border-muted focus:ring-primary/20 pr-10" 
                />
                <School className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-bold text-primary flex items-center gap-2">
                <Hash className="w-4 h-4 text-secondary" />
                الرمز المختصر
              </Label>
              <div className="relative">
                <Input 
                  value={newCollege.code || ""} 
                  onChange={(e) => setNewCollege({...newCollege, code: e.target.value})} 
                  className="rounded-xl h-12 bg-muted/20 border-muted uppercase pr-10" 
                  placeholder="ENG"
                />
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row gap-3 pt-6">
            <Button onClick={handleAddCollege} disabled={submitting} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'تفعيل الكلية'}
            </Button>
            <Button variant="outline" onClick={() => setIsAddCollegeOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Year Add Dialog */}
      <Dialog open={isAddYearOpen} onOpenChange={setIsAddYearOpen}>
        <DialogContent className="rounded-3xl border-none text-right shadow-2xl p-8" dir="rtl">
          <DialogHeader className="text-right items-start mb-6">
            <DialogTitle className="text-2xl font-black text-primary flex items-center gap-2">
              <Calendar className="w-6 h-6 text-secondary" />
              عام دراسي جديد
            </DialogTitle>
            <DialogDescription className="font-bold text-muted-foreground text-right">تحديد مسمى العام الجامعي (مثلاً: 2024 / 2025).</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="font-bold text-primary flex items-center gap-2">
                <Calendar className="w-4 h-4 text-secondary" />
                تسمية العام
              </Label>
              <div className="relative">
                <Input 
                  placeholder="2024 / 2025" 
                  value={newYear.label || ""} 
                  onChange={(e) => setNewYear({...newYear, label: e.target.value})} 
                  className="rounded-xl h-12 bg-muted/20 border-muted pr-10 font-bold text-right" 
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
          <DialogFooter className="flex-row gap-3 pt-6">
            <Button onClick={handleAddYear} disabled={submitting} className="flex-1 rounded-xl h-12 font-bold gradient-blue shadow-lg">
              {submitting ? <Loader2 className="animate-spin w-5 h-5" /> : 'إضافة العام'}
            </Button>
            <Button variant="outline" onClick={() => setIsAddYearOpen(false)} className="flex-1 rounded-xl h-12 font-bold border-2">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialogs */}
      <Dialog open={!!editingCollege} onOpenChange={(o) => !o && setEditingCollege(null)}>
        <DialogContent className="rounded-3xl text-right shadow-2xl border-none p-8" dir="rtl">
           <DialogHeader className="text-right items-start mb-6">
              <DialogTitle className="font-black text-primary text-2xl flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل بيانات الكلية
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground">تحديث بيانات الكلية المختارة.</DialogDescription>
           </DialogHeader>
           <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="font-bold text-primary flex items-center gap-2">
                  <Type className="w-4 h-4 text-secondary" />
                  الاسم الرسمي
                </Label>
                <div className="relative">
                  <Input value={editingCollege?.name || ""} onChange={(e) => setEditingCollege({...editingCollege, name: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted pr-10" />
                  <School className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-primary flex items-center gap-2">
                  <Hash className="w-4 h-4 text-secondary" />
                  الرمز المختصر
                </Label>
                <div className="relative">
                  <Input value={editingCollege?.code || ""} onChange={(e) => setEditingCollege({...editingCollege, code: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted uppercase pr-10" />
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
           </div>
           <DialogFooter className="flex-row gap-3 pt-6">
              <Button onClick={handleUpdateCollege} className="flex-1 h-12 font-bold rounded-xl gradient-blue shadow-lg">حفظ التغييرات</Button>
              <Button variant="outline" onClick={() => setEditingCollege(null)} className="flex-1 h-12 font-bold rounded-xl border-2">تراجع</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingYear} onOpenChange={(o) => !o && setEditingYear(null)}>
        <DialogContent className="rounded-3xl text-right shadow-2xl border-none p-8" dir="rtl">
           <DialogHeader className="text-right items-start mb-6">
              <DialogTitle className="font-black text-primary text-2xl flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-secondary" />
                تعديل العام الدراسي
              </DialogTitle>
              <DialogDescription className="font-bold text-muted-foreground text-right">تحديث تسمية العام الدراسي المختار.</DialogDescription>
           </DialogHeader>
           <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="font-bold text-primary flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-secondary" />
                  تسمية العام
                </Label>
                <div className="relative">
                  <Input value={editingYear?.label || ""} onChange={(e) => setEditingYear({...editingYear, label: e.target.value})} className="rounded-xl h-12 bg-muted/20 border-muted pr-10 font-bold text-right" />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
           </div>
           <DialogFooter className="flex-row gap-3 pt-6">
              <Button onClick={handleUpdateYear} className="flex-1 h-12 font-bold rounded-xl gradient-blue shadow-lg">تحديث</Button>
              <Button variant="outline" onClick={() => setEditingYear(null)} className="flex-1 h-12 font-bold rounded-xl border-2">إلغاء</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
